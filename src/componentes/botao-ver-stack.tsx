"use client";

import { useState, useEffect, useId } from "react";

interface Props {
  projetoId: string;
  nomeProjeto: string;
  className?: string;
}

export function BotaoVerStack({ projetoId, nomeProjeto, className }: Props) {
  const [aberto, setAberto] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [conteudo, setConteudo] = useState<string | null>(null);
  const [caminho, setCaminho] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [abrindoEditor, setAbrindoEditor] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const baseId = useId();

  // Fecha o modal no ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && aberto) {
        setAberto(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [aberto]);

  async function abrirModal(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setAberto(true);

    if (conteudo) return;

    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch(`/api/projetos/${projetoId}/stack`);
      if (!res.ok) {
        throw new Error("Arquivo 02-stack.md não encontrado neste projeto.");
      }
      const data = await res.json();
      setConteudo(data.conteudo);
      setCaminho(data.caminho);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao carregar stack");
    } finally {
      setCarregando(false);
    }
  }

  async function abrirNoEditor() {
    setAbrindoEditor(true);
    try {
      await fetch(`/api/projetos/${projetoId}/stack`, { method: "POST" });
    } catch {
      // ignore
    } finally {
      setAbrindoEditor(false);
    }
  }

  function copiarCaminho() {
    if (!caminho) return;
    navigator.clipboard.writeText(caminho);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  // Renderizador simplificado de Markdown (tabelas, títulos, listas, destaques)
  function renderizarMarkdown(md: string) {
    const linhas = md.split("\n");
    const elementos: React.ReactNode[] = [];
    let i = 0;

    while (i < linhas.length) {
      const linha = linhas[i];

      // Cabeçalhos
      if (linha.startsWith("# ")) {
        elementos.push(
          <h1 key={`${baseId}-${i}`} className="text-xl font-bold text-[#e6edf3] mt-4 mb-2 pb-1 border-b border-[#30363d]">
            {linha.replace("# ", "")}
          </h1>
        );
        i++;
        continue;
      }
      if (linha.startsWith("## ")) {
        elementos.push(
          <h2 key={`${baseId}-${i}`} className="text-lg font-semibold text-[#58a6ff] mt-5 mb-2">
            {linha.replace("## ", "")}
          </h2>
        );
        i++;
        continue;
      }
      if (linha.startsWith("### ")) {
        elementos.push(
          <h3 key={`${baseId}-${i}`} className="text-sm font-semibold text-[#e6edf3] mt-4 mb-2">
            {linha.replace("### ", "")}
          </h3>
        );
        i++;
        continue;
      }

      // Blockquotes
      if (linha.startsWith("> ")) {
        elementos.push(
          <blockquote key={`${baseId}-${i}`} className="border-l-2 border-[#58a6ff] pl-3 py-1 my-2 text-xs text-[#8b949e] italic bg-[#161b22]/50 rounded-r">
            {linha.replace(/^>\s*/, "")}
          </blockquote>
        );
        i++;
        continue;
      }

      // Tabela Markdown
      if (linha.includes("|") && linha.trim().startsWith("|")) {
        const tabelaLinhas: string[] = [];
        while (i < linhas.length && linhas[i].includes("|") && linhas[i].trim().startsWith("|")) {
          tabelaLinhas.push(linhas[i]);
          i++;
        }

        if (tabelaLinhas.length >= 2) {
          const headers = tabelaLinhas[0]
            .split("|")
            .map((c) => c.trim())
            .filter((c) => c !== "");
          // Ignora a linha de separadores (linha 1)
          const dadosLinhas = tabelaLinhas.slice(2);

          elementos.push(
            <div key={`${baseId}-tabela-${i}`} className="overflow-x-auto my-3 rounded-lg border border-[#30363d]">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#0d1117] text-[#8b949e] border-b border-[#30363d]">
                  <tr>
                    {headers.map((h, hIdx) => (
                      <th key={`${baseId}-th-${hIdx}`} className="px-3 py-2 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]">
                  {dadosLinhas.map((dl, rIdx) => {
                    const celulas = dl
                      .split("|")
                      .map((c) => c.trim())
                      .filter((c, idx, arr) => (idx === 0 && c === "" ? false : idx === arr.length - 1 && c === "" ? false : true));
                    return (
                      <tr key={`${baseId}-tr-${rIdx}`} className="hover:bg-[#1f242c] transition">
                        {celulas.map((c, cIdx) => (
                          <td key={`${baseId}-td-${cIdx}`} className="px-3 py-2 text-[#c9d1d9]">
                            {c.replace(/\*\*(.*?)\*\*/g, "$1")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
          continue;
        }
      }

      // Lista com marcadores
      if (linha.trim().startsWith("- ")) {
        elementos.push(
          <li key={`${baseId}-${i}`} className="ml-4 list-disc text-xs text-[#c9d1d9] my-0.5">
            {linha.replace(/^[\s-]*-\s*/, "")}
          </li>
        );
        i++;
        continue;
      }

      // Linha vazia
      if (!linha.trim()) {
        elementos.push(<div key={`${baseId}-vazia-${i}`} className="h-2" />);
        i++;
        continue;
      }

      // Parágrafo comum
      elementos.push(
        <p key={`${baseId}-${i}`} className="text-xs text-[#8b949e] my-1">
          {linha}
        </p>
      );
      i++;
    }

    return elementos;
  }

  return (
    <>
      <button
        type="button"
        onClick={abrirModal}
        title="Abrir e inspecionar governanca/livro-arquitetura/02-stack.md"
        className={
          className ||
          "rounded-full border border-[#30363d] bg-[#0d1117] px-3 py-1 text-xs font-medium text-[#58a6ff] hover:bg-[#21262d] hover:text-[#79c0ff] hover:border-[#58a6ff] transition flex items-center gap-1.5 shadow-sm"
        }
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#58a6ff]" />
        Stack
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setAberto(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[88vh] flex flex-col rounded-xl border border-[#30363d] bg-[#161b22] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Modal */}
            <div className="flex items-center justify-between border-b border-[#30363d] px-5 py-3.5 bg-[#0d1117]">
              <div className="flex items-center gap-2">
                <span className="rounded bg-[#58a6ff]/15 px-2 py-0.5 text-xs font-mono font-medium text-[#58a6ff]">
                  02-stack.md
                </span>
                <h3 className="font-semibold text-sm text-[#e6edf3]">{nomeProjeto}</h3>
              </div>

              <div className="flex items-center gap-2">
                {caminho && (
                  <>
                    <button
                      type="button"
                      onClick={abrirNoEditor}
                      disabled={abrindoEditor}
                      className="rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-medium text-[#e6edf3] hover:border-[#58a6ff] hover:text-[#58a6ff] transition disabled:opacity-50"
                      title="Abrir arquivo 02-stack.md no VS Code / editor"
                    >
                      {abrindoEditor ? "Abrindo..." : "Abrir no Editor"}
                    </button>
                    <button
                      type="button"
                      onClick={copiarCaminho}
                      className="rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-1.5 text-xs font-medium text-[#8b949e] hover:text-[#e6edf3] transition"
                      title="Copiar caminho absoluto do arquivo"
                    >
                      {copiado ? "Copiado!" : "Copiar Caminho"}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  className="rounded-lg p-1.5 text-[#8b949e] hover:bg-[#30363d] hover:text-[#e6edf3] transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Corpo com scroll */}
            <div className="flex-1 overflow-y-auto p-6 text-sm text-[#c9d1d9] space-y-2">
              {carregando && (
                <div className="py-12 text-center text-sm text-[#8b949e]">
                  Carregando 02-stack.md...
                </div>
              )}

              {erro && (
                <div className="rounded-lg border border-red-800 bg-red-950/20 p-4 text-xs text-red-400">
                  {erro}
                </div>
              )}

              {conteudo && !carregando && (
                <div>
                  {renderizarMarkdown(conteudo)}
                </div>
              )}
            </div>

            {/* Rodapé informativo */}
            {caminho && (
              <div className="border-t border-[#30363d] px-5 py-2.5 bg-[#0d1117] text-[11px] text-[#7d8590] truncate font-mono">
                {caminho}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
