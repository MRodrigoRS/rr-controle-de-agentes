---
name: mapear-comportamento-autonomo
description: Documenta triggers, jobs, webhooks, workers, middleware, CI e cascatas no livro-arquitetura/04.
---

# Skill: Mapear Comportamento Autônomo

> Varre o repositório em busca de triggers, jobs, webhooks, workers,
> middlewares, cascatas de banco, CI e hooks — tudo que executa sozinho
> sem ação direta do usuário. Documenta cada achado em
> [04-comportamento-autonomo.md](../livro-arquitetura/04-comportamento-autonomo.md).

## Quando Executar

- **Após criar ou modificar** triggers, jobs, webhooks, workers
- **Antes de alterar o esquema do banco** (migrações que podem quebrar cascatas)
- **Antes de desativar serviços** (jobs que ninguém lembra existir)
- **Sempre que o usuário suspeitar de comportamento inesperado**
- **Reconciliação global** — para realinhar simultaneamente todos os volumes do livro de arquitetura (01 a 04), utilize a skill [sincronizar-documentacao.md](sincronizar-documentacao.md)



## O que Varrer

Examine **todo o código fonte + configurações + histórico de migrações**
em busca de:

### 1. Database Triggers

- Migrations/SQL: procurar por `CREATE TRIGGER`, `CREATE OR REPLACE FUNCTION`,
  `plpgsql`, `plv8`, stored procedures
- Prisma: procurar por `@@schema` com raw SQL, `prisma.$queryRaw`
- GAS: triggers instaláveis no `ScriptApp.newTrigger()`

### 2. Cascatas de Chave Estrangeira

- Prisma: `onDelete: Cascade`, `onDelete: SetNull`, `onUpdate: Cascade`
  no `schema.prisma`
- Migrations/SQL: `ON DELETE CASCADE`, `ON UPDATE CASCADE`,
  `ON DELETE SET NULL`, `ON DELETE RESTRICT`
- ORMs similares (TypeORM, Sequelize, Drizzle)

### 3. Jobs Agendados

- `cron.schedule()`, `node-cron`, `bull`, `bullmq`, `agenda`
- `setInterval`, `setTimeout` de longo prazo
- GAS: `ScriptApp.newTrigger('minhaFuncao').timeBased().everyHours(1)`
- `pg_cron`, `pg_tle`
- Arquivos `crontab`, `.cron`, `.timer`, systemd timers
- Infra: Cloud Scheduler, EventBridge, Cloud Tasks

### 4. Webhooks

- Rotas que recebem callback externo: `app.post('/webhook'`, `router.post('/stripe'`,
  `app.post('/mercadopago'`
- Handlers com verificação de assinatura: `stripe.webhooks.constructEvent`,
  `x-signature`, `x-hub-signature`, `verifySignature`
- GAS: `doPost(e)` em Web App
- Configuração: webhooks registrados no dashboard do provedor (documentar manualmente)

### 5. Workers e Filas

- Bull/BullMQ: `new Queue()`, `worker.process()`, `Queue.add()`
- RabbitMQ, Kafka, Redis Streams, SQS/SNS
- Worker threads, child processes, serverless functions
- Concorrência configurada e filas de retry/DLQ

### 6. Middleware e Lifecycle

- Next.js: `middleware.ts`, `middleware.js`
- Express/Fastify: `app.use()`, `router.use()`
- React: `useEffect` sem cleanup, `onMount`, `onUnmount`
- Nuxt/Vue: `middleware/`, `onMounted`, `beforeUnmount`
- Ciclo de vida de server components

### 7. CI e Pós-Deploy

- `.github/workflows/`, `gitlab-ci.yml`, `Jenkinsfile`
- GAS: `appsscript.json` com `timeDrivenTriggers`
- Scripts pós-deploy: `postinstall`, `postmigrate`, `prisma generate`
- Husky: `.husky/`

### 8. Git Hooks

- `.husky/`: `pre-commit`, `commit-msg`, `pre-push`, `post-merge`
- Lint-staged, commitlint, conventional commits
- `.git/hooks/` (se configurado manualmente)

## Como Documentar

Para cada achado, **adicione uma linha na tabela correspondente** em
[04-comportamento-autonomo.md](../livro-arquitetura/04-comportamento-autonomo.md):

```markdown
| *ex: log_audit* | *pedidos* | *AFTER INSERT* | *insere em logs_auditoria* | *prisma/migrations/* |
```

Inclua sempre o **arquivo de origem** e, se relevante, o **risco** de
ignorar a existência deste comportamento (ex: "remove dados órfãos na
tabela de itens").

## Regras

- **Nunca remova** um comportamento autônomo sem documentá-lo primeiro
- Se encontrar um comportamento não documentado, **pergunte ao usuário**
  antes de presumir que está obsoleto
- **Jobs sem dono conhecido** devem ser sinalizados com `⚠️` na tabela
- Se o comportamento tem impacto deletivo (`CASCADE`, `DELETE`,
  `DROP`), marque como `[RISCO]` na descrição
