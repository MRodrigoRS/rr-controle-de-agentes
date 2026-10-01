"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  projetoId: string;
}

export function BotaoRecriarGovernanca({ projetoId }: Props) {
  const router = useRouter();
  const [recriando, setRecriando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  async function handleRecriar() {
    setRecriando(true);
    setMensagem("");
    try {
      const res = await fetch(`/api/projetos/${projetoId}`, { method: "PUT" });
      const data = await res.json();
      if (res.ok) {
        setMensagem("Governança recriada com sucesso!");
        router.refresh();
      } else {
        setMensagem(data.erro || "Erro ao recriar");
      }

    } catch {
      setMensagem("Erro de conexão");
    } finally {
      setRecriando(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleRecriar} disabled={recriando}
        className="rounded-lg border border-[#d2a8ff]/30 px-3 py-1.5 text-sm text-[#d2a8ff] hover:bg-[#d2a8ff]/10 disabled:opacity-50 transition whitespace-nowrap">
        {recriando ? "Recriando..." : "Recriar Governança"}
      </button>
      {mensagem && (
        <span className={`text-sm ${mensagem.includes("sucesso") ? "text-[#2ea043]" : "text-[#e94560]"}`}>
          {mensagem}
        </span>
      )}
    </div>
  );
}
