"use client";

import { useState, useMemo, useEffect } from "react";
import dadosIniciais from "@/servidor/dados/tecnologias.json";

interface ItemTecnologia {
  id?: number;
  nome: string;
  categoria: string;
  descricao: string;
  aplicabilidade: string;
}

export function GuiaTecnologias() {
  const [tecnologias, setTecnologias] = useState<ItemTecnologia[]>(dadosIniciais as ItemTecnologia[]);
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");

  // Busca as tecnologias atualizadas em runtime da API (SQLite)
  useEffect(() => {
    let ativo = true;
    fetch("/api/tecnologias")
      .then((res) => {
        if (!res.ok) throw new Error("Falha ao buscar tecnologias");
        return res.json();
      })
      .then((data) => {
        if (ativo && Array.isArray(data) && data.length > 0) {
          setTecnologias(data);
        }
      })
      .catch(() => {
        // Mantém os dados iniciais do snapshot se a chamada falhar
      });

    return () => {
      ativo = false;
    };
  }, []);

  const categorias = useMemo(() => {
    return [...new Set(tecnologias.map((t) => t.categoria))].sort();
  }, [tecnologias]);

  const filtrados = useMemo(() => {
    return tecnologias.filter((t) => {
      if (categoria && t.categoria !== categoria) return false;
      if (busca) {
        const q = busca.toLowerCase().trim();
        const idBusca = q.replace(/^#/, "");
        const idMatch = t.id !== undefined && String(t.id) === idBusca;
        return (
          idMatch ||
          t.nome.toLowerCase().includes(q) ||
          t.descricao.toLowerCase().includes(q) ||
          t.aplicabilidade.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tecnologias, busca, categoria]);

  const LIMITE_PADRAO = 10;
  const [expandido, setExpandido] = useState(false);

  const temMais = filtrados.length > LIMITE_PADRAO;
  const exibidos = expandido || !temMais ? filtrados : filtrados.slice(0, LIMITE_PADRAO);
  const restantes = filtrados.length - LIMITE_PADRAO;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar tecnologia por nome, ID (ex: #129), papel ou descrição..."
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

      <div className="flex items-center justify-between text-xs text-[#8b949e]">
        <span>
          Mostrando {exibidos.length} de {filtrados.length} tecnologia{filtrados.length !== 1 ? "s" : ""}
          {busca || categoria ? " (com filtros aplicados)" : ""}
        </span>
      </div>

      {filtrados.length === 0 ? (
        <p className="text-sm text-[#8b949e]">Nenhuma tecnologia encontrada.</p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-[#30363d]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0d1117] text-left text-[#8b949e]">
                  <th className="px-3 py-3 font-medium text-center w-14">ID</th>
                  <th className="px-4 py-3 font-medium">Nome</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 font-medium">Descrição</th>
                  <th className="px-4 py-3 font-medium">Aplicabilidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30363d]">
                {exibidos.map((t) => (
                  <tr key={`${t.id ?? t.nome}-${t.nome}`} className="bg-[#161b22] hover:bg-[#1a2332] transition">
                    <td className="px-3 py-3 text-center text-xs font-mono text-[#58a6ff]">{t.id ?? "-"}</td>
                    <td className="px-4 py-3 font-medium text-[#e6edf3] whitespace-nowrap">{t.nome}</td>
                    <td className="px-4 py-3 text-[#8b949e] whitespace-nowrap">{t.categoria}</td>
                    <td className="px-4 py-3 text-[#8b949e]">{t.descricao}</td>
                    <td className="px-4 py-3 text-[#8b949e]">{t.aplicabilidade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {temMais && (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={() => setExpandido(!expandido)}
                className="inline-flex items-center gap-2 rounded-lg border border-[#30363d] bg-[#161b22] px-4 py-2 text-sm font-medium text-[#58a6ff] hover:bg-[#21262d] hover:text-[#79c0ff] hover:border-[#58a6ff] transition shadow-sm"
              >
                {expandido ? "Ver menos" : `Ver mais (+${restantes} tecnologias)`}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
