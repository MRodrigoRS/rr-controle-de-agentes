# Skill: Auditar Responsividade Mobile

> Instrui o agente a analisar o projeto quanto à compatibilidade com
> dispositivos móveis, identificando barreiras, oportunidades e gerando
> um relatório com recomendações de adaptação.

## Quando Executar

- **No onboarding** — para planejar a abordagem mobile desde o início
- **Antes de uma release pública** — se o projeto pode ser acessado
  de celular ou tablet
- **Sempre que o usuário solicitar** uma auditoria de responsividade

## Pré-requisitos

- A skill `auditar-repositorio.md` deve ter sido executada antes, para
  garantir que não há vulnerabilidades ou más práticas críticas
- O agente deve ter navegado pelo projeto (UI atual, se existir) para
  entender o estado real da interface

## O que Analisar

### 1. Stack e Viabilidade

- **Framework frontend:** React/Next.js, Vue, GAS HTML Service, HTML puro?
  - Next.js com Tailwind CSS é naturalmente adaptável
  - GAS HTML Service exige CSS inline e cuidado redobrado
- **Tipo de projeto:** SPA, SSR, extensão de navegador, planilha com sidebar?
  - Projetos GAS (Web App, Sheets sidebar) já rodam em mobile — a UI é o desafio
  - Extensões de navegador têm limitações específicas em mobile
- **Público-alvo:** o usuário usa celular para acessar? O problema resolvido
  faz sentido em contexto mobile?

### 2. Viewport e Meta

- A tag `<meta name="viewport">` existe e está correta?
  ```html
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ```
- A página usa `user-scalable=no`? (acessibilidade prejudicada em mobile)
- O `min-width` do layout é fixo? (ex: `min-width: 1200px` trava mobile)

### 3. Layout e CSS

- Existem **media queries** (`@media (max-width: ...)`, `@media (min-width: ...)`)?
  - Quantas? Apenas desktop-first ou há breakpoints mobile?
- O layout usa **grid/flexbox** responsivo ou posicionamento absoluto?
- Elementos com **largura fixa em pixels** (`width: 400px`) que quebram em
  telas menores?
- **Imagens e mídia:** são responsivas? (`max-width: 100%`, `srcset`?)
- **Fontes:** usam unidades relativas (`rem`, `em`) ou fixas (`px`)?
- **Overflow:** há conteúdo escondido ou cortado em viewports menores?

### 4. Interação Touch

- **Botões e links** têm tamanho mínimo para toque (~44x44px)?
- Eventos **mouse-only** (`mouseover`, `mouseenter`) sem fallback touch?
  - Especialmente dropdowns, tooltips, hover menus
- **Formulários:** inputs grandes o suficiente para digitação em mobile?
  - `select` e `date` usam controles nativos do sistema?
- **Gestos:** swipe, drag, pinch — funcionam ou quebram em mobile?
- **Scroll:** há scroll horizontal inesperado? `overflow-x: hidden`
  mascarando conteúdo?

### 5. Performance Mobile

- **Tamanho dos assets:** JS, CSS, imagens são leves ou precisam de
  carregamento lento?
- **Renderização:** há animações ou efeitos pesados que travam em
  dispositivos mais lentos?
- **Redes lentas:** o app funciona offline ou com latência alta?
  - Service worker? Cache de recursos estáticos?
- **Consumo de dados:** chamadas de API frequentes ou payloads grandes?

### 6. Navegação Mobile

- Menu/navbar se adapta a telas pequenas? (hamburger, bottom nav, tabs)
- Tabelas são roláveis horizontalmente ou têm versão em cards?
- Modais e diálogos ocupam largura total em mobile ou ficam minúsculos?
- Back button e gestos de navegação nativos funcionam?
- **PWA:** o projeto poderia virar um PWA? (`manifest.json`, service worker)

## Formato do Relatório

Crie um arquivo em `governanca/relatorios/` com o seguinte formato:

```markdown
# Auditoria de Responsividade Mobile — {{data}}

**Projeto:** {{nomeProjeto}}
**Stack Frontend:** {{frontend}}

---

## Resumo

- **Nível atual:** Nada responsivo / Parcialmente responsivo / Totalmente responsivo
- **Esforço estimado:** Baixo / Médio / Alto para adaptar
- **Recomendação:** Adaptar agora / Adaptar depois / Não adaptar (justificativa)

---

## 1. Stack e Viabilidade

(descrição da stack, se faz sentido para mobile, limitações da plataforma)

## 2. Viewport e Meta

- [x] Meta tag presente e correta
- [ ] `user-scalable=no` detectado — remover

## 3. Layout e CSS

- [ ] Media queries: 0 encontradas
- [ ] Elementos com largura fixa: 12 ocorrências (listar arquivos)
- [ ] Fontes em px: 8 ocorrências
- [ ] Overflow horizontal detectado em: `src/pages/relatorio.tsx`
(manter apenas os itens relevantes, com localização e sugestão)

## 4. Interação Touch

- [ ] Botões com menos de 44px: 5 ocorrências
- [ ] Eventos mouse-only: 3 ocorrências
(etc)

...

## Recomendações Finais

### Itens Prioritários

1. Adicionar `<meta name="viewport">` — arquivo: `src/app/layout.tsx`
2. Substituir `width: 400px` por `max-width: 100%` — arquivo: `src/componentes/card.tsx:15`
3. ...

### Oportunidades

- Transformar em PWA para permitir instalação e uso offline
- Adotar mobile-first com Tailwind breakpoints (`sm:`, `md:`, `lg:`)
```

## Após Gerar o Relatório

1. **Registre nas notas persistentes** do `AGENTS.md` que a auditoria foi
   realizada e o caminho do relatório
2. **Apresente o resumo** ao usuário (nível atual, esforço estimado,
   itens prioritários)
3. **Pergunte** se deseja transformar as recomendações em tarefas de sprint
4. Se autorizado, crie as tarefas correspondentes nas sprints
5. **Leia as sprints ativas** (arquivos em `governanca/sprints/`, exceto
   `_template.md`). Para cada achado, identifique:
   - As sprints futuras preveem telas ou interações que sofreriam do
     mesmo problema de responsividade?
   - Se sim, o mesmo padrão inadequado se repetirá nessas sprints?
6. **Apresente ao usuário** cada sobreposição encontrada:
   > "A Sprint 4 prevê uma tabela de relatórios. Na auditoria vi que as
   > tabelas atuais não são roláveis horizontalmente em mobile. Quer que
   > eu já deixe a tabela da Sprint 4 responsiva?"
7. Se o usuário autorizar, **edite o arquivo da sprint** correspondente
   adicionando a tarefa preventiva e seus critérios de aceite
