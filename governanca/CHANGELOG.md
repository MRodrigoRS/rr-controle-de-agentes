# Changelog da Governança — RR Tech Studio

Todas as alterações notáveis, novas regras, padrões de engenharia, skills e melhorias estruturais da governança matriz são documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [Sprint 04] — 2026-10-06

### Adicionado
- **Context Engineering & Orçamento de Contexto:** `AGENTS.md` enxugado para 97 linhas com teto contratual de 150 linhas (~12 KB) e Progressive Disclosure rigoroso via `padroes/` para evitar truncamento em LLMs (teto de 32 KiB).
- **Encadeamento Determinístico de Workflows:** Seção "Próximo Passo Recomendado" em [spec.md](workflows/spec.md), [plan.md](workflows/plan.md), [research.md](workflows/research.md), [implement.md](workflows/implement.md), [review.md](workflows/review.md), [release.md](workflows/release.md) e [VINCULAR.md](VINCULAR.md), eliminando becos sem saída no fluxo de trabalho do agente.
- **Validação Visual Humana no `/fix`:** Diretriz obrigatória no workflow Fast-Track [fix.md](workflows/fix.md) para mudanças de UI/CSS: o agente detalha o componente e rota afetados e aguarda validação humana explícita, sem scan autônomo de tela.
- **Trava de Teto de Tentativas no `/test`:** Limite formal de até 3 tentativas no workflow [test.md](workflows/test.md) contra loops infinitos de refatoração cega.
- **Usabilidade Nativa e Ergonomia de Interface (Zero-Bloat):** Seção 7 em [frontend.md](padroes/frontend.md) instituindo HTML semântico nativo (`<button>`, `<a>`), fechamento por teclado (`Escape`), alvos de toque confortáveis (~40-44px) no mobile e contraste legível com zero inchaço de bibliotecas extras ou atributos ARIA redundantes.
- **Reconciliação Completa do Livro de Arquitetura:** Volumes 01 a 05 de [livro-arquitetura/](livro-arquitetura/) totalmente reconciliados com a stack viva (Next.js 16, React 19, SQLite nativo WAL `dados/rr.db`, Biome e Vitest), incluindo diagrama ERD das 3 tabelas reais (`tecnologias`, `projetos`, `metricas_git`).

---

## [Sprint 03] — 2026-10-06

### Adicionado
- **Análise Zero-Token (Knip):** Seção oficial em [auditar-repositorio.md](skills/auditar-repositorio.md) instruindo o uso de ferramentas offline de análise estática (`npx knip --reporter compact`, `cargo machete`, `vulture`, `deadcode`) para erradicar código morto e dependências zumbis sem queimar tokens de IA.
- **Modernização do Catálogo SQLite:** Saneamento taxonômico completo (151 tecnologias em 11 categorias limpas), absorvendo categorias monotemáticas (`Linguagens & Tipagem` e `Testes` consolidadas em `Bibliotecas` e `Qualidade & Testes`). Aposentadoria formal de `PyInstaller` (preterido por `Nuitka`) e `dotenv` (preterido por `--env-file`). Adicionadas ferramentas de 2026 (`Gitleaks`, `Knip`, `Oxlint`, `Bun`, `Deno`).
- **Paridade Total de Linters nos Presets:** Vinculação de IDs reais aos presets em `presets.json` para linters de todas as linguagens suportadas (.NET Roslyn Analyzers, golangci-lint, gofumpt, flutter_lints, dart format) e Biome consolidado nos presets web.
- **Desacoplamento de Fases:** Refinamento de escopo na meta-skill [faxina-completa.md](skills/faxina-completa.md) e [auditar-repositorio.md](skills/auditar-repositorio.md), separando a auditoria técnica de repositório das fases estéticas de design tokens ([auditar-consistencia-visual.md](skills/auditar-consistencia-visual.md)) e mobile ([auditar-responsividade.md](skills/auditar-responsividade.md)).

---

## [Sprint 02] — 2026-10-06

### Adicionado
- **OWASP Agentic Top 10 2026:** Inclusão formal de proteções contra ASI01 (Goal Hijacking), ASI02 (Tool Poisoning) e ASI06 (Memory/Context Poisoning) nos manuais [backend.md](padroes/backend.md) e [usar-harness-do-agente.md](skills/usar-harness-do-agente.md).
- **Scanner Determinístico de Segredos:** Script portátil [verificar-segredos.mjs](scripts/verificar-segredos.mjs) (Node.js nativo 18+, zero dependências) com fallback regex e suporte a `gitleaks`, integrado aos checklists pré-deploy e auditorias ([auditar-prontidao-producao.md](skills/auditar-prontidao-producao.md) e [auditar-repositorio.md](skills/auditar-repositorio.md)).
- **Defesa HTTP em Profundidade:** Padrão mandatório de Strict CSP com nonce e `strict-dynamic`, HSTS permanente (`max-age=63072000; includeSubDomains; preload`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` e Rate Limiting documentados em [backend.md](padroes/backend.md).
- **Governança de MCP:** Regras de Allowlist Explícita baseada no [02-stack.md](livro-arquitetura/02-stack.md), política Read-Only First para bancos e autorização humana mandatória antes de ações de mutação em [configurar-harness.md](skills/configurar-harness.md).

---

## [Sprint 01.1] — 2026-10-06

### Adicionado
- **Segregação de Changelogs:** Template `PRODUTO_CHANGELOG.md` provisionado automaticamente na raiz de novos projetos satélites (`CHANGELOG.md`), separando o ciclo do software do cliente do histórico da governança matriz.
- **Hábito Operacional de Commit:** Cláusula pétrea e critério de qualidade exigindo que o agente registre o delta consolidado no `CHANGELOG.md` da raiz antes de fechar qualquer commit.
- **Integração em Workflows:** Passos mandatórios de atualização de changelog incluídos nos workflows `/implement`, `/fix`, `/release` e templates de sprint.

---

## [Sprint 01] — 2026-10-06

### Adicionado
- Validação contínua de paridade 1:1 entre wrappers do harness (`.agents/skills/`) e skills reais em `governanca/skills/`.
- Bloqueio de vazamento de ferramentas exclusivas de P&D da matriz para projetos satélites.
- Tratamento e código de erro para falhas de rede no download de arquivos em `sincronizar.mjs`.

### Modificado
- Normalizados todos os links de subpastas para caminhos relativos nativos (`../`, `./`), eliminando erros 404 no GitHub e VS Code.
- Endurecido o validador `validar-templates.ts` com remoção de fallback permissivo da raiz.
- Enxugado o protocolo de início em [AGENTS.md](AGENTS.md) com ponteiro direto para [SESSAO.md](SESSAO.md) e `/status`.
- Higienizada a pasta [templates/](templates/), mantendo estritamente arquivos `.template` e movendo scripts para [scripts/](scripts/).

---

## [1.1.0] — 2026-10-06

### Adicionado
- **Sincronização Remota Universal:** Implementado o script portátil [sincronizar.mjs](scripts/sincronizar.mjs) (Node.js 18+ nativo, zero dependências externas) permitindo que projetos associados sincronizem a matriz de qualquer computador via GitHub ou fonte local.
- **Dois Modos de Sincronização:**
  - **Modo Essencial (Seguro / Padrão):** Atualiza padrões em [padroes/](padroes/), workflows em [workflows/](workflows/), skills em [skills/](skills/) e catálogo sem tocar no contexto vivo do projeto ([SESSAO.md](SESSAO.md), [PRD.md](PRD.md), [sprints/](sprints/) e [livro-arquitetura/](livro-arquitetura/)).
  - **Modo Total (Hard Reset):** Regenera 100% dos arquivos a partir dos presets da matriz, com confirmação explícita no terminal (`REGENERAR TUDO`) e criação garantida de backup prévio em `.backup-governanca-<timestamp>/`.
- **Evolução da Interface Web:**
  - Menu no botão **Recriar Governança** com opções "Sincronizar Essencial" e "Regeneração Total...".
  - Componente modal de confirmação com alerta visual de impacto e aviso de backup automático.
  - Endpoint `PUT /api/projetos/[id]` adaptado para `{ modo: "essencial" | "total" }` com backup prévio automático no modo total.
- **Metadados da Matriz:** Criação automática de [.matriz.json](.matriz.json) registrando repositório, branch, presets vinculados e timestamp da última sincronização.
- **Manual de Sincronização Remota:** Documento oficial [sincronizacao-remota.md](padroes/sincronizacao-remota.md) detalhando tokens do GitHub (PAT clássico), variáveis de ambiente e fluxos de uso.
- **Comando CLI da Progenitora:** Adicionado script `npm run rr:sync -- [caminho] [--total]`.
- **Changelog Integrado:** Documento [CHANGELOG.md](CHANGELOG.md) que viaja junto com a governança e se regenera em qualquer sincronização.
- **Canonização Estrita de Links:** Regra em [CONVENCOES-TEMPLATES.md](../CONVENCOES-TEMPLATES.md) exigindo links Markdown reais para qualquer referência a documentos ou skills.
- **Bootstrap em Repositório Virgem:** Suporte nativo no script [sincronizar.mjs](scripts/sincronizar.mjs) para execução direta na raiz sem governança prévia, criando automaticamente a estrutura `governanca/`, os ponteiros raiz [AGENTS.md](AGENTS.md) e [CLAUDE.md](../CLAUDE.md), e sincronizando o harness `.agents/`.
- **Comandos One-Liner e Prompts para Agente:** Seção no manual [sincronizacao-remota.md](padroes/sincronizacao-remota.md) com comandos diretos (PowerShell e Bash) e o prompt exato para colar para o agente IA iniciar ou sincronizar a governança.
- **Distribuição Universal do Harness:** Inclusão do script [harness.mjs](scripts/harness.mjs) na pasta de templates `src/templates/scripts/` para transporte remoto.
- **Interface Web Dedicada do Satélite:** Implementado o script portátil [ui.mjs](scripts/ui.mjs) (Node.js 18+ nativo, zero dependências externas) permitindo subir um servidor local com painel web interativo completo idêntico ao da progenitora em qualquer máquina que possua o projeto governado (`npm run rr:ui` ou `node governanca/scripts/ui.mjs`).
- **Skill [sincronizar-governanca.md](skills/sincronizar-governanca.md):** Nova skill que automatiza o ciclo completo de sincronização com a matriz pública (modo essencial ou total), validação síncrona do painel web ([ui.mjs](scripts/ui.mjs) `--check`), leitura do changelog e registro no diário [SESSAO.md](SESSAO.md), acionada por comando `/sincronizar-governanca` ou pedido em linguagem natural.
- **Acolhimento Inteligente e Auto-Diagnóstico de Contexto:** Adicionado ao [AGENTS.md](AGENTS.md) protocolo oficial para que o agente, ao receber prompts genéricos como *"Leia AGENTS"*, realize auto-diagnóstico de contexto em 3 segundos (identificando Onboarding Brownfield com código vivo, Greenfield para novos projetos, ou Continuação de Sprint) e proponha a ação correta imediatamente sem advertências burocráticas ou postura passiva.
- **Comandos Rápidos de Início (Intenção Macro):** Adicionados aos ponteiros de raiz [AGENTS.md](AGENTS.md) e [CLAUDE.md](../CLAUDE.md) para guiar o usuário com prompts precisos no pontapé inicial de cada sessão.
- **Ferramental de P&D e Auto-Evolução da Governança (Exclusivo Matriz):** Implementada a nova skill [auditar-maturidade-governanca.md](skills/auditar-maturidade-governanca.md), o workflow `/auditar-governanca` ([auditar-governanca.md](workflows/auditar-governanca.md)) e o template de relatório [_template_evolucao_governanca.md](relatorios/_template_evolucao_governanca.md). A ferramenta opera sob demanda exclusivamente na matriz para benchmark com o mercado, avaliação de ferramentas (Graphify, linters, MCPs) e geração de backlog de sprints sem poluir os projetos satélites.
- **Auditoria Integral de Maturidade & Roadmap Multi-Sprint:** Realizada inspeção de 100% dos manuais, scripts e catálogo da governança, formalizada em [evolucao-governanca-2026-10-06.md](relatorios/evolucao-governanca-2026-10-06.md) (nota calibrada em 7.8/10), com desdobramento mandatória em 4 arquivos físicos de sprint em `governanca/sprints/` (Sprints 01 a 04).
- **Blindagem Anti-Atalhos na Auditoria:** Skill e workflow de auditoria blindados com proibição estrita de suposições/testes mentais, exigência de tabela de Manifesto de Cobertura e proibição de roadmaps inline.

### Modificado
- [AGENTS.md](AGENTS.md): Documentação dos comandos de sincronização, manutenção e hábito obrigatório de registro no changelog.
- Skill [evoluir-governanca.md](skills/evoluir-governanca.md): Seção dedicada ao consumo de melhorias da matriz e registro obrigatório de diff.
- Script [harness.mjs](scripts/harness.mjs): Ajuste de caminhos relativos em ponteiros do harness e suporte a rotas de início dinâmicas.
- Script portátil [sincronizar.mjs](scripts/sincronizar.mjs) e template: Busca recursiva de diretórios pais para localizar a progenitora, garantia de ponteiros raiz e suporte a transporte de `CHANGELOG.md`.
- **Canonização Universal de Links (Pente Fino):** Varredura completa em 145 arquivos eliminando todas as menções em texto puro solto a documentos, skills e workflows. Cobertura da suíte ampliada para **856 links Markdown locais auditados e 100% íntegros**.
- **Paridade Absoluta:** Sincronização espelhada de 100% dos arquivos entre os templates da progenitora (`src/templates/`) e os arquivos vivos da governança (`governanca/`).

---

## [1.0.0] — 2026-10-02

### Adicionado
- **Auto-Governança da Progenitora:** A própria base `rr-controle-de-agentes-1.1` agora é governada por suas próprias regras.
- **Harness Autônomo:** Script [harness.mjs](scripts/harness.mjs) com zero dependências externas para sincronizar `.agents/` e ponteiros raiz.
- **Descoberta Dinâmica de Templates:** Eliminação de hardcoding estático de arquivos no gerador por varredura automática de pastas de templates.
- **Auto-Seed Transparente:** Seed do banco SQLite com preservação estrita de identificadores e integridade referencial dos 27 presets.
- **Padrões Especializados:** Manuais dedicados de engenharia de software em [padroes/](padroes/) ([frontend.md](padroes/frontend.md) e [backend.md](padroes/backend.md)).
- **Blindagem de Contexto:** Proteção estrita contra perda de dados em [PLANO.md](PLANO.md), [PRD.md](PRD.md) e [SESSAO.md](SESSAO.md).
