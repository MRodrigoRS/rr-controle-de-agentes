import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import {
  obterTodosProjetos,
  obterProjetoPorCaminho as obterProjetoPorCaminhoDb,
  inserirProjeto,
  atualizarProjetoDb,
  excluirProjetoDb,
  obterMetricasDb,
  salvarMetricasDb,
  type MetricasCodigo,
  type ProjetoRegistro,
} from "./db";

export type { ProjetoRegistro, MetricasCodigo };

export interface MetadadosGit {
  timestamp: number;
  iso: string;
  hash: string;
  mensagem: string;
  relativo: string;
}

export interface ProjetoComGit extends ProjetoRegistro {
  commit?: MetadadosGit | null;
  metricas?: MetricasCodigo | null;
  temStack: boolean;
  ultimoTimestamp: number;
  estaNaPastaProjetos: boolean;
}

export function estaNaPastaProjetos(caminho: string): boolean {
  try {
    const pastaProjetos = path.resolve("projetos").toLowerCase();
    const caminhoNormalizado = path.resolve(caminho).toLowerCase();
    return caminhoNormalizado.startsWith(pastaProjetos + path.sep) || caminhoNormalizado === pastaProjetos;
  } catch {
    return false;
  }
}

export function temArquivoStack(caminho: string): boolean {
  try {
    return fs.existsSync(path.join(path.resolve(caminho), "governanca", "livro-arquitetura", "02-stack.md"));
  } catch {
    return false;
  }
}

const EXTENSOES_BINARIAS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".svg", ".pdf",
  ".zip", ".tar", ".gz", ".7z", ".rar", ".exe", ".dll", ".so", ".bin",
  ".woff", ".woff2", ".ttf", ".eot", ".mp3", ".mp4", ".wav", ".db", ".sqlite", ".sqlite3"
]);

const caminhoArquivo = path.resolve("dados/projetos.json");

export function formatarTempoRelativo(dataMs: number): string {
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

export function formatarTokensEstimados(caracteres: number): string {
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

export function ehRaizGit(caminho: string): boolean {
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

export function obterMetadadosGit(caminho: string): MetadadosGit | null {
  try {
    if (!ehRaizGit(caminho)) return null;
    const out = execFileSync(
      "git",
      ["-C", caminho, "log", "-1", "--format=%ct|%cI|%h|%s"],
      { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"], timeout: 2000, windowsHide: true }
    ).trim();

    if (!out) return null;
    const [unix, iso, hash, ...msgParts] = out.split("|");
    const gitTs = Number(unix) * 1000;
    if (isNaN(gitTs)) return null;

    return {
      timestamp: gitTs,
      iso,
      hash,
      mensagem: msgParts.join("|"),
      relativo: formatarTempoRelativo(gitTs),
    };
  } catch {
    return null;
  }
}

export function obterMetricasCodigo(caminho: string, commitHash?: string): MetricasCodigo | null {
  try {
    if (!ehRaizGit(caminho)) return null;

    if (commitHash) {
      const cache = obterMetricasDb(caminho, commitHash);
      if (cache) return cache;
    }

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

    const metricas: MetricasCodigo = {
      totalLinhas,
      totalCaracteres,
      totalArquivos: arquivosTexto,
    };

    if (commitHash) {
      salvarMetricasDb(caminho, commitHash, metricas);
    }

    return metricas;
  } catch {
    return null;
  }
}

function sincronizarJson(projetos: ProjetoRegistro[]) {
  try {
    const dir = path.dirname(caminhoArquivo);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(caminhoArquivo, JSON.stringify(projetos, null, 2), "utf-8");
  } catch {
    // ignore
  }
}

export function carregarProjetos(): ProjetoRegistro[] {
  const projetos = obterTodosProjetos();
  sincronizarJson(projetos);
  return projetos;
}

export function carregarProjetosOrdenadosPorCommit(): ProjetoComGit[] {
  const projetos = carregarProjetos();
  const comGit: ProjetoComGit[] = projetos.map((p) => {
    const commit = obterMetadadosGit(p.caminho);
    const metricas = commit ? obterMetricasCodigo(p.caminho, commit.hash) : null;
    const temStack = temArquivoStack(p.caminho);
    const tsCriacao = new Date(p.criadoEm).getTime() || 0;
    const ultimoTimestamp = commit ? commit.timestamp : tsCriacao;
    const estaEmProjetos = estaNaPastaProjetos(p.caminho);
    return {
      ...p,
      commit,
      metricas,
      temStack,
      ultimoTimestamp,
      estaNaPastaProjetos: estaEmProjetos,
    };
  });

  return comGit.sort((a, b) => b.ultimoTimestamp - a.ultimoTimestamp);
}

export function obterProjetoPorCaminho(caminho: string): ProjetoRegistro | undefined {
  return obterProjetoPorCaminhoDb(caminho);
}

/**
 * @deprecated Use registrarProjeto, atualizarProjeto ou excluirProjeto para operações atômicas no SQLite.
 */
export function salvarProjetos(projetos: ProjetoRegistro[]) {
  for (const p of projetos) {
    inserirProjeto(p);
  }
  sincronizarJson(projetos);
}

export function registrarProjeto(projeto: ProjetoRegistro) {
  inserirProjeto(projeto);
  sincronizarJson(obterTodosProjetos());
}

export function atualizarProjeto(id: string, campos: Partial<ProjetoRegistro>): ProjetoRegistro | null {
  const atualizado = atualizarProjetoDb(id, campos);
  if (atualizado) {
    sincronizarJson(obterTodosProjetos());
  }
  return atualizado;
}

export function excluirProjeto(id: string): boolean {
  const res = excluirProjetoDb(id);
  if (res) {
    sincronizarJson(obterTodosProjetos());
  }
  return res;
}

export interface PontoHistoricoCommit {
  hash: string;
  mensagem: string;
  data: string; // YYYY-MM-DD
  timestamp: number;
  linhasTotais: number;
  insercoes: number;
  delecoes: number;
}

export interface RespostaHistoricoLinhas {
  pontos: PontoHistoricoCommit[];
  totalCommits: number;
  temMais: boolean;
  offset: number;
  limit: number;
}

export function obterHistoricoLinhasCommits(
  caminhoProjeto: string,
  limit: number = 10,
  offset: number = 0
): RespostaHistoricoLinhas {
  const respostaVazia: RespostaHistoricoLinhas = {
    pontos: [],
    totalCommits: 0,
    temMais: false,
    offset,
    limit,
  };

  try {
    if (!ehRaizGit(caminhoProjeto)) return respostaVazia;

    // 1. Contagem total de commits
    const countOut = execFileSync("git", ["-C", caminhoProjeto, "rev-list", "--count", "HEAD"], {
      encoding: "utf-8",
      timeout: 3000,
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    }).trim();

    const totalCommits = parseInt(countOut, 10);
    if (isNaN(totalCommits) || totalCommits === 0) return respostaVazia;

    // 2. Linhas atuais no HEAD
    const commitHead = obterMetadadosGit(caminhoProjeto);
    const metricasHead = commitHead ? obterMetricasCodigo(caminhoProjeto, commitHead.hash) : null;
    const totalLinhasHead = metricasHead ? metricasHead.totalLinhas : 0;

    // 3. Buscar commits até a janela requisitada (offset + limit)
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

    // 4. Parser dos commits e shortstat
    const linhas = logOut.split(/\r?\n/);
    interface CommitBruto {
      hash: string;
      mensagem: string;
      data: string;
      timestamp: number;
      insercoes: number;
      delecoes: number;
    }

    const commitsBrutos: CommitBruto[] = [];
    let commitAtual: CommitBruto | null = null;

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

    // 5. Cálculo cumulativo reverso de linhas totais
    let linhasAcumuladas = totalLinhasHead;
    const todosCalculados: PontoHistoricoCommit[] = [];

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

      // O total anterior ao commit era o total atual menos a variação (inserções - deleções)
      const deltaLiquido = c.insercoes - c.delecoes;
      linhasAcumuladas -= deltaLiquido;
    }

    // A janela requisitada vai de offset até offset + limit
    // Como os commits vêm do mais novo (HEAD) para o mais antigo,
    // revertemos para ordem cronológica (mais antigo -> mais novo) para exibição em linha do tempo.
    const fatia = todosCalculados.slice(offset, offset + limit).reverse();

    return {
      pontos: fatia,
      totalCommits,
      temMais: offset + limit < totalCommits,
      offset,
      limit,
    };
  } catch (error) {
    console.error("Erro ao obter histórico de linhas de commits:", error);
    return respostaVazia;
  }
}


