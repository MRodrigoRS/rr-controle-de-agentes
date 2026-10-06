---
name: auditar-maturidade-governanca
description: Audita a maturidade da governança matriz, pesquisa ferramentas e melhores práticas da web (como Graphify, linters, MCPs, harness) e gera relatórios com propostas de sprints para auto-evolução contínua.
---

# Skill: Auditar Maturidade & Evoluir Governança (P&D Matriz)

> **Escopo:** Exclusivo da Matriz Progenitora (`rr-controle-de-agentes-1.1`).  
> **Modo de Uso:** 100% Sob Demanda — disparado apenas por comando explícito do usuário ou `/auditar-governanca`.  
> **Meta-Objetivo:** A governança deve ser um organismo vivo de alta engenharia, capaz de inspecionar a si mesmo, comparar-se com o estado da arte do mercado e propor sua própria evolução contínua sem depender de adivinhações.

---

## 1. Quando Executar

- Em sessões dedicadas de **Pesquisa e Desenvolvimento (P&D)** da governança.
- Antes de grandes releases ou versões menores (ex: 1.1.0 -> 1.2.0).
- Quando surgirem novas ferramentas ou padrões relevantes na indústria (ex: novas convenções de agentes autônomos, ferramentas de AST/Tree-sitter, MCP servers consolidados, linters modernos como Biome/Knip).
- Quando solicitada pelo usuário com o prompt: `"Audite a maturidade da governança"` ou via comando `/auditar-governanca`.

---

## 2. Passo a Passo da Auditoria

### Fase 1: Raio-X Estrutural Interno (Diagnóstico Local)
Examine o estado atual dos componentes da governança:
1. **Regras e Filosofia Fundamental:**
   - Inspecione [AGENTS.md](governanca/AGENTS.md) e [CLAUDE.md](CLAUDE.md).
   - Verifique se as cláusulas fundamentais, políticas de Zero-Trust e Dever de Crítica permanecem claras e sem ambiguidades.
2. **Manuais Especializados:**
   - Inspecione [padroes/frontend.md](governanca/padroes/frontend.md), [padroes/backend.md](governanca/padroes/backend.md) e [padroes/sincronizacao-remota.md](governanca/padroes/sincronizacao-remota.md).
   - Avalie se as diretrizes técnicas ainda refletem padrões modernos de arquitetura, acessibilidade, segurança e resiliência.
3. **Catálogo e Presets:**
   - Inspecione [CATALOGO_TECNOLOGIAS.md](governanca/skills/CATALOGO_TECNOLOGIAS.md) e a tabela SQLite de tecnologias.
   - Verifique se há stacks obsoletas ou ferramentas essenciais que ainda não foram catalogadas.
4. **Ferramental e Scripts Auxiliares:**
   - Avalie os scripts portáteis em [scripts/](governanca/scripts/): [sincronizar.mjs](governanca/scripts/sincronizar.mjs), [ui.mjs](governanca/scripts/ui.mjs), [harness.mjs](governanca/scripts/harness.mjs).
   - Verifique ergonomia, performance, portabilidade (Node.js nativo zero-dependência) e tratamento de falhas.
5. **Integridade de Links e Templates:**
   - Execute mentalmente ou via terminal `npm test` para assegurar que 100% dos links e templates estão operacionais.
6. **Coerência Documental & Ecossistema de Arquivos Markdown (.md):**
   - **Fluxo e Navegabilidade:** Avalie se os documentos formam uma jornada lógica e intuitiva para o desenvolvedor e o agente, sem atritos cognitivos ou becos sem saída.
   - **Divisão Estrita de Responsabilidades:** Certifique-se de que cada documento respeita sua camada (regras universais em [AGENTS.md](governanca/AGENTS.md), manuais técnicos em [padroes/](governanca/padroes/), procedimentos em [workflows/](governanca/workflows/), habilidades isoladas sob demanda em [skills/](governanca/skills/), e diário em [SESSAO.md](governanca/SESSAO.md)).
   - **Eliminação de Redundâncias e Repetições:** Localize textos ou regras duplicadas em múltiplos arquivos que desperdicem tokens de janela ou aumentem o risco de divergência com o tempo.
   - **Referenciação Cruzada & Arquivos Órfãos:** Verifique se todos os arquivos importantes estão devidamente apontados a partir dos índices e se nenhum documento relevante ficou esquecido/desconectado do fluxo.


---

### Fase 2: Pesquisa Externa & Benchmark do Estado da Arte
Investigue proativamente referências na web e inovações do ecossistema:
1. **Agent Harness Engineering:**
   - Padrões recomendados por laboratórios de IA de ponta (Google DeepMind, Anthropic, OpenAI).
   - Otimização do consumo de tokens (manter regras essenciais na raiz, manuais sob demanda).
   - Padrões de MCP (Model Context Protocol) eficientes e seguros.
2. **Ferramentas de Análise de Código Offline & Zero-Token:**
   - Avalie ferramentas integráveis ao fluxo como [Graphify](governanca/skills/mapear-grafo-de-conhecimento.md), bibliotecas Tree-sitter, linters rápidos (Biome, Knip, Oxlint), orquestradores de testes locais (Vitest, Playwright).
   - Princípio: preferir ferramentas que rodem localmente sem gastar tokens da janela de contexto.
3. **Segurança & Resiliência:**
   - Atualizações de OWASP Top 10, escaneamento de segredos via git hooks, proteção de variáveis de ambiente e CSP/CORS.
4. **Ergonomia do Desenvolvedor (DX):**
   - Comandos one-liner, automações portáteis e dashboards de acompanhamento visual.

---

### Fase 3: Geração do Relatório Formal
Crie um relatório oficial em `governanca/relatorios/evolucao-governanca-<YYYY-MM-DD>.md` utilizando a estrutura de [_template_evolucao_governanca.md](governanca/relatorios/_template_evolucao_governanca.md):
1. Atribua notas honestas (0 a 10) para cada um dos 5 pilares de maturidade.
2. Documente cada tecnologia/ideia avaliada no **Radar de Inovação** com veredito (Adotar / Planejar / Descartar).
3. Agrupe pontos de melhoria em:
   - 🔴 **Gaps Críticos:** problemas reais de documentação, links ou riscos de alucinação.
   - 🟡 **Oportunidades:** refinamentos arquiteturais e novidades da web.
   - 🟢 **Ganhos Rápidos (Quick Wins):** tarefas simples de alto impacto.
4. Monte a **Matriz Esforço x Impacto**.

---

### Fase 4: Proposta de Sprints e Backlog da Matriz
Converta as conclusões mais valiosas em uma proposta de Sprint executável para a governança matriz:
1. Formate a proposta nos padrões de [sprints/_template.md](governanca/sprints/_template.md).
2. Apresente ao usuário as tarefas divididas em fatias verticais com critérios claros de aceite.
3. **Aguarde a validação do usuário.** Somente após o aval, insira as tarefas em [SESSAO.md](governanca/SESSAO.md) e inicie a implementação.

---

## 3. Cláusulas e Regras de Conduta

- **Não Inventar Dependências:** Nunca sugira ferramentas externas pesadas se um script nativo Node.js ou padrão simples resolver com estabilidade e zero dependências.
- **Portabilidade Total:** Tudo o que for adotado na governança deve funcionar de forma transparente no Windows, macOS e Linux.
- **Segregação Rigorosa:** Ferramentas de auto-análise e P&D da governança permanecem restritas à matriz (`governanca/skills/`) e não devem ser replicadas em `src/templates/skills/` para não sobrecarregar os projetos satélites dos clientes.
- **Transparência de Gaps:** Não hesite em apontar fragilidades ou pontas soltas na governança existente. O papel do agente é ser crítico, construtivo e garantir a longevidade técnica do estúdio.
