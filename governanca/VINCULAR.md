# Vinculação — rr-controle-de-agentes-1.1

> Este projeto já existia antes da governança. O agente deve examinar o
> repositório e também considerar o plano/descrição fornecidos pelo usuário
> sobre o que deseja fazer com ele.

**Gerado em:** 2026-10-02



> ⚡ **Harness Pré-Configurado:** A progenitora já configurou automaticamente o harness deste projeto:
> - Regra ativa em `.agents/rules/000-governanca.md` apontando para `@governanca/AGENTS.md`.
> - Ponteiro fino `CLAUDE.md` na raiz do repositório.
> - Workflows registrados como **Slash Commands nativos** em `.agents/workflows/` (`/spec`, `/plan`, `/implement`, `/test`, `/review`, `/research`, `/release`).
> - Se precisar re-sincronizar o harness futuramente, execute: `npx tsx ./src/scripts/configurar-harness.ts .`

## 1. Leia o Plano do Usuário

O plano/descrição do projeto está em [governanca/PLANO.md](governanca/PLANO.md). Leia-o agora.
Ele contém as melhorias, correções ou funcionalidades que o usuário deseja
implementar **a partir do repositório existente**.

> **Preencha o PRD:** pergunte ao usuário se deseja um PRD estruturado. Se sim,
> analise o plano e preencha [governanca/PRD.md](governanca/PRD.md) (arquivo já criado na governança):
> resumo executivo, requisitos (tabela ID/descrição/prioridade), critérios de aceite
> e itens fora de escopo. Apresente para validação do usuário e registre o status
> em [governanca/SESSAO.md](governanca/SESSAO.md).
>
> Use o workflow [spec.md](governanca/workflows/spec.md) para transformar a visão em
> uma especificação verificável.

> Se o plano/PRD do usuário contiver um esboço de stack técnica, **não avance**
> antes de executar a skill [alinhar-stack-com-presets.md](governanca/skills/alinhar-stack-com-presets.md) em
> `governanca/skills/`. Ela orienta a comparação bidirecional entre a stack
> identificada no repositório e a stack do plano.

## 2. Examine o Repositório

- Siga o workflow [research.md](governanca/workflows/research.md) — investigação
  progressiva (estrutura → configurações → modelos/serviços → fluxos
  críticos → deep dive) e registre o artefato de contexto em
  `governanca/relatorios/`
- Leia `package.json`, `tsconfig.json`, `composer.json`, `.clasp.json`,
  `Dockerfile`, `Cargo.toml` ou equivalente para identificar linguagens,
  frameworks e dependências
- Examine a estrutura de pastas para entender a organização
- **Mapeamento de Grafo (Projetos com 30+ arquivos):** Se o repositório for volumoso ou tiver arquitetura complexa, execute a skill [mapear-grafo-de-conhecimento.md](governanca/skills/mapear-grafo-de-conhecimento.md) em `governanca/skills/`. Ela indexa o código via Tree-sitter (offline, zero tokens) e revela clusters funcionais e pontos de alto acoplamento (*god nodes*) em minutos.
- Verifique se há ferramentas de teste, lint, build configuradas
- Identifique serviços externos (bancos, APIs, gateways de pagamento)
- **Extração do Modelo de Dados:** Se o repositório possuir banco de dados relacional
  (PostgreSQL ou SQLite), execute a skill [criar-extrair-modelo.md](governanca/skills/criar-extrair-modelo.md) em `governanca/skills/`
  para gerar a documentação viva em `modelo-de-dados/` (tabelas, colunas, chaves estrangeiras
  e diagrama ER). Esse snapshot é essencial antes de planejar as sprints ou refatorações.
- Execute a skill [alinhar-stack-com-presets.md](governanca/skills/alinhar-stack-com-presets.md) em `governanca/skills/`
  para comparar a stack detectada com os presets da progenitora

## 3. Preencha o Livro de Arquitetura

Edite os arquivos em `governanca/livro-arquitetura/` com base no que
encontrou. Documente:

- Stack real do projeto (frontend, backend, banco)
- Estrutura de diretórios existente
- Decisões arquiteturais aparentes

## 4. Limpe a Documentação Legada

O repositório existente pode conter documentação espalhada que a
governança já substitui. Organize o repositório deixando apenas o
código e configurações de build.

### O que manter (intocado)

```
src/              prisma/           public/
testes/           .env.example      .gitignore
package.json      tsconfig.json     next.config.*
Dockerfile        docker-compose.*  .clasp.json
appsscript.json   go.mod
*.csproj          Cargo.toml        requirements.txt
```

### O que adaptar (mova para `governanca/scripts/`)

```
scripts/          (todo o conteúdo da pasta)
dev.sh            seed.js           deploy.sh
*.ps1             *.sh              Makefile
```

Após mover, registre os scripts disponíveis em `governanca/SESSAO.md`, no formato:
```
Scripts disponíveis: governanca/scripts/dev.ps1, governanca/scripts/deploy.sh
```

### O que remover (governança substitui)

```
README.md         docs/             CHANGELOG.md
CONTRIBUTING.md   architecture.md   requirements.md
wiki/             *.md na raiz      (pergunta ao usuário um por um)
```

### Execução

1. **Varra o repositório** catalogando o que entra em cada categoria
2. **Apresente as listas** ao usuário (o que mantém, o que move, o que exclui)
3. Pergunte: *"Posso prosseguir com a limpeza?"*
4. Se autorizar:
   - **Mova scripts** para `governanca/scripts/`
   - **Exclua** documentação legada com `git rm` (ou delete se não versionado)
   - **Preserve** código e configurações
   - **Registre** os scripts movidos em [governanca/SESSAO.md](governanca/SESSAO.md)
5. Se o usuário quiser manter algum arquivo específico, respeite

## 5 — Crie as Sprints

As sprints devem **combinar o código existente com o plano do usuário**:

- A **Sprint 1** deve ser a mais simples possível: adaptar a governança ao
  repositório e preparar o terreno para as primeiras melhorias
- Cada sprint posterior incrementa uma funcionalidade do plano
- Use o template em [governanca/sprints/_template.md](governanca/sprints/_template.md) como base
- Use o workflow [plan.md](governanca/workflows/plan.md) para montar cada sprint como
  um plano verificável

## 6 — Habilite a Governança

Após documentar tudo, apresente ao usuário:

- A stack identificada no repositório
- A estrutura documentada
- A proposta de sprints (combinando o que já existe com o que será feito)

Após aprovação, faça o primeiro commit com a mensagem:
```
sprint-00: vinculação de governança
```

*Template gerado por RR Tech Studio (Rodrigo Rafael).*
