# Skill: Depurar Erros

> Instrui o agente a seguir um fluxo sistemático de depuração quando
> algo dá errado — teste falhou, build quebrou, comportamento inesperado
> ou exceção lançada.

## Quando Executar

Esta skill é acionada **automaticamente** sempre que:

- Um **teste falha** (ao rodar `npm test`, `go test`, etc.)
- O **build quebra** (`npm run build`, `next build`, erro de compilação)
- Uma **exceção ou erro** é lançado em runtime
- O **comportamento observado** difere do esperado
- O **usuário reporta um bug**

## Fluxo de Depuração

Siga estes passos **em ordem**, sem pular etapas:

### Passo 1 — Reproduza o Erro

- Execute o comando ou ação que causa o erro
- Capture a **mensagem de erro completa**, stack trace, status code
- Se possível, crie um **caso mínimo** que reproduza (input mínimo, rota isolada)

### Passo 2 — Entenda o Erro

- Leia a mensagem com atenção: ela diz exatamente o que falhou e onde
- Identifique o **tipo do erro**: compilação, runtime, lógico, integração
- Pergunte-se: "O que era esperado acontecer? O que realmente aconteceu?"

### Passo 3 — Isole a Causa

- Comece pelo local apontado no stack trace, se houver
- Se não houver stack trace, use **busca binária**: comente metade do código,
  teste, repita até isolar a linha
- Adicione `console.log` / `console.error` / `Debug.Log` em pontos estratégicos
  para inspecionar estado
- Verifique **inputs**: os dados que entram na função são o que você espera?
- Verifique **outputs**: o que sai é diferente do esperado?

### Passo 4 — Levante Hipóteses

- Liste 1-3 hipóteses do que pode estar causando o erro
- Para cada hipótese, pense em como **testá-la** (um log, um teste isolado,
  um pequeno experimento)

### Passo 5 — Teste a Hipótese Mais Provável

- Implemente a correção ou experimento mais simples para testar a hipótese
- Se funcionar → vá para o Passo 6
- Se não funcionar → descarte a hipótese, teste a próxima

### Passo 6 — Corrija e Verifique

- Aplique a correção definitiva
- **Execute os testes novamente** — o erro original deve sumir
- **Execute todos os outros testes** — a correção não deve quebrar nada
- Se houver testes de regressão, certifique-se de que estão passando

### Passo 7 — Previna Regressão

- Escreva um **teste que reproduza o bug** (se não existir ainda)
- Considere: esse erro poderia ter sido pego por tipo/estático?
  (TypeScript, lint, validação de schema)
- Documente a causa raiz e a correção nas notas persistentes do `AGENTS.md`

## Ferramentas por Stack

| Stack | Ferramentas |
|-------|------------|
| Next.js / Node | `console.log`, `console.error`, `debugger`, Chrome DevTools, `node --inspect` |
| React | React DevTools, `console.log` no componente, Error Boundary |
| GAS | `console.log`, Stackdriver Logging, `Logger.log()`, debug no editor do GAS |
| Go | `fmt.Printf`, `log.Println`, `dlv` (delve debugger), `go test -v` |
| Banco | `EXPLAIN ANALYZE`, logs de query, `SELECT` direto para ver dados |
| Rede | Network tab do DevTools, `curl`, `wget`, `httpie` |

## Regras

- **Nunca tente "chutar" a correção** — sempre passe pelos passos 1-3
  antes de mudar código
- **Uma mudança de cada vez** — se alterar várias coisas e o erro sumir,
  você não saberá o que resolveu
- **Desfaça alterações que não funcionaram** — não deixe código morto
  ou logs espalhados
- **Se estiver travado por mais de 15 minutos**, apresente o que descobriu
  ao usuário e peça orientação
- **Registre a causa raiz** nas notas persistentes — isso acelera
  diagnósticos futuros
