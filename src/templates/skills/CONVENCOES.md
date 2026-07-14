# Skill: Convenções de Estrutura de Pastas

> Define a organização padrão de diretórios para todos os projetos governados.

## Estrutura Padrão

```
projeto/
├── src/
│   ├── app/              ← entrada da aplicação (páginas, rotas)
│   ├── componentes/      ← componentes de UI reutilizáveis
│   ├── lib/              ← lógica de negócio, validações, helpers puros
│   ├── servidor/         ← APIs, server actions, serviços, rotas backend
│   ├── dados/            ← schemas de banco, tipos, ORM, conexões, migrations
│   ├── cenas/            ← cenas 3D / fases de jogo (Three.js, PixiJS)
│   ├── estado/           ← estado global da aplicação (Zustand, Redux)
│   ├── scripts/          ← scripts de cena, lógica de jogo, automações
│   ├── popup/            ← popup da extensão de navegador
│   ├── background/       ← service worker da extensão de navegador
│   ├── content/          ← content scripts da extensão de navegador
│   └── html/             ← páginas HTML do Google Apps Script
├── prisma/               ← schema e migrations do Prisma ORM
├── public/               ← assets estáticos da extensão de navegador
├── testes/               ← testes unitários, integração, e2e
├── docs/                 ← documentação extra (diagramas, decisões técnicas)
├── governanca/           ← governança do projeto (gerado pela progenitora)
│   └── scripts/          ← automações: build, deploy, seed, tarefas
├── .env.example
├── .gitignore
├── README.md
└── package.json
```

## Regras

| Pasta | O que vai |
|-------|-----------|
| `src/app/` | Tudo que é ponto de entrada: páginas, rotas, entry points |
| `src/componentes/` | Componentes de UI reutilizáveis, desacoplados de lógica de negócio |
| `src/lib/` | Lógica pura, validações, utilidades **sem dependência de framework** |
| `src/servidor/` | Tudo que roda no servidor: APIs, server actions, integrações |
| `src/dados/` | Schemas, types de banco, ORM, conexões, migrations |
| `src/cenas/` | Cenas 3D ou fases de jogo (Three.js, PixiJS) |
| `src/estado/` | Estado global da aplicação (stores, slices) |
| `src/scripts/` | Scripts auxiliares de cena/jogo ou automações |
| `src/popup/` | Popup da extensão de navegador (Manifest V3) |
| `src/background/` | Service worker da extensão de navegador |
| `src/content/` | Content scripts da extensão de navegador |
| `src/html/` | Páginas HTML do Google Apps Script |
| `prisma/` | Schema e migrations do Prisma ORM |
| `public/` | Assets estáticos (ícones, manifest da extensão) |
| `testes/` | Testes organizados por tipo (unit/, integracao/, e2e/) |
| `docs/` | Documentação extra que não cabe no livro de arquitetura |
| `governanca/` | Governança do projeto (sprints, skills, scripts, arquitetura) |
| `governanca/scripts/` | Automações: build, deploy, seed, migrações manuais |

## Notas

- Se o preset não criar alguma pasta, você pode criá-la quando necessário
- A estrutura deve SEMPRE ser mantida — não crie pastas soltas na raiz
- Componentes de terceiros (shadcn/ui, base-ui) vão em `src/componentes/`
- Testes de um módulo específico devem ficar em `testes/` com nome correspondente
