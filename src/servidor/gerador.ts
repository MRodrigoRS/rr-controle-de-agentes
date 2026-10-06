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
  modoRegeneracao?: "essencial" | "total";
  modoMigracao?: boolean;
}

const templatesBaseDir = path.resolve(process.cwd(), "src/templates");

function escanearTemplatesPasta(subpasta: string): string[] {
  const dir = path.join(templatesBaseDir, subpasta);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => fs.statSync(path.join(dir, f)).isFile());
}

function limparArquivosObsoletos(owned: Set<string>, dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const arquivo of fs.readdirSync(dir)) {
    const caminho = path.join(dir, arquivo);
    if (!owned.has(caminho) && fs.statSync(caminho).isFile()) {
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
  const caminhoRelativoRR = (rel === "" || rel === "." ? "." : path.isAbsolute(rel) ? raizRR : rel).replace(/\\/g, "/") + "/";

  const pastas = [
    governancaDir,
    path.join(governancaDir, "sprints"),
    path.join(governancaDir, "sprints", "concluidas"),
    path.join(governancaDir, "livro-arquitetura"),
    path.join(governancaDir, "livro-arquitetura", "decisoes"),
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
    // Arquivo mestre de regras (sempre atualizado)
    { destino: path.join(governancaDir, "AGENTS.md"), template: "AGENTS.md", ctx },
    // Histórico de mudanças da governança matriz (sempre atualizado)
    { destino: path.join(governancaDir, "CHANGELOG.md"), template: "CHANGELOG.md", ctx },
    // Template de sprints (sempre atualizado)
    { destino: path.join(governancaDir, "sprints", "_template.md"), template: "SPRINT.md", ctx: ctxSprint },
    // Stack oficial do projeto (sempre atualizada para refletir presets atuais)
    { destino: path.join(governancaDir, "livro-arquitetura", "02-stack.md"), template: "arquitetura/02-stack.md", ctx },
  ];

  // Ferramentas exclusivas de P&D da Matriz (nunca geradas em projetos satélites)
  const exclusivosMatriz = new Set([
    "skills/auditar-maturidade-governanca.md",
    "skills/CATALOGO_TECNOLOGIAS.md",
    "workflows/auditar-governanca.md",
    "relatorios/_template_evolucao_governanca.md",
  ]);

  // 1. Descoberta dinâmica de Skills
  for (const arquivo of escanearTemplatesPasta("skills")) {
    if (arquivo.endsWith(".md") && !exclusivosMatriz.has(`skills/${arquivo}`)) {
      arquivos.push({
        destino: path.join(governancaDir, "skills", arquivo),
        template: `skills/${arquivo}`,
        ctx,
      });
    }
  }

  // 2. Descoberta dinâmica de Workflows
  for (const arquivo of escanearTemplatesPasta("workflows")) {
    if (arquivo.endsWith(".md") && !exclusivosMatriz.has(`workflows/${arquivo}`)) {
      arquivos.push({
        destino: path.join(governancaDir, "workflows", arquivo),
        template: `workflows/${arquivo}`,
        ctx,
      });
    }
  }

  // 3. Descoberta dinâmica de Padrões
  for (const arquivo of escanearTemplatesPasta("padroes")) {
    if (arquivo.endsWith(".md") && !exclusivosMatriz.has(`padroes/${arquivo}`)) {
      arquivos.push({
        destino: path.join(governancaDir, "padroes", arquivo),
        template: `padroes/${arquivo}`,
        ctx,
      });
    }
  }

  // 4. Descoberta dinâmica de Relatórios
  for (const arquivo of escanearTemplatesPasta("relatorios")) {
    if (arquivo.endsWith(".md") && !exclusivosMatriz.has(`relatorios/${arquivo}`)) {
      arquivos.push({
        destino: path.join(governancaDir, "relatorios", arquivo),
        template: `relatorios/${arquivo}`,
        ctx,
      });
    }
  }

  // 5. Descoberta dinâmica de Scripts e Templates auxiliares
  for (const arquivo of escanearTemplatesPasta("scripts")) {
    const subpastaDestino = arquivo.endsWith(".template") ? "templates" : "scripts";
    arquivos.push({
      destino: path.join(governancaDir, subpastaDestino, arquivo),
      template: `scripts/${arquivo}`,
      ctx,
    });
  }

  const ehRegeneracaoTotal = params.modoRegeneracao === "total";

  // 6. Livros de arquitetura protegidos (sobrescreve apenas se for regeneração total)
  const outrosLivros = [
    { destino: path.join(governancaDir, "livro-arquitetura", "01-visao-geral.md"), template: "arquitetura/01-visao-geral.md" },
    { destino: path.join(governancaDir, "livro-arquitetura", "03-logica-do-sistema.md"), template: "arquitetura/03-logica-do-sistema.md" },
    { destino: path.join(governancaDir, "livro-arquitetura", "04-comportamento-autonomo.md"), template: "arquitetura/04-comportamento-autonomo.md" },
    { destino: path.join(governancaDir, "livro-arquitetura", "05-modelo-de-dados.md"), template: "arquitetura/05-modelo-de-dados.md" },
    { destino: path.join(governancaDir, "livro-arquitetura", "decisoes", "_template.md"), template: "arquitetura/decisoes/_template.md" },
  ];

  for (const item of outrosLivros) {
    if (ehRegeneracaoTotal || (!params.regenerar && !fs.existsSync(item.destino))) {
      arquivos.push({ destino: item.destino, template: item.template, ctx });
    }
  }

  // 7. PLANO.md — NUNCA sobrescreve no modo essencial/normal (proteção contra perda de dados)
  const caminhoPlano = path.join(governancaDir, "PLANO.md");
  if (ehRegeneracaoTotal || !fs.existsSync(caminhoPlano)) {
    arquivos.push({ destino: caminhoPlano, template: "PLANO.md", ctx });
  }

  // 8. PRD.md — NUNCA sobrescreve no modo essencial/normal
  const caminhoPrd = path.join(governancaDir, "PRD.md");
  if (ehRegeneracaoTotal || !fs.existsSync(caminhoPrd)) {
    arquivos.push({ destino: caminhoPrd, template: "PRD.md", ctx });
  }

  // 9. SESSAO.md — NUNCA sobrescreve no modo essencial/normal
  const caminhoSessao = path.join(governancaDir, "SESSAO.md");
  if (ehRegeneracaoTotal || !fs.existsSync(caminhoSessao)) {
    arquivos.push({ destino: caminhoSessao, template: "SESSAO.md", ctx });
  }

  // 10. INICIO.md ou VINCULAR.md
  const ehVinculado = Boolean(repositorioExistente || fs.existsSync(path.join(governancaDir, "VINCULAR.md")));
  const arquivoInicial = ehVinculado ? "VINCULAR.md" : "INICIO.md";
  arquivos.push({
    destino: path.join(governancaDir, arquivoInicial),
    template: arquivoInicial,
    ctx,
  });

  // Renderiza e grava todos os arquivos gerenciados
  for (const { destino, template, ctx: templateCtx } of arquivos) {
    const conteudo = processarTemplate(template, templateCtx);
    fs.writeFileSync(destino, conteudo, "utf-8");
  }

  // Gera o catálogo dinâmico de tecnologias
  const catalogoMd = gerarCatalogoMarkdown();
  const catalogoPath = path.join(governancaDir, "skills", "CATALOGO_TECNOLOGIAS.md");
  fs.writeFileSync(catalogoPath, catalogoMd, "utf-8");

  // Gera ou atualiza o arquivo de metadados da matriz (.matriz.json)
  const matrizMetaPath = path.join(governancaDir, ".matriz.json");
  const matrizMeta = {
    repositorio: "https://github.com/MRodrigoRS/rr-controle-de-agentes",
    branch: "master",
    versaoMatriz: "1.1.0",
    presetFrontend: presetFrontend.id,
    presetBackend: presetBackend.id,
    modoRegeneracaoUltimo: params.modoRegeneracao || (params.regenerar ? "essencial" : "criacao"),
    atualizadoEm: new Date().toISOString(),
  };
  fs.writeFileSync(matrizMetaPath, JSON.stringify(matrizMeta, null, 2), "utf-8");

  // Limpeza de arquivos obsoletos em todas as pastas gerenciadas
  const ownedFiles = new Set(arquivos.map((a) => a.destino));
  ownedFiles.add(catalogoPath);
  ownedFiles.add(matrizMetaPath);

  limparArquivosObsoletos(ownedFiles, path.join(governancaDir, "skills"));
  limparArquivosObsoletos(ownedFiles, path.join(governancaDir, "workflows"));
  limparArquivosObsoletos(ownedFiles, path.join(governancaDir, "padroes"));
  limparArquivosObsoletos(ownedFiles, path.join(governancaDir, "relatorios"));
  limparArquivosObsoletos(ownedFiles, path.join(governancaDir, "templates"));
  limparArquivosObsoletos(ownedFiles, path.join(governancaDir, "scripts"));

  // Sincroniza o harness (.agents/, CLAUDE.md, workflows e skills)
  configurarHarnessNoProjeto(caminhoAbs);

  return { sucesso: true, caminho: caminhoAbs };
}
