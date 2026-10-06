"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ModalConfirmarRegeneracaoTotal } from "./modal-confirmar-regeneracao-total";

interface Props {
  projetoId: string;
  projetoNome?: string;
}

export function BotaoRecriarGovernanca({ projetoId, projetoNome }: Props) {
  const router = useRouter();
  const [menuAberto, setMenuAberto] = useState(false);
  const [modalTotalAberta, setModalTotalAberta] = useState(false);
  const [recriando, setRecriando] = useState(false);
  const [modoEmExecucao, setModoEmExecucao] = useState<"essencial" | "total" | null>(null);
  const [mensagem, setMensagem] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuAberto(false);
      }
    }
    if (menuAberto) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuAberto]);

  async function handleRecriar(modo: "essencial" | "total") {
    setRecriando(true);
    setModoEmExecucao(modo);
    setMensagem("");
    setMenuAberto(false);

    try {
      const res = await fetch(`/api/projetos/${projetoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modo }),
      });
      const data = await res.json();
      if (res.ok) {
        setMensagem(data.mensagem || (modo === "total" ? "Regeneração total concluída!" : "Governança sincronizada com sucesso!"));
        setModalTotalAberta(false);
        router.refresh();
      } else {
        setMensagem(data.erro || "Erro ao atualizar governança");
      }
    } catch {
      setMensagem("Erro de conexão com o servidor");
    } finally {
      setRecriando(false);
      setModoEmExecucao(null);
    }
  }

  return (
    <div className="relative inline-flex items-center gap-2" ref={dropdownRef}>
      {/* Botão de Disparo do Menu */}
      <button
        type="button"
        onClick={() => setMenuAberto(!menuAberto)}
        disabled={recriando}
        className="inline-flex items-center gap-1.5 rounded-lg border border-[#d2a8ff]/40 bg-[#161b22] px-3 py-1.5 text-xs font-medium text-[#d2a8ff] hover:bg-[#d2a8ff]/10 hover:border-[#d2a8ff] disabled:opacity-50 transition whitespace-nowrap shadow-sm"
        title="Opções de atualização da governança"
      >
        <span>
          {recriando
            ? modoEmExecucao === "total"
              ? "Regenerando tudo..."
              : "Sincronizando..."
            : "Recriar Governança"}
        </span>
        <span className="text-[10px] opacity-75">▾</span>
      </button>

      {/* Dropdown com as duas opções */}
      {menuAberto && (
        <div className="absolute left-0 top-full mt-1.5 z-40 w-72 rounded-xl border border-[#30363d] bg-[#161b22] p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Opção 1: Essencial */}
          <button
            type="button"
            onClick={() => handleRecriar("essencial")}
            disabled={recriando}
            className="w-full text-left rounded-lg p-2 hover:bg-[#21262d] transition group flex flex-col gap-0.5"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#2ea043]" />
              <span className="text-xs font-semibold text-[#e6edf3] group-hover:text-[#58a6ff]">
                Sincronizar Essencial (Seguro)
              </span>
            </div>
            <p className="text-[11px] text-[#8b949e] pl-4 leading-snug">
              Atualiza padrões, workflows e skills da matriz. Preserva notas da sessão, sprints e livro de arquitetura.
            </p>
          </button>

          <div className="my-1 border-t border-[#30363d]/60" />

          {/* Opção 2: Total */}
          <button
            type="button"
            onClick={() => {
              setMenuAberto(false);
              setModalTotalAberta(true);
            }}
            disabled={recriando}
            className="w-full text-left rounded-lg p-2 hover:bg-[#f85149]/10 transition group flex flex-col gap-0.5"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#f85149]" />
              <span className="text-xs font-semibold text-[#f85149]">
                Regeneração Total...
              </span>
            </div>
            <p className="text-[11px] text-[#8b949e] pl-4 leading-snug">
              Sobrescreve todos os arquivos com os presets virgens da matriz. Salva backup automático prévio.
            </p>
          </button>
        </div>
      )}

      {/* Feedback em texto */}
      {mensagem && (
        <span
          className={`text-xs max-w-xs truncate ${
            mensagem.includes("sucesso") || mensagem.includes("concluída")
              ? "text-[#2ea043]"
              : "text-[#f85149]"
          }`}
          title={mensagem}
        >
          {mensagem}
        </span>
      )}

      {/* Modal de confirmação para regeneração total */}
      <ModalConfirmarRegeneracaoTotal
        aberto={modalTotalAberta}
        nomeProjeto={projetoNome}
        executando={recriando}
        onCancelar={() => setModalTotalAberta(false)}
        onConfirmar={() => handleRecriar("total")}
      />
    </div>
  );
}
