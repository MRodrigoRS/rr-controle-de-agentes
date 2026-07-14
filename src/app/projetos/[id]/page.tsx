import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { BotaoDeletarProjeto } from "@/componentes/botao-deletar-projeto";
import { BotaoRecriarGovernanca } from "@/componentes/botao-recriar-governanca";
import { DescricaoColapsavel } from "@/componentes/descricao-colapsavel";
import { carregarProjetos } from "@/servidor/projetos";

export const dynamic = "force-dynamic";

function listarArquivos(dir: string): string[] {
  const fullPath = path.resolve(dir);
  if (!fs.existsSync(fullPath)) return [];
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  const arquivos: string[] = [];
  function walk(d: string, prefix = "") {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.isDirectory()) walk(path.join(d, e.name), rel);
      else if (e.name.endsWith(".md")) arquivos.push(rel);
    }
  }
  walk(fullPath);
  return arquivos;
}

export default async function DetalheProjeto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projeto = carregarProjetos().find((p) => p.id === id) ?? null;
  if (!projeto) notFound();

  const caminhoProjeto = path.resolve(projeto.caminho);
  const caminhoGovernanca = path.join(caminhoProjeto, "governanca");
  const sprints = listarArquivos(path.join(caminhoGovernanca, "sprints"));
  const skills = listarArquivos(path.join(caminhoGovernanca, "skills"));
  const arquitetura = listarArquivos(path.join(caminhoGovernanca, "livro-arquitetura"));

  return (
    <>
      <a href="/" className="mb-6 inline-block text-sm text-[#58a6ff] hover:text-[#79c0ff] transition">&larr; Voltar</a>

      <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#e6edf3]">{projeto.nome}</h1>
            {projeto.descricao && <DescricaoColapsavel texto={projeto.descricao} />}
          </div>
          <div className="flex items-center gap-3">
            {projeto.presetFrontend === "nenhum" && projeto.vinculado ? (
              <span className="rounded-full border border-yellow-700 bg-yellow-900/20 px-3 py-1 text-xs font-medium text-yellow-500" title="Aguardando detecção pela skill deduzir-presets-do-repositorio.md">frontend: aguardando detecção</span>
            ) : (
              <span className="rounded-full border border-[#30363d] bg-[#0d1117] px-3 py-1 text-xs font-medium text-[#8b949e]">{projeto.presetFrontend}</span>
            )}
            {projeto.presetBackend === "nenhum" && projeto.vinculado ? (
              <span className="rounded-full border border-yellow-700 bg-yellow-900/20 px-3 py-1 text-xs font-medium text-yellow-500" title="Aguardando detecção pela skill deduzir-presets-do-repositorio.md">backend: aguardando detecção</span>
            ) : (
              <span className="rounded-full border border-[#30363d] bg-[#0d1117] px-3 py-1 text-xs font-medium text-[#8b949e]">{projeto.presetBackend}</span>
            )}
            <BotaoRecriarGovernanca projetoId={projeto.id} />
            <BotaoDeletarProjeto projetoId={projeto.id} projetoNome={projeto.nome} />
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-[#8b949e]">
          <p><span className="font-medium text-[#e6edf3]">Caminho:</span> {projeto.caminho}</p>
          <p><span className="font-medium text-[#e6edf3]">Criado em:</span> {new Date(projeto.criadoEm).toLocaleString("pt-BR")}</p>
          <p><span className="font-medium text-[#e6edf3]">ID:</span> {projeto.id}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-[#e6edf3]">Sprints</h2>
          {sprints.length === 0 ? (
            <p className="text-sm text-[#8b949e]">Nenhuma sprint encontrada.</p>
          ) : (
            <ul className="space-y-1">
              {sprints.map((s) => (
                <li key={s} className="text-sm text-[#8b949e]">{s}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-[#e6edf3]">Skills</h2>
          {skills.length === 0 ? (
            <p className="text-sm text-[#8b949e]">Nenhuma skill encontrada.</p>
          ) : (
            <ul className="space-y-1">
              {skills.map((s) => (
                <li key={s} className="text-sm text-[#8b949e]">{s}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 shadow-sm">
          <h2 className="mb-3 font-semibold text-[#e6edf3]">Arquitetura</h2>
          {arquitetura.length === 0 ? (
            <p className="text-sm text-[#8b949e]">Nenhum registro de arquitetura.</p>
          ) : (
            <ul className="space-y-1">
              {arquitetura.map((a) => (
                <li key={a} className="text-sm text-[#8b949e]">{a}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
