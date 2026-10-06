---
status: em_andamento
ultima_modificacao: 2026-10-06
sessao_atual: 1
---

# Sprint 01: Blindagem Estrutural, Links Nativos e Rigor Operacional — rr-controle-de-agentes-1.1

**Objetivo:** Sanear todas as fragilidades mecânicas imediatas detectadas pela auditoria de maturidade (links relativos 404 em subpastas, vazamento de P&D para satélites, simulação mental na skill de auditoria, falsos sucessos no download remoto e duplicações literais de contexto), garantindo conformidade estrita e verificável sem adicionar complexidade de tooling.

---

## Etapas

### Etapa 1: Saneamento e Commit Consciente da Árvore Git Atual
**Objetivo:** Revisar e comitar as 6 alterações pendentes no repositório antes de novas modificações, assegurando rastreabilidade no changelog.
**Tarefas:**
- [x] Inspecionar o diff das alterações pendentes: `governanca/.matriz.json`, `governanca/AGENTS.md`, `governanca/livro-arquitetura/02-stack.md`, `governanca/scripts/harness.mjs`, `governanca/skills/CATALOGO_TECNOLOGIAS.md` e `governanca/templates/sincronizar.mjs`.
- [x] Registrar as alterações correspondentes em `governanca/CHANGELOG.md`.
- [x] Realizar commit consciente do estado pré-sprint.
**Critérios de Aceite:**
- [x] `git status` limpo antes de iniciar a Etapa 2.
- [x] `governanca/CHANGELOG.md` atualizado com o histórico de correções prévias.

### Etapa 2: Segregação Rigorosa de P&D (Matriz vs. Satélites)
**Objetivo:** Impedir que ferramentas exclusivas de evolução da Matriz vazem para os projetos clientes (satélites).
**Tarefas:**
- [x] Excluir `src/templates/skills/auditar-maturidade-governanca.md` e `src/templates/skills/CATALOGO_TECNOLOGIAS.md` (devem residir exclusivamente em `governanca/skills/`).
- [x] Excluir `src/templates/workflows/auditar-governanca.md` (deve residir exclusivamente em `governanca/workflows/`).
- [x] Excluir `src/templates/relatorios/_template_evolucao_governanca.md` (deve residir exclusivamente em `governanca/relatorios/`).
- [x] Atualizar `src/servidor/gerador.ts` (linhas 160–203) para incorporar o conjunto `exclusivosMatriz`, filtrando esses arquivos durante a geração/scaffold de novos satélites.
**Critérios de Aceite:**
- [x] Nenhuma ferramenta exclusiva de P&D presente em `src/templates/`.
- [x] Geração de satélite testada: pastas `skills/`, `workflows/` e `.agents/` de novos projetos geradas sem as ferramentas de P&D da matriz.

### Etapa 3: Padronização Universal de Links Relativos Navegáveis
**Objetivo:** Corrigir os caminhos de links Markdown dentro de subpastas para que funcionem nativamente em qualquer leitor CommonMark/GFM (GitHub, VS Code).
**Tarefas:**
- [x] Revisar todos os links em `governanca/padroes/` (`backend.md`, `frontend.md`, `sincronizacao-remota.md`): substituir referências com prefixo `governanca/...` por caminhos relativos ao diretório (ex: `../skills/...`, `../CHANGELOG.md`).
- [x] Revisar todos os links no Livro de Arquitetura (`governanca/livro-arquitetura/01..05`): substituir referências absolutas/raiz por caminhos relativos (ex: `../AGENTS.md`, `../skills/...`).
- [x] Replicar as mesmas correções nos templates equivalentes em `src/templates/arquitetura/` e `src/templates/padroes/`.
- [x] Atualizar `CONVENCOES-TEMPLATES.md` clarificando a regra: links em arquivos dentro de subpastas devem obrigatoriamente usar caminhos relativos navegáveis (`../`).
**Critérios de Aceite:**
- [x] 100% dos links em arquivos de subpastas apontando para caminhos relativos válidos.
- [x] Nenhum link retornando 404 ao ser clicado a partir de subpastas no VS Code ou GitHub.

### Etapa 4: Endurecimento do Validador de Templates
**Objetivo:** Fazer com que o `npm test` pare de mascarar links quebrados através de fallbacks permissivos na raiz.
**Tarefas:**
- [x] Modificar `src/scripts/validar-templates.ts` (linhas 188–196): remover o fallback `|| fs.existsSync(resolvidoRaiz)` para arquivos reais em subpastas, exigindo que o link resolva estritamente a partir de `resolvidoDir`.
- [x] Adicionar validação de paridade de wrappers do harness (`.agents/skills/` x `governanca/skills/`) dentro do teste.
- [x] Executar `npm test` e verificar que a suíte passa verde com resolução estrita.
**Critérios de Aceite:**
- [x] `npm test` executado e 100% aprovado sem tolerância a links quebrados em subpastas.

### Etapa 5: Blindagem da Skill `auditar-maturidade-governanca.md`
**Objetivo:** Extirpar autorizações de alucinação e exigir comprovação empírica em auditorias futuras.
**Tarefas:**
- [x] Eliminar terminantemente a frase `"Execute mentalmente ou via terminal npm test"` de `governanca/skills/auditar-maturidade-governanca.md`.
- [x] Tornar obrigatória a inclusão do **Manifesto de Cobertura** (tabela com arquivos lidos na íntegra x linhas) no corpo de todo relatório de auditoria gerado.
- [x] Disciplinar na skill a geração de **Sprints Físicas Dedicadas**: todo roadmap decorrente de auditoria deve ser materializado em arquivos individuais em `governanca/sprints/XX-nome.md`, seguindo `_template.md`.
- [x] Documentar o protocolo de delegação por subagentes especializados quando o harness suportar trabalho multiagente com handoff por artefatos.
**Critérios de Aceite:**
- [x] `governanca/skills/auditar-maturidade-governanca.md` reescrita com padrão de alta engenharia, sem brechas para amostragem preguiçosa.

### Etapa 6: Deduplicação de Contexto e SSOT de Sessão
**Objetivo:** Reduzir o desperdício de tokens de contexto eliminando textos duplicados ipsis litteris entre arquivos de controle.
**Tarefas:**
- [x] Enxugar `governanca/AGENTS.md` (linhas 167–175): substituir a transcrição literal do Protocolo de Início de Sessão por um ponteiro conciso apontando para `governanca/SESSAO.md` e `/status`.
- [x] Atualizar `src/templates/AGENTS.md` com o mesmo enxugamento.
- [x] Limpar a duplicação interna em `governanca/sprints/_template.md` (linhas 122–127 `## Como Arquivar`), unificando as instruções no item 11.
**Critérios de Aceite:**
- [x] `AGENTS.md` reduzido em ~180 tokens redundantes.
- [x] Zero divergência de instruções de sessão entre arquivos.

### Etapa 7: Resiliência de Rede e Higiene em `sincronizar.mjs`
**Objetivo:** Garantir que o script portátil de sincronização não gere relatórios falsos de sucesso e organize corretamente seus arquivos.
**Tarefas:**
- [x] Atualizar `governanca/scripts/sincronizar.mjs` (linhas 291–297): acumular falhas em requisições GitHub Raw (`rawRes.ok === false`) e abortar/alertar com código de saída de erro caso algum arquivo falhe.
- [x] Garantir que `gerador.ts` e `sincronizar.mjs` não copiem scripts `.mjs` para dentro de `governanca/templates/` (apenas arquivos `.template` devem residir lá).
- [x] Replicar as melhorias no template de distribuição `src/templates/scripts/sincronizar.mjs`.
**Critérios de Aceite:**
- [x] `sincronizar.mjs` interrompe e sinaliza erro caso haja falha de download em arquivos individuais.
- [x] Pasta `governanca/templates/` contendo apenas arquivos de extensão `.template`.

---

## Andamento

- [x] Etapas 1 a 7 implementadas
- [x] Testes passando (`npm test` 100% verde com 823 links estritos e 27 wrappers)
- [x] Código revisado

---

## Instruções ao Agente

1. **Gate 1 — aprovação do plano:** Apresente ao usuário as 7 etapas desta sprint, detalhando arquivos afetados e critérios de aceite. Só implemente após aprovação explícita.
2. Execute cada tarefa rigorosamente em ordem.
3. Após cada etapa, rode `npm test` para garantir não-regressão.
4. **Gate 2 — aprovação da entrega:** Apresente evidências, limitações e roteiro de verificação. Só realize commits com autorização do usuário.

---

## Conclusão

**Mensagem de commit sugerida:**
```
sprint-01: blindagem estrutural, links relativos nativos e saneamento da governanca
```

---

## Roteiro de Verificação

1. Executar `npm test` no terminal e constatar validação estrita sem fallbacks permissivos.
2. Abrir `governanca/padroes/backend.md` no VS Code e clicar em links relativos (`../skills/...`), confirmando que os arquivos destino abrem instantaneamente sem erro 404.
3. Verificar a ausência de ferramentas de P&D em `src/templates/skills/` e `src/templates/workflows/`.
4. Inspecionar `governanca/skills/auditar-maturidade-governanca.md` e verificar ausência do termo "mentalmente" e presença do manifesto de cobertura.

---

## Evidências

- [x] Build sem erros (`npm run build`)
- [x] `npm test` passando com validação estrita de links (823/823 links)
- [x] Diff do git revisado e registrado no `CHANGELOG.md`

## Limitações

- Modificações nesta sprint são estritamente de integridade mecânica, links, segregação de templates e documentação base. Novas ferramentas analíticas (Knip, Biome) e cabeçalhos de segurança (Strict CSP) serão introduzidos nas Sprints 02 e 03.

---

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
