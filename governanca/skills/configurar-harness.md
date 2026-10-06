---
name: configurar-harness
description: Registra ou re-sincroniza o harness do agente (.agents/, CLAUDE.md, workflows e regras) e propõe MCPs mínimos derivados da stack real.
---

# Skill: Configurar o Harness

> A progenitora configura automaticamente o harness (`.agents/`, `CLAUDE.md`, workflows e regras)
> no nascimento e na regeneração de qualquer projeto. Esta skill orienta a re-sincronização
> e a conexão de MCPs sob demanda com base na stack real.

## Quando Usar

- Primeira sessão para verificar MCPs necessários da stack
- Quando o usuário pedir para atualizar ou re-sincronizar o harness
- Quando adicionar novas skills ou workflows e desejar espelhar imediatamente no harness

## Princípios

- **Automação nativa:** use a CLI da progenitora para sincronizar em 1 segundo em vez de comandos manuais
- **Fonte única da verdade:** o harness usa ponteiros leves para `governanca/` — nunca duplique conteúdo
- **Menor privilégio:** só proponha MCPs para serviços que o projeto realmente utiliza (banco, cloud, CI)

## Passos

### 1. Sincronização do Harness via CLI

Se precisar re-sincronizar regras, workflows ou skills no harness do projeto, execute:

```bash
# A partir do diretório do projeto:
npx tsx ./src/scripts/configurar-harness.ts .

# Ou a partir da raiz da progenitora:
cd ./ && npm run rr:harness <caminho-do-projeto>
```

Este comando atômico:
1. Cria o ponteiro fino `CLAUDE.md` na raiz (`@governanca/AGENTS.md`).
2. Cria a regra `.agents/rules/000-governanca.md` apontando para a governança oficial.
3. Registra todos os workflows de `governanca/workflows/*.md` em `.agents/workflows/` (virando slash commands como `/spec`, `/plan`, `/implement`, `/test`, `/review`).
4. Registra todas as skills como ponteiros leves em `.agents/skills/<nome>/SKILL.md`.
5. Purga quaisquer pastas ou arquivos de skills e workflows obsoletos/renomeados.

### 2. Política de MCP Mínimo & Proteção contra Tool Poisoning

Não instale MCPs genéricos "por garantia". Tool bloat degrada o contexto e amplia a superfície de ataque:

1. **Allowlist Explícita (Dirigida pela Stack):**
   - Nenhum MCP deve ser ativado sem justificativa direta fundamentada na stack do [02-stack.md](../livro-arquitetura/02-stack.md):
     - **PostgreSQL:** propor MCP oficial do PostgreSQL apenas se houver necessidade real de inspeção de dados.
     - **Google Apps Script:** verificar se clasp e credenciais do Google estão autenticadas.
     - **Supabase / Firebase:** propor CLI ou MCP oficial do provedor.
     - **Sem serviços externos:** **zero MCPs**, mantendo contexto leve e respostas rápidas.

2. **Padrão Read-Only First:**
   - Servidores MCP conectados a bancos de dados, storages ou APIs devem ser configurados prioritariamente em modo **somente-leitura** (`readonly: true`).
   - Escritas, mutações e comandos administrativos via MCP são bloqueados por padrão.

3. **Aprovação Humana Obrigatória em Ações Críticas:**
   - Operações destrutivas (drop de tabelas, exclusão de dados, deploys ou revogação de acessos) **nunca** devem ser executadas de forma autônoma por MCPs. Exija consentimento expresso do usuário.

4. **Confirmação Prévia:**
   - Pergunte ao usuário antes de instalar qualquer servidor:
     *"Identifiquei que este projeto usa [Serviço]. Deseja configurar o MCP oficial em modo somente-leitura para [finalidade] ou seguimos com o ambiente padrão?"*
   - Configure apenas com aprovação expressa.
