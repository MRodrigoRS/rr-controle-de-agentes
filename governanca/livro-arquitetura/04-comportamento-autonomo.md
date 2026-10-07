# Comportamento Autônomo — rr-controle-de-agentes-1.1

**Projeto:** rr-controle-de-agentes-1.1  
**Marca:** RR Tech Studio | Autor: Rodrigo Rafael  
**Última Reconciliação:** 2026-10-06  

> Catálogo de tudo que executa autonomamente no sistema — inicializações automáticas, rotinas de banco, CI, verificadores e hooks.

---

## 1. Rotinas Autônomas de Banco de Dados (SQLite)

| Recurso | Disparo | Ação / Comportamento | Localização |
|---------|---------|----------------------|-------------|
| **Write-Ahead Logging (WAL)** | Abertura da conexão com o banco | Ativa `PRAGMA journal_mode = WAL;` para permitir leituras concorrentes ultrarrápidas sem bloquear escritas. | `src/servidor/db.ts` |
| **Auto-Migration de Inicialização** | Boot do servidor ou execução de script | Executa `CREATE TABLE IF NOT EXISTS` para as tabelas `tecnologias`, `projetos` e `metricas_git`. | `src/servidor/db.ts` |
| **Auto-Seed de Catálogo** | Boot quando tabela `tecnologias` estiver vazia | Lê `dados/tecnologias-snapshot.json` ou `src/servidor/dados/tecnologias.json` e popula as 151 tecnologias homologadas. | `src/servidor/db.ts` |
| **Auto-Migração de Colunas** | Boot do servidor | Adiciona `modo_migracao` na tabela `projetos` caso ainda não exista, com tratamento de exceção silenciosa. | `src/servidor/db.ts` |

---

## 2. Automação de Qualidade, CI & Testes

| Automação | Gatilho | O que Valida | Localização |
|-----------|---------|--------------|-------------|
| **Validador de Integridade de Templates** | `npm test` ou CI GitHub Actions | Analisa 61 templates, 27 presets x catálogo SQLite, paridade de 27 wrappers `.agents/skills/`, paridade do bundle `ui.mjs` x `src/satelite-ui/` e integridade estrita de todos os links Markdown locais. | `src/scripts/validar-templates.ts` |
| **Bundler do Painel Satélite** | `npm run build` ou `npm run build:ui` | Empacota os módulos de `src/satelite-ui/` (views, client, server) em um único arquivo autocontido para `governanca/scripts/ui.mjs` e templates. | `src/scripts/build-satelite-ui.ts` |
| **Scanner Nativo de Segredos** | Pré-commit ou comando `node governanca/scripts/verificar-segredos.mjs --all` | Varre arquivos alterados e histórico git procurando chaves de API, senhas, tokens e credenciais confidenciais. | `governanca/scripts/verificar-segredos.mjs` |
| **Sincronizador do Harness** | `node governanca/scripts/harness.mjs` | Regenera regras (`000-governanca.md`), links de workflows e wrappers de skills em `.agents/` para paridade total com a governança. | `governanca/scripts/harness.mjs` |

---

## 3. Gestão de Sessão e Progressive Disclosure

| Mecanismo | Comportamento Autônomo |
|-----------|------------------------|
| **Auto-Diagnóstico de Início** | Ao receber prompt genérico, o agente realiza auto-diagnóstico em 3 segundos identificando se o repositório é Greenfield, Brownfield ou Sprint Ativa antes de agir. |
| **Trava de Teto em Loops** | Se um teste falhar durante `/test` e não for sanado em até 3 tentativas, o ciclo é interrompido autonomamente para alinhamento com o usuário. |
| **Validação Visual Humana no `/fix`** | O agente descreve o que alterou e indica a rota sem escanear a tela de forma autônoma, aguardando validação humana explícita. |

---

*Documento mantido e reconciliado conforme os padrões da RR Tech Studio.*
