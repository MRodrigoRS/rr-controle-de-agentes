"use client";

import { useState, useMemo } from "react";
import dados from "@/servidor/dados/tecnologias.json";

const categorias = [...new Set(dados.map((t) => t.categoria))] as string[];

export function GuiaTecnologias() {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");

  const filtrados = useMemo(() => {
    return dados.filter((t) => {
      if (categoria && t.categoria !== categoria) return false;
      if (busca) {
        const q = busca.toLowerCase();
        return (
          t.nome.toLowerCase().includes(q) ||
          t.descricao.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [busca, categoria]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar tecnologia..."
          className="flex-1 rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:border-[#58a6ff] focus:outline-none"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] focus:border-[#58a6ff] focus:outline-none"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {filtrados.length === 0 ? (
        <p className="text-sm text-[#8b949e]">Nenhuma tecnologia encontrada.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#30363d]">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0d1117] text-left text-[#8b949e]">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Categoria</th>
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium">Aplicabilidade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]">
              {filtrados.map((t) => (
                <tr key={t.nome} className="bg-[#161b22] hover:bg-[#1a2332] transition">
                  <td className="px-4 py-3 font-medium text-[#e6edf3] whitespace-nowrap">{t.nome}</td>
                  <td className="px-4 py-3 text-[#8b949e] whitespace-nowrap">{t.categoria}</td>
                  <td className="px-4 py-3 text-[#8b949e]">{t.descricao}</td>
                  <td className="px-4 py-3 text-[#8b949e]">{t.aplicabilidade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
