# Skill: Superar Código

> Instrui o agente a examinar o repositório em busca de oportunidades
> de elevar a qualidade do código — não para corrigir erros, mas para
> identificar padrões que poderiam ser mais simples, rápidos, legíveis
> ou modernos.

## Quando Executar

- **Sob demanda** — sempre que o usuário quiser uma visão de melhoria contínua
- **Periodicamente** — a cada 3-4 sprints, junto com a auditoria de segurança
- **Antes de refatorações** — para planejar o que vale a pena mexer

## Diferença de `auditar-repositorio.md`

| `auditar-repositorio.md` | `superar-codigo.md` |
|-------------------------|---------------------|
| "Isso está **errado**" | "Isso poderia ser **melhor**" |
| Vulnerabilidades, más práticas, inconsistências | Extração, simplificação, performance, modernização |
| Reativo (corrigir) | Proativo (evoluir) |
| Itens críticos viram tarefa imediata | Itens viram sugestão para sprints futuras |

## Categorias de Análise

### 1. Extração

- **Componentes duplicados** — a mesma UI aparece em mais de um lugar sem
  estar encapsulada? (botões, modais, tabelas, cards, formulários)
- **Lógica repetida** — a mesma validação, cálculo ou transformação aparece
  em vários arquivos?
- **Hooks customizados** — estado + efeitos que se repetem poderiam virar
  um hook customizado único?
- **Funções utilitárias** — helpers que estão espalhados em arquivos de
  componente em vez de em `src/lib/`?

### 2. Simplificação

- **Código verboso** — algo que uma library moderna resolveria em 3 linhas
  está implementado em 30? (ex: validação manual → Zod, fetch raw → axios,
  manipulação de datas → date-fns)
- **Aninhamento profundo** — `if` dentro de `if` dentro de `if` que um
  early return ou guard clause simplificaria
- **Estado booleano demais** — `isLoading`, `isError`, `isSuccess`, `isEmpty`
  que uma máquina de estados (XState, ou mesmo um enum) unificaria
- **Switch/if-else grande** — polimorfismo ou dicionário substituiriam?
- **CSS inline vs classes** — estilos inline que poderiam estar no Tailwind?

### 3. Performance

- **Loops ineficientes** — row-by-row no GAS (`getValue`/`setValue`) que
  poderiam ser `getValues`/`setValues` (batch)
- **Re-renders no React** — estado muito alto na árvore, falta de `useMemo`/
  `useCallback`, props que mudam sem necessidade
- **Queries N+1** — no Prisma, GAS ou SQL: uma query dentro de um loop
  que deveria ser `include` ou batch
- **Assets pesados** — imagens sem lazy loading, bundles grandes sem
  code splitting, fontes sem subset
- **Requisições em série** — 3 chamadas de API independentes que poderiam
  ser `Promise.all`

### 4. Modernização

- **APIs/syntax descontinuadas** — `pages router` vs `app router`,
  `require` vs `import`, `axios` vs `fetch` nativo, classes vs hooks
- **Ferramentas mais recentes** — ESLint → Biome, `npm` → `pnpm`,
  Webpack → Turbopack/Vite
- **Padrões emergentes** — Server Actions em vez de APIs REST para mutações
  simples, `next/image` em vez de `<img>` manual

### 5. Testabilidade

- **Funções com efeitos colaterais** — lógica pura e efeito misturados que
  dificultam o teste unitário
- **Dependências hardcoded** — chamadas diretas a API/bando no meio da
  lógica de negócio (sem injeção, sem adapter)
- **Funções longas** — mais de 40 linhas com múltiplas responsabilidades

### 6. Legibilidade

- **Nomes confusos** — variáveis como `dados`, `temp`, `x1`, `fn` que
  não revelam intenção
- **Comentários que deveriam ser código** — `// se for admin, pula validacao`
  em vez de `if (usuario.ehAdmin) continue;`
- **Código morto** — variáveis, funções, imports, branches que nunca são
  executados
- **Organização de arquivos** — arquivos com 500+ linhas que misturam
  tipos, lógica, UI e estilos

## Saída

Gere o relatório em `governanca/relatorios/auditoria-superacao.md`
usando o template em `governanca/relatorios/_template.md`.

- Use `[BLOQ]` para código que representa risco real (ex: queries N+1
  em produção que degradam performance visivelmente)
- Use `[REC]` para oportunidades de alto impacto e baixo esforço
- Use `[SUG]` para modernização, padrões emergentes e melhorias de
  legibilidade que podem esperar

Ao preencher a seção `## Sprint Sugerida`, crie uma sprint com etapas
por severidade. Para cada oportunidade, inclua a ação concreta e o
arquivo afetado.

## Após Gerar o Relatório

1. **Registre nas notas persistentes** do `AGENTS.md` que a análise foi
   feita e o caminho do relatório
2. **Apresente o resumo** ao usuário (total de oportunidades, maiores
   impactos, sugestões mais simples)
3. **Pergunte** se deseja transformar alguma oportunidade em tarefa de sprint
4. Se autorizado, crie as tarefas correspondentes nas sprints
