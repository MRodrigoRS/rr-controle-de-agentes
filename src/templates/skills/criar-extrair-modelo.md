# Skill: Criar o Script de Extração do Modelo de Dados

> Instrui o agente a materializar o script `extrair-modelo` no projeto a
> partir do modelo virgem, customizando o mapeamento de domínios para o
> repositório específico. O resultado fica em `governanca/scripts/` (pasta
> que **não regenera**); o virgem fica em `governanca/templates/` (regenera).

## Por que existe

A fonte da verdade do schema é o estado **atual** do banco — não a
reconstrução mental a partir de migrations acumuladas. Este script extrai o
modelo real (tabelas, colunas, FKs, RLS, views, enums, funções) e gera
`modelo-de-dados/`, dando ao agente uma visão macro fidedigna.

## Quando Executar

- **No setup do ambiente** (Passo 4 do INICIO.md) de um projeto com banco
  PostgreSQL
- **Após vincular um repositório existente** com banco PostgreSQL
- **Sob demanda** — quando o mapeamento de domínios precisa ser ajustado ou
  o modelo está desatualizado

## Fluxo

### 1. Copie o Modelo Virgem

Copie o virgem para a pasta de scripts do projeto (que **não** regenera):

```bash
cp governanca/templates/extrair-modelo.ts governanca/scripts/extrair-modelo.ts
```

Crie também o wrapper:

```bash
cp governanca/templates/extrair-modelo.ps1 governanca/scripts/extrair-modelo.ps1
```

### 2. Preencha o Mapeamento de Domínios

No `governanca/scripts/extrair-modelo.ts` (cópia do projeto), preencha:

- `DOMINIO_MANUAL` — nomes **exatos** de tabela → domínio (ex: `perfis:
  "Autenticação"`)
- `DOMINIO_PREFIXO` — prefixos → domínio (ex: `["pedido", "Vendas"]`)

Use as tabelas reais deste repositório (consulte `modelo-de-dados/` após a
primeira execução, ou o schema). Se o projeto não usa domínios, deixe vazio —
tudo cai em "Outros".

### 3. Garanta Pré-requisitos

- Instale as dependências, se ausentes: `npm i -D pg tsx`
- Confirme que `DATABASE_URL` existe em `.env.local` (ou variável de ambiente)

### 4. Execute e Valide

```bash
./governanca/scripts/extrair-modelo.ps1
```

O script gera `modelo-de-dados/` na raiz do projeto. Verifique:

- O `index.md` lista os domínios corretos
- Nenhuma tabela importante caiu em "Outros" (o script avisa no console)

Ajuste o mapeamento e repita até o modelo refletir o domínio do projeto.

### 5. Registre nas Notas Persistentes

Adicione no `AGENTS.md` (seção de notas persistentes):

```
Scripts disponíveis:
- extrair-modelo.ps1 — regenera modelo-de-dados/ a partir do banco real
Modelo de dados: modelo-de-dados/index.md (macro) + tabelas/<dominio>.md
```

### 6. Comite o Snapshot

Commite `modelo-de-dados/` junto com o código. Assim o snapshot fica
disponível em sessões futuras **sem acesso ao banco**.

## Regras

- **Nunca edite o virgem** em `governanca/templates/` — ele regenera e as
  alterações seriam perdidas. Edite sempre a cópia em `governanca/scripts/`
- `governanca/scripts/` **não regenera** — é a casa do script do projeto
- **Sempre use o script** para conhecer o schema — não reconstrua o modelo
  lendo migrations uma a uma (veja a regra `Modelo de Dados` no AGENTS.md)
- Quando novas tabelas ou domínios surgirem, **atualize o mapeamento** no
  script do projeto e **regenere** o modelo
- O script não é gerado pela progenitora em projetos sem banco PostgreSQL —
  a regra do AGENTS.md só existe quando o preset é PostgreSQL
