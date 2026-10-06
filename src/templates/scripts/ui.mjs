#!/usr/bin/env node
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
function gerarPaginaHtml() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RR Tech Studio — Painel do Projeto</title>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --card-border: #30363d;
      --card-hover: #1c2128;
      --text-main: #e6edf3;
      --text-muted: #8b949e;
      --text-dim: #6e7681;
      --accent-blue: #58a6ff;
      --accent-blue-hover: #79c0ff;
      --accent-green: #3fb950;
      --accent-green-bg: rgba(63, 185, 80, 0.12);
      --accent-green-border: rgba(63, 185, 80, 0.35);
      --accent-purple: #d2a8ff;
      --accent-purple-bg: rgba(137, 87, 229, 0.15);
      --accent-purple-border: rgba(137, 87, 229, 0.4);
      --accent-orange: #f0883e;
      --accent-red: #f85149;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text-main);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      padding: 24px;
      min-height: 100vh;
    }
    .container { max-width: 1240px; margin: 0 auto; }
    .header {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 16px;
    }
    .header-title-area { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
    .title { font-size: 1.6rem; font-weight: 700; color: var(--text-main); }
    .badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .badge-satelite { background: var(--accent-purple-bg); border: 1px solid var(--accent-purple-border); color: var(--accent-purple); }
    .badge-git { background: rgba(88, 166, 255, 0.12); border: 1px solid rgba(88, 166, 255, 0.35); color: var(--accent-blue); font-family: monospace; }
    .badge-lines { background: #0d1117; border: 1px solid var(--card-border); color: var(--accent-blue); font-family: monospace; font-size: 0.8rem; }
    .header-actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn {
      background: #21262d;
      color: var(--text-main);
      border: 1px solid var(--card-border);
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .btn:hover { background: #30363d; border-color: #8b949e; }
    .btn-primary { background: #238636; border-color: rgba(240, 246, 252, 0.1); color: #fff; }
    .btn-primary:hover { background: #2ea043; }
    .btn-danger { background: #b62324; border-color: rgba(240, 246, 252, 0.1); color: #fff; }
    .btn-danger:hover { background: #d73a49; }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 12px;
      font-size: 0.85rem;
      color: var(--text-muted);
      border-top: 1px solid rgba(48, 54, 61, 0.6);
      padding-top: 16px;
    }
    .meta-item strong { color: var(--text-main); }
    .grid-sections {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .card-title { font-size: 1.05rem; font-weight: 600; color: var(--text-main); }
    .card-count {
      font-size: 0.75rem;
      color: var(--text-muted);
      background: #0d1117;
      padding: 2px 8px;
      border-radius: 999px;
      border: 1px solid var(--card-border);
    }
    .file-list { list-style: none; display: flex; flex-direction: column; gap: 4px; }
    .file-item {
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 0.85rem;
      color: var(--accent-blue);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      transition: background 0.15s ease;
      word-break: break-all;
    }
    .file-item:hover { background: #21262d; color: var(--accent-blue-hover); }
    .file-icon { color: var(--text-muted); margin-right: 6px; font-size: 0.8rem; }
    .empty-msg { color: var(--text-dim); font-size: 0.85rem; font-style: italic; }
    .commits-list { list-style: none; display: flex; flex-direction: column; gap: 8px; font-size: 0.82rem; }
    .commit-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      color: var(--text-muted);
      border-bottom: 1px solid rgba(48, 54, 61, 0.4);
      padding-bottom: 6px;
    }
    .commit-hash { font-family: monospace; color: var(--accent-blue); }
    .commit-msg { color: var(--text-main); flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* Modal / Drawer */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(2px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    .modal-overlay.active { display: flex; }
    .modal-content {
      background: #161b22;
      border: 1px solid var(--card-border);
      border-radius: 12px;
      width: 100%;
      max-width: 900px;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 16px 36px rgba(0,0,0,0.6);
    }
    .modal-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--card-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-title { font-size: 1.1rem; font-weight: 600; color: var(--text-main); font-family: monospace; }
    .modal-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
      font-size: 0.95rem;
      line-height: 1.6;
      color: #e6edf3;
    }
    .modal-body h1, .modal-body h2, .modal-body h3 {
      color: #fff;
      margin-top: 20px;
      margin-bottom: 10px;
      border-bottom: 1px solid rgba(48, 54, 61, 0.5);
      padding-bottom: 6px;
    }
    .modal-body h1 { font-size: 1.5rem; }
    .modal-body h2 { font-size: 1.25rem; }
    .modal-body pre {
      background: #0d1117;
      border: 1px solid var(--card-border);
      border-radius: 6px;
      padding: 14px;
      overflow-x: auto;
      font-family: Consolas, monospace;
      font-size: 0.85rem;
      margin: 14px 0;
    }
    .modal-body code {
      background: rgba(110, 118, 129, 0.2);
      padding: 2px 5px;
      border-radius: 4px;
      font-family: Consolas, monospace;
      font-size: 0.85rem;
    }
    .modal-body pre code { background: none; padding: 0; }
    .modal-body table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 0.88rem;
    }
    .modal-body th, .modal-body td {
      border: 1px solid var(--card-border);
      padding: 8px 12px;
      text-align: left;
    }
    .modal-body th { background: #0d1117; }
    .modal-body blockquote {
      border-left: 4px solid var(--accent-blue);
      padding-left: 12px;
      color: var(--text-muted);
      margin: 12px 0;
    }
    .modal-body a { color: var(--accent-blue); text-decoration: none; }
    .modal-body a:hover { text-decoration: underline; }
    .terminal-output {
      background: #090d13;
      border: 1px solid #30363d;
      border-radius: 6px;
      padding: 14px;
      font-family: Consolas, monospace;
      font-size: 0.85rem;
      color: #7ee787;
      max-height: 400px;
      overflow-y: auto;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-top">
        <div>
          <div class="header-title-area">
            <h1 class="title" id="proj-nome">Carregando...</h1>
            <span class="badge badge-satelite">Satélite Governado</span>
            <span class="badge badge-git" id="badge-branch">branch: ...</span>
            <span class="badge badge-lines" id="badge-lines">0 linhas</span>
          </div>
          <p id="proj-desc" style="color: var(--text-muted); font-size: 0.9rem; margin-top: 6px;"></p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" onclick="executarSincronizacao('essencial')">
            🟢 Sincronizar Essencial
          </button>
          <button class="btn btn-danger" onclick="executarSincronizacao('total')">
            🔴 Regenerar Total...
          </button>
          <button class="btn" onclick="executarHarness()">
            ⚙️ Harness
          </button>
          <button class="btn" onclick="abrirNoEditor()">
            💻 Abrir no Editor
          </button>
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-item">
          <strong>Caminho:</strong> <span id="meta-caminho" style="font-family: monospace; font-size: 0.8rem;">...</span>
        </div>
        <div class="meta-item">
          <strong>Último Commit:</strong> <span id="meta-commit">...</span>
        </div>
        <div class="meta-item">
          <strong>Volume de Código:</strong> <span id="meta-volume">...</span>
        </div>
        <div class="meta-item">
          <strong>Origem Matriz:</strong> <span id="meta-matriz">...</span>
        </div>
      </div>
    </div>

    <!-- Card do Gráfico de Evolução de Linhas -->
    <div class="card" id="card-grafico" style="margin-bottom: 24px; display: none;">
      <div class="card-header" style="flex-wrap: wrap; gap: 8px;">
        <div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <h2 class="card-title">Evolução do Volume de Linhas</h2>
            <span class="card-count" id="grafico-badge-commits">0 commits</span>
          </div>
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
            Variação no período exibido: <span id="grafico-variacao" style="font-family: monospace; font-weight: 600;">+0 linhas</span>
          </p>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 0.75rem; color: var(--text-dim);">Passe o mouse nos pontos para ver o delta</span>
          <button class="btn" id="btn-carregar-mais-commits" style="display: none; padding: 2px 8px; font-size: 0.75rem;" onclick="carregarMaisCommits()">
            + Carregar mais
          </button>
        </div>
      </div>

      <div style="position: relative; background: #0d1117; border: 1px solid rgba(48, 54, 61, 0.6); border-radius: 8px; padding: 10px; margin-top: 8px;">
        <svg id="svg-grafico" viewBox="0 0 850 240" style="width: 100%; height: auto; max-height: 280px; display: block;">
        </svg>
        <div id="grafico-tooltip" style="position: absolute; display: none; pointer-events: none; background: #161b22; border: 1px solid var(--card-border); border-radius: 6px; padding: 8px 12px; font-size: 0.8rem; box-shadow: 0 8px 24px rgba(0,0,0,0.6); z-index: 10; max-width: 280px;">
        </div>
      </div>
    </div>

    <!-- Seção de Stack e Commits -->
    <div class="grid-sections">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Stack Tecnológica & Presets</h2>
          <button class="btn" style="padding: 2px 8px; font-size: 0.75rem;" onclick="abrirArquivo('livro-arquitetura/02-stack.md')">
            Ver 02-stack.md
          </button>
        </div>
        <div id="stack-content" style="font-size: 0.88rem; color: var(--text-muted);">
          Carregando stack...
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Histórico Recente de Commits</h2>
          <span class="card-count" id="commits-count">0</span>
        </div>
        <ul class="commits-list" id="commits-list">
          <li class="empty-msg">Nenhum commit encontrado.</li>
        </ul>
      </div>
    </div>

    <!-- Cards de Governança -->
    <div class="grid-sections" style="grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));">
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Padrões de Engenharia</h2>
          <span class="card-count" id="count-padroes">0</span>
        </div>
        <ul class="file-list" id="list-padroes"></ul>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Workflows</h2>
          <span class="card-count" id="count-workflows">0</span>
        </div>
        <ul class="file-list" id="list-workflows"></ul>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Skills do Agente</h2>
          <span class="card-count" id="count-skills">0</span>
        </div>
        <ul class="file-list" id="list-skills"></ul>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Livro de Arquitetura</h2>
          <span class="card-count" id="count-arquitetura">0</span>
        </div>
        <ul class="file-list" id="list-arquitetura"></ul>
      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Sprints & Sessão</h2>
          <span class="card-count" id="count-sprints">0</span>
        </div>
        <ul class="file-list" id="list-sprints"></ul>
      </div>
    </div>
  </div>

  <!-- Modal de Leitura de Markdown -->
  <div class="modal-overlay" id="markdown-modal" onclick="fecharModalSeFora(event)">
    <div class="modal-content">
      <div class="modal-header">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: var(--accent-blue); font-size: 1.1rem;">📄</span>
          <span class="modal-title" id="modal-arquivo-titulo">documento.md</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn" style="padding: 4px 10px; font-size: 0.75rem;" onclick="abrirArquivoNoEditor()">
            Abrir no Editor
          </button>
          <button class="btn" style="padding: 4px 10px; font-size: 0.75rem;" onclick="fecharModal()">
            ✕ Fechar
          </button>
        </div>
      </div>
      <div class="modal-body" id="modal-arquivo-body">
        Carregando conteúdo...
      </div>
    </div>
  </div>

  <!-- Modal de Ação / Terminal -->
  <div class="modal-overlay" id="action-modal">
    <div class="modal-content" style="max-width: 700px;">
      <div class="modal-header">
        <span class="modal-title" id="action-modal-titulo">Executando Ação...</span>
        <button class="btn" style="padding: 4px 10px; font-size: 0.75rem;" onclick="fecharActionModal()">
          ✕ Fechar
        </button>
      </div>
      <div class="modal-body">
        <div class="terminal-output" id="action-terminal-output">Processando...</div>
      </div>
    </div>
  </div>

  <script>
    let arquivoAbertoAtual = "";

    async function carregarDados() {
      try {
        const res = await fetch("/api/info");
        const data = await res.json();

        document.getElementById("proj-nome").textContent = data.nome;
        document.getElementById("proj-desc").textContent = data.descricao || "Projeto sob a Governança Oficial RR Tech Studio";
        document.getElementById("meta-caminho").textContent = data.caminho;

        if (data.git) {
          document.getElementById("badge-branch").textContent = "branch: " + data.git.branch;
          if (data.git.hash) {
            document.getElementById("meta-commit").innerHTML =
              '<span style="color: var(--accent-green); font-weight: 500;">' + data.git.relativo + '</span> ' +
              '<span style="color: var(--accent-blue); font-family: monospace;">[' + data.git.hash + ']</span> — ' +
              (data.git.mensagem || "");
          } else {
            document.getElementById("meta-commit").textContent = "Sem commits recentes";
          }
        }

        if (data.metricas) {
          const m = data.metricas;
          document.getElementById("badge-lines").textContent = m.totalLinhas.toLocaleString("pt-BR") + " linhas";
          document.getElementById("meta-volume").innerHTML =
            '<span style="color: var(--accent-blue); font-weight: 600;">' + m.totalLinhas.toLocaleString("pt-BR") + ' linhas</span> ' +
            '(' + m.totalCaracteres.toLocaleString("pt-BR") + ' carac. • ' +
            '<span style="color: #a5d6ff; font-weight: 500;" title="~3.8 caracteres por token">' + m.tokensEstimados + '</span>) ' +
            'em ' + m.totalArquivos + ' arquivos';
        } else {
          document.getElementById("meta-volume").textContent = "Métricas indisponíveis";
        }

        if (data.matriz) {
          document.getElementById("meta-matriz").textContent =
            (data.matriz.repositorio || "Matriz Oficial") + " (" + (data.matriz.branch || "master") + ")";
          let presetsHtml = "";
          if (data.matriz.presetFrontend || data.matriz.presetBackend) {
            presetsHtml += '<div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 8px;">';
            if (data.matriz.presetFrontend) {
              presetsHtml += '<span class="badge" style="background:#21262d; border:1px solid #30363d; color: var(--accent-blue);">Frontend: ' + data.matriz.presetFrontend + '</span>';
            }
            if (data.matriz.presetBackend) {
              presetsHtml += '<span class="badge" style="background:#21262d; border:1px solid #30363d; color: var(--accent-green);">Backend: ' + data.matriz.presetBackend + '</span>';
            }
            presetsHtml += '</div>';
          }
          presetsHtml += '<p style="font-size: 0.8rem; color: var(--text-dim);">Última sincronização: ' + (data.matriz.atualizadoEm ? new Date(data.matriz.atualizadoEm).toLocaleString("pt-BR") : "N/D") + '</p>';
          document.getElementById("stack-content").innerHTML = presetsHtml;
        } else {
          document.getElementById("stack-content").innerHTML = '<p class="empty-msg">Nenhum preset registrado em .matriz.json.</p>';
        }

        // Commits
        const commitsList = document.getElementById("commits-list");
        if (data.historico && data.historico.length > 0) {
          document.getElementById("commits-count").textContent = data.historico.length;
          commitsList.innerHTML = data.historico.map(c =>
            '<li class="commit-row">' +
              '<span class="commit-hash">' + c.hash + '</span>' +
              '<span class="commit-msg" title="' + c.mensagem + '">' + c.mensagem + '</span>' +
              '<span style="font-size: 0.75rem; color: var(--text-dim);">' + c.relativo + '</span>' +
            '</li>'
          ).join("");
        } else {
          commitsList.innerHTML = '<li class="empty-msg">Nenhum histórico disponível.</li>';
        }

        // Preenche listas de arquivos
        renderizarListaArquivos("padroes", data.arquivos.padroes, "padroes/");
        renderizarListaArquivos("workflows", data.arquivos.workflows, "workflows/");
        renderizarListaArquivos("skills", data.arquivos.skills, "skills/");
        renderizarListaArquivos("arquitetura", data.arquivos.arquitetura, "livro-arquitetura/");

        // Sprints e Avulsos juntos
        const sprintsAvulsos = [
          ...(data.arquivos.avulsos || []),
          ...(data.arquivos.sprints || []).map(s => "sprints/" + s)
        ];
        renderizarListaArquivos("sprints", sprintsAvulsos, "");
        // Gráfico de evolução de linhas
        if (data.historicoLinhas && data.historicoLinhas.pontos) {
          pontosGrafico = data.historicoLinhas.pontos;
          totalCommitsGrafico = data.historicoLinhas.totalCommits;
          temMaisGrafico = data.historicoLinhas.temMais;
          renderizarGrafico(pontosGrafico);
        }
      } catch (err) {
        console.error("Falha ao carregar dados:", err);
      }
    }

    let pontosGrafico = [];
    let totalCommitsGrafico = 0;
    let temMaisGrafico = false;

    function renderizarGrafico(pontos) {
      if (!pontos || pontos.length < 2) {
        document.getElementById("card-grafico").style.display = "none";
        return;
      }
      document.getElementById("card-grafico").style.display = "flex";

      const primeiroPonto = pontos[0];
      const ultimoPonto = pontos[pontos.length - 1];
      const variacaoPeriodo = ultimoPonto.linhasTotais - primeiroPonto.linhasTotais;

      document.getElementById("grafico-badge-commits").textContent = pontos.length + " de " + totalCommitsGrafico + " commits";
      const elVariacao = document.getElementById("grafico-variacao");
      elVariacao.textContent = (variacaoPeriodo > 0 ? "+" : "") + variacaoPeriodo.toLocaleString("pt-BR") + " linhas";
      elVariacao.style.color = variacaoPeriodo > 0 ? "var(--accent-green)" : (variacaoPeriodo < 0 ? "var(--accent-red)" : "var(--text-muted)");

      const btnMais = document.getElementById("btn-carregar-mais-commits");
      btnMais.style.display = temMaisGrafico ? "inline-flex" : "none";

      const dim = {
        largura: 850,
        altura: 240,
        paddingLeft: 65,
        paddingRight: 35,
        paddingTop: 30,
        paddingBottom: 45
      };

      const valores = pontos.map(p => p.linhasTotais);
      const minVal = Math.min(...valores);
      const maxVal = Math.max(...valores);
      const margem = Math.max(10, Math.ceil((maxVal - minVal) * 0.15));
      const yMin = Math.max(0, minVal - margem);
      const yMax = maxVal + margem;
      const alcanceY = Math.max(1, yMax - yMin);
      const wUtil = dim.largura - dim.paddingLeft - dim.paddingRight;
      const hUtil = dim.altura - dim.paddingTop - dim.paddingBottom;

      const coords = pontos.map((p, idx) => {
        const x = pontos.length === 1
          ? dim.paddingLeft + wUtil / 2
          : dim.paddingLeft + (idx / (pontos.length - 1)) * wUtil;
        const y = dim.altura - dim.paddingBottom - ((p.linhasTotais - yMin) / alcanceY) * hUtil;
        return { x, y, p };
      });

      const dLinha = coords.reduce(function(acc, c, idx) {
        const pt = c.x.toFixed(1) + " " + c.y.toFixed(1);
        return idx === 0 ? "M " + pt : acc + " L " + pt;
      }, "");

      const chaoY = dim.altura - dim.paddingBottom;
      const dArea = coords.length > 0
        ? dLinha + " L " + coords[coords.length - 1].x.toFixed(1) + " " + chaoY + " L " + coords[0].x.toFixed(1) + " " + chaoY + " Z"
        : "";

      const svg = document.getElementById("svg-grafico");

      let svgHtml = '<defs>' +
        '<linearGradient id="gradienteAzul" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="#58a6ff" stop-opacity="0.28" />' +
          '<stop offset="100%" stop-color="#58a6ff" stop-opacity="0.0" />' +
        '</linearGradient>' +
      '</defs>';

      // Linhas de Grade Horizontais
      [0, 0.5, 1].forEach(function(pct) {
        const y = dim.paddingTop + (dim.altura - dim.paddingTop - dim.paddingBottom) * (1 - pct);
        const valorLinha = Math.round(yMin + (yMax - yMin) * pct);
        svgHtml += '<line x1="' + dim.paddingLeft + '" y1="' + y + '" x2="' + (dim.largura - dim.paddingRight) + '" y2="' + y + '" stroke="#21262d" stroke-dasharray="3 3" stroke-width="1" />' +
          '<text x="' + (dim.paddingLeft - 10) + '" y="' + (y + 4) + '" fill="#7d8590" font-size="11" text-anchor="end" font-family="monospace">' + valorLinha.toLocaleString("pt-BR") + '</text>';
      });

      // Linha do chão
      svgHtml += '<line x1="' + dim.paddingLeft + '" y1="' + chaoY + '" x2="' + (dim.largura - dim.paddingRight) + '" y2="' + chaoY + '" stroke="#30363d" stroke-width="1" />';

      // Área e Linha
      if (dArea) svgHtml += '<path d="' + dArea + '" fill="url(#gradienteAzul)" />';
      if (dLinha) svgHtml += '<path d="' + dLinha + '" fill="none" stroke="#58a6ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />';

      // Pontos nos commits
      coords.forEach(function(c, idx) {
        svgHtml += '<circle cx="' + c.x.toFixed(1) + '" cy="' + c.y.toFixed(1) + '" r="4" fill="#58a6ff" stroke="#0d1117" stroke-width="2" style="cursor: pointer;" data-idx="' + idx + '" class="grafico-ponto" />' +
          '<text x="' + c.x.toFixed(1) + '" y="' + (chaoY + 18) + '" fill="#7d8590" font-size="10" text-anchor="middle" font-family="monospace">' + c.p.hash + '</text>';
      });

      svg.innerHTML = svgHtml;

      // Adiciona eventos de hover
      const tooltip = document.getElementById("grafico-tooltip");
      svg.querySelectorAll(".grafico-ponto").forEach(function(el) {
        el.addEventListener("mouseenter", function(e) {
          const idx = parseInt(e.target.getAttribute("data-idx"), 10);
          const c = coords[idx];
          if (!c) return;

          const p = c.p;
          tooltip.innerHTML =
            '<div style="font-weight: 600; color: #fff; margin-bottom: 4px; display: flex; justify-content: space-between;">' +
              '<span style="color: var(--accent-blue); font-family: monospace;">[' + p.hash + ']</span>' +
              '<span style="color: var(--text-muted); font-size: 0.75rem;">' + p.data + '</span>' +
            '</div>' +
            '<div style="color: var(--text-main); margin-bottom: 6px; font-size: 0.78rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">' + escaparHtml(p.mensagem) + '</div>' +
            '<div style="display: flex; justify-content: space-between; font-family: monospace; font-size: 0.75rem; border-top: 1px solid var(--card-border); padding-top: 4px;">' +
              '<span style="color: #fff;">' + p.linhasTotais.toLocaleString("pt-BR") + ' linhas</span>' +
              '<span>' +
                '<span style="color: var(--accent-green);">+' + p.insercoes + '</span> / ' +
                '<span style="color: var(--accent-red);">-' + p.delecoes + '</span>' +
              '</span>' +
            '</div>';
          tooltip.style.display = "block";
          
          const rect = svg.getBoundingClientRect();
          const pontoX = (c.x / dim.largura) * rect.width;
          const pontoY = (c.y / dim.altura) * rect.height;

          let left = pontoX + 15;
          if (left + 260 > rect.width) left = pontoX - 270;
          let top = Math.max(10, pontoY - 40);

          tooltip.style.left = left + "px";
          tooltip.style.top = top + "px";
        });

        el.addEventListener("mouseleave", function() {
          tooltip.style.display = "none";
        });
      });
    }

    async function carregarMaisCommits() {
      const btn = document.getElementById("btn-carregar-mais-commits");
      btn.textContent = "Carregando...";
      btn.disabled = true;
      try {
        const novoLimite = pontosGrafico.length + 10;
        const res = await fetch("/api/historico-linhas?limit=" + novoLimite + "&offset=0");
        const data = await res.json();
        if (data.pontos) {
          pontosGrafico = data.pontos;
          totalCommitsGrafico = data.totalCommits;
          temMaisGrafico = data.temMais;
          renderizarGrafico(pontosGrafico);
        }
      } catch (e) {
        console.error("Falha ao carregar mais commits:", e);
      } finally {
        btn.textContent = "+ Carregar mais";
        btn.disabled = false;
      }
    }

    function renderizarListaArquivos(tipo, lista, prefixo) {
      const elCount = document.getElementById("count-" + tipo);
      const elList = document.getElementById("list-" + tipo);
      if (!elList) return;

      elCount.textContent = (lista || []).length;
      if (!lista || lista.length === 0) {
        elList.innerHTML = '<li class="empty-msg">Nenhum arquivo encontrado.</li>';
        return;
      }

      elList.innerHTML = lista.map(item => {
        const caminhoCompleto = prefixo + item;
        return '<li class="file-item" onclick="abrirArquivo(\\'' + caminhoCompleto + '\\')">' +
          '<span><span class="file-icon">📄</span>' + item + '</span>' +
          '<span style="font-size: 0.75rem; color: var(--text-dim);">&rarr;</span>' +
        '</li>';
      }).join("");
    }

    async function abrirArquivo(caminhoRelativo) {
      arquivoAbertoAtual = caminhoRelativo;
      document.getElementById("modal-arquivo-titulo").textContent = caminhoRelativo;
      const body = document.getElementById("modal-arquivo-body");
      body.innerHTML = "<p>Carregando conteúdo...</p>";
      document.getElementById("markdown-modal").classList.add("active");

      try {
        const res = await fetch("/api/arquivo?path=" + encodeURIComponent(caminhoRelativo));
        const json = await res.json();
        if (json.erro) {
          body.innerHTML = '<p style="color: var(--accent-red);">Erro: ' + json.erro + '</p>';
          return;
        }

        if (window.marked) {
          body.innerHTML = marked.parse(json.conteudo);
        } else {
          // Fallback caso marked.js não carregue via CDN
          body.innerHTML = '<pre><code>' + escaparHtml(json.conteudo) + '</code></pre>';
        }
      } catch (err) {
        body.innerHTML = '<p style="color: var(--accent-red);">Falha ao carregar arquivo.</p>';
      }
    }

    function fecharModal() {
      document.getElementById("markdown-modal").classList.remove("active");
    }

    function fecharModalSeFora(e) {
      if (e.target.id === "markdown-modal") fecharModal();
    }

    function fecharActionModal() {
      document.getElementById("action-modal").classList.remove("active");
    }

    async function abrirNoEditor(caminho = "") {
      try {
        await fetch("/api/abrir-editor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caminho })
        });
      } catch {
        alert("Não foi possível acionar o editor de código.");
      }
    }

    function abrirArquivoNoEditor() {
      if (arquivoAbertoAtual) {
        abrirNoEditor("governanca/" + arquivoAbertoAtual);
      }
    }

    async function executarSincronizacao(modo) {
      if (modo === "total") {
        const confirmacao = prompt("⚠️ ATENÇÃO: Regeneração Total irá sobrescrever arquivos.\\nDigite 'REGENERAR TUDO' para confirmar:");
        if (confirmacao !== "REGENERAR TUDO") {
          alert("Operação cancelada.");
          return;
        }
      }

      const modal = document.getElementById("action-modal");
      const titulo = document.getElementById("action-modal-titulo");
      const terminal = document.getElementById("action-terminal-output");

      titulo.textContent = modo === "total" ? "Regeneração Total da Governança..." : "Sincronização Essencial da Governança...";
      terminal.textContent = "⏳ Conectando e sincronizando com a matriz da RR Tech Studio...\\nAguarde...\\n";
      modal.classList.add("active");

      try {
        const res = await fetch("/api/sincronizar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ modo })
        });
        const data = await res.json();
        terminal.textContent = data.output || "Concluído!";
        if (data.sucesso) {
          carregarDados();
        }
      } catch (err) {
        terminal.textContent = "❌ Erro ao disparar sincronização: " + err.message;
      }
    }

    async function executarHarness() {
      const modal = document.getElementById("action-modal");
      const titulo = document.getElementById("action-modal-titulo");
      const terminal = document.getElementById("action-terminal-output");

      titulo.textContent = "Re-sincronizando Harness (.agents/)...";
      terminal.textContent = "⏳ Executando harness.mjs...\\nAguarde...\\n";
      modal.classList.add("active");

      try {
        const res = await fetch("/api/harness", { method: "POST" });
        const data = await res.json();
        terminal.textContent = data.output || "Concluído!";
      } catch (err) {
        terminal.textContent = "❌ Erro ao executar harness: " + err.message;
      }
    }

    function escaparHtml(text) {
      return text.replace(/[&<>"']/g, function(m) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
      });
    }

    // Inicialização
    carregarDados();
  </script>
</body>
</html>`;
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
        try {
          const parsed = JSON.parse(body);
          if (parsed.modo === "total") modo = "total";
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
          const cmd = modo === "total"
            ? `node "${scriptSync}" --total -y`
            : `node "${scriptSync}"`;
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
