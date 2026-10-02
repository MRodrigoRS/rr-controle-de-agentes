"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  projetoId: string;
  projetoNome: string;
  caminhoAtual: string;
  estaNaPastaProjetos?: boolean;
}

export function BotaoCopiarProjeto({
  projetoId,
  projetoNome,
  caminhoAtual,
  estaNaPastaProjetos = false,
}: Props) {
  const router = useRouter();
  const [modalAberto, setModalAberto] = useState(false);
  const [novoNome, setNovoNome] = useState(`${projetoNome} (Cópia)`);
  const [copiando, setCopiando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Não exibe o botão se o projeto já estiver dentro da pasta projetos/
  if (estaNaPastaProjetos) {
    return null;
  }

  async function handleCopiar(e: React.FormEvent) {
    e.preventDefault();
    setCopiando(true);
    setErro(null);

    try {
      const res = await fetch(`/api/projetos/${projetoId}/copiar-para-projetos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ novoNome }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.erro || "Erro ao copiar projeto");
      }

      setModalAberto(false);
      // Redireciona diretamente para o novo projeto copiado
      router.push(`/projetos/${data.projeto.id}`);
      router.refresh();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido ao copiar");
      setCopiando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setNovoNome(`${projetoNome} (Cópia)`);
          setErro(null);
          setModalAberto(true);
        }}
        className="rounded-lg border border-[#388bfd]/40 px-3 py-1.5 text-xs sm:text-sm font-medium text-[#58a6ff] hover:bg-[#388bfd]/10 hover:border-[#58a6ff] transition whitespace-nowrap"
        title="Copiar este projeto externo para a pasta projetos/ da governança"
      >
        Copiar para projetos/
      </button>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#30363d] pb-3">
              <h3 className="text-lg font-bold text-[#e6edf3]">
                Copiar para a pasta projetos/
              </h3>
              <button
                type="button"
                onClick={() => !copiando && setModalAberto(false)}
                className="text-[#8b949e] hover:text-[#e6edf3] text-lg font-mono"
                disabled={copiando}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCopiar} className="mt-4 space-y-4">
              <p className="text-xs text-[#8b949e] leading-relaxed">
                Esta ação copia o projeto por completo (código, histórico do Git, dependências e governança)
                para dentro do diretório <code className="text-[#58a6ff]">projetos/</code> da ferramenta principal.
                O projeto de origem permanecerá <strong>100% intacto</strong>.
              </p>

              <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3 text-xs space-y-1 font-mono">
                <p className="text-[#8b949e]">
                  <strong className="text-[#c9d1d9]">Origem:</strong> {caminhoAtual}
                </p>
                <p className="text-[#8b949e]">
                  <strong className="text-[#c9d1d9]">Destino:</strong> projetos/
                  <span className="text-[#58a6ff]">
                    {novoNome
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/[^a-z0-9_-]/g, "-")
                      .replace(/-+/g, "-") || "projeto-copia"}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#c9d1d9] mb-1">
                  Nome do Novo Projeto na Governança:
                </label>
                <input
                  type="text"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  required
                  disabled={copiando}
                  className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] focus:border-[#58a6ff] focus:outline-none transition"
                />
              </div>

              {erro && (
                <div className="rounded-lg border border-[#f85149]/40 bg-[#f85149]/10 p-3 text-xs text-[#ff7b72]">
                  {erro}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#30363d]">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  disabled={copiando}
                  className="rounded-lg border border-[#30363d] px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#21262d] disabled:opacity-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={copiando || !novoNome.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#238636] px-4 py-2 text-sm font-medium text-white hover:bg-[#2ea043] disabled:opacity-50 transition"
                >
                  {copiando ? (
                    <>
                      <svg
                        className="h-4 w-4 animate-spin text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      <span>Copiando arquivos...</span>
                    </>
                  ) : (
                    <span>Iniciar Cópia</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
