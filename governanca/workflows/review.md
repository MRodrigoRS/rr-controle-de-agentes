# Workflow: Review

> Revisão independente/adversarial antes de entregar. O criador não deve ser o
> único juiz do próprio trabalho.

## Quando Usar

- Antes do Gate 2 (aprovação da entrega)
- Sob demanda para mudanças críticas

## Passos

1. Mude o objetivo: tente **quebrar** o que foi feito
2. Procure casos extremos, edge cases, concorrência e falha externa
3. Assuma que a solução contém um bug — encontre-o
4. Verifique requisitos falsamente satisfeitos ("parece funcionar" ≠ "verificado")
5. Faça uma passada de segurança
6. Se houver outra sessão/agente disponível, peça revisão independente — ou
   delegue a um **subagente revisor** quando o harness suportar (veja a skill
   [usar-subagentes.md](governanca/skills/usar-subagentes.md))
7. Corrija os achados e reteste

## Gate de ADR

Antes de encerrar: **"Esta entrega envolveu alguma decisão de design contestável que ainda não tem ADR?"**
Se sim, crie o registro em [`governanca/livro-arquitetura/decisoes/`](governanca/livro-arquitetura/decisoes/) usando o [`_template.md`](governanca/livro-arquitetura/decisoes/_template.md) antes de apresentar ao Gate 2.

## Saída

Achados corrigidos (ou registrados como limitações) antes da entrega.

## Critérios de Conclusão

- Nenhum achado crítico em aberto
- Achados não corrigidos registrados em `## Limitações`
- ADRs criados para decisões arquiteturais relevantes (ou confirmado que não há nenhuma)
