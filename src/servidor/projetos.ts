import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import {
  obterTodosProjetos,
  obterProjetoPorCaminho as obterProjetoPorCaminhoDb,
  inserirProjeto,
  atualizarProjetoDb,
  excluirProjetoDb,
  type ProjetoRegistro,
} from "./db";

export type { ProjetoRegistro };

export interface MetadadosGit {
  timestamp: number;
  iso: string;
  hash: string;
  mensagem: string;
  relativo: string;
}

export interface ProjetoComGit extends ProjetoRegistro {
  commit?: MetadadosGit | null;
  ultimoTimestamp: number;
}

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

export function obterMetadadosGit(caminho: string): MetadadosGit | null {
  try {
    if (!fs.existsSync(caminho)) return null;
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
    const tsCriacao = new Date(p.criadoEm).getTime() || 0;
    const ultimoTimestamp = commit ? commit.timestamp : tsCriacao;
    return {
      ...p,
      commit,
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

