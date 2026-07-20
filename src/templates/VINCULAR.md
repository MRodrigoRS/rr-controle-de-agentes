# Vinculação — {{nomeProjeto}}

> Este projeto já existia antes da governança. O agente deve examinar o
> repositório e também considerar o plano/descrição fornecidos pelo usuário
> sobre o que deseja fazer com ele.

**Gerado em:** {{data}}

## 1. Leia o Plano do Usuário

O plano/descrição do projeto está em `governanca/PLANO.md`. Leia-o agora.
Ele contém as melhorias, correções ou funcionalidades que o usuário deseja
implementar **a partir do repositório existente**.

> **Crie o PRD:** pergunte ao usuário se deseja um PRD estruturado. Se sim,
> analise o plano e extraia: resumo executivo, requisitos (tabela ID/descrição/
> prioridade), critérios de aceite, fora de escopo. Crie `governanca/PRD.md`
> usando o template em `governanca/PRD.md`. Apresente para validação e registre
> nas notas persistentes do `AGENTS.md`.

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
- Execute a skill `deduzir-presets-do-repositorio.md` em `governanca/skills/`
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

Após mover, registre os scripts disponíveis em `AGENTS.md` nas notas
persistentes, no formato:
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
   - **Registre** os scripts movidos nas notas persistentes do `AGENTS.md`
5. Se o usuário quiser manter algum arquivo específico, respeite

## 5 — Crie as Sprints

As sprints devem **combinar o código existente com o plano do usuário**:

- A **Sprint 1** deve ser a mais simples possível: adaptar a governança ao
  repositório e preparar o terreno para as primeiras melhorias
- Cada sprint posterior incrementa uma funcionalidade do plano
- Use o template em `governanca/sprints/_template.md` como base

## 6 — Habilite a Governança

Após documentar tudo, apresente ao usuário:

- A stack identificada no repositório
- A estrutura documentada
- A proposta de sprints (combinando o que já existe com o que será feito)

Após aprovação, faça o primeiro commit com a mensagem:
```
sprint-00: vinculação de governança
```

*Template gerado pelo RR Controle de Agentes.*
