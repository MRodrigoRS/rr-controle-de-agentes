# Workflow: Auditar Governança

> Inspeção profunda de maturidade técnica, benchmark com o estado da arte na web e planejamento de evolução contínua da governança matriz.

## Quando Usar

- Em sessões focadas em P&D e melhoria da própria governança
- Antes de releases maiores ou marcos semestrais
- Quando surgirem novas ferramentas e padrões relevantes na web (Tree-sitter, Graphify, novos linters, padrões de agentes)
- Ao receber o comando `/auditar-governanca` ou pedido em linguagem natural

## Passos

1. **Ativar a Skill de Referência:**
   - Siga o guia passo a passo em [auditar-maturidade-governanca.md](governanca/skills/auditar-maturidade-governanca.md).
2. **Raio-X Interno:**
   - Inspecione regras, manuais em [padroes/](governanca/padroes/), catálogo em [CATALOGO_TECNOLOGIAS.md](governanca/skills/CATALOGO_TECNOLOGIAS.md), scripts portáteis e teste a integridade com `npm test`.
   - Avalie a **coerência geral dos arquivos Markdown (.md)**: divisão de responsabilidades, ausência de redundâncias/repetições desnecessárias e garantia de que todos os arquivos se integram em um fluxo fluido sem arquivos órfãos.

3. **Pesquisa Externa & Benchmark Web:**
   - Investigue inovações recentes em agent harness engineering, ferramentas de análise estática sem consumo de tokens e segurança.
4. **Gerar Relatório de Auditoria:**
   - Crie o artefato `governanca/relatorios/evolucao-governanca-<YYYY-MM-DD>.md` com base em [_template_evolucao_governanca.md](governanca/relatorios/_template_evolucao_governanca.md).
5. **Estruturar Proposta de Sprint:**
   - Proponha as tarefas prioritárias para a esteira da matriz e aguarde a aprovação do usuário antes de iniciar qualquer código.

## Saída

- Relatório formal `governanca/relatorios/evolucao-governanca-<YYYY-MM-DD>.md` contendo nota de maturidade, radar de inovações e proposta de Sprint.

## Critérios de Conclusão

- Relatório gerado com avaliação crítica e fundamentada.
- Proposta de Sprint apresentada ao usuário de forma modular e acionável.
