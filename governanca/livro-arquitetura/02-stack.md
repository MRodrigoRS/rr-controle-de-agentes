# Detalhamento da Stack — rr-controle-de-agentes-1.1

**Projeto:** rr-controle-de-agentes-1.1
**Gerado em:** 2026-10-06



## Frontend

- **Framework:** Next.js 16 (App Router)
- **Estilização:** Tailwind CSS 4
- **Testes:** Vitest + Testing Library + MSW

## Backend

- **Runtime:** Node.js 22 + Hono
- **Banco:** SQLite
- **ORM:** Prisma

## Ferramentas & Padrões

- **Lint:** Biome
- **Formatação:** Biome
- **CI/CD:** GitHub Actions

---

## Catálogo de Ferramentas Oficiais do Projeto

> **Regra Mandatória de Implementação:** Todas as tecnologias e bibliotecas listadas abaixo foram contratadas e aprovadas pelo preset do projeto. Use-as prioritariamente desde o início da implementação. É proibido inventar soluções caseiras (ad-hoc) ou instalar bibliotecas concorrentes para responsabilidades já atendidas nesta stack (ex: use Zustand para estado global, Zod para schemas/validações, Lucide para ícones, etc.).


### Tecnologias do Frontend

| ID | Tecnologia | Categoria | Papel / Responsabilidade no Projeto |
|:--:|---|---|---|
| 70 | **@supabase/ssr** | Bibliotecas | Sessão do Supabase Auth via cookies em aplicações SSR |
| 56 | **Lucide React** | Bibliotecas | Conjunto de ícones SVG para React |
| 55 | **Motion** | Bibliotecas | Animações declarativas para React e Web |
| 69 | **Radix UI** | Bibliotecas | Primitivas headless acessíveis para React |
| 12 | **React Hook Form** | Bibliotecas | Criação de formulários complexos reativos com alta performance |
| 11 | **Zod** | Bibliotecas | Validação de dados de entrada e tipagem em runtime |
| 10 | **Zustand** | Bibliotecas | Gerenciamento de estado leve e global no frontend |
| 19 | **Next.js** | Frontend | SaaS corporativos de grande porte e portais otimizados |
| 20 | **React** | Frontend | Single Page Applications (SPAs) reativas e modulares |
| 21 | **Tailwind CSS** | Frontend | Estilização ágil de componentes sem arquivos CSS gigantes |
| 22 | **shadcn/ui** | Frontend | Acelerar a criação de layouts com design de nível premium |
| 23 | **TypeScript** | Linguagens | Frontend e Backend corporativo |
| 31 | **Biome** | Qualidade & Testes | Formatação e análise de código ultrarrápidas em JS/TS/CSS |
| 36 | **MSW (Mock Service Worker)** | Qualidade & Testes | Interceptar e mockar chamadas HTTP em testes |
| 37 | **Testing Library** | Qualidade & Testes | Testar interações de componentes React com o DOM |
| 33 | **Vitest** | Qualidade & Testes | Testes de unidade e integração rápidos e reativos |
| 140 | **@serwist/next** | Runtimes & Build | Progressive Web App (PWA) e Service Worker com suporte nativo ao Next.js App Router |
| 44 | **pnpm** | Runtimes & Build | Gerenciamento eficiente de dependências node_modules |




### Tecnologias do Backend

| ID | Tecnologia | Categoria | Papel / Responsabilidade no Projeto |
|:--:|---|---|---|
| 129 | **@hono/zod-validator** | Backend | Middleware de validação de schemas Zod para rotas Hono |
| 118 | **Hono** | Backend | Framework web ultra-rápido para Cloudflare Workers, Node.js e Deno |
| 130 | **Pino** | Backend | Logger estruturado em JSON de altíssima performance para Node.js |
| 2 | **Prisma ORM** | Backend | Mapeamento objeto-relacional para Node.js/TypeScript |
| 7 | **SQLite** | Bancos de Dados | Aplicações locais offline, testes e ferramentas desktop |
| 11 | **Zod** | Bibliotecas | Validação de dados de entrada e tipagem em runtime |
| 119 | **GitHub Actions** | DevOps | Pipelines de CI/CD automatizadas para build, testes e deploy |
| 31 | **Biome** | Qualidade & Testes | Formatação e análise de código ultrarrápidas em JS/TS/CSS |
| 33 | **Vitest** | Qualidade & Testes | Testes de unidade e integração rápidos e reativos |
| 41 | **Node.js** | Runtimes & Build | Executar Javascript e TypeScript do lado do servidor |



*Template gerado por RR Tech Studio (Rodrigo Rafael).*
