# Plano — RR Controle de Agentes 1.1

**Gerado em:** 2026-10-02

## Filosofia

O RR 1.1 é uma **progenitora de projetos governados**. Ela cria a estrutura do projeto, gera `governanca/` com arquivos `.md` virgens, configura o harness nativo do agente ([.agents/](.agents/), [CLAUDE.md](CLAUDE.md), [AGENTS.md](AGENTS.md)) e **não acompanha** o desenvolvimento em tempo de execução. O projeto nasce e vive sozinho.

- **Sem JSONs de acompanhamento, sem banco de sprints, sem comandos de ciclo no projeto**
- **Sem acompanhamento de progresso** — a web UI cria, lista e regenera a governança dos projetos
- **Tudo em `.md`** dentro de `governanca/`
- **Fonte única da verdade (SSOT):** Catálogo de tecnologias gerido via SQLite nativo (`dados/rr.db`), presets vinculados por IDs inteiros auto-incrementais e snapshot em JSON para diffs legíveis no Git.

## Objetivos e Capacidades da Progenitora

1. Cria projeto com estrutura de pastas base (se preset)
2. Gera [AGENTS.md](governanca/AGENTS.md) com diretrizes pétreas, qualidade e regra mandatória de uso da stack
3. Gera [INICIO.md](governanca/INICIO.md) para onboarding completo do agente (ou [VINCULAR.md](governanca/VINCULAR.md) se repositório existente)
4. Gera [sprints/_template.md](governanca/sprints/_template.md) para o agente preencher
5. Gera [livro-arquitetura/](governanca/livro-arquitetura/) com a stack detalhada e categorizada ([02-stack.md](governanca/livro-arquitetura/02-stack.md))
6. Gera [workflows/](governanca/workflows/) e os registra em `.agents/workflows/` como **Slash Commands nativos** (`/fix`, `/spec`, `/plan`, `/implement`, `/test`, `/review`, `/research`, `/release`)
7. Gera [skills/](governanca/skills/) com habilidades práticas e catálogo oficial com IDs
8. Configura automaticamente o **Harness do Agente** (`.agents/rules/`, `.agents/workflows/`, `.agents/skills/`, [CLAUDE.md](CLAUDE.md) e [AGENTS.md](AGENTS.md))
9. Fornece script autônomo e portátil [harness.mjs](governanca/scripts/harness.mjs) para sincronização nativa com Node.js sem dependências externas
10. Web UI: cria projetos, lista projetos criados, busca tecnologias por ID/aplicabilidade/nome e permite recriar a governança a qualquer momento sem perder o [PLANO.md](governanca/PLANO.md) do usuário.

## Estrutura da Ferramenta

```
rr-controle-de-agentes-1.1/
├── package.json
├── tsconfig.json
├── dados/
│   ├── rr.db                    ← SQLite local nativo (node:sqlite)
│   ├── tecnologias-snapshot.json← Snapshot JSON das tecnologias para Git
│   └── projetos.json            ← Registro/backup de projetos
├── src/
│   ├── app/                     ← Next.js 16 (web UI)
│   ├── componentes/             ← UI da progenitora
│   ├── presets/                 ← Tipagem e resolução de stacks via IDs
│   ├── servidor/                ← Engine geradora, harness, db e templates
│   ├── scripts/                 ← CLIs (tecnologia, harness, vincular, validar)
│   └── templates/               ← Modelos .md oficiais
└── governanca/                  ← Auto-governança ativa da própria progenitora
```

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
