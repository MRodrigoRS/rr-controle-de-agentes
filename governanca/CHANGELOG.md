# Changelog da Governança — RR Tech Studio

Todas as alterações notáveis, novas regras, padrões de engenharia, skills e melhorias estruturais da governança matriz são documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.1.0] — 2026-10-06

### Adicionado
- **Sincronização Remota Universal:** Implementado o script portátil [sincronizar.mjs](governanca/scripts/sincronizar.mjs) (Node.js 18+ nativo, zero dependências externas) permitindo que projetos associados sincronizem a matriz de qualquer computador via GitHub ou fonte local.
- **Dois Modos de Sincronização:**
  - **Modo Essencial (Seguro / Padrão):** Atualiza padrões em [padroes/](governanca/padroes/), workflows em [workflows/](governanca/workflows/), skills em [skills/](governanca/skills/) e catálogo sem tocar no contexto vivo do projeto ([SESSAO.md](governanca/SESSAO.md), [PRD.md](governanca/PRD.md), [sprints/](governanca/sprints/) e [livro-arquitetura/](governanca/livro-arquitetura/)).
  - **Modo Total (Hard Reset):** Regenera 100% dos arquivos a partir dos presets da matriz, com confirmação explícita no terminal (`REGENERAR TUDO`) e criação garantida de backup prévio em `.backup-governanca-<timestamp>/`.
- **Evolução da Interface Web:**
  - Menu no botão **Recriar Governança** com opções "Sincronizar Essencial" e "Regeneração Total...".
  - Componente modal de confirmação com alerta visual de impacto e aviso de backup automático.
  - Endpoint `PUT /api/projetos/[id]` adaptado para `{ modo: "essencial" | "total" }` com backup prévio automático no modo total.
- **Metadados da Matriz:** Criação automática de [.matriz.json](governanca/.matriz.json) registrando repositório, branch, presets vinculados e timestamp da última sincronização.
- **Manual de Sincronização Remota:** Documento oficial [sincronizacao-remota.md](governanca/padroes/sincronizacao-remota.md) detalhando tokens do GitHub (PAT clássico), variáveis de ambiente e fluxos de uso.
- **Comando CLI da Progenitora:** Adicionado script `npm run rr:sync -- [caminho] [--total]`.
- **Changelog Integrado:** Documento [CHANGELOG.md](governanca/CHANGELOG.md) que viaja junto com a governança e se regenera em qualquer sincronização.
- **Canonização Estrita de Links:** Regra em [CONVENCOES-TEMPLATES.md](CONVENCOES-TEMPLATES.md) exigindo links Markdown reais para qualquer referência a documentos ou skills.
- **Bootstrap em Repositório Virgem:** Suporte nativo no script [sincronizar.mjs](governanca/scripts/sincronizar.mjs) para execução direta na raiz sem governança prévia, criando automaticamente a estrutura `governanca/`, os ponteiros raiz [AGENTS.md](governanca/AGENTS.md) e [CLAUDE.md](CLAUDE.md), e sincronizando o harness `.agents/`.
- **Comandos One-Liner e Prompts para Agente:** Seção no manual [sincronizacao-remota.md](governanca/padroes/sincronizacao-remota.md) com comandos diretos (PowerShell e Bash) e o prompt exato para colar para o agente IA iniciar ou sincronizar a governança.
- **Distribuição Universal do Harness:** Inclusão do script [harness.mjs](governanca/scripts/harness.mjs) na pasta de templates `src/templates/scripts/` para transporte remoto.
- **Interface Web Dedicada do Satélite:** Implementado o script portátil [ui.mjs](governanca/scripts/ui.mjs) (Node.js 18+ nativo, zero dependências externas) permitindo subir um servidor local com painel web interativo completo idêntico ao da progenitora em qualquer máquina que possua o projeto governado (`npm run rr:ui` ou `node governanca/scripts/ui.mjs`).
- **Skill [sincronizar-governanca.md](governanca/skills/sincronizar-governanca.md):** Nova skill que automatiza o ciclo completo de sincronização com a matriz pública (modo essencial ou total), validação síncrona do painel web ([ui.mjs](governanca/scripts/ui.mjs) `--check`), leitura do changelog e registro no diário [SESSAO.md](governanca/SESSAO.md), acionada por comando `/sincronizar-governanca` ou pedido em linguagem natural.
- **Acolhimento Inteligente e Auto-Diagnóstico de Contexto:** Adicionado ao [AGENTS.md](governanca/AGENTS.md) protocolo oficial para que o agente, ao receber prompts genéricos como *"Leia AGENTS"*, realize auto-diagnóstico de contexto em 3 segundos (identificando Onboarding Brownfield com código vivo, Greenfield para novos projetos, ou Continuação de Sprint) e proponha a ação correta imediatamente sem advertências burocráticas ou postura passiva.
- **Comandos Rápidos de Início (Intenção Macro):** Adicionados aos ponteiros de raiz [AGENTS.md](governanca/AGENTS.md) e [CLAUDE.md](CLAUDE.md) para guiar o usuário com prompts precisos no pontapé inicial de cada sessão.
- **Ferramental de P&D e Auto-Evolução da Governança (Exclusivo Matriz):** Implementada a nova skill [auditar-maturidade-governanca.md](governanca/skills/auditar-maturidade-governanca.md), o workflow `/auditar-governanca` ([auditar-governanca.md](governanca/workflows/auditar-governanca.md)) e o template de relatório [_template_evolucao_governanca.md](governanca/relatorios/_template_evolucao_governanca.md). A ferramenta opera sob demanda exclusivamente na matriz para benchmark com o mercado, avaliação de ferramentas (Graphify, linters, MCPs) e geração de backlog de sprints sem poluir os projetos satélites.
- **Auditoria Integral de Maturidade & Roadmap Multi-Sprint:** Realizada inspeção de 100% dos manuais, scripts e catálogo da governança, formalizada em [evolucao-governanca-2026-10-06.md](governanca/relatorios/evolucao-governanca-2026-10-06.md) (nota calibrada em 7.8/10), com desdobramento mandatória em 4 arquivos físicos de sprint em `governanca/sprints/` (Sprints 01 a 04).
- **Blindagem Anti-Atalhos na Auditoria:** Skill e workflow de auditoria blindados com proibição estrita de suposições/testes mentais, exigência de tabela de Manifesto de Cobertura e proibição de roadmaps inline.

### Modificado
- [AGENTS.md](governanca/AGENTS.md): Documentação dos comandos de sincronização, manutenção e hábito obrigatório de registro no changelog.
- Skill [evoluir-governanca.md](governanca/skills/evoluir-governanca.md): Seção dedicada ao consumo de melhorias da matriz e registro obrigatório de diff.
- Script [harness.mjs](governanca/scripts/harness.mjs): Ajuste de caminhos relativos em ponteiros do harness e suporte a rotas de início dinâmicas.
- Script portátil [sincronizar.mjs](governanca/scripts/sincronizar.mjs) e template: Busca recursiva de diretórios pais para localizar a progenitora, garantia de ponteiros raiz e suporte a transporte de `CHANGELOG.md`.
- **Canonização Universal de Links (Pente Fino):** Varredura completa em 145 arquivos eliminando todas as menções em texto puro solto a documentos, skills e workflows. Cobertura da suíte ampliada para **856 links Markdown locais auditados e 100% íntegros**.
- **Paridade Absoluta:** Sincronização espelhada de 100% dos arquivos entre os templates da progenitora (`src/templates/`) e os arquivos vivos da governança (`governanca/`).

---

## [1.0.0] — 2026-10-02

### Adicionado
- **Auto-Governança da Progenitora:** A própria base `rr-controle-de-agentes-1.1` agora é governada por suas próprias regras.
- **Harness Autônomo:** Script [harness.mjs](governanca/scripts/harness.mjs) com zero dependências externas para sincronizar `.agents/` e ponteiros raiz.
- **Descoberta Dinâmica de Templates:** Eliminação de hardcoding estático de arquivos no gerador por varredura automática de pastas de templates.
- **Auto-Seed Transparente:** Seed do banco SQLite com preservação estrita de identificadores e integridade referencial dos 27 presets.
- **Padrões Especializados:** Manuais dedicados de engenharia de software em [padroes/](governanca/padroes/) ([frontend.md](governanca/padroes/frontend.md) e [backend.md](governanca/padroes/backend.md)).
- **Blindagem de Contexto:** Proteção estrita contra perda de dados em [PLANO.md](governanca/PLANO.md), [PRD.md](governanca/PRD.md) e [SESSAO.md](governanca/SESSAO.md).
