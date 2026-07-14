import fs from "fs";
import path from "path";

export interface ProjetoRegistro {
  id: string;
  nome: string;
  descricao: string;
  presetFrontend: string;
  presetBackend: string;
  caminho: string;
  criadoEm: string;
  vinculado?: boolean;
}

const caminhoArquivo = path.resolve("dados/projetos.json");

export function carregarProjetos(): ProjetoRegistro[] {
  if (!fs.existsSync(caminhoArquivo)) return [];
  return JSON.parse(fs.readFileSync(caminhoArquivo, "utf-8"));
}

export function salvarProjetos(projetos: ProjetoRegistro[]) {
  fs.writeFileSync(caminhoArquivo, JSON.stringify(projetos, null, 2), "utf-8");
}

export function registrarProjeto(projeto: ProjetoRegistro) {
  const existentes = carregarProjetos();
  existentes.push(projeto);
  salvarProjetos(existentes);
}
