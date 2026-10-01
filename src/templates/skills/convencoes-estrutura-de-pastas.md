---
name: convencoes-estrutura-de-pastas
description: Define a organização padrão de diretórios para projetos governados, separando estrutura base de pastas específicas por stack.
---

# Skill: Convenções de Estrutura de Pastas

> Define a organização padrão de diretórios para todos os projetos governados.
> Nunca crie pastas soltas na raiz do projeto.

## 1. Estrutura Base Universal (Aplicações Web, APIs e Serviços)

```
projeto/
├── src/
│   ├── app/              ← entrada da aplicação (páginas, rotas, views)
│   ├── componentes/      ← componentes de UI reutilizáveis (sem lógica de negócio)
│   ├── lib/              ← lógica de negócio pura, validações e helpers agnósticos
│   ├── servidor/         ← APIs, endpoints, server actions e serviços de backend
│   ├── dados/            ← schemas de banco, tipos, ORM, conexões e migrations
│   └── estado/           ← gerenciamento de estado global (Zustand, Redux, Store)
├── public/               ← assets estáticos públicos (imagens, fontes, manifest)
├── testes/               ← suíte de testes (unitários, integração, e2e)
├── governanca/           ← governança oficial do projeto (gerada pela progenitora)
│   ├── AGENTS.md         ← regras mestre e diretrizes pétreas
│   ├── SESSAO.md         ← sprint ativa e notas de contexto entre sessões
│   ├── sprints/          ← sprints do projeto (concluídas em sprints/concluidas/)
│   ├── livro-arquitetura/← documentação viva de arquitetura e stack
│   ├── skills/           ← habilidades operacionais e catálogo
│   ├── workflows/        ← procedimentos do ciclo de desenvolvimento
│   ├── scripts/          ← automações auxiliares de build/deploy/seed
│   └── relatorios/       ← relatórios de auditoria e análises
├── .env.example
├── .gitignore
└── package.json
```

## 2. Pastas Específicas por Ecossistema

Crie e utilize estas pastas **apenas se** o projeto pertencer à stack correspondente:

### Python / FastAPI / NiceGUI
- `src/api/` — Endpoints REST (FastAPI)
- `src/servicos/` — Casos de uso e lógica de aplicação
- `src/modelos/` — Modelos e entidades SQLAlchemy / Pydantic
- `src/ui/` — Interfaces e páginas NiceGUI (`ui/componentes/`, `ui/paginas/`)

### Desktop (PySide6)
- `src/ui/janelas/` — Janelas e diálogos Qt
- `src/recursos/` — Arquivos QSS, ícones e assets desktop

### Mobile (.NET MAUI)
- `src/Views/`, `src/ViewModels/`, `src/Models/`, `src/Services/`, `src/Resources/`

### Mobile (Flutter)
- `lib/ui/screens/`, `lib/ui/widgets/`, `lib/modelos/`, `lib/servicos/`, `lib/dados/`

### Extensões de Navegador (Manifest V3)
- `src/popup/` — Interface popup da extensão
- `src/background/` — Service worker / background script
- `src/content/` — Content scripts injetados

### Jogos / Web 3D (Three.js / PixiJS)
- `src/cenas/` — Fases ou cenas 3D
- `src/scripts/` — Scripts e controladores de física/animação

## 3. Regras de Manutenção

- **Nunca crie pastas na raiz:** Todo código fonte deve residir em `src/` (ou `lib/` em Flutter).
- **Componentes Compartilhados:** Componentes reutilizáveis (Button, Modal, Input) devem ficar sempre em `src/componentes/`.
- **Testes Espelhados:** A estrutura de `testes/` deve refletir a organização dos módulos testados em `src/`.
