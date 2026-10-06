---
name: usar-harness-do-agente
description: Usa o harness do agente (MCP, permissões, git, browser, hooks) com segurança e eficiência de contexto.
---

# Skill: Usar o Harness do Agente

> Orienta o uso do ambiente/harness do agente (MCP, permissões, git, browser,
> hooks, execução assíncrona) com segurança e eficiência. Princípios agnósticos
> de ferramenta — aplicam-se ao Antigravity, Claude, opencode ou qualquer harness.

## MCP — Só o Necessário

- Skill = "como fazer"; MCP = "com o que fazer". Instale MCP apenas para uma
  capacidade que falta
- **Derive os MCPs dos serviços reais do projeto** (banco, auth, storage,
  pagamento, repositório, APIs) — não de uma lista pré-definida
- Antes de instalar: a capacidade precisa ser uma ferramenta? Existe alternativa
  local/determinística?
- Conceda **menor privilégio**: apenas o acesso necessário
- Nunca instale dezenas de MCPs "por garantia" — tool bloat aumenta o contexto

## Permissões — Menor Privilégio

- Ordem de preferência: leitura → execução controlada → escrita → ações
  destrutivas com aprovação
- Ações destrutivas (produção, banco, cloud, deploy, exclusões) exigem aprovação
  explícita
- Nunca trate o agente como autoridade absoluta

## Git como Sistema de Segurança

- Antes de uma tarefa grande: `git status` + branch + checkpoint
- Trabalho arriscado: branch/worktree → agente autônomo → verificação → merge
- Aumente a autonomia sem perder reversibilidade

## Browser/Visão para Resultados Visuais

- Quando o resultado é visual, não confie só no código: executar → interagir →
  screenshot → avaliar → corrigir
- Essencial para web, dashboards, UI, jogos e documentação visual

## Hooks e Automação

- Se uma garantia pode ser determinística, automatize (lint pré-commit, testes
  rápidos após alteração, smoke pós-build) — não dependa da memória do agente

## Execução Assíncrona

- Delegue trabalhos que não exigem atenção imediata (pesquisa, testes,
  documentação, revisão) e trabalhe em paralelo — paralelização do trabalho
  intelectual
- Se o harness suportar subagentes, delegue a subagentes especializados (veja
  [usar-subagentes.md](usar-subagentes.md)) — contexto isolado, sem poluir o agente principal

## Observabilidade e Custo

- Acompanhe tokens, loops de correção, tarefas reabertas, ferramentas usadas
- Custo não é só dinheiro: latência, chamadas redundantes, agentes e ferramentas
  desnecessárias, contexto duplicado
- Use complexidade onde ela compra qualidade — um pipeline de 8 agentes não é
  automaticamente melhor que um de 2
