# Changelog — Controle de Agentes (RR Tech Studio)

Todas as alterações notáveis, novas funcionalidades, melhorias e correções da aplicação **Controle de Agentes** são documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

> **Diretriz para Agentes IA e Desenvolvedores:**
> - Atualize este arquivo **antes de fechar qualquer commit** que altere regras de negócio, telas, dados ou APIs do produto.
> - Registre apenas o **delta consolidado** (o que foi adicionado, modificado ou corrigido).
> - **Não acumule** processo de edição, histórico de tentativas ou micro-passos. O commit no Git já registra o histórico detalhado linha por linha.
> - As alterações no ecossistema e regras de governança são documentadas separadamente em [governanca/CHANGELOG.md](governanca/CHANGELOG.md).

---

## [1.1.6] — 2026-10-06

### Adicionado
- **Sincronização Remota Forçada (`--remoto` / `--online` / `-r`):** Flag no utilitário de sincronização (`sincronizar.mjs`) que ignora a detecção de diretórios locais e força a conexão via GitHub Raw, permitindo testar downloads e rotas de rede da nuvem mesmo quando a matriz progenitora está clonada localmente.
- **Botão `🌐 Forçar Remoto` no Painel Satélite (`ui.mjs`):** Nova ação rápida no cabeçalho do painel web e suporte no endpoint `/api/sincronizar` para disparar a sincronização remota via navegador com terminal flutuante em tempo real.
- **Changelog de Produto Inicial no Bootstrap Remoto:** O sincronizador (`sincronizar.mjs`) agora gera automaticamente o `CHANGELOG.md` de produto na raiz do repositório satélite caso ainda não exista, garantindo histórico de releases desde o primeiro dia.
- **Espelhamento nos Templates e Governança:** Atualização de paridade em `src/templates/scripts/sincronizar.mjs`, no manual de sincronização remota (`sincronizacao-remota.md`) e nas diretrizes da skill `sincronizar-governanca`.

---

## [1.1.5] — 2026-10-06

### Adicionado
- **Modularização dos Fontes do Painel Satélite (`src/satelite-ui/`):** Decomposição completa do arquivo monolítico de 1.433 linhas de `ui.mjs` em módulos especializados com syntax highlight nativo (`views/estilos.css`, `views/template.html`, `client/app.js` e `server/servidor.mjs`).
- **Pipeline de Bundling Determinístico (`build-satelite-ui.ts`):** Compilação automática dos módulos em um único arquivo autocontido para `governanca/scripts/ui.mjs` e `src/templates/scripts/ui.mjs`, preservando a premissa de zero dependências externas no satélite.
- **Automação no CI e Validação de Paridade:** Script `build:ui` integrado ao `npm run build` do Next.js e asserção de paridade estrita em `npm test`, impedindo publicação de bundles desatualizados.

---

## [1.1.4] — 2026-10-06

### Adicionado
- **Context Engineering no AGENTS.md:** Teto estrito de 150 linhas (~12 KB) com Progressive Disclosure orientado a manuais em `padroes/` e workflows *just-in-time*, blindando contra truncamento de contexto de IA.
- **Encadeamento Fluido de Workflows:** Seção "Próximo Passo Recomendado" em todos os workflows operacionais (`/spec`, `/plan`, `/research`, `/implement`, `/review`, `/release`, `VINCULAR.md`) eliminando becos sem saída na navegação do agente.
- **Validação Visual Humana no Fast-Track (`/fix`):** Agente proibido de escanear telas de forma autônoma; exigência de descrição de rota/componente com aguardo de validação humana explícita antes do commit.
- **Trava de Teto em Loops de Teste (`/test`):** Limite determinístico de até 3 tentativas consecutivas de correção de falhas de teste antes de interromper o ciclo para alinhamento com o usuário.
- **Usabilidade Nativa Zero-Bloat:** Seção 7 em `padroes/frontend.md` padronizando tags HTML semânticas nativas (`<button>`, `<a>`), fechamento de modais/drawers com tecla `Escape`, alvos de clique confortáveis no mobile (~40-44px) e alto contraste, sem inchaço de dependências externas ou ARIA redundante.
- **Reconciliação Viva do Livro de Arquitetura:** Volumes 01 a 05 inteiramente alinhados à stack real do projeto (Next.js 16 + React 19 + Tailwind CSS 4 + SQLite nativo `node:sqlite` WAL + Biome + Vitest), documentando catálogo de tabelas, ERD e comportamentos autônomos.

---

## [1.1.3] — 2026-10-06

### Adicionado
- Auditoria de código morto e dependências zumbis zero-token com Knip documentada em `auditar-repositorio.md`.
- Paridade total de linters nativos nos presets (.NET Roslyn Analyzers, golangci-lint, gofumpt, flutter_lints, dart format) e Biome como padrão nos presets web.
- Saneamento taxonômico do catálogo de tecnologias (151 tecnologias em 11 categorias limpas) com aposentadoria formal de PyInstaller e dotenv.
- Desacoplamento estrito de escopo entre auditoria técnica de repositório e auditorias de consistência visual/responsividade na meta-skill `faxina-completa.md`.

---

## [1.1.2] — 2026-10-06

### Adicionado
- Scanner determinístico de segredos `verificar-segredos.mjs` com fallback nativo por regex e suporte a Gitleaks.
- Diretrizes defensivas contra OWASP Agentic Top 10 2026 (Zero-Trust de contexto, anti-Goal Hijacking e Memory Poisoning).
- Padrões de cabeçalhos HTTP defensivos (Strict CSP com nonce, HSTS permanente e Rate Limiting) e política de MCP Mínimo no harness.

---

## [1.1.1] — 2026-10-06

### Adicionado
- Provisionamento automático e não-destrutivo de `CHANGELOG.md` na raiz de novos projetos satélites via template `PRODUTO_CHANGELOG.md`.
- Regra pétrea e hábito operacional condicionado para agentes registrarem o delta consolidado no changelog do produto antes de cada commit.
- Integração do passo de registro no changelog aos workflows operacionais `/implement`, `/fix`, `/release` e templates de sprint.

---

## [1.1.0] — 2026-10-06

### Adicionado
- **Painel Web Portátil do Satélite (`ui.mjs`):** Servidor HTTP local com interface visual completa embarcada em Node.js nativo (18+), zero dependências.
- **Sincronização Remota com a Matriz (`sincronizar.mjs`):** Capacidade de atualizar a governança em máquinas remotas via GitHub Raw ou local nos modos Essencial e Total.
- **Interface de Regeneração Avançada:** Botão com menu dropdown para Sincronização Essencial ou Regeneração Total com modal de confirmação e backup prévio automático.
- **Rastreamento de Métricas:** Visualização de histórico de linhas de código e quantidade de arquivos por projeto.
- **Isolamento de P&D:** Bloqueio mecânico de ferramentas internas de auditoria da matriz em projetos satélites.

---

## [1.0.0] — 2026-10-02

### Adicionado
- Interface web em Next.js para cadastro, visualização e gerência de projetos governados.
- Catálogo de tecnologias com banco SQLite embarcado e integridade referencial dos 27 presets.
- Gerador dinâmico de governança com descoberta de templates de skills, workflows e padrões.
- Harness autônomo com sincronização automática para `.agents/` e instruções para agentes de IA.
