---
name: pesquisar-inovacao-governanca
description: Pesquisa ativamente na web tendências da indústria, padrões de agentes (OWASP, AST, MCP, harnesses) e gera propostas de P&D para a evolução contínua da matriz.
---

# Skill: Pesquisar Inovação & Tendências da Governança (P&D Matriz)

> **Escopo:** Exclusivo da Matriz Progenitora (`rr-controle-de-agentes-1.1`).  
> **Modo de Uso:** 100% Sob Demanda — disparado por comando explícito do usuário ou para prospectar novas versões maiores/menores (ex: v1.2.0).  
> **Meta-Objetivo:** Manter a RR Tech Studio na vanguarda absoluta da engenharia de software para agentes autônomos, pesquisando o ecossistema global na web, filtrando modismos e trazendo inovações práticas e portáteis.

---

## 1. Quando Executar

- Em sessões dedicadas de **Pesquisa & Desenvolvimento (P&D)** da matriz.
- Antes de planejar um salto de versão menor ou maior (ex: `1.1.x` $\to$ `1.2.0`).
- Quando surgirem novos modelos, protocolos ou movimentos relevantes na indústria (novas especificações do Model Context Protocol, novos padrões da Anthropic/OpenAI/Google DeepMind, novidades em AST/Tree-sitter ou linters ultra-rápidos).
- Quando solicitado com prompts do tipo:
  - `"Pesquise na web as melhores práticas recentes para governança de agentes"`
  - `"Investigue novas ferramentas de AST ou linters zero-token para adotarmos"`
  - `"Faça um benchmark da governança contra as novidades do mercado"`

---

## 2. Passo a Passo da Pesquisa & Proposição

### Fase 1: Varredura Obrigatória na Web (Busca Ativa & Leitura Oficial)

O agente DEVE obrigatoriamente realizar buscas ativas na internet e ler documentações oficiais atualizadas. É terminantemente proibido basear-se apenas no treinamento estático.

1. **Os 4 Eixos Fundamentais de Pesquisa:**
   - **Eixo A — Agent Harness Engineering & Ergonomia de Contexto:**
     - Convenções de arquivos de instruções (`AGENTS.md`, `CLAUDE.md`, `.agents/skills/`).
     - Estratégias de *progressive disclosure* e minimização de tokens em prompts de sistema.
     - Práticas de handoff multiagente por artefatos e controle de memória de curto vs longo prazo.
   - **Eixo B — Segurança Agêntica & Zero-Trust para Ferramentas:**
     - Publicações e atualizações do *OWASP Top 10 for Agentic Applications* (riscos de prompt injection indireto, tool poisoning, jailbreaks).
     - Mecanismos de contenção, allowlists de comandos e escaneamento de credenciais (Gitleaks, TruffleHog).
     - Políticas de execução segura em ambientes locais e conteinerizados.
   - **Eixo C — Ferramental Offline Zero-Token & Análise Estática:**
     - Ferramentas nativas em Rust/Go/Node.js que executam em sub-milissegundos sem custo de tokens de IA (ex: Biome, Oxlint, Knip, ast-grep, Tree-sitter).
     - Test runners integrados e analisadores de cobertura determinísticos.
   - **Eixo D — Model Context Protocol (MCP) & Interoperabilidade:**
     - Evolução da especificação oficial do MCP (modelcontextprotocol.io).
     - MCP servers consolidados, padrões de autorização (OAuth 2.1) e ergonomics de deploy.

2. **Delegação a Subagente Pesquisador (Opcional):**
   - Quando suportado, a busca pode ser delegada a um subagente (`role: Web Benchmark Researcher`) com contexto isolado, retornando um briefing consolidado com URLs canônicas.

---

### Fase 2: Radar de Inovação e Avaliação Crítica

Para cada tecnologia, ferramenta, biblioteca ou padrão identificado na web, documente:

| Campo | Descrição |
| :--- | :--- |
| **Tecnologia / Padrão** | Nome oficial e link canônico para o repositório ou documentação. |
| **Categoria** | Ex: Harness, AST, MCP, Linter Zero-Token, Segurança, UI. |
| **O que resolve** | Resumo técnico de como funciona e qual problema soluciona. |
| **Ganho Real para RR Tech Studio** | Ganho mensurável em tokens, tempo de execução, segurança ou DX. |
| **Veredito Técnico** | `Adotar Imediatamente`, `Planejar para Sprint Futura` ou `Descartar`. |

#### O Filtro Anti-Overengineering (Critério Inegociável):
- A governança da RR Tech Studio é **Markdown-first, leve, portátil e orientada a Node.js nativo**.
- **Descarte sumariamente:**
  - Frameworks que exigem serviços em nuvem pagos desnecessários.
  - Runners headless pesados em linguagens exóticas que compliquem o deploy em máquinas Windows/macOS/Linux limpas.
  - Camadas extras de abstração que apenas reembalam o que um script nativo de 50 linhas resolve.

---

### Fase 3: Materialização em Propostas de Sprints Físicas

Inovações nunca devem ficar como anotações abstratas ou ideias perdidas:

1. **Criação de Sprints em [governanca/sprints/](../sprints/):**
   - Para as tecnologias com veredito `Adotar Imediatamente` ou `Planejar para Sprint Futura`, elabore arquivos de sprint físicos dedicados no padrão oficial [governanca/sprints/_template.md](../sprints/_template.md).
   - Defina etapas detalhadas, checkboxes `[ ]`, critérios de aceite mensuráveis e roteiro de verificação.
2. **Atualização do [CHANGELOG.md](../CHANGELOG.md):**
   - Se a pesquisa resultar em ajustes imediatos de documentação ou novas diretrizes nos manuais [padroes/frontend.md](../padroes/frontend.md) ou [padroes/backend.md](../padroes/backend.md), registre a motivação no changelog.
3. **Apresentação ao Usuário:**
   - Apresente o resumo do radar de inovação e solicite a validação do usuário antes de iniciar a implementação física.

---

## 3. Cláusulas de Governança

- **Segregação Rigorosa:** Esta skill é de uso exclusivo da matriz e NUNCA deve ser sincronizada para satélites (`src/templates/skills/`).
- **Verificabilidade:** Toda afirmação sobre o mercado deve ser acompanhada de URL ou fonte primária inspecionada.
- **Respeito aos Satélites:** Nenhuma inovação adotada na matriz pode quebrar a retrocompatibilidade dos projetos satélites existentes sem uma estratégia clara de migração documentada.
