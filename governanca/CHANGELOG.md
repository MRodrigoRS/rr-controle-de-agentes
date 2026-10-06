# Changelog da Governança — RR Tech Studio

Todas as alterações notáveis, novas regras, padrões de engenharia, skills e melhorias estruturais da governança matriz são documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.1.0] — 2026-10-06

### Adicionado
- **Sincronização Remota Universal:** Implementado o script portátil `governanca/scripts/sincronizar.mjs` (Node.js 18+ nativo, zero dependências externas) permitindo que projetos associados sincronizem a matriz de qualquer computador via GitHub ou fonte local.
- **Dois Modos de Sincronização:**
  - **Modo Essencial (Seguro / Padrão):** Atualiza padrões (`padroes/`), workflows (`workflows/`), skills (`skills/`) e catálogo sem tocar no contexto vivo do projeto (`SESSAO.md`, `PRD.md`, `sprints/`, `livro-arquitetura/`).
  - **Modo Total (Hard Reset):** Regenera 100% dos arquivos a partir dos presets da matriz, com confirmação explícita no terminal (`REGENERAR TUDO`) e criação garantida de backup prévio em `.backup-governanca-<timestamp>/`.
- **Evolução da Interface Web:**
  - Menu no botão **Recriar Governança** com opções "Sincronizar Essencial" e "Regeneração Total...".
  - Componente `ModalConfirmarRegeneracaoTotal` com alerta visual de impacto e aviso de backup automático.
  - Endpoint `PUT /api/projetos/[id]` adaptado para `{ modo: "essencial" | "total" }` com backup prévio automático no modo total.
- **Metadados da Matriz:** Criação automática de `governanca/.matriz.json` registrando repositório, branch, presets vinculados e timestamp da última sincronização.
- **Comando CLI da Progenitora:** Adicionado script `npm run rr:sync -- [caminho] [--total]`.
- **Changelog Integrado:** Documento `governanca/CHANGELOG.md` que viaja junto com a governança e se regenera em qualquer sincronização.

### Modificado
- `AGENTS.md` e `src/templates/AGENTS.md`: Documentação dos comandos de sincronização e manutenção.
- Skill `evoluir-governanca`: Seção dedicada ao consumo de melhorias da matriz em qualquer máquina.
- `harness.mjs`: Ajuste de caminhos relativos em ponteiros do harness e suporte a rotas de início dinâmicas.

---

## [1.0.0] — 2026-10-02

### Adicionado
- **Auto-Governança da Progenitora:** A própria base `rr-controle-de-agentes-1.1` agora é governada por suas próprias regras.
- **Harness Autônomo:** Script `governanca/scripts/harness.mjs` com zero dependências externas para sincronizar `.agents/` e ponteiros raiz (`CLAUDE.md`, `AGENTS.md`).
- **Descoberta Dinâmica de Templates:** Eliminação de hardcoding estático de arquivos no gerador por varredura automática de pastas de templates.
- **Auto-Seed Transparente:** Seed do banco SQLite com preservação estrita de identificadores e integridade referencial dos 27 presets.
- **Padrões Especializados:** Manuais dedicados de engenharia de software em `governanca/padroes/` (`frontend.md` e `backend.md`).
- **Blindagem de Contexto:** Proteção estrita contra perda de dados em `PLANO.md`, `PRD.md` e `SESSAO.md`.
