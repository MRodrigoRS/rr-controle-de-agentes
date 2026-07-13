import { GuiaTecnologias } from "@/componentes/guia-tecnologias";
import { BotaoDeletarProjeto } from "@/componentes/botao-deletar-projeto";
import { carregarProjetos } from "@/servidor/projetos";

export const dynamic = "force-dynamic";

export default function Home() {
  const projetos = carregarProjetos();

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#e6edf3]">Projetos</h1>
        <a href="/criar" className="rounded-lg bg-[#238636] px-4 py-2 text-sm text-white hover:bg-[#2ea043] transition">Novo Projeto</a>
      </div>

      {projetos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#30363d] p-12 text-center text-[#8b949e]">
          <p className="text-lg">Nenhum projeto criado ainda.</p>
          <p className="mt-1 text-sm">Crie seu primeiro projeto para começar.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {projetos.map((p) => (
            <div key={p.id}
              className="rounded-xl border border-[#30363d] bg-[#161b22] p-4 shadow-sm transition hover:border-[#58a6ff] hover:bg-[#1a2332]">
              <div className="flex items-center justify-between">
                <a href={`/projetos/${p.id}`} className="min-w-0 flex-1">
                  <h2 className="font-semibold text-[#e6edf3]">{p.nome}</h2>
                  <p className="mt-1 text-sm text-[#8b949e]">{p.caminho}</p>
                </a>
                <div className="flex items-center gap-2 ml-4">
                  <span className="rounded-full border border-[#30363d] bg-[#0d1117] px-3 py-1 text-xs font-medium text-[#8b949e]">{p.presetFrontend}</span>
                  <span className="rounded-full border border-[#30363d] bg-[#0d1117] px-3 py-1 text-xs font-medium text-[#8b949e]">{p.presetBackend}</span>
                  <BotaoDeletarProjeto projetoId={p.id} projetoNome={p.nome} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <hr className="my-12 border-[#30363d]" />

      <h2 className="mb-6 text-xl font-bold text-[#e6edf3]">Catálogo de Tecnologias</h2>
      <GuiaTecnologias />
    </>
  );
}
