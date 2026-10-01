import fs from "fs";
import path from "path";
import {
  obterTodasTecnologias,
  inserirTecnologia,
  exportarSnapshotTecnologias,
} from "../db";

const presetsPath = path.resolve(process.cwd(), "src/servidor/dados/presets.json");

interface PresetItem {
  id: string;
  nome: string;
  descricao: string;
  destaque?: string;
  stack: string[];
  pastas: string[];
  arquitetura: Record<string, string>;
  tecnologiaIds?: number[];
}

interface PresetsData {
  frontend: PresetItem[];
  backend: PresetItem[];
  fullstacks: unknown[];
}

// Metadados para tecnologias que estavam nos presets mas não no catálogo original
const metadadosNovasTecnologias: Record<string, { categoria: string; aplicabilidade: string; descricao: string }> = {
  "Rapier": {
    categoria: "Bibliotecas",
    aplicabilidade: "Simulação de física 2D/3D realista em WebGL/WebAssembly",
    descricao: "Motor de física rápido escrito em Rust e compilado para WebAssembly para uso em jogos e visualizações interativas no navegador."
  },
  "Manifest V3": {
    categoria: "Frontend",
    aplicabilidade: "Padrão moderno de extensões de navegador (Chrome/Edge)",
    descricao: "Especificação de segurança e arquitetura para extensões de navegador baseadas em service workers e permissões granulares."
  },
  "WXT": {
    categoria: "Frontend",
    aplicabilidade: "Framework para desenvolvimento ágil de extensões de navegador",
    descricao: "Next-gen framework para desenvolvimento de extensões de navegador com TypeScript, live reload e build multi-browser."
  },
  "Chrome APIs": {
    categoria: "Frontend",
    aplicabilidade: "APIs nativas de integração do Chrome/Edge (tabs, storage, runtime)",
    descricao: "Conjunto de APIs nativas do navegador para interação entre o navegador e extensões."
  },
  "dotnet format": {
    categoria: "Ferramentas",
    aplicabilidade: "Formatador e linter oficial de código .NET C#",
    descricao: "Ferramenta CLI oficial da Microsoft para aplicar estilos de código e convenções em projetos .NET."
  },
  "Qt Widgets + QSS": {
    categoria: "Frontend",
    aplicabilidade: "Interface desktop nativa tradicional com estilização tipo CSS",
    descricao: "Módulo de componentes nativos de desktop Qt customizados através de folhas de estilo QSS."
  },
  "Quasar": {
    categoria: "Frontend",
    aplicabilidade: "Framework Vue para SPA, PWA, SSR, mobile e desktop",
    descricao: "Framework completo baseado em Vue.js com dezenas de componentes Material Design e gerador multiplataforma."
  },
  "Material Design 3": {
    categoria: "Frontend",
    aplicabilidade: "Design system moderno do Google para interfaces intuitivas",
    descricao: "Sistema de design e componentes visuais do Google focado em personalização dinâmica e acessibilidade."
  },
  "integration_test": {
    categoria: "Testes",
    aplicabilidade: "Testes de integração end-to-end para Flutter",
    descricao: "Pacote oficial do Flutter para executar testes de integração em dispositivos reais ou emuladores."
  },
  "Expo SDK": {
    categoria: "Mobile",
    aplicabilidade: "Plataforma e conjunto de ferramentas para React Native",
    descricao: "Ecossistema completo que simplifica o desenvolvimento, build e deploy de aplicações React Native."
  },
  "Jest": {
    categoria: "Testes",
    aplicabilidade: "Framework de testes unitários e de integração JavaScript",
    descricao: "Test runner clássico com foco em simplicidade, assertions embutidas e suporte a mocks."
  },
  "Hono": {
    categoria: "Backend",
    aplicabilidade: "Framework web ultra-rápido para Cloudflare Workers, Node.js e Deno",
    descricao: "Framework web leve e tipado de altíssima performance para arquiteturas serverless e edge."
  },
  "GitHub Actions": {
    categoria: "DevOps",
    aplicabilidade: "Pipelines de CI/CD automatizadas para build, testes e deploy",
    descricao: "Serviço de automação e integração contínua nativo do GitHub para fluxos de desenvolvimento."
  },
  "pgx": {
    categoria: "Backend",
    aplicabilidade: "Driver PostgreSQL puro e toolkit de alta performance para Go",
    descricao: "Driver PostgreSQL em Go puro com suporte a transações nativas, pool de conexões e performance máxima."
  },
  "testify": {
    categoria: "Testes",
    aplicabilidade: "Conjunto de asserções e mocks para testes em Go",
    descricao: "Biblioteca de teste mais popular de Go com assertions elegantes, suites de teste e suporte a mocking."
  },
  "SpreadsheetApp": {
    categoria: "Bibliotecas",
    aplicabilidade: "Manipulação de planilhas Google Sheets via Google Apps Script",
    descricao: "Serviço nativo do GAS para leitura, escrita, formatação e automação de planilhas Google."
  },
  "DriveApp": {
    categoria: "Bibliotecas",
    aplicabilidade: "Gestão de arquivos e pastas no Google Drive via Google Apps Script",
    descricao: "Serviço nativo do GAS para criar, mover, compartilhar e gerenciar arquivos no Google Drive."
  },
  "LockService": {
    categoria: "Backend",
    aplicabilidade: "Controle de concorrência e travas críticas no Google Apps Script",
    descricao: "Serviço de bloqueio mútuo para prevenir condições de corrida em execuções concorrentes do GAS."
  },
  "CacheService": {
    categoria: "Backend",
    aplicabilidade: "Cache em memória de curta duração no Google Apps Script",
    descricao: "Armazenamento em cache chave-valor temporário para evitar chamadas de I/O lentas no GAS."
  },
  "PropertiesService": {
    categoria: "Bancos de Dados",
    aplicabilidade: "Armazenamento persistente de estado e configurações no GAS",
    descricao: "Serviço de armazenamento persistente chave-valor com escopos de script, usuário e documento."
  },
  "Utilities": {
    categoria: "Bibliotecas",
    aplicabilidade: "Utilitários nativos do GAS (base64, sleep, formatação de data, UUID)",
    descricao: "Conjunto de funções utilitárias nativas do Google Apps Script para manipulação de dados."
  },
  "SHA-256 + pepper + UUID": {
    categoria: "Segurança",
    aplicabilidade: "Padrão de hashing seguro e tokens únicos para autenticação",
    descricao: "Prática de criptografia e hashing de senhas com salgamento/pimenta e identificadores universais únicos."
  }
};

export function normalizarPresets(): void {
  console.log("\n📦 Normalizando presets com IDs do SQLite...");

  const presetsRaw = fs.readFileSync(presetsPath, "utf-8");
  const data: PresetsData = JSON.parse(presetsRaw);

  let todasTecs = obterTodasTecnologias();

  // Helper para resolver ou cadastrar tecnologia
  function resolverOuCadastrar(nomeTec: string): number {
    const nomeLimpo = nomeTec.trim();
    const nomeSemVersao = nomeLimpo.replace(/\s+\d+(\.\d+)*.*$/, "").trim();

    // 1. Busca exata ou por nome sem versão
    let found = todasTecs.find(
      (t) => t.nome.toLowerCase() === nomeLimpo.toLowerCase() || t.nome.toLowerCase() === nomeSemVersao.toLowerCase()
    );

    // 2. Busca parcial se não achou
    if (!found) {
      found = todasTecs.find(
        (t) =>
          t.nome.toLowerCase().includes(nomeSemVersao.toLowerCase()) ||
          nomeSemVersao.toLowerCase().includes(t.nome.toLowerCase())
      );
    }

    if (found) {
      return found.id;
    }

    // 3. Cadastra se for inédita
    const meta = metadadosNovasTecnologias[nomeLimpo] || metadadosNovasTecnologias[nomeSemVersao] || {
      categoria: "Bibliotecas",
      aplicabilidade: `Uso em projetos com stack ${nomeLimpo}`,
      descricao: `Ferramenta ou biblioteca ${nomeLimpo} para o ecossistema do projeto.`
    };

    console.log(`➕ Inserindo tecnologia no catálogo: ${nomeLimpo} (${meta.categoria})`);
    const inserida = inserirTecnologia({
      nome: nomeLimpo,
      categoria: meta.categoria,
      aplicabilidade: meta.aplicabilidade,
      descricao: meta.descricao,
    });

    todasTecs = obterTodasTecnologias(); // recarrega
    return inserida.id;
  }

  // Normaliza Frontend
  for (const p of data.frontend) {
    if (p.id === "nenhum") {
      p.tecnologiaIds = [];
      continue;
    }
    const ids: number[] = [];
    for (const item of p.stack) {
      const id = resolverOuCadastrar(item);
      if (!ids.includes(id)) {
        ids.push(id);
      }
    }
    p.tecnologiaIds = ids;
  }

  // Normaliza Backend
  for (const p of data.backend) {
    if (p.id === "nenhum") {
      p.tecnologiaIds = [];
      continue;
    }
    const ids: number[] = [];
    for (const item of p.stack) {
      const id = resolverOuCadastrar(item);
      if (!ids.includes(id)) {
        ids.push(id);
      }
    }
    p.tecnologiaIds = ids;
  }

  fs.writeFileSync(presetsPath, JSON.stringify(data, null, 2), "utf-8");
  exportarSnapshotTecnologias();

  console.log(`✅ Presets frontend normalizados: ${data.frontend.length}`);
  console.log(`✅ Presets backend normalizados: ${data.backend.length}`);
  console.log("🎉 Todos os presets agora possuem tecnologiaIds: number[] vinculados ao SQLite!\n");
}

if (require.main === module) {
  normalizarPresets();
}
