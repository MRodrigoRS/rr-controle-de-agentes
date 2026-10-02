---
name: auditar-responsividade
description: Analisa compatibilidade mobile — viewport, layout, toque, performance, navegação e oportunidades PWA.
---

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

### 6. Navegação Mobile e PWA (Progressive Web App)

- Menu/navbar se adapta a telas pequenas? (hamburger, bottom nav, tabs)
- Tabelas são roláveis horizontalmente ou têm versão em cards?
- Modais e diálogos ocupam largura total em mobile ou ficam minúsculos?
- Back button e gestos de navegação nativos funcionam?
- **PWA (Padrão para Web):**
  - **Manifest:** `manifest.json` ou `manifest.ts` existe com `name`, `short_name`, `theme_color`, `background_color`, `display: "standalone"`, `start_url` e ícones adequados (192x192, 512x512, maskable)?
  - **Service Worker / Offline:** Service Worker registrado (via `vite-plugin-pwa`, `@serwist/next` ou nativo)? Há estratégia de cache para assets estáticos e página offline de fallback?
  - **Instalabilidade:** O app atende aos critérios do Chrome/Lighthouse para o banner "Instalar Aplicativo"?
  - **Meta Tags:** Tags de status bar iOS (`apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`) configuradas?

## Saída

Gere o relatório em `governanca/relatorios/auditoria-responsividade.md`
usando o template em `governanca/relatorios/_template.md`.

- Use `[BLOQ]` para barras que impedem o uso em mobile (viewport ausente,
  layout travado em largura fixa > 480px)
- Use `[REC]` para problemas de UX mobile (botões pequenos, eventos mouse-only,
  fontes em px)
- Use `[SUG]` para oportunidades (PWA, mobile-first, breakpoints)

Ao preencher a seção `## Sprint Sugerida`, crie uma sprint com etapas
por severidade. Cada achado deve virar uma tarefa concreta.

## Após Gerar o Relatório

1. **Registre nas notas persistentes** de `governanca/SESSAO.md` que a auditoria foi
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
