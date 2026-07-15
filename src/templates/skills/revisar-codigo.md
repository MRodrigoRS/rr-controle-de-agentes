# Skill: Revisar Código

> Instrui o agente a realizar uma auto-revisão sistemática do código
> recém-implementado **antes de apresentá-lo ao usuário**, garantindo
> qualidade, segurança e aderência aos requisitos.

## Quando Executar

Esta skill é acionada **automaticamente** durante:

- **Cada tarefa de cada sprint** — antes de apresentar o resultado
  ao usuário e antes de commitar
- **Correção de bugs** — antes de submeter a correção
- **Sempre que o agente terminar de escrever código** em qualquer contexto

## Checklist de Revisão

Percorra cada item **antes de mostrar o código ao usuário**:

### Funcionalidade

- [ ] O código implementa exatamente o que o requisito pede? (sem "features extras")
- [ ] Todos os critérios de aceite da tarefa foram atendidos?
- [ ] O fluxo principal funciona do início ao fim?
- [ ] Fluxos alternativos e de erro estão cobertos?

### Edge Cases

- [ ] Input vazio / nulo / undefined — o código quebra ou trata?
- [ ] Limites: array vazio, string muito longa, número negativo, zero
- [ ] Concorrência: duas requisições simultâneas causam race condition?
- [ ] Estado: o que acontece se o usuário recarregar a página no meio do fluxo?
- [ ] Dependência externa: se a API/banco falhar, o código lida com graça?

### Segurança

- [ ] Dados do usuário são validados e sanitizados antes de usar?
- [ ] Não há credenciais, tokens ou URLs de API hardcoded?
- [ ] O código expõe informações internas em mensagens de erro ou logs?
- [ ] A autenticação/autorização é verificada em cada operação sensível?

### Código

- [ ] Há código morto (variável/função/import não usado)?
- [ ] Há duplicação que deveria estar em uma função só?
- [ ] Nomes de variáveis, funções e arquivos são claros e consistentes?
- [ ] Funções são pequenas e fazem uma coisa só? (máximo ~40 linhas)
- [ ] O código segue as convenções de `CONVENCOES.md`?
- [ ] Tipos/typagem estão corretos (sem `any` desnecessário)?

### Manutenibilidade

- [ ] Um outro desenvolvedor (ou outro agente) entenderia esse código?
- [ ] Há comentários enganosos ou ausentes onde a lógica não é óbvia?
- [ ] A lógica está no lugar certo? (ex: regra de negócio em componente UI?)
- [ ] Constantes mágicas estão nomeadas? (`if (status === 3)` → `if (status === Status.Ativo)`)

### Performance (quando aplicável)

- [ ] Evita loops aninhados desnecessários com dados grandes?
- [ ] Consultas ao banco estão indexadas?
- [ ] Renderização: há re-renders desnecessários no frontend?
- [ ] Assets estáticos têm tamanho razoável?

## Como Revisar

1. **Leia o diff** das alterações (todo o código novo e modificado)
2. **Percorra o checklist** mentalmente ou anotando
3. **Para cada problema encontrado**, decida:
   - **Crítico:** corrige antes de apresentar
   - **Moderado:** corrige ou pergunta ao usuário
   - **Sugestão:** menciona mas não bloqueia
4. **Corrija os problemas críticos e moderados**
5. **Apresente o código revisado** ao usuário mencionando:
   - O que foi implementado
   - Problemas corrigidos durante a revisão
   - Sugestões (se houver)

## Regras

- **Nunca pule a revisão** — mesmo para código simples, percorra o checklist
- **Seja crítico com seu próprio código** — trate como se fosse de outro dev
- Se encontrar algo que não sabe resolver, **pergunte ao usuário** antes
  de prosseguir
- Após a revisão, **registre nas notas persistentes** as decisões tomadas
