---
name: criar-extrair-modelo
description: Cria o script que extrai o modelo de dados real (PostgreSQL ou SQLite) e alimenta o livro-arquitetura/05.
---

# Skill: Criar o Script de Extração do Modelo de Dados

> Instrui o agente a materializar o script `extrair-modelo` no projeto a
> partir do modelo virgem, customizando o mapeamento de domínios para o
> repositório específico. Suporta tanto **PostgreSQL** quanto **SQLite**.
> O resultado fica em `governanca/scripts/` (pasta que **não regenera**);
> os virgens ficam em `governanca/templates/` (regeneram).

## Por que existe

A fonte da verdade do schema é o estado **atual** do banco — não a
reconstrução mental a partir de migrations acumuladas. Este script extrai o
modelo real (tabelas, colunas, chaves primárias e estrangeiras, índices e relacionamentos)
e alimenta `governanca/livro-arquitetura/05-modelo-de-dados.md`, dando ao agente uma visão macro e detalhada fidedigna.


## Quando Executar

- **No setup do ambiente** de um projeto com banco de dados relacional
- **Imediatamente após vincular um repositório existente** que contenha banco de dados
- **Durante a Fase 2 de migração de stack** (`migrar-stack-legada.md`), para mapear todo o schema legado no inventário De-Para
- **Sob demanda** — após aplicar novas migrations ou alterar tabelas

## Fluxo

### 1. Identifique o Tipo de Banco

Verifique a infraestrutura do projeto:
- **PostgreSQL:** possui `DATABASE_URL` no `.env` / `.env.local` apontando para `postgresql://` ou `postgres://`.
- **SQLite:** possui arquivo `.db`, `.sqlite`, ou `DATABASE_URL="file:..."` / `sqlite:...`.

### 2. Copie o Modelo Virgem Correspondente

Copie o script virgem para a pasta de scripts do projeto (que **não** regenera):

**Se for SQLite:**
```bash
cp governanca/templates/extrair-modelo-sqlite.ts.template governanca/scripts/extrair-modelo-sqlite.ts
```

**Se for PostgreSQL:**
```bash
cp governanca/templates/extrair-modelo.ts.template governanca/scripts/extrair-modelo.ts
```

Copie também o wrapper PowerShell universal:
```bash
cp governanca/templates/extrair-modelo.ps1.template governanca/scripts/extrair-modelo.ps1
```


### 3. Garanta os Pré-requisitos

- **Para SQLite:** Suporte nativo em Node.js v22+ (`node:sqlite`). Se necessário: `npm i -D tsx`.
- **Para PostgreSQL:** `npm i -D pg tsx` e confirme `DATABASE_URL` configurada.

### 4. Execute e Valide

```bash
./governanca/scripts/extrair-modelo.ps1
```
*(ou execute diretamente: `npx tsx governanca/scripts/extrair-modelo-sqlite.ts`)*

O script gera a documentação em `governanca/livro-arquitetura/modelo-de-dados/` contendo:
- `index.md`: Visão macro com totais de tabelas, colunas, relacionamentos e diagrama Mermaid ER.
- `tabelas/<dominio>.md`: Detalhamento de cada tabela, colunas, tipos, PKs, FKs e índices.

### 5. Preencha o Mapeamento de Domínios (Opcional)

Se houver muitas tabelas e desejar agrupá-las logicamente em arquivos separados, edite `DOMINIO_MANUAL` e `DOMINIO_PREFIXO` no script copiado em `governanca/scripts/` e rode novamente.

### 6. Registre nas Notas Persistentes e Comite

Adicione em `governanca/SESSAO.md` (seção de notas persistentes da sessão):
```
Scripts disponíveis em governanca/scripts/:
- extrair-modelo.ps1 — regenera o modelo de dados a partir do banco real
Modelo de dados: governanca/livro-arquitetura/modelo-de-dados/index.md (e tabelas/<dominio>.md)
```

Commite a pasta `governanca/livro-arquitetura/modelo-de-dados/` junto com o código para que a documentação fique disponível mesmo em sessões offline.

## Regras

- **Nunca edite o virgem** em `governanca/templates/` — edite sempre a cópia em `governanca/scripts/`
- `governanca/scripts/` **não regenera** — é o local definitivo dos scripts do projeto
- **Sempre use o script** para conhecer o schema — não tente adivinhar campos lendo arquivos de migration antigos
- Em repositórios vinculados, execute esta extração **antes** de criar as sprints funcionais
