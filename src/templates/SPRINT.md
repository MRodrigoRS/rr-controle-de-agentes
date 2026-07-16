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
2. Execute cada tarefa em ordem.
3. **Após implementar cada tarefa**, execute a skill `escrever-testes.md`
   em `governanca/skills/` para criar os testes correspondentes.
4. **Se um teste falhar**, execute a skill `depurar-erros.md` em
   `governanca/skills/` para depurar sistematicamente antes de avançar.
5. **Antes de apresentar o resultado**, execute a skill `revisar-codigo.md`
   em `governanca/skills/` para fazer a auto-revisão.
6. **Antes de finalizar a sprint**, execute a skill `mapear-logica-do-sistema.md`
   em `governanca/skills/` para atualizar `livro-arquitetura/03-logica-do-sistema.md`
   com a lógica implementada.
7. Apresente o resultado parcial ao usuário.
8. Ao finalizar, marque `status: concluida` no front-matter e atualize
   `ultima_modificacao`.
9. Apresente o resumo ao usuário e, se aprovado, faça o commit com a
   mensagem abaixo.

---

## Conclusão

**Mensagem de commit sugerida:**
```
sprint-{{numero}}: {{sugestaoCommit}}
```

*Template gerado pelo RR Controle de Agentes.*
