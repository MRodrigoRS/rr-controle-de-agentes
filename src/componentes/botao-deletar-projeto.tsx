"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  projetoId: string;
  projetoNome: string;
  redirecionarPara?: string;
}

export function BotaoDeletarProjeto({ projetoId, projetoNome, redirecionarPara = "/" }: Props) {
  const [confirmando, setConfirmando] = useState(false);
  const [deletando, setDeletando] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setDeletando(true);
    try {
      const res = await fetch(`/api/projetos/${projetoId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao deletar");
      router.push(redirecionarPara);
      router.refresh();
    } catch {
      setDeletando(false);
      setConfirmando(false);
    }
  }

  if (confirmando) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#e94560]">Deletar {projetoNome}?</span>
        <button onClick={handleDelete} disabled={deletando}
          className="rounded-lg bg-[#e94560] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#d63851] disabled:opacity-50 transition">
          {deletando ? "Deletando..." : "Sim, deletar"}
        </button>
        <button onClick={() => setConfirmando(false)} disabled={deletando}
          className="rounded-lg border border-[#30363d] px-3 py-1.5 text-sm text-[#c9d1d9] hover:bg-[#21262d] disabled:opacity-50 transition">
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button onClick={() => setConfirmando(true)}
      className="rounded-lg border border-[#e94560]/30 px-3 py-1.5 text-sm text-[#e94560] hover:bg-[#e94560]/10 transition">
      Deletar
    </button>
  );
}
