---
name: auditar-maturidade-governanca
description: Audita a maturidade da governança matriz, pesquisa ferramentas e melhores práticas da web (como Graphify, linters, MCPs, harness) e gera relatórios com propostas de sprints para auto-evolução contínua.
---

# Skill: Auditar Maturidade & Evoluir Governança (P&D Matriz)

> **Escopo:** Exclusivo da Matriz Progenitora (`rr-controle-de-agentes-1.1`).  
> **Modo de Uso:** 100% Sob Demanda — disparado apenas por comando explícito do usuário ou `/auditar-governanca`.  
> **Meta-Objetivo:** A governança deve ser um organismo vivo de alta engenharia, capaz de inspecionar a si mesmo, comparar-se com o estado da arte do mercado e propor sua própria evolução contínua sem superficialidade, sem atalhos cognitivos e gerando sprints físicas dedicadas prontas para execução.

---

## 1. Quando Executar

- Em sessões dedicadas de **Pesquisa e Desenvolvimento (P&D)** da governança.
- Antes de grandes releases ou versões menores (ex: 1.1.0 -> 1.2.0).
- Quando surgirem novas ferramentas ou padrões relevantes na indústria (ex: novas convenções de agentes autônomos, ferramentas de AST/Tree-sitter, MCP servers consolidados, linters modernos como Biome/Knip).
- Quando solicitada pelo usuário com o prompt: `"Audite a maturidade da governança"` ou via comando `/auditar-governanca`.

---

## 2. Passo a Passo da Auditoria

### Fase 1: Raio-X Estrutural Interno (Diagnóstico Local Baseado em Evidências)

O auditor DEVE obrigatoriamente inspecionar os arquivos vivos no disco antes de emitir qualquer veredito. É terminantemente proibido assumir estados ou emitir opiniões sem leitura comprovada.

1. **Manifesto de Cobertura Mandatório (Pré-Condição Inegociável):**
   - Todo relatório de auditoria DEVE conter no início a tabela de **Manifesto de Cobertura**, declarando:
     - Caminho relativo do arquivo inspecionado.
     - Contagem real de linhas lidas.
     - Escopo / Função no ecossistema.
     - Status da checagem (`100% Lido na Íntegra` vs. `Amostrado`).
   - O relatório é nulo e inválido se contiver diagnósticos sobre manuais, workflows ou scripts que não foram lidos linha por linha.
2. **Execução Determinística de Testes (Proibição Absoluta de Simulação Mental):**
   - Execute via terminal o comando oficial de validação de integridade:
     ```bash
     npm test
     ```
   - **É EXPRESSAMENTE PROIBIDO "executar mentalmente" ou supor que os testes passaram.** O relatório deve transcrever a saída real do terminal (templates aprovados, total de links Markdown verificados e integridade dos presets x SQLite).
3. **Auditoria de Paridade dos Wrappers do Harness:**
   - Inspecione a pasta `.agents/skills/`.
   - Assegure que cada skill em `governanca/skills/*.md` possui seu wrapper equivalente em `.agents/skills/<nome>/SKILL.md`.
   - Confirme que os frontmatters (`name` e `description`) estão preenchidos de forma clara, imperativa e sem ambiguidades.
4. **Auditoria da Regra de Segregação Rigorosa:**
   - Verifique se nenhuma ferramenta ou skill exclusiva de P&D da Matriz (`auditar-maturidade-governanca.md`, `CATALOGO_TECNOLOGIAS.md`, etc.) vazou para `src/templates/skills/` ou `src/templates/workflows/`.
5. **Divisão Multiagente com Handoff por Artefatos (Quando o Harness Suportar):**
   - Em auditorias amplas que cubram dezenas de arquivos, o agente principal DEVE particionar a carga de trabalho em 4 subagentes dedicados com contexto isolado:
     - **Subagente 1 (Manuais & Arquitetura):** `padroes/*.md`, Livro de Arquitetura (01 a 05), `CONVENCOES-TEMPLATES.md`.
     - **Subagente 2 (Workflows & Sessão):** 10 workflows em `workflows/`, `INICIO.md`, `VINCULAR.md`, `SESSAO.md`.
     - **Subagente 3 (Scripts & Gerador):** `sincronizar.mjs`, `harness.mjs`, `gerador.ts`, `validar-templates.ts`.
     - **Subagente 4 (Catálogo & Skills):** `CATALOGO_TECNOLOGIAS.md`, `presets.json`, SQLite e wrappers `.agents/`.
   - A comunicação opera estritamente via **handoff por artefatos (arquivos Markdown)**: cada subagente entrega seu relatório com manifesto de cobertura e evidências; o agente principal consolida sem perda de contexto.

---

### Fase 2: Pesquisa Externa Obrigatória na Web & Benchmark do Estado da Arte

O auditor DEVE obrigatoriamente consultar a internet (via ferramentas de busca na web e leitura de documentações oficiais) para comparar a governança com as inovações mais recentes da indústria. É terminantemente proibido basear-se apenas na memória estática pré-treinada do modelo.

1. **Protocolo Mandatório de Varredura Externa:**
   - Execute buscas ativas cobrindo os 4 eixos fundamentais de modernização:
     - **Eixo A (Agent Harness Engineering & Context Limits):** Investigue convenções recentes de arquivos de contexto (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`), limites de truncamento cumulativo de LLMs líderes (ex: teto silencioso de 32 KiB do Codex), práticas de *progressive disclosure* e estudos empíricos sobre tamanho de prompts de sistema.
     - **Eixo B (Segurança Agêntica & Blindagem de Ferramentas):** Consulte as publicações mais recentes do OWASP (incluindo o *OWASP Top 10 for Agentic Applications* — ASI01 a ASI07), mitigações contra *indirect prompt injection*, riscos de *tool poisoning*, escaneamento determinístico de segredos (Gitleaks, TruffleHog) e cabeçalhos de defesa em profundidade (Strict CSP com nonce/`strict-dynamic`).
     - **Eixo C (Ferramentas Offline Zero-Token & AST):** Pesquise ferramentas modernas que rodem localmente em sub-milissegundos sem consumir tokens de IA: linters e formatadores em Rust (Biome, Oxlint), analisadores de código morto e dependências zumbis (Knip), manipuladores de AST (ast-grep, Tree-sitter) e test runners nativos (`node --test`).
     - **Eixo D (Model Context Protocol & DX Portátil):** Consulte a especificação oficial do MCP (modelcontextprotocol.io), boas práticas de segurança (OAuth 2.1, allowlists, menor privilégio) e ergonomia de desenvolvedor (one-liners, zero-dependências).
2. **Delegação a Subagente Pesquisador:**
   - Quando o harness suportar execução multiagente, o agente principal pode delegar esta fase a um subagente dedicado (`role: Web Benchmark Researcher`), que executará as buscas na web e devolverá um briefing compilado com links canônicos e dados técnicos verificados.
3. **Formatação Mandatória no Radar de Inovação:**
   - Para cada tecnologia, ferramenta ou padrão identificado na pesquisa, o relatório DEVE conter:
     - **Nome & Categoria:** Identificação clara.
     - **Fonte / URL Canônica:** Link oficial da documentação ou repositório.
     - **O que faz:** Descrição técnica objetiva.
     - **Benefício Real para a RR Tech Studio:** Ganho mensurável em tokens, velocidade, segurança ou qualidade.
     - **Veredito Técnico Justificado:**
       - `Adotar Imediatamente` (alto impacto, zero atrito, alinhado à stack atual).
       - `Planejar para Sprint Futura` (alto valor, mas exige janela de implementação estruturada).
       - `Descartar` (viola a simplicidade Markdown-first, introduz dependências pesadas em linguagens secundárias ou gera overengineering).
4. **Filtro de Simplicidade Inegociável (Anti-Overengineering):**
   - Rejeite sumariamente propostas que criem frameworks proprietários de avaliação, suítes em YAML com runners headless ou dependências que fujam do Node.js nativo e do ecossistema contratado. Toda modernização deve respeitar a premissa de manter a governança ágil, portátil e guiada por Markdown.

---

### Fase 3: Geração do Relatório Formal e Rubrica de Notas
Crie ou atualize o relatório oficial em `governanca/relatorios/evolucao-governanca-<YYYY-MM-DD>.md` utilizando a estrutura de [_template_evolucao_governanca.md](governanca/relatorios/_template_evolucao_governanca.md):
1. Transcreva o **Manifesto de Cobertura Integral** consolidando todas as frentes auditadas.
2. Atribua notas honestas e fundamentadas (0 a 10) para cada um dos 6 pilares de maturidade, seguindo a **Régua Métrica Objetiva**:
   - **0 a 4 (Emergente / Frágil):** Presença de links quebrados (404), templates com dados sintéticos/placeholders não preenchidos, ou ferramentas de P&D vazando para clientes.
   - **5 a 7 (Funcional com Gaps):** Sistema funciona e compila, mas possui duplicações literais de texto, falta de regras de acessibilidade básica, ausência de tratamento de erros em downloads ou validações permissivas.
   - **8 a 9 (Maduro):** 100% dos links navegáveis nativamente, segregação absoluta Matriz vs. Satélites, workflows encadeados sem becos sem saída, e manuais com Zero-Trust e padrões modernos de segurança.
   - **10 (Estado da Arte):** Nível 9 somado a ferramentas determinísticas zero-token (Knip, Biome), barreira mecânica contra segredos (Gitleaks), orçamentos rígidos de contexto (< 150 linhas) e auditorias contínuas.
3. Documente o **Radar de Inovação** com vereditos claros (Adotar / Planejar / Descartar).
4. Agrupe pontos de melhoria em:
   - 🔴 **Gaps Críticos:** falhas mecânicas, links 404, vazamento de P&D ou riscos de alucinação (citando obrigatoriamente `arquivo:linha`).
   - 🟡 **Oportunidades:** modernizações conceituais, segurança agêntica e análise zero-token.
   - 🟢 **Ganhos Rápidos (Quick Wins):** ajustes de texto ou regras de alto impacto imediato.

---

### Fase 4: Materialização Mandatória de Sprints Físicas Dedicadas

As propostas de evolução **NUNCA devem permanecer como resumos genéricos ou listas fatiadas soltas no corpo do relatório**:

1. **Geração de Arquivos Físicos Dedicados:**
   - O auditor DEVE gerar arquivos Markdown individuais para cada sprint proposta dentro do diretório oficial:
     `governanca/sprints/XX-nome-da-sprint.md`
   - Cada arquivo de sprint deve seguir rigorosamente a estrutura completa de [sprints/_template.md](governanca/sprints/_template.md): frontmatter (`status: pendente`, `sessao_atual: 0`), objetivo mensurável, etapas detalhadas com tarefas concretas em checkboxes `[ ]`, critérios de aceite, instruções de Gate 1 e Gate 2, roteiro de verificação passo a passo e limitações honestas.
2. **Desdobramento Completo do Escopo (Roadmap Não-Econômico):**
   - Não economize na quantidade de sprints. Divida o trabalho em sprints temáticas especializadas e encadeadas (ex: Sprint 01 para correções mecânicas imediatas; Sprint 02 para segurança e blindagem agêntica; Sprint 03 para ferramentas analíticas zero-token; Sprint 04 para contexto e ergonomia).
3. **Vinculação no Relatório:**
   - A Seção 5 do relatório de auditoria deve conter a tabela com o resumo de cada sprint e links Markdown navegáveis para seus arquivos físicos correspondentes em `governanca/sprints/`.
4. **Aguarde a Validação do Usuário:**
   - Somente após a aprovação formal do usuário no Gate 1 da respectiva sprint, insira as tarefas em [SESSAO.md](governanca/SESSAO.md) e inicie a implementação.

---

## 3. Cláusulas e Regras de Conduta

- **Comportamentos Terminantemente Proibidos (Anti-Atalhos):**
  1. É proibido usar amostragem (`head`, `grep` ou leitura superficial de cabeçalhos) em substituição à leitura linha por linha dos manuais e workflows.
  2. É proibido supor ou "executar mentalmente" testes e comandos de validação.
  3. É proibido emitir diagnósticos sem citar o par `arquivo:linha` onde a evidência foi comprovada.
  4. É proibido agrupar sprints em resumos inline no relatório em vez de gerar os arquivos físicos dedicados em `governanca/sprints/`.
- **Coerência Sistêmica:** As recomendações da auditoria e o formato das sprints devem respeitar a escala de complexidade consagrada em [evoluir-governanca.md](governanca/skills/evoluir-governanca.md) e [usar-subagentes.md](governanca/skills/usar-subagentes.md):
  $$\text{Regra em Manual (.md)} \longrightarrow \text{Script Nativo} \longrightarrow \text{Skill sob Demanda} \longrightarrow \text{Subagente Isolado}$$
- **Não Inventar Dependências:** Nunca sugira ferramentas externas pesadas se um script nativo Node.js ou padrão simples resolver com estabilidade e zero dependências.
- **Portabilidade Total:** Tudo o que for adotado na governança deve funcionar de forma transparente no Windows, macOS e Linux.
- **Segregação Rigorosa:** Ferramentas de auto-análise e P&D da governança permanecem restritas à matriz (`governanca/skills/`) e não devem ser replicadas em `src/templates/skills/` para não sobrecarregar os projetos satélites dos clientes.
