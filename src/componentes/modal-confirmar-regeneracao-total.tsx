"use client";

import React from "react";

interface Props {
  aberto: boolean;
  nomeProjeto?: string;
  executando: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export function ModalConfirmarRegeneracaoTotal({
  aberto,
  nomeProjeto,
  executando,
  onConfirmar,
  onCancelar,
}: Props) {
  if (!aberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={executando ? undefined : onCancelar}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-[#f85149]/40 bg-[#161b22] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center gap-3 border-b border-[#30363d] px-5 py-4 bg-[#0d1117]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f85149]/15 text-[#f85149] font-bold text-lg">
            ⚠️
          </div>
          <div>
            <h3 className="font-semibold text-sm text-[#e6edf3]">
              Confirmar Regeneração Total (Hard Reset)
            </h3>
            {nomeProjeto && (
              <p className="text-xs text-[#8b949e]">Projeto: <span className="text-[#c9d1d9] font-medium">{nomeProjeto}</span></p>
            )}
          </div>
        </div>

        {/* Corpo com avisos */}
        <div className="p-5 space-y-4 text-xs text-[#c9d1d9]">
          <div className="rounded-lg border border-[#f85149]/30 bg-[#f85149]/10 p-3.5 space-y-2 text-[#ff7b72]">
            <p className="font-semibold text-sm flex items-center gap-1.5">
              <span>Atenção:</span> Ação de impacto profundo!
            </p>
            <p className="leading-relaxed">
              Esta operação irá regenerar <strong>100% dos arquivos de governança</strong> a partir dos templates da matriz.
            </p>
          </div>

          <div className="space-y-2 text-[#8b949e] leading-relaxed">
            <p className="text-[#e6edf3] font-medium">O que será afetado:</p>
            <ul className="list-disc ml-5 space-y-1">
              <li>Notas da sessão viva (<code className="text-[#d2a8ff]">governanca/SESSAO.md</code>)</li>
              <li>Histórico e planejamento de sprints (<code className="text-[#d2a8ff]">governanca/sprints/</code>)</li>
              <li>Visão de produto (<code className="text-[#d2a8ff]">governanca/PRD.md</code> e <code className="text-[#d2a8ff]">PLANO.md</code>)</li>
              <li>Livro de arquitetura local e decisões (<code className="text-[#d2a8ff]">governanca/livro-arquitetura/</code>)</li>
            </ul>
          </div>

          <div className="rounded-lg border border-[#30363d] bg-[#0d1117] p-3 text-[#2ea043] flex items-center gap-2">
            <span>🛡️</span>
            <span>
              <strong>Rede de Segurança:</strong> Um backup automático da pasta atual será salvo em <code className="text-[#79c0ff]">.backup-governanca-*</code> antes de qualquer alteração.
            </span>
          </div>
        </div>

        {/* Rodapé / Ações */}
        <div className="flex items-center justify-end gap-2 border-t border-[#30363d] px-5 py-3.5 bg-[#0d1117]">
          <button
            type="button"
            onClick={onCancelar}
            disabled={executando}
            className="rounded-lg border border-[#30363d] px-3.5 py-1.5 text-xs text-[#c9d1d9] hover:bg-[#21262d] disabled:opacity-50 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={executando}
            className="rounded-lg bg-[#f85149] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#da3633] disabled:opacity-50 transition shadow-sm"
          >
            {executando ? "Regenerando e Salvando Backup..." : "Sim, Regenerar Tudo"}
          </button>
        </div>
      </div>
    </div>
  );
}
