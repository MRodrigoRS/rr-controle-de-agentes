import dados from "@/servidor/dados/presets.json";
import { obterTecnologiasPorIds, type TecnologiaRegistro } from "@/servidor/db";

export interface PresetFrontend {
  id: string;
  nome: string;
  descricao: string;
  destaque: string;
  stack: string[];
  pastas: string[];
  tecnologiaIds?: number[];
  tecnologias?: TecnologiaRegistro[];
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
  tecnologiaIds?: number[];
  tecnologias?: TecnologiaRegistro[];
  arquitetura: {
    backendRuntime?: string;
    backendBanco?: string;
    backendORM?: string;
    lint?: string;
    formatacao?: string;
    cicd?: string;
  };
}

export interface FullstackRecomendado {
  id: string;
  nome: string;
  categoria: string;
  destaque?: string;
  frontend: string;
  backend: string;
  objetivo: string;
  vantagens: string[];
  tecnologias?: TecnologiaRegistro[];
}

export const presetsFrontend: PresetFrontend[] = dados.frontend;
export const presetsBackend: PresetBackend[] = dados.backend;
export const presetsFullstack: FullstackRecomendado[] = dados.fullstacks;

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
    { titulo: "Português brasileiro no código", descricao: "Nomes de entidades, regras de negócio, tabelas de banco, variáveis e funções devem ser escritos em português brasileiro (ex: obterUsuario, salvarPedido, cliente). Termos técnicos universais e padrões de bibliotecas/frameworks (id, payload, props, handler, middleware, token, status, req/res) permanecem em inglês sem tradução forçada." },
    { titulo: "Backend como autoridade única (Zero-Trust no cliente)", descricao: "O frontend é uma camada de apresentação descartável e potencialmente manipulável pelo usuário (DevTools/F12). Toda regra de negócio, cálculo de valores/preços, checagem de permissões/papéis e validação de transição de estado deve obrigatoriamente ser recalculada e validada no backend, nunca aceitando dados calculados ou permissões vindas cegamente do payload do cliente." },
    { titulo: "Dependências com justificativa", descricao: "Não instalar dependências sem justificativa prévia registrada. Prefira bibliotecas consolidadas e de manutenção ativa." },
  ];
}

export function obterCriteriosQualidade(): { titulo: string; descricao: string }[] {
  return [
    { titulo: "Build sem erros", descricao: "Código deve passar em `npm run build` (ou equivalente) sem erros." },
    { titulo: "Commits descritivos", descricao: "Commits devem ter mensagens descritivas em português, explicando o que foi feito e por quê." },
    { titulo: "Testes incrementais", descricao: "Testes devem ser incrementais — nunca regrida a suíte de testes existente. Adicione testes para novas funcionalidades." },
    { titulo: "Responsividade e PWA", descricao: "Aplicações Web devem ser 100% responsivas (Mobile-First) e incluir suporte a PWA (manifest, ícones e instalabilidade) por padrão." },
    { titulo: "Estrutura de pastas", descricao: "Siga a estrutura de pastas definida em `governanca/skills/convencoes-estrutura-de-pastas.md`. Não crie pastas soltas na raiz do projeto." },
    { titulo: "Documentação de decisões", descricao: "Decisões técnicas relevantes devem ser registradas no livro de arquitetura em `governanca/livro-arquitetura/`." },
  ];
}

export function obterTecnologiasDoPreset(preset: PresetFrontend | PresetBackend): TecnologiaRegistro[] {
  if (!preset.tecnologiaIds || preset.tecnologiaIds.length === 0) return [];
  return obterTecnologiasPorIds(preset.tecnologiaIds);
}

