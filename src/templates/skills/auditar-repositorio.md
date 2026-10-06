---
name: auditar-repositorio
description: Audita segurança, más práticas, inconsistências e oportunidades de evolução do repositório.
---

# Skill: Auditar Repositório

> Instrui o agente a examinar minuciosamente todo o repositório em busca de
> vulnerabilidades de segurança, más práticas de código, inconsistências
> entre documentação e implementação, e oportunidades de evolução do código,
> gerando um relatório estruturado.

## Quando Executar

- **No onboarding** (após definir sprints, antes de codificar) — para conhecer
  o estado atual do código
- **Antes de uma sprint crítica** (ex: colocar em produção, integrar
  pagamento) — para garantir que não há problemas conhecidos
- **Periodicamente** (a cada 3-4 sprints) — junto com a superação do código
- **Sempre que o usuário solicitar** explicitamente uma auditoria

## Categorias de Análise

### 1. Segurança

Examine arquivo por arquivo em busca de:

- **Senhas, tokens, chaves de API, strings de conexão** hardcoded
  (especialmente em arquivos versionados, não em `.env.example`)
- **SQL Injection** — concatenção de strings em queries SQL/NoSQL
- **XSS (Cross-Site Scripting)** — renderização direta de input do usuário
  sem sanitização
- **CSRF** — ausência de proteção em mutações de estado
- **Autenticação frágil** — lógica de login insegura, falta de validação
  de sessão, tokens previsíveis
- **Exposição de informações sensíveis** — stack traces, dados internos
  em respostas de API, comentários com credenciais
- **Dependências vulneráveis** — versões conhecidamente inseguras de
  bibliotecas (consulte `package.json`, `requirements.txt`, etc.)
- **Permissões excessivas** — escopos OAuth2 muito amplos, service accounts
  com privilégios além do necessário (especialmente em GAS e cloud)

### 2. Más Práticas

- **Código morto** — funções, variáveis, imports não utilizados
- **Duplicação** — lógica repetida que deveria estar em um único lugar
- **Tratamento de erros genérico** — `catch` vazio, `try` monstruoso
  sem separação por tipo de erro
- **Nomes confusos** — variáveis/funções com nomes que não refletem seu
  propósito (ex: `dados`, `temp`, `x1`, `funcao`)
- **Funções muito longas** — mais de 40-50 linhas (sugira refatoração)
- **Acoplamento excessivo** — módulos que dependem de detalhes internos
  de outros módulos
- **Falta de tratamento de limites** — arrays sem verificação de índice,
  paginação sem limite máximo, upload sem validação de tamanho
- **Comentários enganosos** — comentário que não corresponde ao que o
  código realmente faz
- **Ausência de validação de entrada** — parâmetros de API, formulários,
  webhooks sem sanitização ou tipagem

### 3. Inconsistências

- **Doc vs código** — o [livro de arquitetura](governanca/livro-arquitetura/), [PLANO.md](governanca/PLANO.md), [convencoes-estrutura-de-pastas.md](governanca/skills/convencoes-estrutura-de-pastas.md)
  descrevem algo diferente do que o código implementa
- **Configurações conflitantes** — variáveis de ambiente definidas em
  múltiplos lugares com valores diferentes
- **Estilos misturados** — parte do código usa um padrão (ex: CommonJS
  `require`) e outra parte usa outro (ESM `import`), a menos que seja
  intencional por limitação da stack
- **Versão de ferramentas** — `engines` no `package.json` vs runtime real
- **Nomenclatura inconsistente** — `camelCase`, `snake_case` e `kebab-case`
  misturados sem critério no mesmo contexto

### 4. Oportunidades de Melhoria

O que *poderia ser melhor* — itens de extração, simplificação, performance,
modernização e testabilidade. Itens de legibilidade (nomes confusos, código
morto, funções longas) já estão cobertos em Más Práticas:

- **Extração** — componente de UI repetido que deveria estar encapsulado;
  lógica/validação/cálculo repetidos em vários arquivos; estado+efeitos que
  se repetem e virariam um hook customizado; helpers espalhados que pertencem
  a `src/lib/`
  > Para **executar** a modularização dos achados de extração (DRY, regressão
  > zero), use a skill [modularizar-padroes-recorrentes.md](governanca/skills/modularizar-padroes-recorrentes.md).
- **Simplificação** — código verboso que uma library moderna resolveria em
  poucas linhas (validação manual → Zod, fetch raw → axios, datas →
  date-fns); aninhamento profundo que um early return resolveria; muitos
  booleanos de estado que uma máquina de estados unificaria; `switch`/`if-else`
  grande que polimorfismo ou dicionário substituiria
- **Performance** — loops row-by-row no GAS (`getValue`/`setValue`) em vez de
  batch; re-renders no React (estado muito alto na árvore, falta de
  `useMemo`/`useCallback`); queries N+1 que deveriam ser `include`/batch;
  assets pesados sem lazy loading; requisições independentes em série que
  poderiam ser `Promise.all`
- **Modernização** — APIs/sintaxe descontinuadas (`pages` vs `app` router,
  `require` vs `import`, axios vs fetch nativo); ferramentas mais recentes
  (ESLint → Biome, npm → pnpm, Webpack → Vite/Turbopack); padrões emergentes
  (Server Actions, `next/image`)
- **Testabilidade** — lógica pura e efeitos colaterais misturados; dependências
  hardcoded (API/banco no meio da lógica de negócio, sem injeção/adapter)

### 5. Conformidade com os Manuais de Engenharia (`governanca/padroes/`)

Examine se a base de código obedece fielmente às diretrizes dos manuais técnicos:

#### Padrões de Frontend ([frontend.md](governanca/padroes/frontend.md))
- **Design Tokens & Consistência Visual:** Existem cores hexadecimais arbitrárias, inline styles ou valores mágicos de espaçamento que deveriam utilizar os tokens semânticos do Design System / tema?
- **Estados Assíncronos Completos:** Telas e componentes assíncronos cobrem obrigatoriamente os 4 estados essenciais (`Idle`, `Loading/Skeleton`, `Success/Empty State` e `Error amigável com botão de retry`)?
- **Acessibilidade (WCAG 2.1 AA):** Elementos interativos (`<button>`, `<a>`) possuem labels acessíveis (`aria-label`), tags HTML semânticas adequadas e foco visível para navegação por teclado?
- **Separação de Camadas (Clean Components):** Componentes de apresentação misturam requisições de rede brutas e mutações complexas em vez de delegar a custom hooks ou presenters?
- **Layout & Responsividade:** Interfaces quebram em mobile (360px), causam scroll horizontal involuntário ou desrespeitam o grid responsivo?

#### Padrões de Backend ([backend.md](governanca/padroes/backend.md))
- **Zero-Trust Input Validation:** Todos os endpoints e eventos externos (params, query, body, webhooks, filas) possuem schemas rígidos de validação na borda (Zod, Valibot, etc.) antes de atingir a lógica de negócio?
- **Arquitetura em Camadas:** Há controllers/rotas executando queries de banco ou SQL diretamente, furando o desacoplamento da camada de Service/Use-Case?
- **Tratamento de Erros Tipados:** Existem blocos `catch (err: any)` genéricos, `catch` vazios ou swallowed errors? Erros de domínio usam classes tipadas e respostas estruturadas (formato RFC 7807)?
- **Transações Atômicas & Idempotência:** Mutações críticas em múltiplas entidades ou tabelas estão envolvidas em transações de banco (ACID)? Ações de pagamento ou efeito colateral crítico suportam idempotência?
- **Sanitização de Respostas e Logs:** Respostas da API em ambiente de desenvolvimento vazam stack traces para o cliente? Logs contêm dados pessoais (PII), senhas ou tokens?

## Saída

Gere o relatório em `governanca/relatorios/auditoria-repositorio.md`
usando o template em `governanca/relatorios/_template.md`.

- Use `[BLOQ]` para vulnerabilidades críticas de segurança, falhas de validação na borda (Zero-Trust) ou más práticas com risco de corrupção/perda de dados
- Use `[REC]` para desvios dos manuais de engenharia (Design System, estados assíncronos faltantes, camadas acopladas), más práticas e inconsistências de alto impacto
- Use `[SUG]` para inconsistências menores, micro-otimizações e melhorias de documentação que podem aguardar

Ao preencher a seção `## Sprint Sugerida`, crie uma sprint pronta para
copiar com etapas por severidade. Cada achado deve virar uma tarefa.

## Após Gerar o Relatório

1. **Registre no histórico da sessão ativa** (`governanca/SESSAO.md`) que a auditoria foi
   realizada e o caminho do relatório gerado
2. **Apresente o resumo** ao usuário (principais achados, prioridades)
3. **Pergunte** se deseja que os itens críticos/altos virem tarefas na
   sprint atual ou em uma sprint específica de correção
4. Se o usuário autorizar, crie as tarefas correspondentes nas sprints
5. **Leia as sprints ativas** (arquivos em `governanca/sprints/`, exceto
   `_template.md`). Para cada achado crítico/alto, identifique:
   - As sprints futuras preveem funcionalidades similares ao código onde
     o problema foi encontrado?
   - Se sim, o mesmo problema provavelmente se repetirá nessas sprints?
6. **Apresente ao usuário** cada sobreposição encontrada:
   > "A Sprint 3 prevê um formulário de cadastro. Na auditoria encontrei
   > que os formulários atuais não têm validação de entrada. Quer que eu
   > adicione validação como tarefa na Sprint 3 para evitar o mesmo problema?"
7. Se o usuário autorizar, **edite o arquivo da sprint** correspondente
   adicionando a tarefa preventiva e seus critérios de aceite
