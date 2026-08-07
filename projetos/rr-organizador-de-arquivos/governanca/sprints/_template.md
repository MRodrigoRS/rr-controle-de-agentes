---
status: pendente
ultima_modificacao: 2026-08-07
sessao_atual: 0
---

# Sprint ?: ? — RR Organizador De Arquivos

**Objetivo:** ?

---

## Etapas

### Etapa ?: ?

**Objetivo:** ?

**Tarefas:**
- [ ] (descreva as tarefas concretas desta etapa)

**Critérios de Aceite:**
- [ ] Build sem erros (`npm run`)
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
3. **Testes:** após implementar cada tarefa, escreva os testes
   correspondentes seguindo `criar-testes.md` em `governanca/skills/`
   (padrão de ferramentas, cobertura por stack e fluxo de depuração
   quando um teste falhar).
4. **Antes de apresentar o resultado**, percorra este checklist:
   - [ ] Funcionalidade atende o requisito (sem extras)
   - [ ] Edge cases: vazio, nulo, limites, concorrência, falha externa
   - [ ] Segurança: inputs validados, sem credenciais hardcoded
   - [ ] Código: sem código morto, duplicado, nomes claros, sem `any`
   - [ ] Manutenibilidade: lógica no lugar certo, sem constantes mágicas
   - [ ] Testes passando
5. **Antes de finalizar a sprint**, execute a skill `mapear-logica-do-sistema.md`
   em `governanca/skills/` para atualizar `livro-arquitetura/03-logica-do-sistema.md`
   com a lógica implementada.
   5b. **(Opcional) Se houver comportamento autônomo novo** (triggers, jobs,
   webhooks, workers, middleware, cascatas de banco), execute a skill
   `mapear-comportamento-autonomo.md` para documentá-lo em
   `livro-arquitetura/04-comportamento-autonomo.md`.
 6. Apresente o resultado parcial ao usuário.
 7. Ao finalizar, marque `status: concluida` no front-matter e atualize
    `ultima_modificacao`.
 8. **Documente aprendizados e decisões:** antes de finalizar, preencha a
    seção `## Aprendizados e Decisões` abaixo com os aprendizados técnicos
    importantes e as decisões de design tomadas ou validadas nesta sprint.
    Isso garante rastreabilidade para sprints futuras.
 9. **Arquive a sprint concluída** seguindo as regras de `Arquivamento de
    Sprints` no `governanca/AGENTS.md`.
10. Apresente o resumo ao usuário e, se aprovado, faça o commit com a
    mensagem abaixo.

---

## Conclusão

**Mensagem de commit sugerida:**
```
sprint-?: descreva o que foi entregue nesta sprint
```

---

## Como Arquivar

Após aprovação do usuário e commit, arquive a sprint seguindo as regras de
`Arquivamento de Sprints` no `governanca/AGENTS.md` (mover para
`sprints/concluidas/`, atualizar front-matter e notas persistentes).

---

## Aprendizados e Decisões

*Preenchido pelo agente ao finalizar a sprint.*

### Aprendizados Técnicos

- *Liste descobertas importantes sobre APIs, bibliotecas, ferramentas ou
  comportamento do sistema que valem para sprints futuras.*

### Decisões de Design Confirmadas

- *Liste decisões arquiteturais ou de implementação que foram tomadas ou
  validadas nesta sprint.*

---

*Template gerado pelo RR Controle de Agentes.*
