# RR Controle de Agentes 1.1 — Plano Final

## Filosofia

O RR 1.1 é uma **progenitora de projetos governados**. Ela cria a estrutura do projeto, gera `governanca/` com `.md` virgens, configura o harness nativo do agente (`.agents/`, `CLAUDE.md`) e **não acompanha** o desenvolvimento em tempo de execução. O projeto nasce, vive sozinho.

- **Sem JSONs de acompanhamento, sem banco de sprints, sem comandos de ciclo no projeto**
- **Sem acompanhamento de progresso** — a web UI cria, lista e regenera a governança dos projetos
- **Tudo em `.md`** dentro de `governanca/`
- **Fonte única da verdade (SSOT):** Catálogo de tecnologias gerido via SQLite nativo (`dados/rr.db`), presets vinculados por IDs inteiros auto-incrementais e snapshot em JSON para diffs legíveis no Git.

## O que o RR 1.1 faz

1. Cria projeto com estrutura de pastas base (se preset)
2. Gera `governanca/AGENTS.md` com diretrizes pétreas, qualidade e regra mandatória de uso da stack
3. Gera `governanca/INICIO.md` para onboarding completo do agente (ou `VINCULAR.md` se repositório existente)
4. Gera `governanca/sprints/_template.md` para o agente preencher
5. Gera `governanca/livro-arquitetura/` com a stack detalhada e categorizada (`02-stack.md`)
6. Gera `governanca/workflows/` e os registra em `.agents/workflows/` como **Slash Commands nativos** (`/spec`, `/plan`, `/implement`, `/test`, `/review`, `/research`, `/release`)
7. Gera `governanca/skills/` com habilidades práticas e catálogo oficial com IDs
8. Configura automaticamente o **Harness do Agente** (`.agents/rules/`, `.agents/workflows/`, `.agents/skills/` e `CLAUDE.md`)
9. Web UI: cria projetos, lista projetos criados, busca tecnologias por ID e permite recriar a governança a qualquer momento

## Estrutura que a progenitora gera

```
meu-projeto/
├── .agents/                     ← Harness nativo para Antigravity
│   ├── rules/                   ← 000-governanca.md (@governanca/AGENTS.md)
│   ├── workflows/               ← Slash commands (/spec, /plan, /review, etc.)
│   └── skills/                  ← Ponteiros leves para governanca/skills/
├── CLAUDE.md                    ← Ponteiro fino para Claude Code
├── governanca/
│   ├── AGENTS.md                ← instruções ao agente (regras pétreas, stack oficial)
│   ├── INICIO.md                ← onboarding com o arsenal completo do preset (ou VINCULAR.md)
│   ├── PLANO.md                 ← visão e objetivos do projeto
│   ├── sprints/
│   │   └── _template.md         ← template preenchível de sprint
│   ├── livro-arquitetura/
│   │   ├── 01-visao-geral.md
│   │   ├── 02-stack.md          ← catálogo categorizado de ferramentas e responsabilidades
│   │   ├── 03-logica-do-sistema.md
│   │   └── 04-comportamento-autonomo.md
│   ├── skills/                  ← skills operacionais e CATALOGO_TECNOLOGIAS.md
│   ├── scripts/                 ← scripts auxiliares do projeto
│   ├── workflows/               ← procedimentos do ciclo de desenvolvimento
│   └── relatorios/              ← templates de auditorias
├── src/                         ← estrutura base de código
└── package.json
```

## Estrutura do RR 1.1 (ferramenta)

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
│   │   ├── page.tsx             ← lista projetos e busca no catálogo de tecnologias
│   │   ├── criar/page.tsx       ← formulário de criação com presets e vinculação
│   │   ├── projetos/[id]/page.tsx ← detalhes e botão de recriar governança
│   │   └── api/
│   │       ├── projetos/route.ts
│   │       ├── tecnologias/route.ts
│   │       └── selecionar-pasta/route.ts
│   ├── componentes/             ← UI da progenitora
│   ├── presets/
│   │   └── index.ts             ← tipagem e resolução de stacks via IDs
│   ├── servidor/
│   │   ├── db.ts                ← módulo central SQLite nativo (node:sqlite)
│   │   ├── gerador.ts           ← engine que monta governanca/ no disco
│   │   ├── harness.ts           ← automação de harness (.agents, CLAUDE.md)
│   │   ├── projetos.ts          ← camada de serviço de projetos
│   │   ├── templates.ts         ← micro-engine de processamento .md
│   │   └── dados/
│   │       ├── presets.json     ← definições de presets com tecnologiaIds
│   │       ├── tecnologias.json ← snapshot sincronizado para imports
│   │       └── gerar-catalogo.ts← compila CATALOGO_TECNOLOGIAS.md
│   ├── scripts/
│   │   ├── cadastrar-tecnologia.ts ← CLI npm run rr:tecnologia
│   │   ├── configurar-harness.ts   ← CLI npm run rr:harness
│   │   ├── vincular.ts             ← CLI npm run rr:vincular
│   │   └── validar-templates.ts    ← CLI npm test (integridade referencial + sintaxe)
│   └── templates/               ← modelos .md oficiais
│       ├── AGENTS.md
│       ├── INICIO.md
│       ├── VINCULAR.md
│       ├── PLANO.md
│       ├── PRD.md
│       ├── SPRINT.md
│       ├── arquitetura/
│       ├── skills/
│       ├── workflows/
│       └── relatorios/
└── PLANO.md
```

## Comandos da Progenitora

- `npm run dev`: Executa a interface web em `http://localhost:3000`.
- `npm test`: Executa o validador de integridade referencial de presets e sintaxe de templates.
- `npm run rr:tecnologia`: Cadastra uma tecnologia inédita com ID auto-incremental via SQLite e atualiza o catálogo.
- `npm run rr:harness`: Configura ou re-sincroniza o harness do agente em qualquer projeto existente.
- `npm run rr:vincular`: Injeta a governança em um repositório existente sem alterar o código original.
- `npm run rr:db:migrar`: Executa a migração/seed do catálogo e projetos para `dados/rr.db`.
