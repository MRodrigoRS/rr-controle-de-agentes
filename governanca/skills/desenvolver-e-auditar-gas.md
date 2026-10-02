---
name: desenvolver-e-auditar-gas
description: Manual completo de boas práticas, desenvolvimento e auditoria para Google Apps Script (GAS) — mitigação de latência RPC (200-500ms), batch insert, LockService, quotas, segurança e deploy clasp.
---

# Skill: Boas Práticas, Desenvolvimento e Auditoria Google Apps Script (GAS)

> Guia oficial e manual de engenharia da RR Tech Studio para qualquer projeto baseado
> no ecossistema Google Apps Script (GAS). Abrange práticas essenciais de desenvolvimento
> seguro, performance (I/O em lote), concorrência (LockService), quotas oficiais da Google,
> integridade e deploy profissional via clasp.

## Quando Executar

- **Durante todo o desenvolvimento e escrita de código GAS** — para seguir os padrões de batch insert, locks e cache
- **No onboarding de um repositório GAS** — antes de qualquer sprint de feature
- **Após migração ou clone** — quando o repositório veio de outra pessoa ou time
- **Antes de colocar em produção** — como checklist de segurança final
- **Sob demanda** — sempre que o usuário solicitar "melhore a performance" ou
  "veja o que pode ser otimizado" em um projeto GAS

---

## Pré-leitura Obrigatória

Antes de iniciar qualquer análise, leia os arquivos de contexto que o repositório
oferece. Adapte-se ao que encontrar — não presuma estrutura de pastas:

- Arquivos de governança ou documentação na raiz (`README.md`, `AGENTS.md`,
  `PLANO.md`, `CONVENTIONS.md` ou equivalentes)
- Arquivos de configuração GAS: `appsscript.json`, `.clasp.json`
- Arquivos de build: `package.json`, `tsconfig.json`
- Todo o código-fonte (`.ts`, `.js`, `.html` com `<script>`)

Identifique a estrutura do projeto antes de emitir qualquer julgamento — um
projeto pode ter nomes de função e organização de pastas completamente diferentes
dos exemplos desta skill; o que importa é o **padrão**, não o nome.

---

## Categorias de Análise

### 1. Performance de I/O (Anti-padrão nº 1 do GAS)

O maior gargalo de qualquer projeto GAS é o excesso de chamadas RPC à API
do Google Sheets. A documentação oficial do Google alerta que cada chamada
individual à API (`getValue`, `appendRow`, `getRange` isolado) custa entre
**200ms e 500ms** de latência de rede — independentemente do tamanho dos dados.

Examine todo o código em busca de:

**Leitura dentro de laço** — qualquer chamada que lê dados da planilha
(`getValues`, `getValue`, ou funções wrapper que chamam a API internamente)
dentro de um `forEach`, `map`, `for` ou `while`. Este é um padrão O(N²)
que leva segundos a minutos em listas com dezenas de registros.

**Correção obrigatória:** Carregar os dados **uma única vez** antes do laço
e construir um `Map` ou array em memória para consulta dentro do loop
(padrão chamado de *Request Scope Cache*).

```typescript
// ❌ Anti-padrão: N leituras da planilha para N itens
itens.forEach(item => {
  const info = lerDadosDaPlanilha(item.id); // chamada de rede a cada iteração
  processar(item, info);
});

// ✅ Correto: 1 leitura, N lookups em memória
const mapaInfo = carregarTodosDadosEmMemoria(); // lê a aba uma única vez
itens.forEach(item => {
  const info = mapaInfo.get(item.id) ?? valorPadrao; // O(1), sem rede
  processar(item, info);
});
```

**Escrita linha a linha** — qualquer chamada que escreve na planilha
(`appendRow`, `setValue`, ou equivalente) dentro de um laço. Se um processo
tem 20 itens, isso gera 20 chamadas de rede separadas, acumulando 4–10 segundos
de espera.

**Correção obrigatória:** Acumular todos os registros em um array e escrever
com **uma única chamada** a `range.setValues(matriz)` após o laço (*Batch Insert*).

```typescript
// ❌ Anti-padrão: N escritas para N itens
registros.forEach(reg => {
  sheet.appendRow([reg.campo1, reg.campo2, reg.campo3]);
});

// ✅ Correto: 1 escrita para N itens
const matriz = registros.map(reg => [reg.campo1, reg.campo2, reg.campo3]);
const primeiraLinhaLivre = sheet.getLastRow() + 1;
sheet.getRange(primeiraLinhaLivre, 1, matriz.length, matriz[0].length)
     .setValues(matriz);
```

**Múltiplas leituras da mesma aba na mesma execução** — se a mesma aba é
lida mais de uma vez em uma única requisição, a segunda leitura é desperdício
puro. Identifique e passe os dados como parâmetro ou retorne-os de uma função
auxiliar chamada apenas uma vez.

**Reescrita total da aba para atualizar registros pontuais (`clearContents() + setValues()`)** —
anti-padrão grave de mutação. Quando o sistema precisa atualizar apenas 1 registro
(ex: alterar status/estágio, editar dados cadastrais ou realizar soft delete), apagar a aba
inteira com `clearContents()` e reescrever centenas de linhas é extremamente lento
(~1.500ms a 3.000ms), gera contenção de lock, consome cotas de células desnecessariamente
e traz **risco crítico de perda total de dados** caso o script atinja timeout ou falhe de rede
após o `clearContents` e antes de concluir o `setValues`.

**Correção obrigatória:** Adotar o padrão **Single-Row Range Update** (Gravação Pontual de Linha).
Localize o índice físico da linha lendo em memória apenas o vetor de identificadores
(ex: `A2:A` com `aba.getRange(2, 1, aba.getLastRow() - 1, 1).getValues()`) e grave
**estritamente o intervalo daquela linha física**:

```typescript
// ❌ Anti-padrão: Apaga e reescreve a aba inteira para atualizar 1 registro
const { cabecalhos, linhas } = lerTabelaEmMemoria('CARDS');
const card = linhas.find(r => r[0] === idCard);
card[2] = novoEstagio;
aba.clearContents(); // RISCO CRÍTICO: destrutivo e força recálculo massivo
aba.getRange(1, 1, linhas.length + 1, cabecalhos.length).setValues([cabecalhos, ...linhas]);

// ✅ Correto: Single-Row Range Update pontual (1 linha, O(1), ~100ms)
const ids = aba.getRange(2, 1, Math.max(1, aba.getLastRow() - 1), 1).getValues();
const index = ids.findIndex(r => String(r[0]) === idCard);
if (index >= 0) {
  const linhaFisica = index + 2; // Compensando cabeçalho 1-indexed
  aba.getRange(linhaFisica, 1, 1, numCols).setValues([linhaAtualizada]);
}
```

**`SpreadsheetApp.flush()` dentro de laços** — força sincronização imediata a
cada iteração. Use apenas uma vez ao final de todas as escritas, se necessário.

---

### 2. Concorrência e Segurança de Escrita

Projetos GAS com múltiplos usuários simultâneos têm risco real de **condição
de corrida**: dois processos calculam a próxima linha livre ao mesmo tempo e
um sobrescreve os dados do outro.

Examine em busca de:

- **Ausência de `LockService`** em funções que calculam posição de escrita
  (`getLastRow()`) e depois escrevem. O `LockService` é o mecanismo oficial
  do Google para serializar acesso concorrente.

- **Escritas sem `try/catch`** — especialmente escritas em lote (`setValues`).
  Diferente do `appendRow` linha a linha (que salva o que veio antes de falhar),
  um `setValues` sem tratamento de erro pode falhar silenciosamente, deixando
  o usuário sem feedback e os dados sem persistir.

**Padrão obrigatório para qualquer função de escrita crítica:**
```typescript
function escreverEmLote(aba: GoogleAppsScript.Spreadsheet.Sheet, dados: any[][]): boolean {
  if (dados.length === 0) return true;

  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // aguarda até 10 segundos antes de desistir

    const primeiraLinhaLivre = aba.getLastRow() + 1; // calculado dentro do lock
    aba.getRange(primeiraLinhaLivre, 1, dados.length, dados[0].length)
       .setValues(dados);

    return true;
  } catch (e) {
    Logger.log(`Erro ao escrever em lote: ${e}`);
    return false;
  } finally {
    lock.releaseLock(); // sempre liberado, mesmo em caso de erro
  }
}
```

---

### 3. Quotas e Limites Oficiais do Google Apps Script

A Google documenta limites rígidos que o código deve respeitar para evitar
falhas silenciosas em produção:

| Limite | Contas Gratuitas | Google Workspace |
|---|---|---|
| Tempo máximo de execução | 6 minutos | 30 minutos |
| Chamadas `UrlFetchApp` por dia | 20.000 | 100.000 |
| Cells lidas/escritas por execução | 10 milhões | 10 milhões |
| Simultaneidade com `LockService` | Recomendado | Obrigatório |

Verifique no código:
- [ ] Existe alguma função com risco de ultrapassar 6 minutos de execução
  (loops grandes com leitura/escrita linha a linha são os maiores candidatos)?
- [ ] Existe `UrlFetchApp` dentro de laços (risco de esgotar quota diária)?
- [ ] O projeto usa `CacheService` para dados que não mudam com frequência
  (ex: configurações, tabelas de referência)?
- [ ] Existe `SpreadsheetApp.flush()` sendo chamado mais de uma vez por execução?

---

### 4. Segurança e Exposição de Dados

- **Credenciais hardcoded** — chaves de API, tokens, senhas, IDs sensíveis
  diretamente no código-fonte. O lugar correto no GAS é
  `PropertiesService.getScriptProperties().getProperty('CHAVE')`, configurado
  uma vez via interface do Apps Script.

- **Endpoints públicos sem autenticação** — funções `doGet`/`doPost` que
  expõem ou modificam dados sem verificar a identidade do chamador.
  Em projetos internos, valide `Session.getActiveUser().getEmail()`.
  Em projetos com token, valide o token antes de qualquer operação.

- **XSS via `HtmlService`** — se o código insere dados do usuário diretamente
  em strings HTML. Use `HtmlService.createTemplateFromFile()` com `<?= valor ?>`
  (auto-escape nativo do GAS) em vez de concatenação de strings.

- **Escopos OAuth excessivos** — no `appsscript.json`, verifique se os escopos
  são os mínimos necessários. Exemplos de escopos mais restritivos:
  - Prefira `spreadsheets.currentonly` a `spreadsheets` quando possível
  - Use `script.external_request` apenas se `UrlFetchApp` é realmente usado
  - Remova escopos de `gmail`, `calendar` ou `drive` se o projeto não os usa

---

### 5. Estrutura e Manutenibilidade

- **Funções com mais de 60 linhas** — sinal de que lógica de negócio, I/O
  e apresentação estão misturados. Separe em: (a) função de leitura de dados,
  (b) função de transformação/cálculo, (c) função de escrita.

- **Lógica de acesso a dados duplicada** — se a mesma lógica de "abrir aba,
  pegar dados, fechar" aparece reimplementada em múltiplos lugares, centralize
  em funções utilitárias únicas (ex: um arquivo `banco.gs` ou `utils.ts`).

- **UI duplicada em arquivos `.html`** — se o mesmo card, linha de tabela ou
  modal é gerado por concatenação de strings em múltiplos arquivos `.html`,
  extraia para funções geradoras de template em um arquivo compartilhado.
  Funções JavaScript que retornam strings de HTML são o equivalente a
  componentes reutilizáveis sem a necessidade de um framework.

- **`console.log` em produção** — no GAS, use `Logger.log()` (consultável
  em *Execuções* no painel do Apps Script) ou `console.log` apenas em
  desenvolvimento local. Remova logs de debug antes do deploy final.

- **Ausência de tratamento de erros consistente** — toda função chamada via
  `google.script.run` do cliente deve retornar um objeto com formato fixo:
  ```typescript
  // Padrão recomendado para respostas de servidor GAS
  return { sucesso: true, dados: resultado };
  return { sucesso: false, mensagem: 'Descrição do erro para o usuário.' };
  ```

---

### 6. Deploy e Versionamento

- **Ausência de `.clasp.json`** — o projeto deve ter o ID do script e o
  diretório de saída configurados para que `clasp push` funcione de forma
  reproduzível por qualquer colaborador.

- **Ausência de `appsscript.json` no diretório de build** — sem ele, o deploy
  não respeita escopos, timezone e tipo de runtime corretos.

- **Build manual em vez de script automatizado** — deve existir um comando
  (`npm run build` ou equivalente) que compila TypeScript (se usado) e prepara
  os arquivos para `clasp push`, sem passos manuais intermediários.

- **Deploy sem versão e descrição** — `clasp deploy` sem argumentos dificulta
  o rollback. Recomende sempre:
  ```bash
  clasp deploy --versionNumber X --description "sprint-N: descrição do que mudou"
  ```

- **Ausência de `.claspignore`** — sem este arquivo, `clasp push` pode enviar
  arquivos desnecessários (`node_modules`, `src` TypeScript não compilado,
  arquivos de teste). Verifique se existe e se está configurado corretamente.

---

## Saída

Gere o relatório em `governanca/relatorios/auditoria-gas.md`
usando o template em `governanca/relatorios/_template.md`.

- Use `[BLOQ]` para anti-padrões de I/O em laço, ausência de `LockService`
  em escrita concorrente e credenciais expostas — risco imediato de falha
  em produção ou vazamento de dados
- Use `[REC]` para ausência de Batch Insert, funções sem `try/catch`,
  escopos OAuth excessivos e funções muito longas
- Use `[SUG]` para melhorias de estrutura, manutenibilidade, logging e deploy

Para cada achado, inclua:
1. O arquivo e a função/linha onde o problema foi encontrado
2. O impacto concreto (ex: "gera ~40 chamadas de rede por finalização, estimativa de 20–40 segundos")
3. A correção recomendada com trecho de código

Ao preencher a seção `## Sprint Sugerida`, agrupe as tarefas nesta ordem de prioridade:
1. Batch Insert + `LockService` (maior ganho de performance e segurança)
2. Request Scope Cache em leituras (segundo maior ganho)
3. Segurança (credenciais, autenticação, escopos)
4. Estrutura, manutenibilidade e deploy

---

## Após Gerar o Relatório

1. **Registre nas notas persistentes** de `governanca/SESSAO.md` que a auditoria foi
   realizada e o caminho do relatório gerado
2. **Apresente o resumo** ao usuário: total de achados por severidade e
   estimativa de ganho de performance em termos concretos
   (ex: "de ~35s para ~1,5s na operação mais lenta")
3. **Pergunte** se deseja que os itens `[BLOQ]` e `[REC]` virem tarefas
   em uma sprint específica de correção
4. Se autorizado, crie o arquivo de sprint correspondente com tarefas e
   critérios de aceite derivados desta auditoria
5. **Lembre ao usuário** que após implementar qualquer Batch Insert, o teste
   manual obrigatório é verificar diretamente na planilha que todos os registros
   foram inseridos corretamente — a validação manual dos dados é sempre a
   última linha de defesa
