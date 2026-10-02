import fs from "fs";
import path from "path";
import { processarTemplate } from "@/servidor/templates";
import { obterTodasTecnologias } from "@/servidor/db";

interface ErroValidacao {
  arquivo: string;
  tipo: "ERRO" | "AVISO";
  mensagem: string;
}

const templatesDir = path.resolve(process.cwd(), "src/templates");

function listarTemplatesRecursivo(dir: string): string[] {
  const arquivos: string[] = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const caminho = path.join(dir, item.name);
    if (item.isDirectory()) {
      arquivos.push(...listarTemplatesRecursivo(caminho));
    } else {
      arquivos.push(caminho);
    }
  }
  return arquivos;
}

const contextoMockPadrao: Record<string, unknown> = {
  nomeProjeto: "projeto-teste",
  descricao: "Descrição do projeto de teste",
  frontend: "Next.js (App Router)",
  backend: "Node.js / PostgreSQL",
  clausulas: "- **Cláusula 1:** Exemplo de cláusula",
  qualidade: "- **Qualidade 1:** Exemplo de critério de qualidade",
  temPresets: true,
  ehMigracaoStack: true,
  branchSugerida: "refactor/migracao-para-nextjs-app-router",
  planoImportado: false,
  caminhoRR: "../../rr-controle-de-agentes/",
  categoriasLista: "Web, Mobile, Desktop",
  data: "2026-09-03",
  frontendFramework: "Next.js 16",
  frontendEstilo: "Tailwind CSS 4",
  frontendTestes: "Vitest",
  backendRuntime: "Node.js 22",
  backendBanco: "PostgreSQL 16",
  backendORM: "Prisma",
  lint: "Biome",
  formatacao: "Biome",
  cicd: "GitHub Actions",
  stackFrontend: "Next.js, React, Tailwind CSS",
  stackBackend: "Node.js, PostgreSQL",
  tabelaStackFrontend: "| ID | Tecnologia | Categoria | Papel / Responsabilidade |\n|:--:|---|---|---|\n| 1 | **React** | Frontend | Base UI |",
  tabelaStackBackend: "| ID | Tecnologia | Categoria | Papel / Responsabilidade |\n|:--:|---|---|---|\n| 2 | **Node.js** | Backend | Runtime |",
  stackCategorizadaFrontend: "  - **Frontend:** React 19, Next.js 16\n  - **Estilo:** Tailwind CSS 4",
  stackCategorizadaBackend: "  - **Backend:** Node.js 22\n  - **Banco:** PostgreSQL 16",
  numero: "1",
  titulo: "Setup Inicial",
  objetivo: "Configurar a infraestrutura inicial do projeto",
  numeroEtapa: "1.1",
  tituloEtapa: "Estruturação de pastas",
  objetivoEtapa: "Criar árvore de diretórios",
  comandoTeste: "npm test",
  sugestaoCommit: "feat: setup inicial",
};

export function validarIntegridadeReferencialPresets(): boolean {
  console.log("🔗 Verificando integridade referencial dos Presets x Catálogo SQLite...");
  const presetsPath = path.resolve(process.cwd(), "src/servidor/dados/presets.json");
  if (!fs.existsSync(presetsPath)) return true;

  const presets = JSON.parse(fs.readFileSync(presetsPath, "utf-8"));
  const tecnologias = obterTodasTecnologias();
  const idSet = new Set(tecnologias.map((t) => t.id));

  let erros = 0;
  const todosPresets = [...(presets.frontend || []), ...(presets.backend || [])];
  for (const p of todosPresets) {
    for (const id of p.tecnologiaIds || []) {
      if (!idSet.has(id)) {
        console.error(`❌ Preset "${p.id}" referencia tecnologiaId inexistente: ${id}`);
        erros++;
      }
    }
  }

  if (erros === 0) {
    console.log(`✅ Todos os ${todosPresets.length} presets possuem integridade referencial 100% válida.\n`);
    return true;
  }
  return false;
}

export function validarIntegridadeReferenciasSkills(): boolean {
  console.log("🛡️ Verificando integridade de referências a skills em todos os templates...");
  const skillsDir = path.resolve(templatesDir, "skills");
  if (!fs.existsSync(skillsDir)) return true;

  const skillsExistentes = new Set(
    fs
      .readdirSync(skillsDir)
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(/\.md$/, ""))
  );

  const arquivos = listarTemplatesRecursivo(templatesDir).filter((f) => f.endsWith(".md"));
  let erros = 0;

  // Regex para identificar caminhos explícitos a skills:
  // ex: governanca/skills/nome.md, skills/nome.md, ou links markdown
  const regexCaminhoSkill = /(?:governanca\/skills\/|skills\/)([\w-]+)(?:\.md)?/g;

  for (const caminhoAbs of arquivos) {
    const nomeRelativo = path.relative(templatesDir, caminhoAbs).replace(/\\/g, "/");
    const conteudo = fs.readFileSync(caminhoAbs, "utf-8");

    let match;
    while ((match = regexCaminhoSkill.exec(conteudo)) !== null) {
      const nomeSkill = match[1];
      // Ignora parâmetros ou o próprio nome de diretório
      if (nomeSkill.startsWith("{{") || nomeSkill === "skills") continue;

      if (!skillsExistentes.has(nomeSkill)) {
        console.error(`❌ [${nomeRelativo}] Referência quebrada para skill inexistente ou renomeada: "${match[0]}"`);
        erros++;
      }
    }
  }

  if (erros === 0) {
    console.log(`✅ Todas as referências a skills (${skillsExistentes.size} skills existentes) estão 100% íntegras.\n`);
    return true;
  }
  return false;
}

export function validarTemplates(): boolean {
  console.log("\n🔍 Iniciando validação de templates em src/templates...\n");

  const okIntegridade = validarIntegridadeReferencialPresets();
  if (!okIntegridade) return false;

  const okSkills = validarIntegridadeReferenciasSkills();
  if (!okSkills) return false;

  if (!fs.existsSync(templatesDir)) {
    console.error(`❌ Diretório de templates não encontrado: ${templatesDir}`);
    return false;
  }

  const arquivos = listarTemplatesRecursivo(templatesDir);
  const problemas: ErroValidacao[] = [];
  let templatesAprovados = 0;

  for (const caminhoAbs of arquivos) {
    const nomeRelativo = path.relative(templatesDir, caminhoAbs).replace(/\\/g, "/");
    const conteudo = fs.readFileSync(caminhoAbs, "utf-8");
    let temErroNoArquivo = false;

    // 1. Checagem de chaves órfãs ou não fechadas
    const semTagsValidas = conteudo.replace(/\{\{[^}]*\}\}/g, "");
    if (semTagsValidas.includes("{{")) {
      problemas.push({
        arquivo: nomeRelativo,
        tipo: "ERRO",
        mensagem: "Identificador '{{' sem fechamento correspondente '}}'",
      });
      temErroNoArquivo = true;
    }
    if (semTagsValidas.includes("}}")) {
      problemas.push({
        arquivo: nomeRelativo,
        tipo: "ERRO",
        mensagem: "Fechamento '}}' órfão sem abertura correspondente '{{'",
      });
      temErroNoArquivo = true;
    }

    // 2. Balanço de blocos {{#if ...}} e {{/if}}
    const ifsAbertos = (conteudo.match(/\{\{#if\s+[\w.-]+\}\}/g) || []).length;
    const ifsFechados = (conteudo.match(/\{\{\/if\}\}/g) || []).length;
    if (ifsAbertos !== ifsFechados) {
      problemas.push({
        arquivo: nomeRelativo,
        tipo: "ERRO",
        mensagem: `Balanço de blocos if incorreto: ${ifsAbertos} {{#if}} abertos vs ${ifsFechados} {{/if}} fechados`,
      });
      temErroNoArquivo = true;
    }

    // 3. Renderização Mock em dois cenários (flags verdadeiras e falsas)
    try {
      const renderTrue = processarTemplate(nomeRelativo, contextoMockPadrao);
      const contextoFalso = { ...contextoMockPadrao };
      Object.keys(contextoFalso).forEach((k) => {
        if (typeof contextoFalso[k] === "boolean") {
          contextoFalso[k] = false;
        }
      });
      const renderFalse = processarTemplate(nomeRelativo, contextoFalso);

      // 4. Verificar se sobrou alguma variável não interpolada {{variavel}}
      const variaveisNaoResolvidas = renderTrue.match(/\{\{([\w.-]+)\}\}/g);
      if (variaveisNaoResolvidas) {
        const unicas = Array.from(new Set(variaveisNaoResolvidas));
        problemas.push({
          arquivo: nomeRelativo,
          tipo: "AVISO",
          mensagem: `Variáveis não resolvidas com o contexto padrão: ${unicas.join(", ")}`,
        });
      }

      // 5. Verificar se sobrou {{#if}} ou {{/if}} não processado
      if (renderTrue.includes("{{#if") || renderTrue.includes("{{/if}}") || renderFalse.includes("{{#if") || renderFalse.includes("{{/if}}")) {
        problemas.push({
          arquivo: nomeRelativo,
          tipo: "ERRO",
          mensagem: "Tags condicionais {{#if}} não foram completamente processadas pelo template engine",
        });
        temErroNoArquivo = true;
      }
    } catch (err) {
      problemas.push({
        arquivo: nomeRelativo,
        tipo: "ERRO",
        mensagem: `Falha ao processar template: ${err instanceof Error ? err.message : String(err)}`,
      });
      temErroNoArquivo = true;
    }

    if (!temErroNoArquivo) {
      templatesAprovados++;
    }
  }

  // Relatório Final
  console.log(`📋 Total de templates analisados: ${arquivos.length}`);
  console.log(`✅ Templates aprovados sem erros críticos: ${templatesAprovados}/${arquivos.length}\n`);

  if (problemas.length > 0) {
    console.log("⚠️ Ocorrências encontradas:\n");
    for (const p of problemas) {
      const icon = p.tipo === "ERRO" ? "❌" : "⚠️";
      console.log(` ${icon} [${p.tipo}] ${p.arquivo}: ${p.mensagem}`);
    }
    console.log("");
  }

  const errosCriticos = problemas.filter((p) => p.tipo === "ERRO").length;
  if (errosCriticos > 0) {
    console.error(`💥 Validação falhou com ${errosCriticos} erro(s) crítico(s).\n`);
    return false;
  }

  console.log("🎉 Todos os templates e presets passaram com sucesso na validação de integridade!\n");
  return true;
}

if (require.main === module) {
  const ok = validarTemplates();
  process.exit(ok ? 0 : 1);
}
