import { GuiaTecnologias } from "@/componentes/guia-tecnologias";
import { BotaoDeletarProjeto } from "@/componentes/botao-deletar-projeto";
import { BotaoVerStack } from "@/componentes/botao-ver-stack";
import { BotaoCopiarProjeto } from "@/componentes/botao-copiar-projeto";
import { carregarProjetosOrdenadosPorCommit, formatarTokensEstimados } from "@/servidor/projetos";

export const dynamic = "force-dynamic";

export default function Home() {
  const projetos = carregarProjetosOrdenadosPorCommit();

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#e6edf3]">Projetos</h1>
          <p className="mt-1 text-xs text-[#8b949e]">Ordenados automaticamente pela atividade e commits mais recentes.</p>
        </div>
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
              <div className="flex items-start justify-between">
                <a href={`/projetos/${p.id}`} className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-[#e6edf3] hover:text-[#58a6ff] transition">{p.nome}</h2>
                    {p.estaNaPastaProjetos ? (
                      <span
                        className="rounded-full bg-[#238636]/10 border border-[#238636]/30 px-2 py-0.5 text-[11px] font-medium text-[#3fb950]"
                        title="Projeto localizado na pasta projetos/ da governança"
                      >
                        Local (projetos/)
                      </span>
                    ) : (
                      <span
                        className="rounded-full bg-[#f0883e]/10 border border-[#f0883e]/30 px-2 py-0.5 text-[11px] font-medium text-[#f0883e]"
                        title={`Projeto localizado em pasta externa: ${p.caminho}`}
                      >
                        Externo
                      </span>
                    )}
                    {p.commit ? (
                      <span
                        className="rounded-full bg-[#238636]/15 border border-[#238636]/40 px-2.5 py-0.5 text-[11px] font-medium text-[#3fb950]"
                        title={`Último commit: ${new Date(p.commit.iso).toLocaleString("pt-BR")}`}
                      >
                        {p.commit.relativo}
                      </span>
                    ) : (
                      <span className="rounded-full bg-[#30363d]/50 px-2 py-0.5 text-[11px] text-[#8b949e]">
                        sem git
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-[#8b949e] truncate" title={p.caminho}>{p.caminho}</p>
                  {p.commit ? (
                    <p className="mt-2 text-xs text-[#7d8590] truncate flex items-center gap-1.5" title={`${p.commit.hash} - ${p.commit.mensagem}`}>
                      <span className="font-mono text-[#58a6ff]">{p.commit.hash}</span>
                      <span>—</span>
                      <span className="truncate text-[#8b949e]">{p.commit.mensagem}</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-[#7d8590]">
                      Criado em {new Date(p.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </a>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <BotaoCopiarProjeto
                    projetoId={p.id}
                    projetoNome={p.nome}
                    caminhoAtual={p.caminho}
                    estaNaPastaProjetos={p.estaNaPastaProjetos}
                  />
                  {p.metricas && p.metricas.totalLinhas > 0 && (
                    <span
                      className="rounded-full border border-[#30363d] bg-[#0d1117] px-3 py-1 text-xs font-mono text-[#58a6ff]"
                      title={`${p.metricas.totalLinhas.toLocaleString("pt-BR")} linhas, ${p.metricas.totalCaracteres.toLocaleString("pt-BR")} caracteres e ${formatarTokensEstimados(p.metricas.totalCaracteres)} estimados em ${p.metricas.totalArquivos.toLocaleString("pt-BR")} arquivos rastreados`}
                    >
                      {p.metricas.totalLinhas.toLocaleString("pt-BR")} linhas
                    </span>
                  )}
                  {p.temStack && (
                    <BotaoVerStack projetoId={p.id} nomeProjeto={p.nome} />
                  )}
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
