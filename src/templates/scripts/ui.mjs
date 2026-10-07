#!/usr/bin/env node
/**
 * ⚠️ ARQUIVO GERADO AUTOMATICAMENTE — NÃO EDITE DIRETAMENTE
 * 
 * Fonte: src/satelite-ui/ (views/, client/, server/)
 * Para modificar esta interface, edite os fontes modulares em src/satelite-ui/ e execute:
 *   npm run build:ui
 * 
 * RR Tech Studio — Interface Web Dedicada do Projeto Satélite (Zero Dependências)
 */

/**
 * RR Tech Studio — Interface Web Dedicada do Projeto Satélite
 * 
 * Sobe um servidor HTTP local nativo (Node.js 18+) com visual moderno
 * idêntico ao painel da progenitora, permitindo navegar por métricas vivas,
 * arquivos de governança, stack tecnológica e disparar sincronizações com a matriz.
 * 
 * Zero dependências externas — executa em qualquer máquina ou sistema operacional.
 * 
 * Uso:
 *   node governanca/scripts/ui.mjs
 *   node governanca/scripts/ui.mjs --port 3334
 *   node governanca/scripts/ui.mjs --no-open
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { execFileSync, execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ehSubpastaScripts =
  path.basename(__dirname) === "scripts" &&
  path.basename(path.dirname(__dirname)) === "governanca";
const raiz = ehSubpastaScripts ? path.resolve(__dirname, "../..") : process.cwd();
const govDir = path.join(raiz, "governanca");
const matrizPath = path.join(govDir, ".matriz.json");
const packageJsonPath = path.join(raiz, "package.json");

// Processamento de argumentos
const args = process.argv.slice(2);
const naoAbrir = args.includes("--no-open") || args.includes("-n");
let porta = 3333;
const portIdx = args.findIndex((a) => a === "--port" || a === "-p");
if (portIdx !== -1 && args[portIdx + 1]) {
  porta = parseInt(args[portIdx + 1], 10) || 3333;
}

// Extensões de arquivos binários ignoradas na contagem de linhas
const EXTENSOES_BINARIAS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".svg", ".pdf",
  ".zip", ".tar", ".gz", ".7z", ".rar", ".exe", ".dll", ".so", ".bin",
  ".woff", ".woff2", ".ttf", ".eot", ".mp3", ".mp4", ".wav", ".db", ".sqlite", ".sqlite3"
]);

function formatarTempoRelativo(dataMs) {
  const diffMs = Math.max(0, Date.now() - dataMs);
  const seg = Math.floor(diffMs / 1000);
  if (seg < 60) return "agora há pouco";
  const min = Math.floor(seg / 60);
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const dias = Math.floor(h / 24);
  if (dias < 7) return `há ${dias} dia${dias > 1 ? "s" : ""}`;
  const semanas = Math.floor(dias / 7);
  if (semanas < 5) return `há ${semanas} semana${semanas > 1 ? "s" : ""}`;
  const meses = Math.floor(dias / 30);
  if (meses < 12) return `há ${meses} m${meses > 1 ? "eses" : "ês"}`;
  const anos = Math.floor(meses / 12);
  return `há ${anos} ano${anos > 1 ? "s" : ""}`;
}

function formatarTokensEstimados(caracteres) {
  if (!caracteres || caracteres <= 0) return "0 tokens";
  const tokens = Math.round(caracteres / 3.8);
  if (tokens >= 1_000_000) {
    return `~${(tokens / 1_000_000).toFixed(1).replace(".", ",")}M tokens`;
  }
  if (tokens >= 1_000) {
    return `~${Math.round(tokens / 1_000)}k tokens`;
  }
  return `~${tokens} tokens`;
}

function ehRaizGit(caminho) {
  try {
    if (!fs.existsSync(caminho)) return false;
    const toplevel = execFileSync("git", ["-C", caminho, "rev-parse", "--show-toplevel"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 1500,
      windowsHide: true,
    }).trim();
    return path.resolve(toplevel).toLowerCase() === path.resolve(caminho).toLowerCase();
  } catch {
    return false;
  }
}

function obterMetadadosGit(caminho) {
  try {
    if (!ehRaizGit(caminho)) return null;
    const branch = execFileSync("git", ["-C", caminho, "branch", "--show-current"], {
      encoding: "utf-8",
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 1500,
      windowsHide: true,
    }).trim() || "HEAD";

    const out = execFileSync(
      "git",
      ["-C", caminho, "log", "-1", "--format=%ct|%cI|%h|%an|%s"],
      { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"], timeout: 2000, windowsHide: true }
    ).trim();

    if (!out) return { branch, semCommits: true };
    const [unix, iso, hash, autor, ...msgParts] = out.split("|");
    const gitTs = Number(unix) * 1000;

    return {
      branch,
      timestamp: gitTs,
      iso,
      hash,
      autor,
      mensagem: msgParts.join("|"),
      relativo: formatarTempoRelativo(gitTs),
    };
  } catch {
    return null;
  }
}

function obterHistoricoGit(caminho, limite = 7) {
  try {
    if (!ehRaizGit(caminho)) return [];
    const out = execFileSync(
      "git",
      ["-C", caminho, "log", `-${limite}`, "--format=%h|%an|%ct|%s"],
      { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"], timeout: 3000, windowsHide: true }
    ).trim();
    if (!out) return [];
    return out.split(/\r?\n/).map((linha) => {
      const [hash, autor, unix, ...msg] = linha.split("|");
      return {
        hash,
        autor,
        relativo: formatarTempoRelativo(Number(unix) * 1000),
        mensagem: msg.join("|"),
      };
    });
  } catch {
    return [];
  }
}

function obterMetricasCodigo(caminho) {
  try {
    if (!ehRaizGit(caminho)) return null;
    const out = execFileSync("git", ["-C", caminho, "ls-files"], {
      encoding: "utf-8",
      timeout: 5000,
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    });

    const arquivos = out.split(/\r?\n/).filter(Boolean);
    let totalLinhas = 0;
    let totalCaracteres = 0;
    let arquivosTexto = 0;

    for (const f of arquivos) {
      const ext = path.extname(f).toLowerCase();
      if (EXTENSOES_BINARIAS.has(ext)) continue;
      try {
        const fullPath = path.join(caminho, f);
        const conteudo = fs.readFileSync(fullPath, "utf-8");
        if (conteudo.includes("\0")) continue;
        totalLinhas += conteudo.split("\n").length;
        totalCaracteres += conteudo.length;
        arquivosTexto++;
      } catch {
        // Ignora arquivos que falharem na leitura
      }
    }

    return {
      totalLinhas,
      totalCaracteres,
      totalArquivos: arquivosTexto,
      tokensEstimados: formatarTokensEstimados(totalCaracteres),
    };
  } catch {
    return null;
  }
}

function listarArquivosRecursivo(dir, ext = ".md") {
  if (!fs.existsSync(dir)) return [];
  const resultado = [];
  function walk(d, prefix = "") {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.isDirectory()) walk(path.join(d, e.name), rel);
      else if (!ext || e.name.endsWith(ext)) resultado.push(rel);
    }
  }
  walk(dir);
  return resultado;
}

function obterHistoricoLinhasCommits(caminhoProjeto, limit = 10, offset = 0) {
  const respostaVazia = {
    pontos: [],
    totalCommits: 0,
    temMais: false,
    offset,
    limit,
  };

  try {
    if (!ehRaizGit(caminhoProjeto)) return respostaVazia;

    const countOut = execFileSync("git", ["-C", caminhoProjeto, "rev-list", "--count", "HEAD"], {
      encoding: "utf-8",
      timeout: 3000,
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    }).trim();

    const totalCommits = parseInt(countOut, 10);
    if (isNaN(totalCommits) || totalCommits === 0) return respostaVazia;

    const commitHead = obterMetadadosGit(caminhoProjeto);
    const metricasHead = commitHead ? obterMetricasCodigo(caminhoProjeto) : null;
    const totalLinhasHead = metricasHead ? metricasHead.totalLinhas : 0;

    const quantidadeBuscar = Math.min(totalCommits, offset + limit);
    if (quantidadeBuscar <= 0) return respostaVazia;

    const logOut = execFileSync(
      "git",
      [
        "-C",
        caminhoProjeto,
        "log",
        `-n`,
        String(quantidadeBuscar),
        "--shortstat",
        "--format=COMMIT|%h|%s|%cd|%ct",
        "--date=short",
      ],
      {
        encoding: "utf-8",
        timeout: 5000,
        stdio: ["ignore", "pipe", "ignore"],
        windowsHide: true,
      }
    );

    const linhas = logOut.split(/\r?\n/);
    const commitsBrutos = [];
    let commitAtual = null;

    for (const linha of linhas) {
      if (linha.startsWith("COMMIT|")) {
        if (commitAtual) {
          commitsBrutos.push(commitAtual);
        }
        const [, hash, mensagem, data, unixTs] = linha.split("|");
        commitAtual = {
          hash: hash || "",
          mensagem: mensagem || "",
          data: data || "",
          timestamp: (parseInt(unixTs, 10) || 0) * 1000,
          insercoes: 0,
          delecoes: 0,
        };
      } else if (commitAtual && linha.includes("changed")) {
        const insMatch = linha.match(/(\d+)\s+insertion/);
        const delMatch = linha.match(/(\d+)\s+deletion/);
        if (insMatch) commitAtual.insercoes = parseInt(insMatch[1], 10);
        if (delMatch) commitAtual.delecoes = parseInt(delMatch[1], 10);
      }
    }
    if (commitAtual) {
      commitsBrutos.push(commitAtual);
    }

    let linhasAcumuladas = totalLinhasHead;
    const todosCalculados = [];

    for (let i = 0; i < commitsBrutos.length; i++) {
      const c = commitsBrutos[i];
      todosCalculados.push({
        hash: c.hash,
        mensagem: c.mensagem,
        data: c.data,
        timestamp: c.timestamp,
        linhasTotais: Math.max(0, linhasAcumuladas),
        insercoes: c.insercoes,
        delecoes: c.delecoes,
      });

      const deltaLiquido = c.insercoes - c.delecoes;
      linhasAcumuladas -= deltaLiquido;
    }

    const fatia = todosCalculados.slice(offset, offset + limit).reverse();

    return {
      pontos: fatia,
      totalCommits,
      temMais: offset + limit < totalCommits,
      offset,
      limit,
    };
  } catch (error) {
    return respostaVazia;
  }
}

function obterDadosProjeto() {
  let nome = path.basename(raiz);
  let descricao = "";

  if (fs.existsSync(packageJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
      if (pkg.name) nome = pkg.name;
      if (pkg.description) descricao = pkg.description;
    } catch {
      // ignore
    }
  }

  let matriz = null;
  if (fs.existsSync(matrizPath)) {
    try {
      matriz = JSON.parse(fs.readFileSync(matrizPath, "utf-8"));
    } catch {
      // ignore
    }
  }

  const stackPath = path.join(govDir, "livro-arquitetura", "02-stack.md");
  let conteudoStack = "";
  if (fs.existsSync(stackPath)) {
    try {
      conteudoStack = fs.readFileSync(stackPath, "utf-8");
    } catch {
      // ignore
    }
  }

  const padroes = listarArquivosRecursivo(path.join(govDir, "padroes"));
  const workflows = listarArquivosRecursivo(path.join(govDir, "workflows"));
  const skills = listarArquivosRecursivo(path.join(govDir, "skills"));
  const arquitetura = listarArquivosRecursivo(path.join(govDir, "livro-arquitetura"));
  const sprints = listarArquivosRecursivo(path.join(govDir, "sprints"));

  const avulsos = [];
  for (const f of ["SESSAO.md", "PRD.md", "PLANO.md", "CHANGELOG.md", "INICIO.md", "AGENTS.md"]) {
    if (fs.existsSync(path.join(govDir, f))) {
      avulsos.push(f);
    }
  }

  const git = obterMetadadosGit(raiz);
  const metricas = obterMetricasCodigo(raiz);
  const historico = obterHistoricoGit(raiz, 6);
  const historicoLinhas = obterHistoricoLinhasCommits(raiz, 10, 0);

  return {
    nome,
    descricao,
    caminho: raiz,
    matriz,
    git,
    metricas,
    historico,
    historicoLinhas,
    temStack: !!conteudoStack,
    arquivos: {
      padroes,
      workflows,
      skills,
      arquitetura,
      sprints,
      avulsos,
    },
  };
}

function abrirNavegador(url) {
  try {
    const platform = process.platform;
    if (platform === "win32") {
      execSync(`start "" "${url}"`, { windowsHide: true });
    } else if (platform === "darwin") {
      execSync(`open "${url}"`);
    } else {
      execSync(`xdg-open "${url}"`);
    }
  } catch {
    // Ignora se o comando falhar no ambiente headless
  }
}

// Template HTML moderno (GitHub Dark, responsivo, Marked.js via CDN com fallback nativo)
const PAGINA_HTML_EMBARCADA = "<!DOCTYPE html>\n<html lang=\"pt-BR\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>RR Tech Studio — Painel do Projeto</title>\n  <script src=\"https://cdn.jsdelivr.net/npm/marked/marked.min.js\"></script>\n  <style>\n    :root {\n      --bg: #0d1117;\n      --card-bg: #161b22;\n      --card-border: #30363d;\n      --card-hover: #1c2128;\n      --text-main: #e6edf3;\n      --text-muted: #8b949e;\n      --text-dim: #6e7681;\n      --accent-blue: #58a6ff;\n      --accent-blue-hover: #79c0ff;\n      --accent-green: #3fb950;\n      --accent-green-bg: rgba(63, 185, 80, 0.12);\n      --accent-green-border: rgba(63, 185, 80, 0.35);\n      --accent-purple: #d2a8ff;\n      --accent-purple-bg: rgba(137, 87, 229, 0.15);\n      --accent-purple-border: rgba(137, 87, 229, 0.4);\n      --accent-orange: #f0883e;\n      --accent-red: #f85149;\n    }\n    * { box-sizing: border-box; margin: 0; padding: 0; }\n    body {\n      background-color: var(--bg);\n      color: var(--text-main);\n      font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif;\n      line-height: 1.5;\n      padding: 24px;\n      min-height: 100vh;\n    }\n    .container { max-width: 1240px; margin: 0 auto; }\n    .header {\n      background: var(--card-bg);\n      border: 1px solid var(--card-border);\n      border-radius: 12px;\n      padding: 24px;\n      margin-bottom: 24px;\n      display: flex;\n      flex-direction: column;\n      gap: 16px;\n    }\n    .header-top {\n      display: flex;\n      justify-content: space-between;\n      align-items: flex-start;\n      flex-wrap: wrap;\n      gap: 16px;\n    }\n    .header-title-area { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }\n    .title { font-size: 1.6rem; font-weight: 700; color: var(--text-main); }\n    .badge {\n      font-size: 0.75rem;\n      font-weight: 600;\n      padding: 3px 10px;\n      border-radius: 999px;\n      display: inline-flex;\n      align-items: center;\n      gap: 5px;\n    }\n    .badge-satelite { background: var(--accent-purple-bg); border: 1px solid var(--accent-purple-border); color: var(--accent-purple); }\n    .badge-git { background: rgba(88, 166, 255, 0.12); border: 1px solid rgba(88, 166, 255, 0.35); color: var(--accent-blue); font-family: monospace; }\n    .badge-lines { background: #0d1117; border: 1px solid var(--card-border); color: var(--accent-blue); font-family: monospace; font-size: 0.8rem; }\n    .header-actions { display: flex; gap: 10px; flex-wrap: wrap; }\n    .btn {\n      background: #21262d;\n      color: var(--text-main);\n      border: 1px solid var(--card-border);\n      padding: 6px 14px;\n      border-radius: 6px;\n      font-size: 0.85rem;\n      font-weight: 600;\n      cursor: pointer;\n      display: inline-flex;\n      align-items: center;\n      gap: 6px;\n      transition: all 0.15s ease;\n      text-decoration: none;\n    }\n    .btn:hover { background: #30363d; border-color: #8b949e; }\n    .btn-primary { background: #238636; border-color: rgba(240, 246, 252, 0.1); color: #fff; }\n    .btn-primary:hover { background: #2ea043; }\n    .btn-danger { background: #b62324; border-color: rgba(240, 246, 252, 0.1); color: #fff; }\n    .btn-danger:hover { background: #d73a49; }\n    .meta-grid {\n      display: grid;\n      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));\n      gap: 12px;\n      font-size: 0.85rem;\n      color: var(--text-muted);\n      border-top: 1px solid rgba(48, 54, 61, 0.6);\n      padding-top: 16px;\n    }\n    .meta-item strong { color: var(--text-main); }\n    .grid-sections {\n      display: grid;\n      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));\n      gap: 20px;\n      margin-bottom: 24px;\n    }\n    .card {\n      background: var(--card-bg);\n      border: 1px solid var(--card-border);\n      border-radius: 12px;\n      padding: 20px;\n      display: flex;\n      flex-direction: column;\n      justify-content: space-between;\n    }\n    .card-header {\n      display: flex;\n      justify-content: space-between;\n      align-items: center;\n      margin-bottom: 12px;\n    }\n    .card-title { font-size: 1.05rem; font-weight: 600; color: var(--text-main); }\n    .card-count {\n      font-size: 0.75rem;\n      color: var(--text-muted);\n      background: #0d1117;\n      padding: 2px 8px;\n      border-radius: 999px;\n      border: 1px solid var(--card-border);\n    }\n    .file-list { list-style: none; display: flex; flex-direction: column; gap: 4px; }\n    .file-item {\n      padding: 6px 10px;\n      border-radius: 6px;\n      font-size: 0.85rem;\n      color: var(--accent-blue);\n      cursor: pointer;\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n      transition: background 0.15s ease;\n      word-break: break-all;\n    }\n    .file-item:hover { background: #21262d; color: var(--accent-blue-hover); }\n    .file-icon { color: var(--text-muted); margin-right: 6px; font-size: 0.8rem; }\n    .empty-msg { color: var(--text-dim); font-size: 0.85rem; font-style: italic; }\n    .commits-list { list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 0.82rem; }\n    .commit-row {\n      display: flex;\n      align-items: baseline;\n      gap: 8px;\n      color: var(--text-muted);\n      border-bottom: 1px solid rgba(48, 54, 61, 0.4);\n      padding-bottom: 6px;\n    }\n    .commit-hash { font-family: monospace; color: var(--accent-blue); }\n    .commit-msg { color: var(--text-main); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n\n    /* Modal / Drawer */\n    .modal-overlay {\n      position: fixed;\n      inset: 0;\n      background: rgba(0, 0, 0, 0.75);\n      backdrop-filter: blur(2px);\n      display: none;\n      align-items: center;\n      justify-content: center;\n      z-index: 1000;\n      padding: 20px;\n    }\n    .modal-overlay.active { display: flex; }\n    .modal-content {\n      background: #161b22;\n      border: 1px solid var(--card-border);\n      border-radius: 12px;\n      width: 100%;\n      max-width: 900px;\n      max-height: 88vh;\n      display: flex;\n      flex-direction: column;\n      box-shadow: 0 16px 36px rgba(0,0,0,0.6);\n    }\n    .modal-header {\n      padding: 16px 20px;\n      border-bottom: 1px solid var(--card-border);\n      display: flex;\n      justify-content: space-between;\n      align-items: center;\n    }\n    .modal-title { font-size: 1.1rem; font-weight: 600; color: var(--text-main); font-family: monospace; }\n    .modal-body {\n      padding: 24px;\n      overflow-y: auto;\n      flex: 1;\n      font-size: 0.95rem;\n      line-height: 1.6;\n      color: #e6edf3;\n    }\n    .modal-body h1, .modal-body h2, .modal-body h3 {\n      color: #fff;\n      margin-top: 20px;\n      margin-bottom: 10px;\n      border-bottom: 1px solid rgba(48, 54, 61, 0.5);\n      padding-bottom: 6px;\n    }\n    .modal-body h1 { font-size: 1.5rem; }\n    .modal-body h2 { font-size: 1.25rem; }\n    .modal-body pre {\n      background: #0d1117;\n      border: 1px solid var(--card-border);\n      border-radius: 6px;\n      padding: 14px;\n      overflow-x: auto;\n      font-family: Consolas, monospace;\n      font-size: 0.85rem;\n      margin: 14px 0;\n    }\n    .modal-body code {\n      background: rgba(110, 118, 129, 0.2);\n      padding: 2px 5px;\n      border-radius: 4px;\n      font-family: Consolas, monospace;\n      font-size: 0.85rem;\n    }\n    .modal-body pre code { background: none; padding: 0; }\n    .modal-body table {\n      width: 100%;\n      border-collapse: collapse;\n      margin: 16px 0;\n      font-size: 0.88rem;\n    }\n    .modal-body th, .modal-body td {\n      border: 1px solid var(--card-border);\n      padding: 8px 12px;\n      text-align: left;\n    }\n    .modal-body th { background: #0d1117; }\n    .modal-body blockquote {\n      border-left: 4px solid var(--accent-blue);\n      padding-left: 12px;\n      color: var(--text-muted);\n      margin: 12px 0;\n    }\n    .modal-body a { color: var(--accent-blue); text-decoration: none; }\n    .modal-body a:hover { text-decoration: underline; }\n    .terminal-output {\n      background: #090d13;\n      border: 1px solid #30363d;\n      border-radius: 6px;\n      padding: 14px;\n      font-family: Consolas, monospace;\n      font-size: 0.85rem;\n      color: #7ee787;\n      max-height: 400px;\n      overflow-y: auto;\n      white-space: pre-wrap;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <div class=\"header\">\n      <div class=\"header-top\">\n        <div>\n          <div class=\"header-title-area\">\n            <h1 class=\"title\" id=\"proj-nome\">Carregando...</h1>\n            <span class=\"badge badge-satelite\">Satélite Governado</span>\n            <span class=\"badge badge-git\" id=\"badge-branch\">branch: ...</span>\n            <span class=\"badge badge-lines\" id=\"badge-lines\">0 linhas</span>\n          </div>\n          <p id=\"proj-desc\" style=\"color: var(--text-muted); font-size: 0.9rem; margin-top: 6px;\"></p>\n        </div>\n        <div class=\"header-actions\">\n          <button class=\"btn btn-primary\" onclick=\"executarSincronizacao('essencial')\" title=\"Atualização rápida e segura a partir da matriz\">\n            🟢 Sincronizar Essencial\n          </button>\n          <button class=\"btn\" onclick=\"executarSincronizacao('remoto')\" title=\"Força a busca e download direto da nuvem via GitHub Raw\">\n            🌐 Forçar Remoto\n          </button>\n          <button class=\"btn btn-danger\" onclick=\"executarSincronizacao('total')\" title=\"Regenera toda a governança do zero com backup prévio\">\n            🔴 Regenerar Total...\n          </button>\n          <button class=\"btn\" onclick=\"executarHarness()\">\n            ⚙️ Harness\n          </button>\n          <button class=\"btn\" onclick=\"abrirNoEditor()\">\n            💻 Abrir no Editor\n          </button>\n        </div>\n      </div>\n\n      <div class=\"meta-grid\">\n        <div class=\"meta-item\">\n          <strong>Caminho:</strong> <span id=\"meta-caminho\" style=\"font-family: monospace; font-size: 0.8rem;\">...</span>\n        </div>\n        <div class=\"meta-item\">\n          <strong>Último Commit:</strong> <span id=\"meta-commit\">...</span>\n        </div>\n        <div class=\"meta-item\">\n          <strong>Volume de Código:</strong> <span id=\"meta-volume\">...</span>\n        </div>\n        <div class=\"meta-item\">\n          <strong>Origem Matriz:</strong> <span id=\"meta-matriz\">...</span>\n        </div>\n      </div>\n    </div>\n\n    <!-- Card do Gráfico de Evolução de Linhas -->\n    <div class=\"card\" id=\"card-grafico\" style=\"margin-bottom: 24px; display: none;\">\n      <div class=\"card-header\" style=\"flex-wrap: wrap; gap: 8px;\">\n        <div>\n          <div style=\"display: flex; align-items: center; gap: 8px;\">\n            <h2 class=\"card-title\">Evolução do Volume de Linhas</h2>\n            <span class=\"card-count\" id=\"grafico-badge-commits\">0 commits</span>\n          </div>\n          <p style=\"font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;\">\n            Variação no período exibido: <span id=\"grafico-variacao\" style=\"font-family: monospace; font-weight: 600;\">+0 linhas</span>\n          </p>\n        </div>\n        <div style=\"display: flex; align-items: center; gap: 10px;\">\n          <span style=\"font-size: 0.75rem; color: var(--text-dim);\">Passe o mouse nos pontos para ver o delta</span>\n          <button class=\"btn\" id=\"btn-carregar-mais-commits\" style=\"display: none; padding: 2px 8px; font-size: 0.75rem;\" onclick=\"carregarMaisCommits()\">\n            + Carregar mais\n          </button>\n        </div>\n      </div>\n\n      <div style=\"position: relative; background: #0d1117; border: 1px solid rgba(48, 54, 61, 0.6); border-radius: 8px; padding: 10px; margin-top: 8px;\">\n        <svg id=\"svg-grafico\" viewBox=\"0 0 850 240\" style=\"width: 100%; height: auto; max-height: 280px; display: block;\">\n        </svg>\n        <div id=\"grafico-tooltip\" style=\"position: absolute; display: none; pointer-events: none; background: #161b22; border: 1px solid var(--card-border); border-radius: 6px; padding: 8px 12px; font-size: 0.8rem; box-shadow: 0 8px 24px rgba(0,0,0,0.6); z-index: 10; max-width: 280px;\">\n        </div>\n      </div>\n    </div>\n\n    <!-- Seção de Stack e Commits -->\n    <div class=\"grid-sections\">\n      <div class=\"card\">\n        <div class=\"card-header\">\n          <h2 class=\"card-title\">Stack Tecnológica & Presets</h2>\n          <button class=\"btn\" style=\"padding: 2px 8px; font-size: 0.75rem;\" onclick=\"abrirArquivo('livro-arquitetura/02-stack.md')\">\n            Ver 02-stack.md\n          </button>\n        </div>\n        <div id=\"stack-content\" style=\"font-size: 0.88rem; color: var(--text-muted);\">\n          Carregando stack...\n        </div>\n      </div>\n\n      <div class=\"card\">\n        <div class=\"card-header\">\n          <h2 class=\"card-title\">Histórico Recente de Commits</h2>\n          <span class=\"card-count\" id=\"commits-count\">0</span>\n        </div>\n        <ul class=\"commits-list\" id=\"commits-list\">\n          <li class=\"empty-msg\">Nenhum commit encontrado.</li>\n        </ul>\n      </div>\n    </div>\n\n    <!-- Cards de Governança -->\n    <div class=\"grid-sections\" style=\"grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));\">\n      <div class=\"card\">\n        <div class=\"card-header\">\n          <h2 class=\"card-title\">Padrões de Engenharia</h2>\n          <span class=\"card-count\" id=\"count-padroes\">0</span>\n        </div>\n        <ul class=\"file-list\" id=\"list-padroes\"></ul>\n      </div>\n\n      <div class=\"card\">\n        <div class=\"card-header\">\n          <h2 class=\"card-title\">Workflows</h2>\n          <span class=\"card-count\" id=\"count-workflows\">0</span>\n        </div>\n        <ul class=\"file-list\" id=\"list-workflows\"></ul>\n      </div>\n\n      <div class=\"card\">\n        <div class=\"card-header\">\n          <h2 class=\"card-title\">Skills do Agente</h2>\n          <span class=\"card-count\" id=\"count-skills\">0</span>\n        </div>\n        <ul class=\"file-list\" id=\"list-skills\"></ul>\n      </div>\n\n      <div class=\"card\">\n        <div class=\"card-header\">\n          <h2 class=\"card-title\">Livro de Arquitetura</h2>\n          <span class=\"card-count\" id=\"count-arquitetura\">0</span>\n        </div>\n        <ul class=\"file-list\" id=\"list-arquitetura\"></ul>\n      </div>\n\n      <div class=\"card\">\n        <div class=\"card-header\">\n          <h2 class=\"card-title\">Sprints & Sessão</h2>\n          <span class=\"card-count\" id=\"count-sprints\">0</span>\n        </div>\n        <ul class=\"file-list\" id=\"list-sprints\"></ul>\n      </div>\n    </div>\n  </div>\n\n  <!-- Modal de Leitura de Markdown -->\n  <div class=\"modal-overlay\" id=\"markdown-modal\" onclick=\"fecharModalSeFora(event)\">\n    <div class=\"modal-content\">\n      <div class=\"modal-header\">\n        <div style=\"display: flex; align-items: center; gap: 8px;\">\n          <span style=\"color: var(--accent-blue); font-size: 1.1rem;\">📄</span>\n          <span class=\"modal-title\" id=\"modal-arquivo-titulo\">documento.md</span>\n        </div>\n        <div style=\"display: flex; gap: 8px;\">\n          <button class=\"btn\" style=\"padding: 4px 10px; font-size: 0.75rem;\" onclick=\"abrirArquivoNoEditor()\">\n            Abrir no Editor\n          </button>\n          <button class=\"btn\" style=\"padding: 4px 10px; font-size: 0.75rem;\" onclick=\"fecharModal()\">\n            ✕ Fechar\n          </button>\n        </div>\n      </div>\n      <div class=\"modal-body\" id=\"modal-arquivo-body\">\n        Carregando conteúdo...\n      </div>\n    </div>\n  </div>\n\n  <!-- Modal de Ação / Terminal -->\n  <div class=\"modal-overlay\" id=\"action-modal\">\n    <div class=\"modal-content\" style=\"max-width: 700px;\">\n      <div class=\"modal-header\">\n        <span class=\"modal-title\" id=\"action-modal-titulo\">Executando Ação...</span>\n        <button class=\"btn\" style=\"padding: 4px 10px; font-size: 0.75rem;\" onclick=\"fecharActionModal()\">\n          ✕ Fechar\n        </button>\n      </div>\n      <div class=\"modal-body\">\n        <div class=\"terminal-output\" id=\"action-terminal-output\">Processando...</div>\n      </div>\n    </div>\n  </div>\n\n  <script>\n    let arquivoAbertoAtual = \"\";\n\n    async function carregarDados() {\n      try {\n        const res = await fetch(\"/api/info\");\n        const data = await res.json();\n\n        document.getElementById(\"proj-nome\").textContent = data.nome;\n        document.getElementById(\"proj-desc\").textContent = data.descricao || \"Projeto sob a Governança Oficial RR Tech Studio\";\n        document.getElementById(\"meta-caminho\").textContent = data.caminho;\n\n        if (data.git) {\n          document.getElementById(\"badge-branch\").textContent = \"branch: \" + data.git.branch;\n          if (data.git.hash) {\n            document.getElementById(\"meta-commit\").innerHTML =\n              '<span style=\"color: var(--accent-green); font-weight: 500;\">' + data.git.relativo + '</span> ' +\n              '<span style=\"color: var(--accent-blue); font-family: monospace;\">[' + data.git.hash + ']</span> — ' +\n              (data.git.mensagem || \"\");\n          } else {\n            document.getElementById(\"meta-commit\").textContent = \"Sem commits recentes\";\n          }\n        }\n\n        if (data.metricas) {\n          const m = data.metricas;\n          document.getElementById(\"badge-lines\").textContent = m.totalLinhas.toLocaleString(\"pt-BR\") + \" linhas\";\n          document.getElementById(\"meta-volume\").innerHTML =\n            '<span style=\"color: var(--accent-blue); font-weight: 600;\">' + m.totalLinhas.toLocaleString(\"pt-BR\") + ' linhas</span> ' +\n            '(' + m.totalCaracteres.toLocaleString(\"pt-BR\") + ' carac. • ' +\n            '<span style=\"color: #a5d6ff; font-weight: 500;\" title=\"~3.8 caracteres por token\">' + m.tokensEstimados + '</span>) ' +\n            'em ' + m.totalArquivos + ' arquivos';\n        } else {\n          document.getElementById(\"meta-volume\").textContent = \"Métricas indisponíveis\";\n        }\n\n        if (data.matriz) {\n          document.getElementById(\"meta-matriz\").textContent =\n            (data.matriz.repositorio || \"Matriz Oficial\") + \" (\" + (data.matriz.branch || \"master\") + \")\";\n          let presetsHtml = \"\";\n          if (data.matriz.presetFrontend || data.matriz.presetBackend) {\n            presetsHtml += '<div style=\"display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;\">';\n            if (data.matriz.presetFrontend) {\n              presetsHtml += '<span class=\"badge\" style=\"background:#21262d; border:1px solid #30363d; color: var(--accent-blue);\">Frontend: ' + data.matriz.presetFrontend + '</span>';\n            }\n            if (data.matriz.presetBackend) {\n              presetsHtml += '<span class=\"badge\" style=\"background:#21262d; border:1px solid #30363d; color: var(--accent-green);\">Backend: ' + data.matriz.presetBackend + '</span>';\n            }\n            presetsHtml += '</div>';\n          }\n          presetsHtml += '<p style=\"font-size: 0.8rem; color: var(--text-dim);\">Última sincronização: ' + (data.matriz.atualizadoEm ? new Date(data.matriz.atualizadoEm).toLocaleString(\"pt-BR\") : \"N/D\") + '</p>';\n          document.getElementById(\"stack-content\").innerHTML = presetsHtml;\n        } else {\n          document.getElementById(\"stack-content\").innerHTML = '<p class=\"empty-msg\">Nenhum preset registrado em .matriz.json.</p>';\n        }\n\n        // Commits\n        const commitsList = document.getElementById(\"commits-list\");\n        if (data.historico && data.historico.length > 0) {\n          document.getElementById(\"commits-count\").textContent = data.historico.length;\n          commitsList.innerHTML = data.historico.map(c =>\n            '<li class=\"commit-row\">' +\n              '<span class=\"commit-hash\">' + c.hash + '</span>' +\n              '<span class=\"commit-msg\" title=\"' + c.mensagem + '\">' + c.mensagem + '</span>' +\n              '<span style=\"font-size: 0.75rem; color: var(--text-dim);\">' + c.relativo + '</span>' +\n            '</li>'\n          ).join(\"\");\n        } else {\n          commitsList.innerHTML = '<li class=\"empty-msg\">Nenhum histórico disponível.</li>';\n        }\n\n        // Preenche listas de arquivos\n        renderizarListaArquivos(\"padroes\", data.arquivos.padroes, \"padroes/\");\n        renderizarListaArquivos(\"workflows\", data.arquivos.workflows, \"workflows/\");\n        renderizarListaArquivos(\"skills\", data.arquivos.skills, \"skills/\");\n        renderizarListaArquivos(\"arquitetura\", data.arquivos.arquitetura, \"livro-arquitetura/\");\n\n        // Sprints e Avulsos juntos\n        const sprintsAvulsos = [\n          ...(data.arquivos.avulsos || []),\n          ...(data.arquivos.sprints || []).map(s => \"sprints/\" + s)\n        ];\n        renderizarListaArquivos(\"sprints\", sprintsAvulsos, \"\");\n        // Gráfico de evolução de linhas\n        if (data.historicoLinhas && data.historicoLinhas.pontos) {\n          pontosGrafico = data.historicoLinhas.pontos;\n          totalCommitsGrafico = data.historicoLinhas.totalCommits;\n          temMaisGrafico = data.historicoLinhas.temMais;\n          renderizarGrafico(pontosGrafico);\n        }\n      } catch (err) {\n        console.error(\"Falha ao carregar dados:\", err);\n      }\n    }\n\n    let pontosGrafico = [];\n    let totalCommitsGrafico = 0;\n    let temMaisGrafico = false;\n\n    function renderizarGrafico(pontos) {\n      if (!pontos || pontos.length < 2) {\n        document.getElementById(\"card-grafico\").style.display = \"none\";\n        return;\n      }\n      document.getElementById(\"card-grafico\").style.display = \"flex\";\n\n      const primeiroPonto = pontos[0];\n      const ultimoPonto = pontos[pontos.length - 1];\n      const variacaoPeriodo = ultimoPonto.linhasTotais - primeiroPonto.linhasTotais;\n\n      document.getElementById(\"grafico-badge-commits\").textContent = pontos.length + \" de \" + totalCommitsGrafico + \" commits\";\n      const elVariacao = document.getElementById(\"grafico-variacao\");\n      elVariacao.textContent = (variacaoPeriodo > 0 ? \"+\" : \"\") + variacaoPeriodo.toLocaleString(\"pt-BR\") + \" linhas\";\n      elVariacao.style.color = variacaoPeriodo > 0 ? \"var(--accent-green)\" : (variacaoPeriodo < 0 ? \"var(--accent-red)\" : \"var(--text-muted)\");\n\n      const btnMais = document.getElementById(\"btn-carregar-mais-commits\");\n      btnMais.style.display = temMaisGrafico ? \"inline-flex\" : \"none\";\n\n      const dim = {\n        largura: 850,\n        altura: 240,\n        paddingLeft: 65,\n        paddingRight: 35,\n        paddingTop: 30,\n        paddingBottom: 45\n      };\n\n      const valores = pontos.map(p => p.linhasTotais);\n      const minVal = Math.min(...valores);\n      const maxVal = Math.max(...valores);\n      const margem = Math.max(10, Math.ceil((maxVal - minVal) * 0.15));\n      const yMin = Math.max(0, minVal - margem);\n      const yMax = maxVal + margem;\n      const alcanceY = Math.max(1, yMax - yMin);\n      const wUtil = dim.largura - dim.paddingLeft - dim.paddingRight;\n      const hUtil = dim.altura - dim.paddingTop - dim.paddingBottom;\n\n      const coords = pontos.map((p, idx) => {\n        const x = pontos.length === 1\n          ? dim.paddingLeft + wUtil / 2\n          : dim.paddingLeft + (idx / (pontos.length - 1)) * wUtil;\n        const y = dim.altura - dim.paddingBottom - ((p.linhasTotais - yMin) / alcanceY) * hUtil;\n        return { x, y, p };\n      });\n\n      const dLinha = coords.reduce(function(acc, c, idx) {\n        const pt = c.x.toFixed(1) + \" \" + c.y.toFixed(1);\n        return idx === 0 ? \"M \" + pt : acc + \" L \" + pt;\n      }, \"\");\n\n      const chaoY = dim.altura - dim.paddingBottom;\n      const dArea = coords.length > 0\n        ? dLinha + \" L \" + coords[coords.length - 1].x.toFixed(1) + \" \" + chaoY + \" L \" + coords[0].x.toFixed(1) + \" \" + chaoY + \" Z\"\n        : \"\";\n\n      const svg = document.getElementById(\"svg-grafico\");\n\n      let svgHtml = '<defs>' +\n        '<linearGradient id=\"gradienteAzul\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">' +\n          '<stop offset=\"0%\" stop-color=\"#58a6ff\" stop-opacity=\"0.28\" />' +\n          '<stop offset=\"100%\" stop-color=\"#58a6ff\" stop-opacity=\"0.0\" />' +\n        '</linearGradient>' +\n      '</defs>';\n\n      // Linhas de Grade Horizontais\n      [0, 0.5, 1].forEach(function(pct) {\n        const y = dim.paddingTop + (dim.altura - dim.paddingTop - dim.paddingBottom) * (1 - pct);\n        const valorLinha = Math.round(yMin + (yMax - yMin) * pct);\n        svgHtml += '<line x1=\"' + dim.paddingLeft + '\" y1=\"' + y + '\" x2=\"' + (dim.largura - dim.paddingRight) + '\" y2=\"' + y + '\" stroke=\"#21262d\" stroke-dasharray=\"3 3\" stroke-width=\"1\" />' +\n          '<text x=\"' + (dim.paddingLeft - 10) + '\" y=\"' + (y + 4) + '\" fill=\"#7d8590\" font-size=\"11\" text-anchor=\"end\" font-family=\"monospace\">' + valorLinha.toLocaleString(\"pt-BR\") + '</text>';\n      });\n\n      // Linha do chão\n      svgHtml += '<line x1=\"' + dim.paddingLeft + '\" y1=\"' + chaoY + '\" x2=\"' + (dim.largura - dim.paddingRight) + '\" y2=\"' + chaoY + '\" stroke=\"#30363d\" stroke-width=\"1\" />';\n\n      // Área e Linha\n      if (dArea) svgHtml += '<path d=\"' + dArea + '\" fill=\"url(#gradienteAzul)\" />';\n      if (dLinha) svgHtml += '<path d=\"' + dLinha + '\" fill=\"none\" stroke=\"#58a6ff\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" />';\n\n      // Pontos nos commits\n      coords.forEach(function(c, idx) {\n        svgHtml += '<circle cx=\"' + c.x.toFixed(1) + '\" cy=\"' + c.y.toFixed(1) + '\" r=\"4\" fill=\"#58a6ff\" stroke=\"#0d1117\" stroke-width=\"2\" style=\"cursor: pointer;\" data-idx=\"' + idx + '\" class=\"grafico-ponto\" />' +\n          '<text x=\"' + c.x.toFixed(1) + '\" y=\"' + (chaoY + 18) + '\" fill=\"#7d8590\" font-size=\"10\" text-anchor=\"middle\" font-family=\"monospace\">' + c.p.hash + '</text>';\n      });\n\n      svg.innerHTML = svgHtml;\n\n      // Adiciona eventos de hover\n      const tooltip = document.getElementById(\"grafico-tooltip\");\n      svg.querySelectorAll(\".grafico-ponto\").forEach(function(el) {\n        el.addEventListener(\"mouseenter\", function(e) {\n          const idx = parseInt(e.target.getAttribute(\"data-idx\"), 10);\n          const c = coords[idx];\n          if (!c) return;\n\n          const p = c.p;\n          tooltip.innerHTML =\n            '<div style=\"font-weight: 600; color: #fff; margin-bottom: 4px; display: flex; justify-content: space-between;\">' +\n              '<span style=\"color: var(--accent-blue); font-family: monospace;\">[' + p.hash + ']</span>' +\n              '<span style=\"color: var(--text-muted); font-size: 0.75rem;\">' + p.data + '</span>' +\n            '</div>' +\n            '<div style=\"color: var(--text-main); margin-bottom: 6px; font-size: 0.78rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;\">' + escaparHtml(p.mensagem) + '</div>' +\n            '<div style=\"display: flex; justify-content: space-between; font-family: monospace; font-size: 0.75rem; border-top: 1px solid var(--card-border); padding-top: 4px;\">' +\n              '<span style=\"color: #fff;\">' + p.linhasTotais.toLocaleString(\"pt-BR\") + ' linhas</span>' +\n              '<span>' +\n                '<span style=\"color: var(--accent-green);\">+' + p.insercoes + '</span> / ' +\n                '<span style=\"color: var(--accent-red);\">-' + p.delecoes + '</span>' +\n              '</span>' +\n            '</div>';\n          tooltip.style.display = \"block\";\n          \n          const rect = svg.getBoundingClientRect();\n          const pontoX = (c.x / dim.largura) * rect.width;\n          const pontoY = (c.y / dim.altura) * rect.height;\n\n          let left = pontoX + 15;\n          if (left + 260 > rect.width) left = pontoX - 270;\n          let top = Math.max(10, pontoY - 40);\n\n          tooltip.style.left = left + \"px\";\n          tooltip.style.top = top + \"px\";\n        });\n\n        el.addEventListener(\"mouseleave\", function() {\n          tooltip.style.display = \"none\";\n        });\n      });\n    }\n\n    async function carregarMaisCommits() {\n      const btn = document.getElementById(\"btn-carregar-mais-commits\");\n      btn.textContent = \"Carregando...\";\n      btn.disabled = true;\n      try {\n        const novoLimite = pontosGrafico.length + 10;\n        const res = await fetch(\"/api/historico-linhas?limit=\" + novoLimite + \"&offset=0\");\n        const data = await res.json();\n        if (data.pontos) {\n          pontosGrafico = data.pontos;\n          totalCommitsGrafico = data.totalCommits;\n          temMaisGrafico = data.temMais;\n          renderizarGrafico(pontosGrafico);\n        }\n      } catch (e) {\n        console.error(\"Falha ao carregar mais commits:\", e);\n      } finally {\n        btn.textContent = \"+ Carregar mais\";\n        btn.disabled = false;\n      }\n    }\n\n    function renderizarListaArquivos(tipo, lista, prefixo) {\n      const elCount = document.getElementById(\"count-\" + tipo);\n      const elList = document.getElementById(\"list-\" + tipo);\n      if (!elList) return;\n\n      elCount.textContent = (lista || []).length;\n      if (!lista || lista.length === 0) {\n        elList.innerHTML = '<li class=\"empty-msg\">Nenhum arquivo encontrado.</li>';\n        return;\n      }\n\n      elList.innerHTML = lista.map(item => {\n        const caminhoCompleto = prefixo + item;\n        return '<li class=\"file-item\" onclick=\"abrirArquivo(\\'' + caminhoCompleto + '\\')\">' +\n          '<span><span class=\"file-icon\">📄</span>' + item + '</span>' +\n          '<span style=\"font-size: 0.75rem; color: var(--text-dim);\">&rarr;</span>' +\n        '</li>';\n      }).join(\"\");\n    }\n\n    async function abrirArquivo(caminhoRelativo) {\n      arquivoAbertoAtual = caminhoRelativo;\n      document.getElementById(\"modal-arquivo-titulo\").textContent = caminhoRelativo;\n      const body = document.getElementById(\"modal-arquivo-body\");\n      body.innerHTML = \"<p>Carregando conteúdo...</p>\";\n      document.getElementById(\"markdown-modal\").classList.add(\"active\");\n\n      try {\n        const res = await fetch(\"/api/arquivo?path=\" + encodeURIComponent(caminhoRelativo));\n        const json = await res.json();\n        if (json.erro) {\n          body.innerHTML = '<p style=\"color: var(--accent-red);\">Erro: ' + json.erro + '</p>';\n          return;\n        }\n\n        if (window.marked) {\n          body.innerHTML = marked.parse(json.conteudo);\n        } else {\n          // Fallback caso marked.js não carregue via CDN\n          body.innerHTML = '<pre><code>' + escaparHtml(json.conteudo) + '</code></pre>';\n        }\n      } catch (err) {\n        body.innerHTML = '<p style=\"color: var(--accent-red);\">Falha ao carregar arquivo.</p>';\n      }\n    }\n\n    function fecharModal() {\n      document.getElementById(\"markdown-modal\").classList.remove(\"active\");\n    }\n\n    function fecharModalSeFora(e) {\n      if (e.target.id === \"markdown-modal\") fecharModal();\n    }\n\n    function fecharActionModal() {\n      document.getElementById(\"action-modal\").classList.remove(\"active\");\n    }\n\n    async function abrirNoEditor(caminho = \"\") {\n      try {\n        await fetch(\"/api/abrir-editor\", {\n          method: \"POST\",\n          headers: { \"Content-Type\": \"application/json\" },\n          body: JSON.stringify({ caminho })\n        });\n      } catch {\n        alert(\"Não foi possível acionar o editor de código.\");\n      }\n    }\n\n    function abrirArquivoNoEditor() {\n      if (arquivoAbertoAtual) {\n        abrirNoEditor(\"governanca/\" + arquivoAbertoAtual);\n      }\n    }\n\n    async function executarSincronizacao(modo) {\n      if (modo === \"total\") {\n        const confirmacao = prompt(\"⚠️ ATENÇÃO: Regeneração Total irá sobrescrever arquivos.\\nDigite 'REGENERAR TUDO' para confirmar:\");\n        if (confirmacao !== \"REGENERAR TUDO\") {\n          alert(\"Operação cancelada.\");\n          return;\n        }\n      }\n\n      const modal = document.getElementById(\"action-modal\");\n      const titulo = document.getElementById(\"action-modal-titulo\");\n      const terminal = document.getElementById(\"action-terminal-output\");\n\n      if (modo === \"total\") {\n        titulo.textContent = \"Regeneração Total da Governança...\";\n      } else if (modo === \"remoto\") {\n        titulo.textContent = \"Sincronização Remota Forçada (GitHub Raw)...\";\n      } else {\n        titulo.textContent = \"Sincronização Essencial da Governança...\";\n      }\n\n      terminal.textContent = modo === \"remoto\"\n        ? \"🌐 Forçando busca remota na nuvem via GitHub Raw (ignorando cópias locais)...\\nAguarde...\\n\"\n        : \"⏳ Conectando e sincronizando com a matriz da RR Tech Studio...\\nAguarde...\\n\";\n      modal.classList.add(\"active\");\n\n      try {\n        const res = await fetch(\"/api/sincronizar\", {\n          method: \"POST\",\n          headers: { \"Content-Type\": \"application/json\" },\n          body: JSON.stringify({ modo })\n        });\n        const data = await res.json();\n        terminal.textContent = data.output || \"Concluído!\";\n        if (data.sucesso) {\n          carregarDados();\n        }\n      } catch (err) {\n        terminal.textContent = \"❌ Erro ao disparar sincronização: \" + err.message;\n      }\n    }\n\n    async function executarHarness() {\n      const modal = document.getElementById(\"action-modal\");\n      const titulo = document.getElementById(\"action-modal-titulo\");\n      const terminal = document.getElementById(\"action-terminal-output\");\n\n      titulo.textContent = \"Re-sincronizando Harness (.agents/)...\";\n      terminal.textContent = \"⏳ Executando harness.mjs...\\nAguarde...\\n\";\n      modal.classList.add(\"active\");\n\n      try {\n        const res = await fetch(\"/api/harness\", { method: \"POST\" });\n        const data = await res.json();\n        terminal.textContent = data.output || \"Concluído!\";\n      } catch (err) {\n        terminal.textContent = \"❌ Erro ao executar harness: \" + err.message;\n      }\n    }\n\n    function escaparHtml(text) {\n      return text.replace(/[&<>\"']/g, function(m) {\n        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#039;' }[m];\n      });\n    }\n\n    // Inicialização\n    carregarDados();\n  </script>\n</body>\n</html>";

function gerarPaginaHtml() {
  return PAGINA_HTML_EMBARCADA;
}

// Servidor HTTP Nativo
function iniciarServidor() {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    // GET / -> Retorna a UI SPA
    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(gerarPaginaHtml());
      return;
    }

    // GET /api/info -> Retorna metadados consolidados
    if (req.method === "GET" && url.pathname === "/api/info") {
      try {
        const info = obterDadosProjeto();
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(info));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ erro: err.message }));
      }
      return;
    }

    // GET /api/historico-linhas -> Retorna histórico de evolução de linhas por commit
    if (req.method === "GET" && url.pathname === "/api/historico-linhas") {
      const limit = parseInt(url.searchParams.get("limit") || "10", 10) || 10;
      const offset = parseInt(url.searchParams.get("offset") || "0", 10) || 0;
      try {
        const hist = obterHistoricoLinhasCommits(raiz, limit, offset);
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify(hist));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ erro: err.message }));
      }
      return;
    }

    // GET /api/arquivo?path=... -> Retorna conteúdo de arquivo seguro dentro de governanca/
    if (req.method === "GET" && url.pathname === "/api/arquivo") {
      const relPath = url.searchParams.get("path");
      if (!relPath) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ erro: "Parâmetro 'path' é obrigatório" }));
        return;
      }

      // Evita path traversal fora de governanca
      const normalized = path.normalize(relPath).replace(/^(\.\.[\/\\])+/, "");
      const fullPath = path.join(govDir, normalized);

      if (!fullPath.startsWith(govDir) || !fs.existsSync(fullPath)) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ erro: "Arquivo não encontrado." }));
        return;
      }

      try {
        const conteudo = fs.readFileSync(fullPath, "utf-8");
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ conteudo, caminho: normalized }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ erro: err.message }));
      }
      return;
    }

    // POST /api/sincronizar -> Dispara sincronizar.mjs
    if (req.method === "POST" && url.pathname === "/api/sincronizar") {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        let modo = "essencial";
        let forcarRemoto = false;
        try {
          const parsed = JSON.parse(body);
          if (parsed.modo === "total") modo = "total";
          if (parsed.modo === "remoto" || parsed.remoto) forcarRemoto = true;
        } catch {
          // ignore
        }

        const scriptSync = path.join(govDir, "scripts", "sincronizar.mjs");
        if (!fs.existsSync(scriptSync)) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ sucesso: false, output: "❌ Script sincronizar.mjs não encontrado." }));
          return;
        }

        try {
          let cmd = `node "${scriptSync}"`;
          if (modo === "total") {
            cmd = `node "${scriptSync}" --total -y`;
          } else if (forcarRemoto) {
            cmd = `node "${scriptSync}" --remoto`;
          }
          const output = execSync(cmd, { cwd: raiz, encoding: "utf-8" });
          res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({ sucesso: true, output }));
        } catch (err) {
          res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
          res.end(JSON.stringify({
            sucesso: false,
            output: (err.stdout ? err.stdout + "\n" : "") + (err.stderr ? err.stderr + "\n" : "") + err.message
          }));
        }
      });
      return;
    }

    // POST /api/harness -> Dispara harness.mjs
    if (req.method === "POST" && url.pathname === "/api/harness") {
      const scriptHarness = path.join(govDir, "scripts", "harness.mjs");
      if (!fs.existsSync(scriptHarness)) {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ sucesso: false, output: "❌ Script harness.mjs não encontrado." }));
        return;
      }
      try {
        const output = execSync(`node "${scriptHarness}"`, { cwd: raiz, encoding: "utf-8" });
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ sucesso: true, output }));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ sucesso: false, output: err.message }));
      }
      return;
    }

    // POST /api/abrir-editor -> Abre no VS Code
    if (req.method === "POST" && url.pathname === "/api/abrir-editor") {
      let body = "";
      req.on("data", (chunk) => { body += chunk; });
      req.on("end", () => {
        let alvo = raiz;
        try {
          const parsed = JSON.parse(body);
          if (parsed.caminho) alvo = path.join(raiz, parsed.caminho);
        } catch {
          // ignore
        }
        try {
          execSync(`code "${alvo}"`, { windowsHide: true });
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ sucesso: true }));
        } catch {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ sucesso: false, aviso: "Comando 'code' não encontrado no PATH." }));
        }
      });
      return;
    }

    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Rota não encontrada");
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`⚠️ Porta ${porta} em uso. Tentando porta ${porta + 1}...`);
      porta++;
      server.listen(porta);
    } else {
      console.error("❌ Erro no servidor HTTP:", err);
      process.exit(1);
    }
  });

  server.listen(porta, () => {
    const url = `http://localhost:${porta}`;
    console.log("\n========================================================");
    console.log("🌐 RR Tech Studio — Painel Dedicado do Projeto");
    console.log(`   Projeto: ${path.basename(raiz)}`);
    console.log(`   URL:     ${url}`);
    console.log("========================================================\n");
    console.log("Pressione Ctrl+C para encerrar o servidor.");

    if (!naoAbrir) {
      abrirNavegador(url);
    }
  });
}

// Se for modo checagem (--check / -c), valida integridade dos dados e encerra
const modoChecagem = args.includes("--check") || args.includes("-c");
if (modoChecagem) {
  try {
    const dados = obterDadosProjeto();
    console.log("\n✅ Checagem de Prontidão da Interface (UI): OK");
    console.log(`   Projeto: ${dados.nome}`);
    console.log(`   Arquivos: ${dados.metricas?.totalArquivos || 0} arquivos (${dados.metricas?.totalLinhas?.toLocaleString("pt-BR") || 0} linhas)`);
    console.log(`   Governança: ${dados.arquivos.padroes.length} padrões, ${dados.arquivos.workflows.length} workflows, ${dados.arquivos.skills.length} skills`);
    console.log(`   Histórico Git: ${dados.historicoLinhas?.totalCommits || 0} commits rastreados\n`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Falha na checagem da governança:", err.message);
    process.exit(1);
  }
}

iniciarServidor();
