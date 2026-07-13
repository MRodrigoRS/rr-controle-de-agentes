---
status: pendente
ultima_modificacao: {{data}}
sessao_atual: 0
---

# Sprint {{numero}}: {{titulo}}

**Objetivo:** {{objetivo}}

---

## Etapas

### Etapa {{numeroEtapa}}: {{tituloEtapa}}

**Objetivo:** {{objetivoEtapa}}

**Tarefas:**
- [ ] (descreva as tarefas concretas desta etapa)

**Critérios de Aceite:**
- [ ] Build sem erros (`{{comandoTeste}}`)
- [ ] Funcionalidade implementada e testada
- [ ] (adicione mais critérios conforme necessário)

---

## Andamento

- [ ] Etapa em andamento
- [ ] Testes passando
- [ ] Código revisado

---

## Instruções ao Agente

1. Comece sempre perguntando ao usuário se pode iniciar esta sprint.
2. Execute cada tarefa em ordem e apresente o resultado parcial.
3. Ao finalizar, marque `status: concluida` no front-matter e atualize `ultima_modificacao`.
4. Apresente o resumo ao usuário e, se aprovado, faça o commit com a mensagem abaixo.

---

## Conclusão

**Mensagem de commit sugerida:**
```
sprint-{{numero}}: {{sugestaoCommit}}
```

*Template gerado pelo RR Controle de Agentes.*
