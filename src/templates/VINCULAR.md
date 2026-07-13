# Vinculação de Repositório Existente

> Este projeto já existia antes da governança. O agente deve examinar o
> repositório e documentar a estrutura, stack e arquitetura existentes.

## 1. Examine o Repositório

- Leia `package.json`, `tsconfig.json`, `composer.json`, `Cargo.toml` ou
  equivalente para identificar linguagens, frameworks e dependências
- Examine a estrutura de pastas para entender a organização
- Verifique se há ferramentas de teste, lint, build configuradas

## 2. Preencha o Livro de Arquitetura

Edite os arquivos em `governanca/livro-arquitetura/` com base no que
encontrou. Documente:

- Stack real do projeto (frontend, backend, banco)
- Estrutura de diretórios existente
- Decisões arquiteturais aparentes

## 3. Crie as Sprints

Com base no escopo do projeto, crie sprints em `governanca/sprints/`.
Use `_template.md` como base para cada sprint.
Cada sprint deve ter etapas, critérios de aceite e comandos de teste.

## 4. Habilite a Governança

Após documentar tudo, apresente ao usuário:

- A stack identificada
- A estrutura documentada
- A proposta de sprints

Após aprovação, faça o primeiro commit com a mensagem:
```
sprint-00: vinculação de governança
```
