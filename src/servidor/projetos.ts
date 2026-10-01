import {
  obterTodosProjetos,
  obterProjetoPorCaminho as obterProjetoPorCaminhoDb,
  inserirProjeto,
  atualizarProjetoDb,
  excluirProjetoDb,
  type ProjetoRegistro,
} from "./db";
import fs from "fs";
import path from "path";

export type { ProjetoRegistro };

const caminhoArquivo = path.resolve("dados/projetos.json");

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

