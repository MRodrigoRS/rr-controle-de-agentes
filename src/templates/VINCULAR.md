# Vinculação de Repositório Existente

> Este projeto já existia antes da governança. O agente deve examinar o
> repositório e também considerar o plano/descrição fornecidos pelo usuário
> sobre o que deseja fazer com ele.

## 1. Leia o Plano do Usuário

Se o usuário forneceu uma descrição ou documento de requisitos (`.md`),
leia-o agora. Ele contém as melhorias, correções ou funcionalidades que o
usuário deseja implementar **a partir do repositório existente**.

> Se o plano/PRD do usuário contiver um esboço de stack técnica, **não avance**
> antes de executar a skill `comparar-stack-com-plano.md` em
> `governanca/skills/`. Ela orienta a comparação bidirecional entre a stack
> identificada no repositório e a stack do plano.

## 2. Examine o Repositório

- Leia `package.json`, `tsconfig.json`, `composer.json`, `.clasp.json`,
  `Dockerfile`, `Cargo.toml` ou equivalente para identificar linguagens,
  frameworks e dependências
- Examine a estrutura de pastas para entender a organização
- Verifique se há ferramentas de teste, lint, build configuradas
- Identifique serviços externos (bancos, APIs, gateways de pagamento)

## 3. Preencha o Livro de Arquitetura

Edite os arquivos em `governanca/livro-arquitetura/` com base no que
encontrou. Documente:

- Stack real do projeto (frontend, backend, banco)
- Estrutura de diretórios existente
- Decisões arquiteturais aparentes

## 4. Crie as Sprints

As sprints devem **combinar o código existente com o plano do usuário**:

- A **Sprint 1** deve ser a mais simples possível: adaptar a governança ao
  repositório e preparar o terreno para as primeiras melhorias
- Cada sprint posterior incrementa uma funcionalidade do plano
- Use o template em `governanca/sprints/_template.md` como base

## 5. Habilite a Governança

Após documentar tudo, apresente ao usuário:

- A stack identificada no repositório
- A estrutura documentada
- A proposta de sprints (combinando o que já existe com o que será feito)

Após aprovação, faça o primeiro commit com a mensagem:
```
sprint-00: vinculação de governança
```
