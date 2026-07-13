"use client";

import { useState } from "react";

interface Props {
  texto: string;
}

export function DescricaoColapsavel({ texto }: Props) {
  const [aberto, setAberto] = useState(false);
  const linhas = 6;

  return (
    <div>
      <p
        className={`mt-2 text-[#8b949e] whitespace-pre-wrap break-words ${
          !aberto ? "overflow-hidden" : ""
        }`}
        style={!aberto ? { display: "-webkit-box", WebkitLineClamp: linhas, WebkitBoxOrient: "vertical" } : undefined}
      >
        {texto}
      </p>
      <button
        type="button"
        onClick={() => setAberto(!aberto)}
        className="mt-1 text-sm text-[#58a6ff] hover:text-[#79c0ff] transition"
      >
        {aberto ? "Ver menos" : "Ver mais"}
      </button>
    </div>
  );
}
