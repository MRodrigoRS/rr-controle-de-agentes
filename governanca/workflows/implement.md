# Workflow: Implement

> Executa a sprint aprovada. O ciclo completo está nas "Instruções ao Agente"
> do template de sprint (gates, testes, revisão adversarial, evidências).

## Quando Usar

- Ao executar uma sprint estruturada (Nível 2).
- *Nota:* Para correções pontuais, pequenos bugs ou ajustes cosméticos sem cerimônia de sprint, use o workflow Fast-Track `/fix` ([fix.md](governanca/workflows/fix.md)).

## Passos

1. Confirme o Gate 1 (plano aprovado). Consulte os manuais em [padroes/](governanca/padroes/) ([frontend.md](governanca/padroes/frontend.md) e/ou [backend.md](governanca/padroes/backend.md)) e, para qualquer tarefa com banco/entidades, consulte [05-modelo-de-dados.md](governanca/livro-arquitetura/05-modelo-de-dados.md)
2. Execute as tarefas em ordem, escrevendo testes a cada uma, respeitando os padrões de desenvolvimento e consultando a pasta [skills/](governanca/skills/) conforme a tecnologia da sprint
3. Ao final, passe o checklist de qualidade e a revisão adversarial
4. Preencha `## Evidências`, `## Limitações` e `## Roteiro de Verificação`
5. Apresente ao usuário (Gate 2)
6. Após aprovação, commite e arquive a sprint atualizando [SESSAO.md](governanca/SESSAO.md)

## Saída

Código implementado + testes + evidências no arquivo da sprint.

## Critérios de Conclusão

- Build sem erros
- Padrões de desenvolvimento seguidos ([padroes/](governanca/padroes/))
- Testes passando (N/N)
- Evidências registradas e limitações honestas
- Entrega aprovada pelo usuário (Gate 2)
