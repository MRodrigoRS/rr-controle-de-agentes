---
status: pendente
ultima_modificacao: 2026-10-06
sessao_atual: 0
---

# Sprint ?: ? — rr-controle-de-agentes-1.1

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

1. **Gate 1 — aprovação do plano.** Apresente ao usuário o plano desta
   sprint (etapas, arquivos afetados, riscos e como saberá que terminou —
   os critérios de aceite). Só implemente após aprovação.
2. Execute cada tarefa em ordem.
3. **Testes:** após implementar cada tarefa, escreva os testes
   correspondentes consultando a pasta `governanca/skills/` (skill de testes para
   padrão de ferramentas, cobertura por stack e fluxo de depuração
   quando um teste falhar).
4. **Antes de apresentar o resultado**, percorra este checklist:
   - [ ] Funcionalidade atende o requisito (sem extras)
   - [ ] Edge cases: vazio, nulo, limites, concorrência, falha externa
   - [ ] Segurança: inputs validados, sem credenciais hardcoded
   - [ ] Código: sem código morto, duplicado, nomes claros, sem `any`
   - [ ] Manutenibilidade: lógica no lugar certo, sem constantes mágicas
   - [ ] Padrões de engenharia: seguiu os manuais em [padroes/](../padroes/) ([frontend.md](../padroes/frontend.md) e [backend.md](../padroes/backend.md))
   - [ ] Testes passando
   - [ ] Changelog do produto atualizado com o delta no `CHANGELOG.md` da raiz (`../CHANGELOG.md`)
5. **Antes de finalizar a sprint**, consulte a pasta [skills/](../skills/) para atualizar
   o [livro de arquitetura](../livro-arquitetura/) com as regras de negócio, dados
   e comportamentos implementados (usando a skill [sincronizar-documentacao.md](../skills/sincronizar-documentacao.md)).
6. **Revisão adversarial.** Antes de apresentar ao usuário, mude o objetivo
   e tente quebrar o que foi feito: procure casos extremos, assuma que a
   solução contém um bug e encontre-o, verifique quais requisitos podem
   estar falsamente satisfeitos e faça uma passada de segurança. Corrija o
   que encontrar e reteste. Se houver outra sessão/agente disponível, peça
   uma revisão independente — o criador não deve ser o único juiz.
7. **Evidências, limitações e roteiro.** Preencha `## Evidências`,
   `## Limitações` e `## Roteiro de Verificação` abaixo:
   - Evidências: o que foi verificado — **screenshot/print obrigatório**
     quando a UI mudou
   - Limitações: o que **não** foi verificado, em linguagem de negócio
     ("pagamento real com cartão verdadeiro ainda não testado")
   - Roteiro: passo a passo em linguagem de negócio para o usuário conferir
     sozinho (abrir → navegar → agir → resultado esperado)
8. **Documente aprendizados e decisões:** preencha a seção `## Aprendizados e Decisões`
   com descobertas técnicas e decisões arquiteturais confirmadas nesta sprint.
9. **Gate 2 — aprovação da entrega.** Apresente o resumo + evidências +
   limitações + roteiro ao usuário e pergunte se quer conferir sozinho
   antes de aprovar. **Só faça o commit após aprovação explícita do usuário.**
10. **Atualize o Changelog e faça o commit:**
    - Antes de comitar, atualize o `CHANGELOG.md` na raiz do projeto (`../CHANGELOG.md`) com o delta consolidado (Adicionado, Modificado, Corrigido) das entregas desta sprint, sem narrar processos de edição.
    - Se houver melhorias de governança, registre também em [CHANGELOG.md](../CHANGELOG.md).
    - Faça o commit com a mensagem de commit sugerida abaixo.
11. **Finalização e Arquivamento:**
    - Marque `status: concluida` no front-matter e atualize `ultima_modificacao`.
    - Mova o arquivo para `governanca/sprints/concluidas/`.
    - **Atualize `governanca/SESSAO.md`:** ajuste o campo `**Sprint Ativa:**` com a próxima sprint planejada (ou `[Aguardando planejamento]`).

---

## Conclusão

**Mensagem de commit sugerida:**
```
sprint-?: descreva o que foi entregue nesta sprint
```

---

## Roteiro de Verificação

*Passo a passo em linguagem de negócio para o usuário conferir sozinho.
Cada passo: onde ir → o que fazer → resultado esperado.*

1. (ex: Abra o app e entre com usuário/senha válidos → esperado: abre o painel)
2. (ex: Vá em "Produtos" e cadastre um novo → esperado: aparece "Produto salvo" e o item na lista)
3. (ex: Tente cadastrar um produto repetido → esperado: mensagem "Já existe um produto com esse nome")

## Evidências

*Preenchido pelo agente ao apresentar o resultado.*

- [ ] Build sem erros
- [ ] Testes: (N/N passando — liste os executados)
- [ ] Fluxos verificados no ambiente real: (liste o que foi exercitado)
- [ ] **Screenshot/print das telas** — obrigatório quando a UI mudou (o usuário vê o resultado real)
- [ ] Regressões: nenhuma / (liste as encontradas e corrigidas)

## Limitações

*O que NÃO foi verificado — em linguagem de negócio. Honestidade aqui é
obrigatória: nunca diga "pronto" se não testou.*

- (ex: pagamento real com cartão verdadeiro ainda não testado; não testado em celular antigo)

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

*Template gerado por RR Tech Studio (Rodrigo Rafael).*

