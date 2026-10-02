---
name: evoluir-governanca
description: Registra o que deu errado e transforma em nova regra, skill, workflow, teste ou script — melhora o próprio ambiente e propaga melhorias à progenitora.
---

# Skill: Evoluir a Governança

> Meta-loop: o ambiente deve melhorar a si mesmo. Depois de falhas, retrabalho
> ou descobertas, transforme o aprendizado em regras, skills, workflows, testes
> ou scripts permanentes.

## Quando Executar

- Após uma falha, bug recorrente ou retrabalho
- Ao final de ciclos importantes (sprint, release)
- Quando perceber que o agente "descobriu" algo que já deveria estar documentado

## Passos no Projeto

1. Registre: o que deu errado? Por quê?
2. Pergunte:
   - Qual regra teria evitado?
   - Qual skill faltou?
   - Qual teste faltou?
   - Qual etapa deveria ser automatizada?
   - Qual MCP era desnecessário?
3. Transforme a resposta em ação:
   - diretriz de UI/UX, componentes, acessibilidade ou estado frontend → `governanca/padroes/frontend.md`
   - diretriz de APIs, segurança, validação, persistência ou backend → `governanca/padroes/backend.md`
   - regra constitucional ou disciplina fundamental do agente → `AGENTS.md` (Cláusulas Fundamentais)
   - skill faltante → criar skill em `governanca/skills/`
   - procedimento recorrente → workflow em `governanca/workflows/`
   - teste que falta → tarefa em sprint
   - automação → script/hook em `governanca/scripts/`
4. Registre no `SPRINT.md` ou changelog o que mudou e por quê.
5. Se criou uma nova skill ou workflow, re-sincronize o harness:
   ```bash
   npx tsx ./src/scripts/configurar-harness.ts .
   ```

## Como Propagar Melhorias de Volta à Progenitora

Quando uma melhoria for validada no projeto e fizer sentido para todo o ecossistema (novas tecnologias, ajustes de presets ou evolução de templates e manuais):

1. **Adicionar Tecnologia ao Catálogo Central:**
   Execute o comando atômico na progenitora:
   ```bash
   cd ./
   npm run rr:tecnologia -- --nome "Nome" --categoria "Categoria" --aplicabilidade "..." --descricao "..."
   ```
   *O SQLite da progenitora atribuirá um ID numérico auto-incremental imediatamente e atualizará o snapshot do Git.*

2. **Vincular Tecnologia ao Preset na Progenitora:**
   - No repositório da progenitora (`./`), edite `src/servidor/dados/presets.json`.
   - Adicione o ID numérico gerado no array `tecnologiaIds` do preset e o nome no array `stack`.
   - Valide executando: `npm test` (garante integridade referencial 100%).

3. **Atualizar Manuais de Engenharia e Templates Oficiais:**
   - **Práticas de Frontend:** Se novas técnicas mundiais de frontend, acessibilidade WCAG, design tokens, microinterações ou UX surgiram, edite `./src/templates/padroes/frontend.md`.
   - **Práticas de Backend:** Se novas convenções de segurança OWASP, arquitetura em camadas, validação estrita (Zero-Trust) ou resiliência surgiram, edite `./src/templates/padroes/backend.md`.
   - **Diretrizes Gerais ou Novos Templates:** Se a melhoria for uma diretriz arquitetural geral ou novo template, edite os arquivos em `./src/templates/`.
   - **Validação Obrigatória:** Execute `npm test` na progenitora para confirmar que todos os templates e presets continuam íntegros.

## Regras

- Não transforme um caso isolado em regra — procure padrão (repetiu 2+ vezes).
- Propostas e alterações na progenitora passam obrigatoriamente por aprovação prévia do usuário.
- Priorize a ferramenta mais simples: regra em manual → script → skill → workflow → agente.

