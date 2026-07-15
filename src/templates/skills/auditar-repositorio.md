# Skill: Auditar Repositório

> Instrui o agente a examinar minuciosamente todo o repositório em busca de
> vulnerabilidades de segurança, más práticas de código e inconsistências
> entre documentação e implementação, gerando um relatório estruturado.

## Quando Executar

- **No onboarding** (após definir sprints, antes de codificar) — para conhecer
  o estado atual do código
- **Antes de uma sprint crítica** (ex: colocar em produção, integrar
  pagamento) — para garantir que não há problemas conhecidos
- **Sempre que o usuário solicitar** explicitamente uma auditoria
- **Periodicamente** (a cada 3-4 sprints) como boa prática

## Categorias de Análise

### 1. Segurança

Examine arquivo por arquivo em busca de:

- **Senhas, tokens, chaves de API, strings de conexão** hardcoded
  (especialmente em arquivos versionados, não em `.env.example`)
- **SQL Injection** — concatenção de strings em queries SQL/NoSQL
- **XSS (Cross-Site Scripting)** — renderização direta de input do usuário
  sem sanitização
- **CSRF** — ausência de proteção em mutações de estado
- **Autenticação frágil** — lógica de login insegura, falta de validação
  de sessão, tokens previsíveis
- **Exposição de informações sensíveis** — stack traces, dados internos
  em respostas de API, comentários com credenciais
- **Dependências vulneráveis** — versões conhecidamente inseguras de
  bibliotecas (consulte `package.json`, `requirements.txt`, etc.)
- **Permissões excessivas** — escopos OAuth2 muito amplos, service accounts
  com privilégios além do necessário (especialmente em GAS e cloud)

### 2. Más Práticas

- **Código morto** — funções, variáveis, imports não utilizados
- **Duplicação** — lógica repetida que deveria estar em um único lugar
- **Tratamento de erros genérico** — `catch` vazio, `try` monstruoso
  sem separação por tipo de erro
- **Nomes confusos** — variáveis/funções com nomes que não refletem seu
  propósito (ex: `dados`, `temp`, `x1`, `funcao`)
- **Funções muito longas** — mais de 40-50 linhas (sugira refatoração)
- **Acoplamento excessivo** — módulos que dependem de detalhes internos
  de outros módulos
- **Falta de tratamento de limites** — arrays sem verificação de índice,
  paginação sem limite máximo, upload sem validação de tamanho
- **Comentários enganosos** — comentário que não corresponde ao que o
  código realmente faz
- **Ausência de validação de entrada** — parâmetros de API, formulários,
  webhooks sem sanitização ou tipagem

### 3. Inconsistências

- **Doc vs código** — o livro de arquitetura, `PLANO.md`, `CONVENCOES.md`
  descrevem algo diferente do que o código implementa
- **Configurações conflitantes** — variáveis de ambiente definidas em
  múltiplos lugares com valores diferentes
- **Estilos misturados** — parte do código usa um padrão (ex: CommonJS
  `require`) e outra parte usa outro (ESM `import`), a menos que seja
  intencional por limitação da stack
- **Versão de ferramentas** — `engines` no `package.json` vs runtime real
- **Nomenclatura inconsistente** — `camelCase`, `snake_case` e `kebab-case`
  misturados sem critério no mesmo contexto

## Formato do Relatório

Crie um arquivo em `governanca/relatorios/` com o seguinte formato:

```markdown
# Auditoria: {{data}}

**Escopo:** repositório completo (ou específico, se parcial)

---

## Resumo

- **Segurança:** X críticos, Y altos, Z médios, W baixos
- **Más Práticas:** X encontradas
- **Inconsistências:** X encontradas

---

## Segurança

### [CRÍTICO] Título do problema

- **Arquivo:** `caminho/para/arquivo.ts:42`
- **Problema:** descrição clara do que foi encontrado
- **Impacto:** o que um atacante poderia fazer
- **Correção sugerida:** como resolver
- **Prioridade:** crítica / alta / média / baixa

### [ALTA] Título do problema
...

---

## Más Práticas

### Código morto / Duplicação / Nomes confusos

- **Arquivo:** `caminho/para/arquivo.ts`
- **Problema:** descrição
- **Sugestão:** como refatorar

---

## Inconsistências

### Doc vs Código / Configuração conflitante

- **Onde:** `caminho/para/arquivo.ts` vs `governanca/livro-arquitetura/01-visao-geral.md`
- **Problema:** descrição da divergência
- **Correção sugerida:** alinhar doc ao código, ou código à doc

---

## Notas

- Itens marcados como críticos/altos devem ser tratados na próxima sprint
- Reexecute esta auditoria após as correções para verificar
```

## Após Gerar o Relatório

1. **Registre nas notas persistentes** do `AGENTS.md` que a auditoria foi
   realizada e o caminho do relatório gerado
2. **Apresente o resumo** ao usuário (principais achados, prioridades)
3. **Pergunte** se deseja que os itens críticos/altos virem tarefas na
   sprint atual ou em uma sprint específica de correção
4. Se o usuário autorizar, crie as tarefas correspondentes nas sprints
5. **Leia as sprints ativas** (arquivos em `governanca/sprints/`, exceto
   `_template.md`). Para cada achado crítico/alto, identifique:
   - As sprints futuras preveem funcionalidades similares ao código onde
     o problema foi encontrado?
   - Se sim, o mesmo problema provavelmente se repetirá nessas sprints?
6. **Apresente ao usuário** cada sobreposição encontrada:
   > "A Sprint 3 prevê um formulário de cadastro. Na auditoria encontrei
   > que os formulários atuais não têm validação de entrada. Quer que eu
   > adicione validação como tarefa na Sprint 3 para evitar o mesmo problema?"
7. Se o usuário autorizar, **edite o arquivo da sprint** correspondente
   adicionando a tarefa preventiva e seus critérios de aceite
