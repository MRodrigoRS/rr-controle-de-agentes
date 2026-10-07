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
  return `/* INJECT_HTML_PAGE */`;
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
