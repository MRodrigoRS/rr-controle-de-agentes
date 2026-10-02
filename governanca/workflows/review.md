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
   `usar-subagentes.md`)
7. Corrija os achados e reteste

## Saída

Achados corrigidos (ou registrados como limitações) antes da entrega.

## Critérios de Conclusão

- Nenhum achado crítico em aberto
- Achados não corrigidos registrados em `## Limitações`
