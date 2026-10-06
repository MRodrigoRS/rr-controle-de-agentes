# Workflow: Auditar Governança

> Inspeção profunda de maturidade técnica, benchmark com o estado da arte na web e planejamento de evolução contínua da governança matriz.

## Quando Usar

- Em sessões focadas em P&D e melhoria da própria governança
- Antes de releases maiores ou marcos semestrais
- Quando surgirem novas ferramentas e padrões relevantes na web (Tree-sitter, Graphify, novos linters, padrões de agentes)
- Ao receber o comando `/auditar-governanca` ou pedido em linguagem natural

## Passos

1. **Ativar a Skill de Referência:**
   - Siga o guia passo a passo em [auditar-maturidade-governanca.md](../skills/auditar-maturidade-governanca.md).
2. **Raio-X Interno (Evidências Mandatórias):**
   - Inspecione regras, manuais em [padroes/](../padroes/), catálogo em [CATALOGO_TECNOLOGIAS.md](../skills/CATALOGO_TECNOLOGIAS.md), scripts portáteis e teste a integridade com `npm test` real no terminal.
   - Avalie a **coerência geral dos arquivos Markdown (.md)**: divisão de responsabilidades, ausência de redundâncias/repetições desnecessárias e garantia de que todos os arquivos se integram em um fluxo fluido sem arquivos órfãos.
   - Monte obrigatoriamente a tabela de **Manifesto de Cobertura** (arquivos lidos na íntegra x linhas).
3. **Pesquisa Externa & Benchmark Web:**
   - Investigue inovações recentes em agent harness engineering, ferramentas de análise estática sem consumo de tokens (Knip, Biome) e segurança agêntica (OWASP 2026).
4. **Gerar Relatório de Auditoria:**
   - Crie o artefato `governanca/relatorios/evolucao-governanca-<YYYY-MM-DD>.md` com base em [_template_evolucao_governanca.md](../relatorios/_template_evolucao_governanca.md).
5. **Materializar Sprints Físicas Dedicadas (Roadmap Executável):**
   - **É OBRIGATÓRIO gerar arquivos físicos dedicados e expandidos para cada sprint identificada no diretório oficial:**
     `governanca/sprints/XX-nome-da-sprint.md`
   - É expressamente proibido deixar propostas de sprint como resumos compactados ou listas inline soltas dentro do relatório.
   - Cada sprint física deve seguir o padrão integral de [sprints/_template.md](../sprints/_template.md), contendo objetivo mensurável, etapas detalhadas, tarefas, critérios de aceite, instruções de Gate 1/2 e roteiro passo a passo de verificação.
   - O relatório de auditoria deve conter a tabela com o resumo de cada sprint e links diretos para seus arquivos físicos correspondentes em `governanca/sprints/`.

## Saída

- Relatório formal `governanca/relatorios/evolucao-governanca-<YYYY-MM-DD>.md` contendo manifesto de cobertura, nota de maturidade e radar de inovações.
- Conjunto de **arquivos físicos dedicados de sprint** gerados em `governanca/sprints/XX-nome-da-sprint.md`.

## Critérios de Conclusão

- Relatório gerado com avaliação crítica, manifesto de cobertura comprovado e fundamentado em evidências do código.
- Todas as frentes de evolução desdobradas e materializadas em **arquivos físicos dedicados de sprint** prontos para execução após Gate 1.
- `npm test` validado e aprovado com 100% de links íntegros.
