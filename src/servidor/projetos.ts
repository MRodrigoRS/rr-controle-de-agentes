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
  ultimoTimestamp: number;
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
    const tsCriacao = new Date(p.criadoEm).getTime() || 0;
    const ultimoTimestamp = commit ? commit.timestamp : tsCriacao;
    return {
      ...p,
      commit,
      metricas,
      ultimoTimestamp,
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

