---
name: usar-subagentes
description: Orquestra subagentes (pesquisador, arquiteto, implementador, testador, revisor) quando o harness suportar, delegando com contexto isolado e handoff por artefatos.
---

# Skill: Usar Subagentes (Multiagente)

> Habilita o trabalho multiagente quando o harness suportar (ex: Antigravity):
> delegar tarefas isoláveis a subagentes especializados, com contexto isolado
> (não polui o agente principal) e handoff por artefatos.

## Quando Usar

- Tarefa isolável ou pesquisa extensa
- Revisão independente (criador ≠ juiz)
- Paralelismo — várias frentes ao mesmo tempo
- Especialização — um papel dedicado por etapa

## Quando NÃO Usar

- Tarefa trivial (ex: renomear variável) — o overhead de subagente custa tempo
  e tokens
- Não crie cinco agentes para uma linha de código

## Papéis Padrão

| Papel | Workflow | Função |
|---|---|---|
| `pesquisador` | [research.md](../workflows/research.md) | investiga, fontes, riscos — **não implementa** |
| `arquiteto` | [spec.md](../workflows/spec.md) / [plan.md](../workflows/plan.md) | estrutura, interfaces, decisões — **não implementa** |
| `implementador` | [implement.md](../workflows/implement.md) | transforma a spec aprovada em código |
| `testador` | [test.md](../workflows/test.md) | tenta **quebrar** (QA) |
| `revisor` | [review.md](../workflows/review.md) | crítico independente (**criador ≠ juiz**) |

## Como Funciona

- O agente principal invoca o subagente com um papel e um prompt inicial
- O subagente roda com **contexto isolado** (não herda a conversa do principal)
- Vários subagentes podem rodar em paralelo
- **Handoff por artefatos:** a saída de um subagente vira arquivo
  (pesquisa.md, sprint, evidências, review) e o próximo agente lê o arquivo —
  nunca dependa de mensagens entre agentes
- **Permissões:** subagentes herdam as do agente principal; ações que exigem
  aprovação sobem ao usuário

## Delegação no Harness

Quando o ambiente suportar subagentes nativos (ex: Antigravity, OpenCode, Claude Code):
- O agente principal delega tarefas especificando:
  1. **Papel estrito e delimitado** (pesquisador, implementador, testador, revisor).
  2. **Escopo fechado:** indique exatamente qual arquivo ler e qual artefato produzir no disco.
  3. **Menor privilégio:** restrinja o acesso às ferramentas necessárias para a tarefa (leitura para pesquisa, execução de testes para QA).
- **Handoff por arquivo:** O subagente grava seu resultado em arquivo (ex: `governanca/relatorios/pesquisa.md` ou na sprint). O agente principal lê o arquivo gerado — sem depender de troca de mensagens em chat.

## Fluxo no Ciclo

- **Gate 1 (plano):** delegue a `pesquisador` e `arquiteto` para investigar e
  propor antes de implementar
- **Implementação:** `implementador` executa a sprint aprovada
- **Verificação:** `testador` tenta quebrar o que foi feito
- **Gate 2 (entrega):** `revisor` independente revisa antes de aprovar —
  o criador não deve ser o único juiz

## Regras

- Subagente é para trabalho **isolável** — priorize a ferramenta mais simples:
  regra → script → skill → subagente → orquestrador
- Nunca delegue o que o agente principal resolve em poucas ferramentas
- Handoff sempre por **artefato (arquivo)**, não por memória de conversa
- Menor privilégio: `tools` mínimos, `commandExecutionPolicy: sandbox`,
  aprovação para ações destrutivas
