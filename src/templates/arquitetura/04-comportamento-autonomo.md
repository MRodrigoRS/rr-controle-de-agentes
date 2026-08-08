# Comportamento Autônomo — {{nomeProjeto}}

> Catálogo de tudo que roda sozinho no sistema — triggers de banco, jobs
> agendados, webhooks, workers, middlewares, cascatas, CI e hooks.
>
> **Mantenha atualizado sempre que criar ou modificar um destes itens.**
> Um sistema onde ninguém sabe o que roda automaticamente é uma caixa
> preta prestes a quebrar.

---

## Database Triggers

| Nome | Tabela | Evento | Ação | Localização |
|------|--------|--------|------|-------------|
| *ex: log_audit* | *pedidos* | *AFTER INSERT* | *insere em logs_auditoria* | *prisma/migrations/* |

## Cascatas de Chave Estrangeira

| Tabela origem | Tabela destino | Ação ON DELETE | Ação ON UPDATE | Localização |
|---------------|----------------|----------------|----------------|-------------|
| *ex: itens_pedido* | *pedidos* | *CASCADE* | *NO ACTION* | *prisma/schema.prisma* |

## Jobs Agendados

| Nome | Schedule | Descrição | Última execução | Localização |
|------|----------|-----------|-----------------|-------------|
| | | | | |

## Webhooks

| Provedor | Evento tratado | Handler | Verificação de assinatura | Localização |
|----------|---------------|---------|--------------------------|-------------|
| | | | | |

## Workers e Filas

| Worker | Fila | Tarefa | Concorrência | Localização |
|--------|------|--------|--------------|-------------|
| | | | | |

## Middleware e Lifecycle

| Nome | Disparo | Efeito colateral | Localização |
|------|---------|------------------|-------------|
| | | | |

## CI e Pós-Deploy

| Pipeline | Evento | Ações | Localização |
|----------|--------|-------|-------------|
| | | | |

## Git Hooks

| Hook | Ação | Localização |
|------|------|-------------|
| | | |

---

*Template gerado por RR Software (Rodrigo Rafael).*
