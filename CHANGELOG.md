# Changelog — Controle de Agentes (RR Tech Studio)

Todas as alterações notáveis, novas funcionalidades, melhorias e correções da aplicação **Controle de Agentes** são documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

> **Diretriz para Agentes IA e Desenvolvedores:**
> - Atualize este arquivo **antes de fechar qualquer commit** que altere regras de negócio, telas, dados ou APIs do produto.
> - Registre apenas o **delta consolidado** (o que foi adicionado, modificado ou corrigido).
> - **Não acumule** processo de edição, histórico de tentativas ou micro-passos. O commit no Git já registra o histórico detalhado linha por linha.
> - As alterações no ecossistema e regras de governança são documentadas separadamente em [governanca/CHANGELOG.md](governanca/CHANGELOG.md).

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
