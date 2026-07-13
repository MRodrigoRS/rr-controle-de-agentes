import dados from "@/servidor/dados/presets.json";

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

export const presetsFrontend: PresetFrontend[] = dados.frontend;
export const presetsBackend: PresetBackend[] = dados.backend;

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
