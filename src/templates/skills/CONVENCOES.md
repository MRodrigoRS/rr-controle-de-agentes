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
│   └── dados/            ← schemas de banco, tipos, ORM, migrations
├── testes/               ← testes unitários, integração, e2e
├── scripts/              ← automações: build, deploy, seed, tarefas
├── docs/                 ← documentação extra (diagramas, decisões técnicas)
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
| `testes/` | Testes organizados por tipo (unit/, integracao/, e2e/) |
| `scripts/` | Automações: build, deploy, seed, migrações manuais |
| `docs/` | Documentação extra que não cabe no livro de arquitetura |

## Notas

- Se o preset não criar alguma pasta, você pode criá-la quando necessário
- A estrutura deve SEMPRE ser mantida — não crie pastas soltas na raiz
- Componentes de terceiros (shadcn/ui, base-ui) vão em `src/componentes/`
- Testes de um módulo específico devem ficar em `testes/` com nome correspondente
