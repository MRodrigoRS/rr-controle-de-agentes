#!/usr/bin/env node
/**
 * Sincroniza a governança deste projeto a partir do repositório matriz da RR Tech Studio.
 * Zero dependências externas — executa com Node.js nativo (18+) em qualquer máquina ou SO.
 *
 * Modos de Uso:
 *   node governanca/scripts/sincronizar.mjs           -> Modo Essencial (Seguro): atualiza padrões, workflows e skills sem alterar contexto local.
 *   node governanca/scripts/sincronizar.mjs --total   -> Modo Total (Hard Reset): regenera tudo a partir da matriz (exige confirmação e cria backup).
 *   node governanca/scripts/sincronizar.mjs --total -y -> Modo Total sem confirmação interativa (automação/CI).
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "../..");
const govDir = path.join(raiz, "governanca");
const matrizConfigPath = path.join(govDir, ".matriz.json");

if (!fs.existsSync(govDir)) {
  console.error("❌ Erro: Pasta governanca/ não encontrada em " + raiz);
  process.exit(1);
}

// 1. Carregar configuração da matriz
let configMatriz = {
  repositorio: "https://github.com/MRodrigoRS/rr-controle-de-agentes",
  branch: "master",
  versaoMatriz: "1.1.0",
};

if (fs.existsSync(matrizConfigPath)) {
  try {
    const raw = fs.readFileSync(matrizConfigPath, "utf-8");
    configMatriz = { ...configMatriz, ...JSON.parse(raw) };
  } catch (err) {
    console.warn("⚠️ Aviso: Não foi possível ler .matriz.json. Usando padrões.");
  }
}

// 2. Processar argumentos
const args = process.argv.slice(2);
const ehModoTotal = args.includes("--total") || args.includes("-t");
const pularConfirmacao = args.includes("--sim") || args.includes("-y") || args.includes("--forcar");

const branchArgIdx = args.findIndex((a) => a === "--branch" || a === "-b");
if (branchArgIdx !== -1 && args[branchArgIdx + 1]) {
  configMatriz.branch = args[branchArgIdx + 1];
}

// Extrai owner e repo da URL
let repoOwner = "MRodrigoRS";
let repoName = "rr-controle-de-agentes";
try {
  const urlParts = configMatriz.repositorio.replace(/\.git$/, "").split("/");
  if (urlParts.length >= 2) {
    repoName = urlParts.pop() || repoName;
    repoOwner = urlParts.pop() || repoOwner;
  }
} catch {
  // Mantém padrão
}

async function main() {
  console.log("\n========================================================");
  console.log(`📡 RR Tech Studio — Sincronizador de Governança`);
  console.log(`   Origem: ${repoOwner}/${repoName} (${configMatriz.branch})`);
  console.log(`   Modo: ${ehModoTotal ? "🔴 TOTAL (Hard Reset)" : "🟢 ESSENCIAL (Seguro)"}`);
  console.log("========================================================\n");

  // 3. Travas de segurança para o modo Total
  if (ehModoTotal) {
    console.log("⚠️  ATENÇÃO: VOCÊ SELECIONOU O MODO DE REGENERAÇÃO TOTAL!");
    console.log("   Esta ação irá sobrescrever TODOS os arquivos da governança,");
    console.log("   incluindo SESSAO.md, PRD.md, sprints/ e livro-arquitetura/.");
    console.log("   Um backup automático será criado antes da substituição.\n");

    if (!pularConfirmacao) {
      const rl = readline.createInterface({ input, output });
      const resposta = await rl.question("Digite 'REGENERAR TUDO' para confirmar: ");
      rl.close();

      if (resposta.trim() !== "REGENERAR TUDO") {
        console.log("\n❌ Operação cancelada. Nenhum arquivo foi modificado.\n");
        process.exit(0);
      }
    }

    // Criar backup prévio
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(raiz, `.backup-governanca-${ts}`);
    console.log(`💾 Criando backup prévio em: ${path.basename(backupDir)}...`);
    fs.cpSync(govDir, backupDir, { recursive: true });
    console.log("✅ Backup salvo com sucesso!\n");
  }

  // 4. Estratégia de obtenção dos arquivos (Local com fallback para Remoto GitHub)
  let sucessoObtencao = false;

  // Tentativa A: Progenitora presente localmente
  const caminhosLocaisPossiveis = [
    path.resolve(raiz, "..", "rr-controle-de-agentes-1.1"),
    path.resolve(raiz, "..", "rr-controle-de-agentes"),
    path.resolve(raiz, "..", repoName),
    path.resolve(process.cwd()),
  ];

  let progenitoraLocal = null;
  for (const c of caminhosLocaisPossiveis) {
    if (fs.existsSync(path.join(c, "src", "templates")) && c !== raiz) {
      progenitoraLocal = c;
      break;
    }
  }

  if (progenitoraLocal) {
    console.log(`📁 Fonte local detectada em: ${progenitoraLocal}`);
    sucessoObtencao = sincronizarDeOrigemLocal(progenitoraLocal);
  }

  // Tentativa B: Remoto via GitHub API / Raw
  if (!sucessoObtencao) {
    console.log(`🌐 Buscando atualizações remotas via GitHub (${repoOwner}/${repoName})...`);
    sucessoObtencao = await sincronizarDeGitHubRemoto();
  }

  if (!sucessoObtencao) {
    console.error("\n❌ Não foi possível sincronizar da matriz. Verifique sua conexão ou configuração.");
    process.exit(1);
  }

  // 5. Atualizar metadados (.matriz.json)
  configMatriz.atualizadoEm = new Date().toISOString();
  configMatriz.modoRegeneracaoUltimo = ehModoTotal ? "total" : "essencial";
  fs.writeFileSync(matrizConfigPath, JSON.stringify(configMatriz, null, 2), "utf-8");

  // 6. Invocar o script do harness para refletir as mudanças em .agents/
  const harnessScript = path.join(govDir, "scripts", "harness.mjs");
  if (fs.existsSync(harnessScript)) {
    console.log("\n⚙️  Re-sincronizando o harness do agente local (.agents/)...");
    const { execSync } = await import("node:child_process");
    try {
      execSync(`node "${harnessScript}"`, { stdio: "inherit", cwd: raiz });
    } catch {
      console.warn("⚠️ Não foi possível rodar harness.mjs automaticamente.");
    }
  }

  console.log(`\n🎉 Governança sincronizada com sucesso no modo ${ehModoTotal ? "TOTAL" : "ESSENCIAL"}!\n`);
}

function sincronizarDeOrigemLocal(caminhoOrigem) {
  try {
    const templatesDir = path.join(caminhoOrigem, "src", "templates");
    copiarPastasMatriz(templatesDir, caminhoOrigem);
    return true;
  } catch (err) {
    console.warn("⚠️ Falha na cópia local: " + err.message);
    return false;
  }
}

async function sincronizarDeGitHubRemoto() {
  const headers = { "User-Agent": "RR-Controle-De-Agentes-Sync" };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    // Busca árvore de arquivos recursiva via GitHub API
    const treeUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/${configMatriz.branch}?recursive=1`;
    const res = await fetch(treeUrl, { headers });

    if (!res.ok) {
      console.warn(`⚠️ API do GitHub retornou status ${res.status}: ${res.statusText}`);
      return false;
    }

    const data = await res.json();
    if (!data.tree || !Array.isArray(data.tree)) {
      return false;
    }

    const arquivosTemplates = data.tree.filter((item) =>
      item.type === "blob" && (item.path.startsWith("src/templates/") || item.path.endsWith("CATALOGO_TECNOLOGIAS.md"))
    );

    console.log(`📦 Encontrados ${arquivosTemplates.length} arquivos gerenciados na matriz.`);

    for (const item of arquivosTemplates) {
      const relPath = item.path.replace(/^src\/templates\//, "");

      // Verifica se é arquivo protegido no modo essencial
      if (!ehModoTotal) {
        if (
          relPath.startsWith("arquitetura/01-") ||
          relPath.startsWith("arquitetura/03-") ||
          relPath.startsWith("arquitetura/04-") ||
          relPath.startsWith("arquitetura/05-") ||
          relPath === "PLANO.md" ||
          relPath === "PRD.md" ||
          relPath === "SESSAO.md"
        ) {
          continue; // Protegido!
        }
      }

      // Determinar destino no projeto
      let destRel = null;
      if (item.path.endsWith("CATALOGO_TECNOLOGIAS.md")) {
        destRel = path.join("skills", "CATALOGO_TECNOLOGIAS.md");
      } else if (relPath === "CHANGELOG.md") {
        destRel = "CHANGELOG.md";
      } else if (relPath.startsWith("padroes/")) {
        destRel = relPath;
      } else if (relPath.startsWith("workflows/")) {
        destRel = relPath;
      } else if (relPath.startsWith("skills/")) {
        destRel = relPath;
      } else if (relPath.startsWith("relatorios/")) {
        destRel = relPath;
      } else if (relPath.startsWith("scripts/")) {
        destRel = path.join("templates", path.basename(relPath));
      } else if (ehModoTotal && relPath.startsWith("arquitetura/")) {
        destRel = path.join("livro-arquitetura", relPath.replace(/^arquitetura\//, ""));
      } else if (ehModoTotal && (relPath === "SESSAO.md" || relPath === "PRD.md" || relPath === "PLANO.md")) {
        destRel = relPath;
      }

      if (!destRel) continue;

      const destAbs = path.join(govDir, destRel);
      fs.mkdirSync(path.dirname(destAbs), { recursive: true });

      // Baixa o conteúdo cru do arquivo
      const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${configMatriz.branch}/${item.path}`;
      const rawRes = await fetch(rawUrl, { headers });
      if (rawRes.ok) {
        const conteudo = await rawRes.text();
        fs.writeFileSync(destAbs, conteudo, "utf-8");
      }
    }

    return true;
  } catch (err) {
    console.warn("⚠️ Falha no download remoto: " + err.message);
    return false;
  }
}

function copiarPastasMatriz(templatesDir, raizOrigem) {
  const subpastas = ["padroes", "workflows", "skills", "relatorios"];

  for (const sub of subpastas) {
    const srcDir = path.join(templatesDir, sub);
    const destDir = path.join(govDir, sub);
    if (fs.existsSync(srcDir)) {
      fs.mkdirSync(destDir, { recursive: true });
      for (const f of fs.readdirSync(srcDir)) {
        if (f.endsWith(".md")) {
          fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
        }
      }
    }
  }

  // CHANGELOG da matriz
  const changelogOrigem = path.join(templatesDir, "CHANGELOG.md");
  const changelogDest = path.join(govDir, "CHANGELOG.md");
  if (fs.existsSync(changelogOrigem)) {
    fs.copyFileSync(changelogOrigem, changelogDest);
  }

  // Catálogo de tecnologias
  const catalogoSrc = path.join(govDir, "skills", "CATALOGO_TECNOLOGIAS.md");
  const catalogoOrigem = path.join(raizOrigem, "governanca", "skills", "CATALOGO_TECNOLOGIAS.md");
  if (fs.existsSync(catalogoOrigem)) {
    fs.copyFileSync(catalogoOrigem, catalogoSrc);
  }

  // Scripts templates
  const scriptsSrc = path.join(templatesDir, "scripts");
  const templatesDest = path.join(govDir, "templates");
  if (fs.existsSync(scriptsSrc)) {
    fs.mkdirSync(templatesDest, { recursive: true });
    for (const f of fs.readdirSync(scriptsSrc)) {
      fs.copyFileSync(path.join(scriptsSrc, f), path.join(templatesDest, f));
    }
  }

  // No modo total, copia também os livros de arquitetura e arquivos base
  if (ehModoTotal) {
    const arqSrc = path.join(templatesDir, "arquitetura");
    const arqDest = path.join(govDir, "livro-arquitetura");
    if (fs.existsSync(arqSrc)) {
      fs.mkdirSync(arqDest, { recursive: true });
      for (const f of fs.readdirSync(arqSrc)) {
        if (f.endsWith(".md")) {
          fs.copyFileSync(path.join(arqSrc, f), path.join(arqDest, f));
        }
      }
    }

    for (const f of ["SESSAO.md", "PRD.md", "PLANO.md"]) {
      const srcFile = path.join(templatesDir, f);
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, path.join(govDir, f));
      }
    }
  }
}

main().catch((err) => {
  console.error("❌ Erro fatal durante a sincronização:", err);
  process.exit(1);
});
