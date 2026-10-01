import fs from "fs";
import path from "path";
import { PresetFrontend, PresetBackend, obterClausulasPadrao, obterCriteriosQualidade, obterTecnologiasDoPreset } from "@/presets";
import { processarTemplate } from "./templates";
import { gerarCatalogoMarkdown, extrairCategorias } from "@/servidor/dados/gerar-catalogo";
import { type TecnologiaRegistro } from "./db";
import { configurarHarnessNoProjeto } from "./harness";

interface CriarProjetoParams {
  nome: string;
  descricao: string;
  caminho: string;
  presetFrontend: PresetFrontend;
  presetBackend: PresetBackend;
  repositorioExistente?: boolean;
  regenerar?: boolean;
  modoMigracao?: boolean;
}

function limparArquivosObsoletos(owned: Set<string>, dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const arquivo of fs.readdirSync(dir)) {
    const caminho = path.join(dir, arquivo);
    if (!owned.has(caminho) && arquivo.endsWith(".md") && fs.statSync(caminho).isFile()) {
      fs.unlinkSync(caminho);
    }
  }
}

function montarTabelaTecnologias(tecs: TecnologiaRegistro[]): string {
  if (!tecs || tecs.length === 0) return "*Nenhuma tecnologia catalogada especificada.*";
  let md = "| ID | Tecnologia | Categoria | Papel / Responsabilidade no Projeto |\n";
  md += "|:--:|---|---|---|\n";
  for (const t of tecs) {
    md += `| ${t.id} | **${t.nome}** | ${t.categoria} | ${t.aplicabilidade} |\n`;
  }
  return md;
}

function montarStackCategorizada(tecs: TecnologiaRegistro[]): string {
  if (!tecs || tecs.length === 0) return "";
  const porCat = new Map<string, string[]>();
  for (const t of tecs) {
    const list = porCat.get(t.categoria) || [];
    list.push(t.nome);
    porCat.set(t.categoria, list);
  }
  return Array.from(porCat.entries())
    .map(([cat, items]) => `  - **${cat}:** ${items.join(", ")}`)
    .join("\n");
}

export async function criarEstruturaGovernanca(params: CriarProjetoParams) {
  const { nome, descricao, caminho, presetFrontend, presetBackend, repositorioExistente } = params;
  const caminhoAbs = path.resolve(caminho);
  const governancaDir = path.join(caminhoAbs, "governanca");

  const raizRR = path.resolve(process.cwd());
  const rel = path.relative(caminhoAbs, raizRR);
  const caminhoRelativoRR = (path.isAbsolute(rel) ? raizRR : rel).replace(/\\/g, "/") + "/";

  const pastas = [
    governancaDir,
    path.join(governancaDir, "sprints"),
    path.join(governancaDir, "sprints", "concluidas"),
    path.join(governancaDir, "livro-arquitetura"),
    path.join(governancaDir, "skills"),
    path.join(governancaDir, "scripts"),
    path.join(governancaDir, "workflows"),
    path.join(governancaDir, "relatorios"),
    path.join(governancaDir, "padroes"),
    path.join(governancaDir, "templates"),
  ];

  const todasPastas = new Set([...pastas, ...presetFrontend.pastas, ...presetBackend.pastas]);
  for (const pasta of todasPastas) {
    const caminhoPasta = path.isAbsolute(pasta) ? pasta : path.join(caminhoAbs, pasta);
    fs.mkdirSync(caminhoPasta, { recursive: true });
  }

  const clausulas = obterClausulasPadrao();
  const qualidade = obterCriteriosQualidade();
  const categorias = extrairCategorias();
  const hoje = new Date().toISOString().split("T")[0];

  const fe = presetFrontend.arquitetura;
  const be = presetBackend.arquitetura;

  const tecsFrontend = obterTecnologiasDoPreset(presetFrontend);
  const tecsBackend = obterTecnologiasDoPreset(presetBackend);

  const alvoStack = (presetFrontend.id !== "nenhum" ? presetFrontend.id : presetBackend.id !== "nenhum" ? presetBackend.id : "nova-stack")
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-");

  const ehGas = (be.backendRuntime || "").toLowerCase().includes("google apps script") || presetFrontend.id === "gas-web-app";

  const ctx = {
    nomeProjeto: nome,
    descricao,
    frontend: `${presetFrontend.nome}${fe.frontendFramework ? ` (${fe.frontendFramework})` : ""}`,
    backend: be.backendRuntime ? `${be.backendRuntime}${be.backendBanco ? ` / ${be.backendBanco}` : ""}` : "Nenhum",
    clausulas: clausulas.map((c) => `- **${c.titulo}:** ${c.descricao}`).join("\n"),
    qualidade: qualidade.map((q) => `- **${q.titulo}:** ${q.descricao}`).join("\n"),
    temPresets: presetFrontend.id !== "nenhum" || presetBackend.id !== "nenhum",
    ehMigracaoStack: Boolean(params.modoMigracao),
    branchSugerida: `refactor/migracao-para-${alvoStack}`,
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
    stackFrontend: presetFrontend.stack.join(", "),
    stackBackend: presetBackend.stack.join(", "),
    tabelaStackFrontend: montarTabelaTecnologias(tecsFrontend),
    tabelaStackBackend: montarTabelaTecnologias(tecsBackend),
    stackCategorizadaFrontend: montarStackCategorizada(tecsFrontend),
    stackCategorizadaBackend: montarStackCategorizada(tecsBackend),
    ehGas,
  };

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

  const arquivos: { destino: string; template: string; ctx: Record<string, unknown> }[] = [
    { destino: path.join(governancaDir, "AGENTS.md"), template: "AGENTS.md", ctx },
    { destino: path.join(governancaDir, "PLANO.md"), template: "PLANO.md", ctx },
    { destino: path.join(governancaDir, "sprints", "_template.md"), template: "SPRINT.md", ctx: ctxSprint },
    { destino: path.join(governancaDir, "skills", "convencoes-estrutura-de-pastas.md"), template: "skills/convencoes-estrutura-de-pastas.md", ctx },
    { destino: path.join(governancaDir, "skills", "alinhar-stack-com-presets.md"), template: "skills/alinhar-stack-com-presets.md", ctx },
    { destino: path.join(governancaDir, "skills", "criar-scripts-auxiliares.md"), template: "skills/criar-scripts-auxiliares.md", ctx },
    { destino: path.join(governancaDir, "skills", "auditar-repositorio.md"), template: "skills/auditar-repositorio.md", ctx },
    { destino: path.join(governancaDir, "skills", "auditar-responsividade.md"), template: "skills/auditar-responsividade.md", ctx },
    { destino: path.join(governancaDir, "skills", "criar-testes.md"), template: "skills/criar-testes.md", ctx },
    { destino: path.join(governancaDir, "skills", "mapear-logica-do-sistema.md"), template: "skills/mapear-logica-do-sistema.md", ctx },
    { destino: path.join(governancaDir, "skills", "mapear-comportamento-autonomo.md"), template: "skills/mapear-comportamento-autonomo.md", ctx },
    { destino: path.join(governancaDir, "skills", "sincronizar-documentacao.md"), template: "skills/sincronizar-documentacao.md", ctx },

    { destino: path.join(governancaDir, "skills", "auditar-consistencia-visual.md"), template: "skills/auditar-consistencia-visual.md", ctx },
    { destino: path.join(governancaDir, "skills", "auditar-prontidao-producao.md"), template: "skills/auditar-prontidao-producao.md", ctx },
    { destino: path.join(governancaDir, "skills", "auditar-comercializacao.md"), template: "skills/auditar-comercializacao.md", ctx },
    { destino: path.join(governancaDir, "skills", "auditar-competitividade.md"), template: "skills/auditar-competitividade.md", ctx },
    { destino: path.join(governancaDir, "skills", "auditar-textos-usuario.md"), template: "skills/auditar-textos-usuario.md", ctx },
    { destino: path.join(governancaDir, "skills", "usar-harness-do-agente.md"), template: "skills/usar-harness-do-agente.md", ctx },
    { destino: path.join(governancaDir, "skills", "usar-subagentes.md"), template: "skills/usar-subagentes.md", ctx },
    { destino: path.join(governancaDir, "skills", "modularizar-padroes-recorrentes.md"), template: "skills/modularizar-padroes-recorrentes.md", ctx },
    { destino: path.join(governancaDir, "skills", "configurar-harness.md"), template: "skills/configurar-harness.md", ctx },
    { destino: path.join(governancaDir, "skills", "evoluir-governanca.md"), template: "skills/evoluir-governanca.md", ctx },
    { destino: path.join(governancaDir, "skills", "faxina-completa.md"), template: "skills/faxina-completa.md", ctx },
    { destino: path.join(governancaDir, "relatorios", "_template.md"), template: "relatorios/_template.md", ctx },
    { destino: path.join(governancaDir, "workflows", "research.md"), template: "workflows/research.md", ctx },
    { destino: path.join(governancaDir, "workflows", "spec.md"), template: "workflows/spec.md", ctx },
    { destino: path.join(governancaDir, "workflows", "plan.md"), template: "workflows/plan.md", ctx },
    { destino: path.join(governancaDir, "workflows", "implement.md"), template: "workflows/implement.md", ctx },
    { destino: path.join(governancaDir, "workflows", "fix.md"), template: "workflows/fix.md", ctx },
    { destino: path.join(governancaDir, "workflows", "test.md"), template: "workflows/test.md", ctx },
    { destino: path.join(governancaDir, "workflows", "review.md"), template: "workflows/review.md", ctx },
    { destino: path.join(governancaDir, "skills", "criar-extrair-modelo.md"), template: "skills/criar-extrair-modelo.md", ctx },
    { destino: path.join(governancaDir, "templates", "extrair-modelo.ts.template"), template: "scripts/extrair-modelo.ts.template", ctx },
    { destino: path.join(governancaDir, "templates", "extrair-modelo-sqlite.ts.template"), template: "scripts/extrair-modelo-sqlite.ts.template", ctx },
    { destino: path.join(governancaDir, "templates", "extrair-modelo.ps1.template"), template: "scripts/extrair-modelo.ps1.template", ctx },
    { destino: path.join(governancaDir, "skills", "criar-instalador-desktop.md"), template: "skills/criar-instalador-desktop.md", ctx },
    { destino: path.join(governancaDir, "skills", "mapear-grafo-de-conhecimento.md"), template: "skills/mapear-grafo-de-conhecimento.md", ctx },
    { destino: path.join(governancaDir, "padroes", "frontend.md"), template: "padroes/frontend.md", ctx },
    { destino: path.join(governancaDir, "padroes", "backend.md"), template: "padroes/backend.md", ctx },
    { destino: path.join(governancaDir, "workflows", "release.md"), template: "workflows/release.md", ctx },
  ];

  const arquivosCondicionais: { condicao: boolean; destino: string; template: string }[] = [
    { condicao: ctx.ehMigracaoStack, destino: path.join(governancaDir, "skills", "migrar-stack-legada.md"), template: "skills/migrar-stack-legada.md" },
    { condicao: ctx.ehGas, destino: path.join(governancaDir, "skills", "auditar-repositorio-gas.md"), template: "skills/auditar-repositorio-gas.md" },
    { condicao: !params.regenerar, destino: path.join(governancaDir, "livro-arquitetura", "01-visao-geral.md"), template: "arquitetura/01-visao-geral.md" },
    { condicao: !params.regenerar, destino: path.join(governancaDir, "livro-arquitetura", "02-stack.md"), template: "arquitetura/02-stack.md" },
    { condicao: !params.regenerar, destino: path.join(governancaDir, "livro-arquitetura", "03-logica-do-sistema.md"), template: "arquitetura/03-logica-do-sistema.md" },
    { condicao: !params.regenerar, destino: path.join(governancaDir, "livro-arquitetura", "04-comportamento-autonomo.md"), template: "arquitetura/04-comportamento-autonomo.md" },
    { condicao: !params.regenerar, destino: path.join(governancaDir, "livro-arquitetura", "05-modelo-de-dados.md"), template: "arquitetura/05-modelo-de-dados.md" },
  ];

  for (const item of arquivosCondicionais) {
    if (item.condicao) {
      arquivos.push({ destino: item.destino, template: item.template, ctx });
    }
  }

  if (!fs.existsSync(path.join(governancaDir, "PRD.md"))) {
    arquivos.push({ destino: path.join(governancaDir, "PRD.md"), template: "PRD.md", ctx });
  }

  const caminhoSessao = path.join(governancaDir, "SESSAO.md");
  if (!fs.existsSync(caminhoSessao)) {
    arquivos.push({ destino: caminhoSessao, template: "SESSAO.md", ctx });
  }

  const ehVinculado = Boolean(repositorioExistente || fs.existsSync(path.join(governancaDir, "VINCULAR.md")));
  arquivos.push({
    destino: path.join(governancaDir, ehVinculado ? "VINCULAR.md" : "INICIO.md"),
    template: ehVinculado ? "VINCULAR.md" : "INICIO.md",
    ctx,
  });

  for (const { destino, template, ctx: templateCtx } of arquivos) {
    const conteudo = processarTemplate(template, templateCtx);
    fs.writeFileSync(destino, conteudo, "utf-8");
  }

  const catalogoMd = gerarCatalogoMarkdown();
  const catalogoPath = path.join(governancaDir, "skills", "CATALOGO_TECNOLOGIAS.md");
  fs.writeFileSync(catalogoPath, catalogoMd, "utf-8");

  const ownedFiles = new Set(arquivos.map(a => a.destino));
  ownedFiles.add(catalogoPath);
  limparArquivosObsoletos(ownedFiles, path.join(governancaDir, "skills"));

  // Sincroniza o harness (.agents/, CLAUDE.md, workflows e skills)
  configurarHarnessNoProjeto(caminhoAbs);

  return { sucesso: true, caminho: caminhoAbs };
}
