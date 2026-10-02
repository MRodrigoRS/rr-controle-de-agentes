"use client";

import { useState } from "react";

interface Props {
  titulo: string;
  arquivos: string[];
  mensagemVazio: string;
  limiteInicial?: number;
}

export function CardListaArquivos({
  titulo,
  arquivos,
  mensagemVazio,
  limiteInicial = 5,
}: Props) {
  const [expandido, setExpandido] = useState(false);

  const temMais = arquivos.length > limiteInicial;
  const exibidos = expandido || !temMais ? arquivos : arquivos.slice(0, limiteInicial);
  const restantes = arquivos.length - limiteInicial;

  return (
    <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 shadow-sm flex flex-col justify-between">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-[#e6edf3]">{titulo}</h2>
          {arquivos.length > 0 && (
            <span className="rounded-full border border-[#30363d] bg-[#0d1117] px-2 py-0.5 text-xs text-[#8b949e]">
              {arquivos.length}
            </span>
          )}
        </div>

        {arquivos.length === 0 ? (
          <p className="text-sm text-[#8b949e]">{mensagemVazio}</p>
        ) : (
          <ul className="space-y-1">
            {exibidos.map((item) => (
              <li key={item} className="text-sm text-[#8b949e] break-all">
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {temMais && (
        <button
          type="button"
          onClick={() => setExpandido(!expandido)}
          className="mt-3 text-left text-sm font-medium text-[#58a6ff] hover:text-[#79c0ff] transition"
        >
          {expandido ? "Ver menos" : `Ver mais (+${restantes})`}
        </button>
      )}
    </div>
  );
}
