# Visão Geral da Arquitetura — rr-controle-de-agentes-1.1

**Projeto:** rr-controle-de-agentes-1.1
**Gerado em:** 2026-10-02

## Stack

- **Frontend:** Next.js (App Router) (Next.js 16 (App Router))
- **Backend:** Node.js 22 + Hono / SQLite

## Estrutura de Diretórios

```
src/
├── app/          ← páginas/rotas
├── componentes/  ← componentes reutilizáveis
├── servidor/     ← lógica de servidor
└── lib/          ← utilitários
```

## Decisões Arquiteturais (ADR)

Registre decisões importantes com o formato ADR, em sequência (ADR-01, ADR-02...):

- **Problema:** o que precisava ser decidido
- **Alternativas:** opções consideradas
- **Decisão:** o que foi escolhido
- **Motivo:** por quê
- **Consequências:** impactos e trade-offs

Decisões contestadas com o usuário também entram aqui (veja "Dever de Crítica"
no [AGENTS.md](../AGENTS.md)). Isso impede que a arquitetura seja "redescoberta" a cada sprint.

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
