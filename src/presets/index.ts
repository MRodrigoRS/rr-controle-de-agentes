export interface PresetFrontend {
  id: string;
  nome: string;
  descricao: string;
  destaque: string;
  stack: string[];
  pastas: string[];
  arquitetura: {
    frontendFramework: string;
    frontendEstilo?: string;
    frontendTestes?: string;
    lint?: string;
    formatacao?: string;
  };
}

export interface PresetBackend {
  id: string;
  nome: string;
  descricao: string;
  destaque: string;
  stack: string[];
  pastas: string[];
  arquitetura: {
    backendRuntime?: string;
    backendBanco?: string;
    backendORM?: string;
    lint?: string;
    formatacao?: string;
    cicd?: string;
  };
}

export const presetsFrontend: PresetFrontend[] = [
  {
    id: "nextjs-app-router",
    nome: "Next.js (App Router)",
    descricao: "Framework fullstack para produção com React 19, renderização híbrida (SSR + SSG + ISR) e React Server Components. Ideal para SaaS corporativos, portais e aplicações que precisam de SEO e performance.",
    destaque: "Fullstack com React Server Components",
    stack: ["Next.js 16", "React 19", "TypeScript 5", "Tailwind CSS 4", "shadcn/ui", "Zod", "Biome", "Vitest", "Testing Library", "MSW", "pnpm"],
    pastas: ["src/app", "src/componentes", "src/lib", "src/servidor"],
    arquitetura: {
      frontendFramework: "Next.js 16 (App Router)",
      frontendEstilo: "Tailwind CSS 4",
      frontendTestes: "Vitest + Testing Library + MSW",
      lint: "Biome",
      formatacao: "Biome",
    },
  },
  {
    id: "vite-react-ts",
    nome: "Vite + React + TypeScript",
    descricao: "SPA moderna e ultrarrápida com Vite 6, React 19 e TypeScript 5. Hot Module Replacement instantâneo e build otimizado. Ideal para dashboards administrativos, apps single-page e ferramentas internas.",
    destaque: "SPA rápida com Vite e React 19",
    stack: ["React 19", "Vite 6", "TypeScript 5", "Tailwind CSS 4", "TanStack Query", "Zustand", "Zod", "React Hook Form", "ESLint 9", "Vitest", "Testing Library"],
    pastas: ["src/app", "src/componentes", "src/lib"],
    arquitetura: {
      frontendFramework: "React 19 + Vite 6",
      frontendEstilo: "Tailwind CSS 4",
      frontendTestes: "Vitest + Testing Library",
      lint: "ESLint 9",
      formatacao: "Prettier",
    },
  },
  {
    id: "html-css-js",
    nome: "HTML + CSS + JavaScript",
    descricao: "Página web estática clássica sem frameworks. Ideal para landing pages, sites institucionais, protótipos rápidos e projetos onde a simplicidade é prioridade. Zero dependências, zero build.",
    destaque: "Estática, sem dependências",
    stack: ["HTML5", "CSS3", "JavaScript"],
    pastas: ["src", "src/css", "src/js"],
    arquitetura: {
      frontendFramework: "HTML5 + CSS3 + JavaScript",
      frontendEstilo: "CSS puro",
      lint: "ESLint",
      formatacao: "Prettier",
    },
  },
  {
    id: "threejs-rapier-gsap",
    nome: "Three.js + Rapier + GSAP",
    descricao: "Aplicação 3D interativa no navegador com Three.js para renderização WebGL, Rapier para física realista e GSAP para animações profissionais. Ideal para visualizações arquitetônicas, jogos 3D e experiências imersivas.",
    destaque: "3D interativo com física e animações",
    stack: ["Three.js", "Rapier", "GSAP", "JavaScript", "TypeScript 5", "ESLint"],
    pastas: ["src", "src/cenas", "src/componentes", "src/scripts"],
    arquitetura: {
      frontendFramework: "Three.js + Rapier + GSAP",
      frontendEstilo: "CSS puro",
      lint: "ESLint",
      formatacao: "Prettier",
    },
  },
  {
    id: "pixijs-gsap-zustand",
    nome: "PixiJS + GSAP + Zustand",
    descricao: "Jogo 2D ou visualização interativa pesada no navegador. PixiJS renderiza gráficos 2D ultrarrápidos via WebGL, GSAP cuida das animações e Zustand gerencia o estado global. Ideal para jogos HTML5 e dashboards de alta performance.",
    destaque: "Jogos 2D e visualizações pesadas",
    stack: ["PixiJS", "GSAP", "Zustand", "TypeScript 5", "ESLint"],
    pastas: ["src", "src/cenas", "src/estado", "src/scripts"],
    arquitetura: {
      frontendFramework: "PixiJS + GSAP + Zustand",
      frontendEstilo: "CSS puro",
      lint: "ESLint",
      formatacao: "Prettier",
    },
  },
  {
    id: "gas-web-app",
    nome: "Google Apps Script (Web App)",
    descricao: "Web App do Google que roda diretamente na nuvem do Google Workspace, com planilha como banco de dados. Ideal para automações internas, ferramentas administrativas, dashboards corporativos leves e sistemas de workflow integrados ao ecossistema Google.",
    destaque: "Web App integrado ao Google Workspace",
    stack: ["Google Apps Script (V8)", "HTML/CSS/JS", "Google Sheets", "clasp", "ESLint"],
    pastas: ["src", "src/scripts", "src/servidor", "src/html"],
    arquitetura: {
      frontendFramework: "Google Apps Script (HTML/CSS/JS)",
      frontendTestes: "Teste manual com clasp",
      lint: "ESLint + @google/clasp",
      formatacao: "Prettier",
    },
  },
  {
    id: "browser-extension-mv3",
    nome: "Extensão de Navegador (MV3)",
    descricao: "Extensão Chrome/Edge/Opera usando Manifest V3, o padrão mais moderno e seguro para extensões de navegador. Inclui popup, service worker (background), content scripts e comunicação entre contextos. Ideal para automação de navegação, produtividade e ferramentas de desenvolvimento.",
    destaque: "Extensão Chrome/Edge MV3",
    stack: ["Manifest V3", "JavaScript", "HTML/CSS", "Chrome APIs", "ESLint"],
    pastas: ["src", "src/popup", "src/background", "src/content", "public"],
    arquitetura: {
      frontendFramework: "Manifest V3 + JavaScript",
      lint: "ESLint",
      formatacao: "Prettier",
    },
  },
  {
    id: "nenhum",
    nome: "Nenhum",
    descricao: "Sem frontend definido. Apenas backend ou biblioteca. Útil para APIs puras, pacotes npm, workers e microsserviços.",
    destaque: "Apenas backend",
    stack: [],
    pastas: [],
    arquitetura: {
      frontendFramework: "Nenhum",
    },
  },
];

export const presetsBackend: PresetBackend[] = [
  {
    id: "sqlite-local",
    nome: "SQLite + Prisma",
    descricao: "Banco de dados embutido em Node.js via Prisma ORM. Zero configuração de servidor de banco — o banco é um único arquivo .db no projeto. Ideal para aplicações locais, MVPs, ferramentas desktop, e cenários onde a simplicidade da infraestrutura é prioridade.",
    destaque: "Banco local embutido, zero setup",
    stack: ["Node.js 22", "SQLite", "Prisma 7", "Biome", "GitHub Actions"],
    pastas: ["src/dados", "prisma"],
    arquitetura: {
      backendRuntime: "Node.js 22",
      backendBanco: "SQLite",
      backendORM: "Prisma 7",
      lint: "Biome",
      formatacao: "Biome",
      cicd: "GitHub Actions",
    },
  },
  {
    id: "postgres-drizzle",
    nome: "PostgreSQL + Drizzle",
    descricao: "PostgreSQL gerenciado com Drizzle ORM — um ORM extremamente leve que prioriza SQL puro com tipagem TypeScript forte. Ideal para aplicações que precisam de consultas complexas, migrações versionadas e performance de banco relacional tradicional.",
    destaque: "ORM leve com SQL puro e tipagem forte",
    stack: ["Node.js 22", "PostgreSQL", "Drizzle ORM", "Biome", "GitHub Actions"],
    pastas: ["src/dados", "src/servidor"],
    arquitetura: {
      backendRuntime: "Node.js 22",
      backendBanco: "PostgreSQL",
      backendORM: "Drizzle ORM",
      lint: "Biome",
      formatacao: "Biome",
      cicd: "GitHub Actions",
    },
  },
  {
    id: "supabase-online",
    nome: "Supabase (Cloud)",
    descricao: "Plataforma backend completa na nuvem: banco PostgreSQL, autenticação, storage, Realtime e Edge Functions. Tudo gerenciado via dashboard ou SDK. Ideal para startups e MVPs que precisam de backend rico sem gerenciar servidores.",
    destaque: "Backend cloud completo: banco + auth + realtime",
    stack: ["Node.js 22", "PostgreSQL (Supabase)", "Supabase Client", "Biome", "GitHub Actions"],
    pastas: ["src/dados", "src/servidor"],
    arquitetura: {
      backendRuntime: "Node.js 22",
      backendBanco: "PostgreSQL (Supabase)",
      backendORM: "Supabase Client",
      lint: "Biome",
      formatacao: "Biome",
      cicd: "GitHub Actions",
    },
  },
  {
    id: "trpc-backend",
    nome: "tRPC",
    descricao: "API type-safe sem definições de rota manuais. O tRPC infere tipos automaticamente do backend para o frontend, eliminando a necessidade de SDKs, contratos REST ou GraphQL. Ideal para fullstack TypeScript onde produtividade e segurança de tipos são críticas.",
    destaque: "API type-safe sem REST/GraphQL",
    stack: ["Node.js 22", "tRPC", "Prisma 7", "SQLite ou PostgreSQL", "Biome", "GitHub Actions"],
    pastas: ["src/servidor", "src/dados"],
    arquitetura: {
      backendRuntime: "Node.js 22",
      backendBanco: "SQLite ou PostgreSQL",
      backendORM: "Prisma 7",
      lint: "Biome",
      formatacao: "Biome",
      cicd: "GitHub Actions",
    },
  },
  {
    id: "go-fiber-postgres",
    nome: "Go + Fiber + PostgreSQL",
    descricao: "API de altíssima performance em Go usando o framework Fiber (inspirado no Express.js) com PostgreSQL. Ideal para microsserviços, APIs públicas que exigem baixa latência, processamento concorrente intenso e sistemas que precisam de eficiência máxima de hardware.",
    destaque: "Alta performance com concorrência nativa",
    stack: ["Go 1.22", "Fiber", "PostgreSQL", "pgx", "golangci-lint", "gofumpt", "GitHub Actions"],
    pastas: ["src", "src/handlers", "src/dados", "src/models"],
    arquitetura: {
      backendRuntime: "Go 1.22",
      backendBanco: "PostgreSQL",
      backendORM: "pgx",
      lint: "golangci-lint",
      formatacao: "gofumpt",
      cicd: "GitHub Actions",
    },
  },
  {
    id: "gas-sheets",
    nome: "Google Apps Script (Planilha)",
    descricao: "Backend rodando no Google Apps Script com Google Sheets como banco de dados. Ideal para ferramentas administrativas internas, CRMs leves, sistemas de aprovação e workflow, e qualquer aplicação que já opere dentro do ecossistema Google Workspace.",
    destaque: "Planilha como banco no ecossistema Google",
    stack: ["Google Apps Script (V8)", "Google Sheets", "clasp", "ESLint"],
    pastas: ["src/servidor", "src/scripts"],
    arquitetura: {
      backendRuntime: "Google Apps Script (V8)",
      backendBanco: "Google Sheets",
      lint: "ESLint + @google/clasp",
      formatacao: "Prettier",
    },
  },
  {
    id: "nenhum",
    nome: "Nenhum",
    descricao: "Sem backend definido. Apenas frontend estático ou biblioteca frontend. Útil para sites estáticos, landing pages e aplicações que não persistem dados.",
    destaque: "Apenas frontend",
    stack: [],
    pastas: [],
    arquitetura: {
      backendRuntime: "Nenhum",
    },
  },
];

export function obterFrontend(id: string): PresetFrontend | undefined {
  return presetsFrontend.find((p) => p.id === id);
}

export function obterBackend(id: string): PresetBackend | undefined {
  return presetsBackend.find((p) => p.id === id);
}

export function obterClausulasPadrao(): { titulo: string; descricao: string }[] {
  return [
    { titulo: "Não implementar fora do escopo", descricao: "Não implementar funcionalidades fora do escopo da sprint/etapa atual. Se algo urgente surgir, registre e alinhe com o usuário antes." },
    { titulo: "Não avançar com testes falhando", descricao: "Não avançar para a próxima etapa enquanto houver testes falhando. Corrija antes de prosseguir." },
    { titulo: "Não expor segredos", descricao: "Não expor chaves secretas, tokens, senhas ou dados sensíveis. Use variáveis de ambiente e .env.example." },
    { titulo: "Português brasileiro", descricao: "Interface, documentação, código (nomes de variáveis, funções, tabelas, colunas) e modelagem de dados devem usar português brasileiro, na medida do possível." },
    { titulo: "Validações no backend", descricao: "Nunca confiar no frontend para validações críticas de segurança ou regras de negócio. Validações críticas devem obrigatoriamente acontecer no backend." },
    { titulo: "Dependências com justificativa", descricao: "Não instalar dependências sem justificativa prévia registrada. Prefira bibliotecas consolidadas e de manutenção ativa." },
  ];
}

export function obterCriteriosQualidade(): { titulo: string; descricao: string }[] {
  return [
    { titulo: "Build sem erros", descricao: "Código deve passar em `npm run build` (ou equivalente) sem erros." },
    { titulo: "Commits descritivos", descricao: "Commits devem ter mensagens descritivas em português, explicando o que foi feito e por quê." },
    { titulo: "Testes incrementais", descricao: "Testes devem ser incrementais — nunca regrida a suíte de testes existente. Adicione testes para novas funcionalidades." },
    { titulo: "Estrutura de pastas", descricao: "Siga a estrutura de pastas definida em `CONVENCOES.md`. Não crie pastas soltas na raiz do projeto." },
    { titulo: "Documentação de decisões", descricao: "Decisões técnicas relevantes devem ser registradas no livro de arquitetura em `governanca/livro-arquitetura/`." },
  ];
}
