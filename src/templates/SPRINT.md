---
status: pendente
ultima_modificacao: {{data}}
sessao_atual: 0
---

# Sprint {{numero}}: {{titulo}} — {{nomeProjeto}}

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
3. **Testes:** após implementar cada tarefa, escreva os testes
   correspondentes. Consulte `escrever-testes.md` em `governanca/skills/`
   se precisar do padrão de ferramentas e cobertura por stack.
4. **Se um teste falhar**, depure seguindo este fluxo:
   - Reproduza o erro e capture a mensagem completa
   - Entenda o erro: o que era esperado vs. o que aconteceu?
   - Isole a causa (busca binária, logs, stack trace)
   - Levante 1-3 hipóteses
   - Teste a mais provável (uma mudança de cada vez)
   - Corrija e verifique (todos os testes passando)
   - Previna regressão: escreva um teste que reproduza o bug
5. **Antes de apresentar o resultado**, percorra este checklist:
   - [ ] Funcionalidade atende o requisito (sem extras)
   - [ ] Edge cases: vazio, nulo, limites, concorrência, falha externa
   - [ ] Segurança: inputs validados, sem credenciais hardcoded
   - [ ] Código: sem código morto, duplicado, nomes claros, sem `any`
   - [ ] Manutenibilidade: lógica no lugar certo, sem constantes mágicas
   - [ ] Testes passando
6. **Antes de finalizar a sprint**, execute a skill `mapear-logica-do-sistema.md`
   em `governanca/skills/` para atualizar `livro-arquitetura/03-logica-do-sistema.md`
   com a lógica implementada.
   6b. **(Opcional) Se houver comportamento autônomo novo** (triggers, jobs,
   webhooks, workers, middleware, cascatas de banco), execute a skill
   `mapear-comportamento-autonomo.md` para documentá-lo em
   `livro-arquitetura/04-comportamento-autonomo.md`.
 7. Apresente o resultado parcial ao usuário.
8. Ao finalizar, marque `status: concluida` no front-matter e atualize
   `ultima_modificacao`.
9. **Documente aprendizados e decisões:** antes de finalizar, preencha a
   seção `## Aprendizados e Decisões` abaixo com os aprendizados técnicos
   importantes e as decisões de design tomadas ou validadas nesta sprint.
   Isso garante rastreabilidade para sprints futuras.
10. **Arquive a sprint concluída** seguindo as instruções em
    `## Como Arquivar` abaixo.
11. Apresente o resumo ao usuário e, se aprovado, faça o commit com a
    mensagem abaixo.

---

## Conclusão

**Mensagem de commit sugerida:**
```
sprint-{{numero}}: {{sugestaoCommit}}
```

---

## Como Arquivar

Após aprovação do usuário e commit, arquive a sprint:

```bash
mkdir -p governanca/sprints/concluidas
mv governanca/sprints/XX-titulo.md governanca/sprints/concluidas/XX-titulo.md
```

### Regras

- **Nunca delete** uma sprint — apenas mova para `concluidas/`
- **Atualize o front-matter** antes de arquivar (`status: concluido`)
- **Mantenha o template** `_template.md` sempre em `sprints/`
- **Atualize as notas persistentes** do `AGENTS.md`:
  - Se a sprint arquivada era a ativa, troque `Sprint ativa:` para a próxima
  - Se não houver mais sprints, remova a linha
- **Se for a última sprint**, pergunte ao usuário se deseja continuar com
  novas sprints; se sim, proponha e crie a sequência

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
