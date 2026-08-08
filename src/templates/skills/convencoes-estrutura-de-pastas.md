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
│   ├── html/             ← páginas HTML do Google Apps Script
│   ├── api/              ← rotas/endpoints (FastAPI)
│   ├── servicos/         ← lógica de negócio (Python)
│   ├── modelos/          ← modelos/entidades de banco (SQLAlchemy)
│   ├── ui/               ← interfaces NiceGUI
│   │   ├── componentes/  ← componentes de UI reutilizáveis (NiceGUI)
│   │   └── paginas/      ← páginas/rotas da UI (NiceGUI)
│   │   ├── janelas/      ← janelas da aplicação desktop (PySide6)
│   │   └── componentes/  ← componentes Qt reutilizáveis (PySide6)
│   ├── recursos/         ← ícones, imagens, QSS (desktop PySide6)
│   ├── Views/            ← telas da aplicação MAUI (.NET)
│   ├── ViewModels/       ← view models da aplicação MAUI
│   ├── Models/           ← modelos de dados (MAUI)
│   ├── Services/         ← serviços e acesso a dados (MAUI)
│   ├── Resources/        ← recursos visuais (MAUI)
│   ├── hooks/            ← hooks React (React Native)
│   └── dados/            ← schemas de banco, tipos, ORM, conexões, migrations
├── lib/                  ← código da aplicação Flutter
│   ├── ui/
│   │   ├── screens/      ← telas (Flutter)
│   │   └── widgets/      ← widgets reutilizáveis (Flutter)
│   ├── modelos/          ← modelos de dados (Flutter)
│   ├── servicos/         ← serviços (Flutter)
│   └── dados/            ← acesso a dados (Flutter)
├── prisma/               ← schema e migrations do Prisma ORM
├── public/               ← assets estáticos da extensão de navegador
├── testes/               ← testes unitários, integração, e2e (também pytest)
├── docs/                 ← documentação extra (diagramas, decisões técnicas)
├── governanca/           ← governança do projeto (gerado pela progenitora)
│   ├── scripts/          ← automações do projeto: build, deploy, seed, tarefas (não regenera)
│   ├── templates/        ← modelos virgens que regeneram (projetos PostgreSQL)
│   └── relatorios/       ← relatórios de auditoria e análise
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
| `src/api/` | Rotas e endpoints (FastAPI) |
| `src/servicos/` | Lógica de negócio e casos de uso (Python) |
| `src/modelos/` | Modelos/entidades de banco (SQLAlchemy) |
| `src/ui/` | Interfaces NiceGUI |
| `src/ui/componentes/` | Componentes de UI reutilizáveis (NiceGUI) |
| `src/ui/paginas/` | Páginas/rotas da UI (NiceGUI) |
| `src/ui/janelas/` | Janelas da aplicação desktop (PySide6) |
| `src/recursos/` | Ícones, imagens e QSS (desktop PySide6) |
| `src/Views/` | Telas da aplicação MAUI (.NET) |
| `src/ViewModels/` | View models da aplicação MAUI |
| `src/Models/` | Modelos de dados (MAUI) |
| `src/Services/` | Serviços e acesso a dados (MAUI) |
| `src/Resources/` | Recursos visuais (MAUI) |
| `src/hooks/` | Hooks React reutilizáveis (React Native) |
| `lib/ui/` | Telas e widgets da aplicação Flutter |
| `lib/ui/screens/` | Telas (Flutter) |
| `lib/ui/widgets/` | Widgets reutilizáveis (Flutter) |
| `lib/modelos/` | Modelos de dados (Flutter) |
| `lib/servicos/` | Serviços (Flutter) |
| `lib/dados/` | Acesso a dados (Flutter) |
| `prisma/` | Schema e migrations do Prisma ORM |
| `public/` | Assets estáticos (ícones, manifest da extensão) |
| `testes/` | Testes organizados por tipo (unit/, integracao/, e2e/) |
| `docs/` | Documentação extra que não cabe no livro de arquitetura |
| `governanca/` | Governança do projeto (sprints, skills, scripts, relatorios, arquitetura) |
| `governanca/scripts/` | Automações do projeto: build, deploy, seed, migrações manuais (não regenera) |
| `governanca/templates/` | Modelos virgens que regeneram (ex: extrair-modelo em projetos PostgreSQL) |
| `governanca/relatorios/` | Relatórios de auditoria e análise do repositório |

## Notas

- Se o preset não criar alguma pasta, você pode criá-la quando necessário
- A estrutura deve SEMPRE ser mantida — não crie pastas soltas na raiz
- Componentes de terceiros (shadcn/ui, base-ui) vão em `src/componentes/`
- Testes de um módulo específico devem ficar em `testes/` com nome correspondente
