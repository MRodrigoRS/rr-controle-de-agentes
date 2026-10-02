"use client";

import { useEffect, useState, useMemo } from "react";
import type { PontoHistoricoCommit, RespostaHistoricoLinhas } from "@/servidor/projetos";

interface Props {
  projetoId: string;
}

export function GraficoEvolucaoLinhas({ projetoId }: Props) {
  const [pontos, setPontos] = useState<PontoHistoricoCommit[]>([]);
  const [totalCommits, setTotalCommits] = useState(0);
  const [temMais, setTemMais] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Carregamento inicial (10 commits)
  useEffect(() => {
    let ativo = true;
    async function carregarInicial() {
      setCarregando(true);
      setErro(null);
      try {
        const res = await fetch(`/api/projetos/${projetoId}/historico-linhas?limit=10&offset=0`);
        if (!res.ok) throw new Error("Não foi possível carregar o histórico de commits");
        const data: RespostaHistoricoLinhas = await res.json();
        if (ativo) {
          setPontos(data.pontos);
          setTotalCommits(data.totalCommits);
          setTemMais(data.temMais);
        }
      } catch (e) {
        if (ativo) {
          setErro(e instanceof Error ? e.message : "Erro desconhecido");
        }
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    carregarInicial();
    return () => {
      ativo = false;
    };
  }, [projetoId]);

  // Carregar mais 10 commits
  async function carregarMais() {
    if (carregandoMais || !temMais) return;
    setCarregandoMais(true);
    const novoLimite = pontos.length + 10;
    try {
      const res = await fetch(`/api/projetos/${projetoId}/historico-linhas?limit=${novoLimite}&offset=0`);
      if (!res.ok) throw new Error("Erro ao buscar commits anteriores");
      const data: RespostaHistoricoLinhas = await res.json();
      setPontos(data.pontos);
      setTotalCommits(data.totalCommits);
      setTemMais(data.temMais);
    } catch (e) {
      console.error(e);
    } finally {
      setCarregandoMais(false);
    }
  }

  // Geometria e coordenadas do SVG
  const dimensoes = {
    largura: 850,
    altura: 240,
    paddingLeft: 65,
    paddingRight: 35,
    paddingTop: 30,
    paddingBottom: 45,
  };

  const { minLinhas, maxLinhas, coordenadas, pathLinha, pathArea } = useMemo(() => {
    if (pontos.length === 0) {
      return { minLinhas: 0, maxLinhas: 0, coordenadas: [], pathLinha: "", pathArea: "" };
    }

    const valores = pontos.map((p) => p.linhasTotais);
    const minVal = Math.min(...valores);
    const maxVal = Math.max(...valores);

    // Margem vertical para a linha não colar no teto ou chão
    const margem = Math.max(10, Math.ceil((maxVal - minVal) * 0.15));
    const yMin = Math.max(0, minVal - margem);
    const yMax = maxVal + margem;
    const alcanceY = Math.max(1, yMax - yMin);

    const wUtil = dimensoes.largura - dimensoes.paddingLeft - dimensoes.paddingRight;
    const hUtil = dimensoes.altura - dimensoes.paddingTop - dimensoes.paddingBottom;

    const coords = pontos.map((p, idx) => {
      const x =
        pontos.length === 1
          ? dimensoes.paddingLeft + wUtil / 2
          : dimensoes.paddingLeft + (idx / (pontos.length - 1)) * wUtil;
      const y = dimensoes.altura - dimensoes.paddingBottom - ((p.linhasTotais - yMin) / alcanceY) * hUtil;
      return { x, y, ponto: p };
    });

    const dLinha = coords.reduce(
      (acc, c, idx) => (idx === 0 ? `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}` : `${acc} L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`),
      ""
    );

    const chaoY = dimensoes.altura - dimensoes.paddingBottom;
    const dArea =
      coords.length > 0
        ? `${dLinha} L ${coords[coords.length - 1].x.toFixed(1)} ${chaoY} L ${coords[0].x.toFixed(1)} ${chaoY} Z`
        : "";

    return {
      minLinhas: yMin,
      maxLinhas: yMax,
      coordenadas: coords,
      pathLinha: dLinha,
      pathArea: dArea,
    };
  }, [pontos, dimensoes.largura, dimensoes.altura, dimensoes.paddingLeft, dimensoes.paddingRight, dimensoes.paddingTop, dimensoes.paddingBottom]);

  if (carregando) {
    return (
      <div className="mt-8 rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-48 animate-pulse rounded bg-[#21262d]" />
          <div className="h-4 w-28 animate-pulse rounded bg-[#21262d]" />
        </div>
        <div className="h-44 w-full animate-pulse rounded-lg bg-[#0d1117]/60" />
      </div>
    );
  }

  if (erro || pontos.length < 2) {
    // Não exibe bloco se houver menos de 2 commits ou erro de repositório sem git
    return null;
  }

  const pontoHover = hoverIndex !== null && coordenadas[hoverIndex] ? coordenadas[hoverIndex] : null;
  const primeiroPonto = pontos[0];
  const ultimoPonto = pontos[pontos.length - 1];
  const variacaoPeriodo = ultimoPonto.linhasTotais - primeiroPonto.linhasTotais;

  return (
    <div className="mt-8 rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-sm">
      {/* Cabeçalho do Card */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-[#e6edf3]">Evolução do Volume de Linhas</h2>
            <span className="rounded-full border border-[#30363d] bg-[#0d1117] px-2.5 py-0.5 text-xs font-mono text-[#8b949e]">
              {pontos.length} de {totalCommits} commits
            </span>
          </div>
          <p className="mt-0.5 text-xs text-[#8b949e]">
            Variação no período exibido:{" "}
            <span
              className={`font-mono font-medium ${
                variacaoPeriodo > 0
                  ? "text-[#3fb950]"
                  : variacaoPeriodo < 0
                  ? "text-[#f85149]"
                  : "text-[#8b949e]"
              }`}
            >
              {variacaoPeriodo > 0 ? `+${variacaoPeriodo.toLocaleString("pt-BR")}` : variacaoPeriodo.toLocaleString("pt-BR")}{" "}
              linhas
            </span>
          </p>
        </div>

        <div className="text-xs text-[#7d8590]">
          Passe o mouse sobre os pontos para ver o delta do commit
        </div>
      </div>

      {/* Área do Gráfico SVG */}
      <div className="relative mt-4 w-full overflow-hidden rounded-lg border border-[#30363d]/60 bg-[#0d1117] p-2">
        <svg
          viewBox={`0 0 ${dimensoes.largura} ${dimensoes.altura}`}
          className="w-full h-auto select-none"
          style={{ maxHeight: "280px" }}
        >
          <defs>
            <linearGradient id="gradienteAzul" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#58a6ff" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#58a6ff" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Linhas de Grade Horizontais (3 níveis: Max, Médio, Min) */}
          {[0, 0.5, 1].map((pct) => {
            const y =
              dimensoes.paddingTop +
              (dimensoes.altura - dimensoes.paddingTop - dimensoes.paddingBottom) * (1 - pct);
            const valorLinha = Math.round(minLinhas + (maxLinhas - minLinhas) * pct);
            return (
              <g key={pct}>
                <line
                  x1={dimensoes.paddingLeft}
                  y1={y}
                  x2={dimensoes.largura - dimensoes.paddingRight}
                  y2={y}
                  stroke="#21262d"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <text
                  x={dimensoes.paddingLeft - 10}
                  y={y + 4}
                  fill="#7d8590"
                  fontSize="11"
                  textAnchor="end"
                  fontFamily="monospace"
                >
                  {valorLinha.toLocaleString("pt-BR")}
                </text>
              </g>
            );
          })}

          {/* Área Gradiente */}
          {pathArea && <path d={pathArea} fill="url(#gradienteAzul)" />}

          {/* Linha Contínua */}
          {pathLinha && (
            <path
              d={pathLinha}
              fill="none"
              stroke="#58a6ff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Linha vertical indicadora do hover */}
          {pontoHover && (
            <line
              x1={pontoHover.x}
              y1={dimensoes.paddingTop}
              x2={pontoHover.x}
              y2={dimensoes.altura - dimensoes.paddingBottom}
              stroke="#58a6ff"
              strokeDasharray="2 2"
              strokeWidth="1.5"
              opacity="0.6"
            />
          )}

          {/* Pontos Clicáveis / Interativos */}
          {coordenadas.map((coord, idx) => {
            const isHovered = hoverIndex === idx;
            return (
              <g
                key={coord.ponto.hash}
                className="cursor-pointer"
                onMouseEnter={() => setHoverIndex(idx)}
                onMouseLeave={() => setHoverIndex(null)}
              >
                {/* Alvo de toque ampliado transparente */}
                <circle cx={coord.x} cy={coord.y} r="14" fill="transparent" />

                {/* Halo de foco quando hovered */}
                {isHovered && (
                  <circle
                    cx={coord.x}
                    cy={coord.y}
                    r="8"
                    fill="#58a6ff"
                    fillOpacity="0.25"
                  />
                )}

                {/* Ponto principal */}
                <circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#0d1117"
                  stroke="#58a6ff"
                  strokeWidth={isHovered ? 2.5 : 2}
                  className="transition-all duration-150"
                />

                {/* Rótulo da data (apenas no primeiro, último ou quando poucos pontos) */}
                {(idx === 0 || idx === coordenadas.length - 1 || coordenadas.length <= 6) && (
                  <text
                    x={coord.x}
                    y={dimensoes.altura - dimensoes.paddingBottom + 18}
                    fill="#7d8590"
                    fontSize="10"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {coord.ponto.data.slice(5)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip Flutuante */}
        {pontoHover && (
          <div
            className="pointer-events-none absolute z-20 rounded-lg border border-[#30363d] bg-[#161b22]/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm transition-all"
            style={{
              left: `${Math.min(
                Math.max(15, (pontoHover.x / dimensoes.largura) * 100),
                80
              )}%`,
              top: `${Math.max(12, (pontoHover.y / dimensoes.altura) * 100 - 35)}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-[#58a6ff]">
                [{pontoHover.ponto.hash}]
              </span>
              <span className="text-[#8b949e]">{pontoHover.ponto.data}</span>
            </div>

            <div className="mt-1 font-medium text-[#e6edf3] line-clamp-2 max-w-xs">
              {pontoHover.ponto.mensagem}
            </div>

            <div className="mt-2 flex items-center justify-between gap-4 border-t border-[#30363d] pt-1.5 font-mono">
              <span className="text-[#8b949e]">
                Total:{" "}
                <strong className="text-[#e6edf3]">
                  {pontoHover.ponto.linhasTotais.toLocaleString("pt-BR")}
                </strong>{" "}
                linhas
              </span>
              <span className="flex items-center gap-1.5">
                {pontoHover.ponto.insercoes > 0 && (
                  <span className="text-[#3fb950]">
                    +{pontoHover.ponto.insercoes.toLocaleString("pt-BR")}
                  </span>
                )}
                {pontoHover.ponto.delecoes > 0 && (
                  <span className="text-[#f85149]">
                    -{pontoHover.ponto.delecoes.toLocaleString("pt-BR")}
                  </span>
                )}
                {pontoHover.ponto.insercoes === 0 && pontoHover.ponto.delecoes === 0 && (
                  <span className="text-[#7d8590]">0</span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Rodapé / Ação de Paginação sob Demanda */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="text-[#8b949e]">
          Linha do tempo: do commit mais antigo à esquerda ao mais recente à direita.
        </div>

        <div>
          {temMais ? (
            <button
              onClick={carregarMais}
              disabled={carregandoMais}
              className="inline-flex items-center gap-2 rounded-lg border border-[#30363d] bg-[#21262d] px-3.5 py-1.5 font-medium text-[#c9d1d9] hover:bg-[#30363d] hover:text-[#58a6ff] disabled:opacity-50 transition"
            >
              {carregandoMais ? (
                <>
                  <svg
                    className="h-3.5 w-3.5 animate-spin text-[#58a6ff]"
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
                  <span>Carregando commits...</span>
                </>
              ) : (
                <span>&larr; Carregar mais 10 commits anteriores</span>
              )}
            </button>
          ) : (
            <span className="text-[#7d8590] italic">
              Início do repositório alcançado ({totalCommits} commits no total)
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
