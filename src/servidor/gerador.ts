import fs from "fs";
import path from "path";
import { PresetFrontend, PresetBackend, obterClausulasPadrao, obterCriteriosQualidade } from "@/presets";
import { processarTemplate } from "./templates";
import { gerarCatalogoMarkdown, extrairCategorias } from "@/servidor/dados/gerar-catalogo";

interface CriarProjetoParams {
  nome: string;
  descricao: string;
  caminho: string;
  presetFrontend: PresetFrontend;
  presetBackend: PresetBackend;
  repositorioExistente?: boolean;
  regenerar?: boolean;
}

const MARCA_INICIO = "=== INÍCIO DAS NOTAS PERSISTENTES DO AGENTE ===";
const MARCA_FIM = "=== FIM DAS NOTAS PERSISTENTES DO AGENTE ===";
const MARCA_STACK_INICIO = "=== INÍCIO DA STACK DETECTADA ===";
const MARCA_STACK_FIM = "=== FIM DA STACK DETECTADA ===";

function extrairNotasPersistentes(caminhoAgents: string): string {
  if (!fs.existsSync(caminhoAgents)) return "";
  const conteudo = fs.readFileSync(caminhoAgents, "utf-8");
  const inicio = conteudo.indexOf(MARCA_INICIO);
  const fim = conteudo.indexOf(MARCA_FIM);
  if (inicio !== -1 && fim !== -1 && fim > inicio) {
    return conteudo.slice(inicio + MARCA_INICIO.length, fim).trim();
  }
  return "";
}

function montarSecaoNotas(notas: string): string {
  if (notas) {
    return `\n${MARCA_INICIO}\n${notas}\n${MARCA_FIM}\n`;
  }
  return `\n${MARCA_INICIO}\n\nUse este espaço para anotações que devem persistir entre sessões:\ndecisões, observações, lembretes. Esta seção nunca é sobrescrita.\n\n(escreva suas notas abaixo)\n\n${MARCA_FIM}\n`;
}

function extrairStackPersistente(caminhoAgents: string): string | null {
  if (!fs.existsSync(caminhoAgents)) return null;
  const conteudo = fs.readFileSync(caminhoAgents, "utf-8");
  const inicio = conteudo.indexOf(MARCA_STACK_INICIO);
  const fim = conteudo.indexOf(MARCA_STACK_FIM);
  if (inicio !== -1 && fim !== -1 && fim > inicio) {
    return conteudo.slice(inicio, fim + MARCA_STACK_FIM.length);
  }
  return null;
}

export async function criarEstruturaGovernanca(params: CriarProjetoParams) {
  const { nome, descricao, caminho, presetFrontend, presetBackend, repositorioExistente } = params;
  const caminhoAbs = path.resolve(caminho);
  const governancaDir = path.join(caminhoAbs, "governanca");

  const raizRR = path.resolve(process.cwd());
  let caminhoRelativoRR = path.relative(caminhoAbs, raizRR).replace(/\\/g, "/") + "/";
  if (path.isAbsolute(caminhoRelativoRR)) {
    caminhoRelativoRR = raizRR.replace(/\\/g, "/") + "/";
  }

  const pastas = [
    governancaDir,
    path.join(governancaDir, "sprints"),
    path.join(governancaDir, "sprints", "concluidas"),
    path.join(governancaDir, "livro-arquitetura"),
    path.join(governancaDir, "skills"),
    path.join(governancaDir, "scripts"),
    path.join(governancaDir, "relatorios"),
  ];

  const todasPastas = new Set([...pastas, ...presetFrontend.pastas, ...presetBackend.pastas]);
  for (const pasta of todasPastas) {
    fs.mkdirSync(pasta, { recursive: true });
  }

  const clausulas = obterClausulasPadrao();
  const qualidade = obterCriteriosQualidade();
  const categorias = extrairCategorias();
  const hoje = new Date().toISOString().split("T")[0];

  const fe = presetFrontend.arquitetura;
  const be = presetBackend.arquitetura;

  const ctx = {
    nomeProjeto: nome,
    descricao,
    frontend: `${presetFrontend.nome}${fe.frontendFramework ? ` (${fe.frontendFramework})` : ""}`,
    backend: be.backendRuntime ? `${be.backendRuntime}${be.backendBanco ? ` / ${be.backendBanco}` : ""}` : "Nenhum",
    clausulas: clausulas.map((c) => `- **${c.titulo}:** ${c.descricao}`).join("\n"),
    qualidade: qualidade.map((q) => `- **${q.titulo}:** ${q.descricao}`).join("\n"),
    temPresets: presetFrontend.id !== "nenhum" || presetBackend.id !== "nenhum",
    planoImportado: false,
    caminhoRR: caminhoRelativoRR,
    categoriasLista: categorias.join(", "),
    data: hoje,
    frontendFramework: fe.frontendFramework || "A definir",
    frontendEstilo: fe.frontendEstilo || "A definir",
    frontendTestes: fe.frontendTestes || "A definir",
    backendRuntime: be.backendRuntime || "N/A",
    backendBanco: be.backendBanco || "N/A",
    backendORM: be.backendORM || "N/A",
    lint: fe.lint || be.lint || "A definir",
    formatacao: fe.formatacao || be.formatacao || "A definir",
    cicd: be.cicd || "A definir",
    ehGo: (be.backendRuntime || "").toLowerCase().includes("go 1"),
    ehGas: (be.backendRuntime || "").toLowerCase().includes("google apps script"),
    setupBackend: "`package.json`, configs de banco/CI",
  };

  if (ctx.ehGo) {
    ctx.setupBackend = "`go.mod`, configs de banco/CI";
  } else if (ctx.ehGas) {
    ctx.setupBackend = "`.clasp.json`, configs do Google Apps Script";
  }

  const ctxSprint = {
    ...ctx,
    numero: "?",
    titulo: "?",
    objetivo: "?",
    numeroEtapa: "?",
    tituloEtapa: "?",
    objetivoEtapa: "?",
    comandoTeste: "npm run",
    sugestaoCommit: "descreva o que foi entregue nesta sprint",
  };

  const caminhoAgents = path.join(governancaDir, "AGENTS.md");
  const notasExistentes = extrairNotasPersistentes(caminhoAgents);
  const stackExistente = extrairStackPersistente(caminhoAgents);

  const arquivos: { destino: string; template: string; ctx: Record<string, unknown> }[] = [
    { destino: caminhoAgents, template: "AGENTS.md", ctx },
    { destino: path.join(governancaDir, "PLANO.md"), template: "PLANO.md", ctx },
    { destino: path.join(governancaDir, "sprints", "_template.md"), template: "SPRINT.md", ctx: ctxSprint },
    { destino: path.join(governancaDir, "skills", "contribuir-tecnologias.md"), template: "skills/contribuir-tecnologias.md", ctx },
    { destino: path.join(governancaDir, "skills", "CONVENCOES.md"), template: "skills/CONVENCOES.md", ctx },
    { destino: path.join(governancaDir, "skills", "manter-contexto.md"), template: "skills/manter-contexto.md", ctx },
    { destino: path.join(governancaDir, "skills", "arquivar-sprints.md"), template: "skills/arquivar-sprints.md", ctx },
    { destino: path.join(governancaDir, "skills", "comparar-stack-com-plano.md"), template: "skills/comparar-stack-com-plano.md", ctx },
    { destino: path.join(governancaDir, "skills", "criar-scripts-auxiliares.md"), template: "skills/criar-scripts-auxiliares.md", ctx },
    { destino: path.join(governancaDir, "skills", "deduzir-presets-do-repositorio.md"), template: "skills/deduzir-presets-do-repositorio.md", ctx },
    { destino: path.join(governancaDir, "skills", "auditar-repositorio.md"), template: "skills/auditar-repositorio.md", ctx },
    { destino: path.join(governancaDir, "skills", "auditar-responsividade.md"), template: "skills/auditar-responsividade.md", ctx },
    { destino: path.join(governancaDir, "skills", "criar-prd.md"), template: "skills/criar-prd.md", ctx },
    { destino: path.join(governancaDir, "skills", "escrever-testes.md"), template: "skills/escrever-testes.md", ctx },
    { destino: path.join(governancaDir, "skills", "revisar-codigo.md"), template: "skills/revisar-codigo.md", ctx },
    { destino: path.join(governancaDir, "skills", "depurar-erros.md"), template: "skills/depurar-erros.md", ctx },
  ];

  arquivos.push({ destino: path.join(governancaDir, "PRD.md"), template: "PRD.md", ctx });

  if (params.regenerar) {
    arquivos.push({
      destino: path.join(governancaDir, "INICIO.md"),
      template: "INICIO.md",
      ctx,
    });
  } else if (repositorioExistente) {
    arquivos.push({
      destino: path.join(governancaDir, "VINCULAR.md"),
      template: "VINCULAR.md",
      ctx,
    });
  } else {
    arquivos.push({
      destino: path.join(governancaDir, "INICIO.md"),
      template: "INICIO.md",
      ctx,
    });
  }

  if (!params.regenerar) {
    arquivos.push(
      { destino: path.join(governancaDir, "livro-arquitetura", "01-visao-geral.md"), template: "arquitetura/01-visao-geral.md", ctx },
      { destino: path.join(governancaDir, "livro-arquitetura", "02-stack.md"), template: "arquitetura/02-stack.md", ctx },
    );
  }

  for (const { destino, template, ctx: templateCtx } of arquivos) {
    let conteudo = processarTemplate(template, templateCtx);
    if (template === "AGENTS.md") {
      conteudo += montarSecaoNotas(notasExistentes);
      // Preserva o bloco de stack se foi editado manualmente pelo agente
      if (stackExistente) {
        const ini = conteudo.indexOf(MARCA_STACK_INICIO);
        const fim = conteudo.indexOf(MARCA_STACK_FIM);
        if (ini !== -1 && fim !== -1 && fim > ini) {
          const antes = conteudo.slice(0, ini);
          const depois = conteudo.slice(fim + MARCA_STACK_FIM.length);
          conteudo = antes + stackExistente + depois;
        }
      }
    }
    fs.writeFileSync(destino, conteudo, "utf-8");
  }

  const catalogoMd = gerarCatalogoMarkdown();
  fs.writeFileSync(path.join(governancaDir, "skills", "CATALOGO_TECNOLOGIAS.md"), catalogoMd, "utf-8");

  return { sucesso: true, caminho: caminhoAbs };
}
