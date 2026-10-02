# Modelo de Dados & Entidades — rr-controle-de-agentes-1.1

**Projeto:** rr-controle-de-agentes-1.1
**Gerado em:** 2026-10-02

> **Diretriz Mandatória para Agentes:** Antes de criar ou alterar models, queries,
> mutations, migrations ou endpoints, consulte este documento para respeitar
> com exatidão a nomenclatura de tabelas, campos, chaves primárias/estrangeiras e tipos.
> **Nunca presuma ou invente nomes de colunas ou relacionamentos.**

---

## 1. Diagrama Entidade-Relacionamento (ERD)

```mermaid
erDiagram
    %% Exemplo de topologia inicial:
    %% USUARIOS ||--o{ PEDIDOS : "possui"
    %% PEDIDOS ||--|{ ITENS_PEDIDO : "contem"
```

---

## 2. Catálogo de Entidades / Tabelas

### Entidade: `[NomeDaTabela]`
*Descrição breve do propósito desta entidade no domínio do negócio.*

| Coluna | Tipo | Nulo | Chave | Default | Descrição / Valores Permitidos (Enums) |
|--------|------|------|-------|---------|----------------------------------------|
| `id` | `UUID` / `Int` | Não | PK | auto | Identificador único da entidade |
| `criado_em` | `Timestamp` | Não | | `now()` | Data e hora de criação do registro |
| `atualizado_em` | `Timestamp` | Não | | `now()` | Data e hora da última alteração |

---

## 3. Relacionamentos & Chaves Estrangeiras

| Tabela Origem | Coluna FK | Tabela Destino | Coluna PK | Cardinalidade | Ação ON DELETE |
|---------------|-----------|----------------|-----------|---------------|----------------|
| | | | | 1:N | RESTRICT / CASCADE |

---

## 4. Localização do Schema e Migrações

- **Arquivo de Schema / Model:** `prisma/schema.prisma` / `migrations/` / `src/servidor/db/schema.ts`
- **Comando de Migração:** `npx prisma migrate dev` / `npm run db:migrate`
- **Extração Automática:** Execute a skill `governanca/skills/criar-extrair-modelo.md` para extrair o schema atualizado do banco de dados relacional.

---

> Mantenha atualizado — use a skill `sincronizar-documentacao.md` para reconciliar o modelo de dados com o banco/schema real.

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
