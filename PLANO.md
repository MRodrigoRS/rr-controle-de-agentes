# RR Controle de Agentes 1.1 — Plano Final

## Filosofia

O RR 1.1 é uma **progenitora de projetos governados**. Ela cria a estrutura do projeto, gera `governanca/` com `.md` virgens, e **não acompanha** o desenvolvimento. O projeto nasce, vive sozinho.

- **Sem JSONs, sem banco de sprints, sem comandos de ciclo**
- **Sem acompanhamento de progresso** — o web UI só cria e lista projetos
- **Tudo em `.md`** dentro de `governanca/`

## O que o RR 1.1 faz

1. Cria projeto com estrutura de pastas
2. Gera `governanca/AGENTS.md` com CPs, stack, objetivo
3. Gera `governanca/INICIO.md` para onboarding do agente
4. Gera `governanca/sprints/_template.md` para o agente preencher
5. Gera `governanca/livro-arquitetura/` com docs da stack
6. Gera `governanca/skills/` com skills que nascem com o projeto:
   - `alinhar-stack-com-presets.md` — instrui o agente a alinhar a stack do
     plano/repositório com os presets da progenitora e a contribuir com
     novas tecnologias ao catálogo
   - `CATALOGO_TECNOLOGIAS.md` — lista completa de tecnologias catalogadas
7. Web UI: cria projeto e lista projetos criados — só

## Estrutura que a progenitora gera

```
meu-projeto/
├── governanca/
│   ├── AGENTS.md                ← instruções ao agente (CPs, stack)
│   ├── INICIO.md                ← onboarding (se sem preset ou com plano)
│   ├── sprints/
│   │   └── _template.md         ← template preenchível
│   ├── livro-arquitetura/
│   │   ├── 01-visao-geral.md
│   │   └── 02-stack.md
│   ├── skills/
│   │   ├── alinhar-stack-com-presets.md ← skill ativa
│   │   └── CATALOGO_TECNOLOGIAS.md    ← catálogo para consulta
│   ├── scripts/                ← scripts do projeto (não regeneram)
│   └── templates/              ← modelos virgens (regeneram; projetos PostgreSQL)
├── src/                         ← estrutura base (se preset)
└── package.json
```

## Estrutura do RR 1.1 (ferramenta)

```
rr-controle-de-agentes-1.1/
├── package.json
├── tsconfig.json
├── prisma/
│   └── schema.prisma            ← só Projeto, Perfis
├── src/
│   ├── app/                     ← Next.js (web UI)
│   │   ├── page.tsx             ← lista projetos
│   │   ├── criar/page.tsx       ← formulário de criação
│   │   ├── projetos/[id]/page.tsx ← detalhes do projeto (leitura)
│   │   └── api/projetos/route.ts  ← API de criação
│   ├── presets/
│   │   └── index.ts             ← definições de stacks
│   ├── servidor/
│   │   ├── gerador.ts           ← engine que monta governanca/ no disco
│   │   ├── templates.ts         ← processa templates .md
│   │   └── dados/
│   │       ├── tecnologias.json     ← catálogo de tecnologias
│   │       └── gerar-catalogo.ts    ← gera CATALOGO_TECNOLOGIAS.md
│   └── templates/               ← modelos .md
│       ├── AGENTS.md
│       ├── INICIO.md
│       ├── SPRINT.md
│       ├── arquitetura/
│   └── skills/
│       └── alinhar-stack-com-presets.md
├── dados/
│   └── projetos.json            ← registro de projetos criados
└── PLANO.md
```

## O que NÃO existe mais

- `src/scripts/rr-*.ts` — sem comandos CLI
- `src/servidor/governanca/` — removido (viram `src/servidor/gerador.ts`)
- `src/componentes/painel/` — removido
- Modelos Sprint, Etapa, Criterio, Teste, Commit, Execucao — só no lixo
- `rr:iniciar, rr:concluir, rr:commit, rr:testar` — não existem

## Sugestões de outras skills

- **padroes-de-codigo.md** — padrões de código, nomenclatura, estrutura de pastas
- **estrutura-de-commits.md** — como formatar mensagens de commit
- **deploy.md** — instruções de build e deploy para a stack do projeto
- **testes.md** — padrões e ferramentas de teste esperadas
