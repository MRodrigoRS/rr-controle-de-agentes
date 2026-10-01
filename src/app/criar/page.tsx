"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface TecnologiaBadge {
  id?: number;
  nome: string;
  categoria?: string;
  aplicabilidade?: string;
  descricao?: string;
}

interface PresetOpcao {
  id: string;
  nome: string;
  descricao: string;
  destaque: string;
  stack: string[];
  tecnologias?: TecnologiaBadge[];
}

interface FullstackOpcao {
  id: string;
  nome: string;
  categoria: string;
  destaque?: string;
  frontend: string;
  backend: string;
  objetivo: string;
  vantagens: string[];
  stack?: string[];
  tecnologias?: TecnologiaBadge[];
}

function BadgeTecnologia({ tec }: { tec: TecnologiaBadge }) {
  const tooltip = tec.aplicabilidade || tec.descricao || tec.nome;

  return (
    <span
      title={tooltip}
      className="inline-flex items-center rounded-md bg-[#0d1117] px-2 py-0.5 text-xs text-[#8b949e] border border-[#30363d] hover:border-[#58a6ff] hover:text-[#e6edf3] transition cursor-help"
    >
      {tec.id !== undefined && <span className="text-[#58a6ff] font-mono text-[10px] mr-1">#{tec.id}</span>}
      <span>{tec.nome}</span>
    </span>
  );
}

function CardPreset({
  item,
  selecionado,
  aoSelecionar,
}: {
  item: PresetOpcao;
  selecionado: boolean;
  aoSelecionar: () => void;
  nome: string;
}) {
  const tecs: TecnologiaBadge[] =
    item.tecnologias && item.tecnologias.length > 0
      ? item.tecnologias
      : item.stack.map((s) => ({ nome: s }));

  return (
    <div
      onClick={aoSelecionar}
      className={`cursor-pointer rounded-xl border p-4 transition flex flex-col justify-between ${
        selecionado
          ? "border-[#58a6ff] bg-[#1a2332] shadow-sm"
          : "border-[#30363d] bg-[#161b22] hover:border-[#8b949e]"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                selecionado ? "border-[#58a6ff] bg-[#58a6ff]" : "border-[#30363d] bg-[#0d1117]"
              }`}
            >
              {selecionado && <div className="w-1.5 h-1.5 rounded-full bg-[#0d1117]" />}
            </div>
            <span className="font-semibold text-[#e6edf3]">{item.nome}</span>
          </div>
          {item.id !== "nenhum" && item.destaque && (
            <span className="rounded-full bg-[#58a6ff]/10 border border-[#58a6ff]/20 px-2.5 py-0.5 text-xs font-medium text-[#58a6ff] whitespace-nowrap">
              {item.destaque}
            </span>
          )}
        </div>

        <p className="mt-2 text-sm text-[#8b949e]">{item.descricao}</p>
      </div>

      {tecs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#30363d]/60 flex flex-wrap gap-1.5">
          {tecs.map((t, idx) => (
            <BadgeTecnologia key={`${t.id ?? t.nome}-${idx}`} tec={t} />
          ))}
        </div>
      )}
    </div>
  );
}

function CardFullstack({
  combo,
  fe,
  be,
  selecionado,
  aoSelecionar,
}: {
  combo: FullstackOpcao;
  fe: PresetOpcao | undefined;
  be: PresetOpcao | undefined;
  selecionado: boolean;
  aoSelecionar: () => void;
}) {
  const tecs: TecnologiaBadge[] =
    combo.tecnologias && combo.tecnologias.length > 0
      ? combo.tecnologias
      : [
          ...(fe?.tecnologias ?? fe?.stack.map((s) => ({ nome: s })) ?? []),
          ...(be?.tecnologias ?? be?.stack.map((s) => ({ nome: s })) ?? []),
        ];

  return (
    <div
      onClick={aoSelecionar}
      className={`cursor-pointer rounded-xl border p-4 transition flex flex-col justify-between text-left ${
        selecionado
          ? "border-[#58a6ff] bg-[#1a2332] shadow-sm"
          : "border-[#30363d] bg-[#161b22] hover:border-[#8b949e]"
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                selecionado ? "border-[#58a6ff] bg-[#58a6ff]" : "border-[#30363d] bg-[#0d1117]"
              }`}
            >
              {selecionado && <div className="w-1.5 h-1.5 rounded-full bg-[#0d1117]" />}
            </div>
            <span className="font-semibold text-[#e6edf3]">{combo.nome}</span>
          </div>
          <span className="rounded-full bg-[#58a6ff]/10 border border-[#58a6ff]/20 px-2.5 py-0.5 text-xs font-medium text-[#58a6ff] whitespace-nowrap">
            {combo.categoria}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="rounded-md bg-[#0d1117] border border-[#30363d] px-2 py-0.5 text-[#c9d1d9] font-medium">
            {fe?.nome ?? combo.frontend}
          </span>
          <span className="text-[#8b949e] font-bold">+</span>
          <span className="rounded-md bg-[#0d1117] border border-[#30363d] px-2 py-0.5 text-[#c9d1d9] font-medium">
            {be?.nome ?? combo.backend}
          </span>
          {combo.destaque && <span className="text-[#58a6ff] ml-1 font-medium">• {combo.destaque}</span>}
        </div>

        <p className="mt-2 text-sm text-[#8b949e]">{combo.objetivo}</p>

        {combo.vantagens.length > 0 && (
          <ul className="mt-2 space-y-1">
            {combo.vantagens.map((v, i) => (
              <li key={i} className="flex gap-1.5 text-xs text-[#8b949e]">
                <span className="text-[#58a6ff]">•</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {tecs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#30363d]/60 flex flex-wrap gap-1.5">
          {tecs.map((t, idx) => (
            <BadgeTecnologia key={`${t.id ?? t.nome}-${idx}`} tec={t} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CriarProjeto() {
  const router = useRouter();
  const [frontends, setFrontends] = useState<PresetOpcao[]>([]);
  const [backends, setBackends] = useState<PresetOpcao[]>([]);
  const [fullstacks, setFullstacks] = useState<FullstackOpcao[]>([]);
  const [aba, setAba] = useState<"conjuntos" | "livre">("conjuntos");
  const [carregando, setCarregando] = useState(true);
  const [tipo, setTipo] = useState<"novo" | "vincular">("novo");
  const [modoVinculacao, setModoVinculacao] = useState<"manter" | "migrar">("manter");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [frontend, setFrontend] = useState("");
  const [backend, setBackend] = useState("");
  const [caminho, setCaminho] = useState("");
  const [selecionando, setSelecionando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [avisoGovernanca, setAvisoGovernanca] = useState(false);
  const [importAberto, setImportAberto] = useState(false);
  const [importTexto, setImportTexto] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    if (!arquivo) return;
    if (!arquivo.name.endsWith(".md")) { setErro("Apenas arquivos .md"); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const texto = reader.result as string;
      setImportTexto(texto);
      setDescricao(texto);
    };
    reader.readAsText(arquivo);
  }

  function aplicarImport() {
    if (importTexto.trim()) setDescricao(importTexto);
  }

  useEffect(() => {
    fetch("/api/presets")
      .then((res) => res.json())
      .then((data) => {
        setFrontends(data.frontend);
        setBackends(data.backend);
        setFullstacks(data.fullstacks ?? []);
        if (data.frontend.length > 0) setFrontend(data.frontend[0].id);
        if (data.backend.length > 0) setBackend(data.backend[0].id);
        setCarregando(false);
      })
      .catch(() => {
        setErro("Falha ao carregar presets");
        setCarregando(false);
      });
  }, []);

  async function selecionarPasta() {
    setSelecionando(true);
    try {
      const res = await fetch("/api/selecionar-pasta");
      const data = await res.json();
      if (data.caminho) {
        setCaminho(data.caminho);
        setAvisoGovernanca(false);
      }
    } catch {
    } finally {
      setSelecionando(false);
    }
  }

  async function enviarCriacao(sobrescrever = false) {
    setErro("");
    setEnviando(true);
    try {
      const body: Record<string, unknown> = {
        nome: nome.trim(),
        descricao,
        caminho: caminho.trim() || undefined,
        sobrescrever,
      };

      if (tipo === "vincular") {
        body.vinculado = true;
        if (modoVinculacao === "migrar") {
          body.migrarStack = true;
          body.frontend = frontend;
          body.backend = backend;
        }
      } else {
        body.frontend = frontend;
        body.backend = backend;
      }

      const res = await fetch("/api/projetos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.status === 409 && data.governancaExistente) {
        setAvisoGovernanca(true);
        setErro("");
        return;
      }

      if (!res.ok) {
        throw new Error(data.erro || "Erro ao criar projeto");
      }

      setAvisoGovernanca(false);
      router.push(`/projetos/${data.id}`);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setEnviando(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setAvisoGovernanca(false);
    if (!nome.trim()) { setErro("Nome é obrigatório"); return; }
    if (tipo === "vincular" && !caminho.trim()) { setErro("Caminho do repositório é obrigatório para vincular"); return; }
    await enviarCriacao(false);
  }

  if (carregando) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-[#8b949e]">Carregando presets...</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-8 text-2xl font-bold text-[#e6edf3]">Criar Projeto</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#e6edf3]">Tipo de Projeto</h2>
          <div className="flex gap-4">
            <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition flex-1 ${tipo === "novo" ? "border-[#58a6ff] bg-[#1a2332]" : "border-[#30363d] bg-[#0d1117] hover:border-[#8b949e]"}`}>
              <input type="radio" name="tipo" value="novo" checked={tipo === "novo"} onChange={() => setTipo("novo")} className="accent-[#58a6ff]" />
              <div>
                <span className="font-medium text-[#e6edf3]">Novo</span>
                <p className="text-xs text-[#8b949e]">Cria do zero com presets de stack</p>
              </div>
            </label>
            <label className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 transition flex-1 ${tipo === "vincular" ? "border-[#58a6ff] bg-[#1a2332]" : "border-[#30363d] bg-[#0d1117] hover:border-[#8b949e]"}`}>
              <input type="radio" name="tipo" value="vincular" checked={tipo === "vincular"} onChange={() => setTipo("vincular")} className="accent-[#58a6ff]" />
              <div>
                <span className="font-medium text-[#e6edf3]">Vincular</span>
                <p className="text-xs text-[#8b949e]">Governança para repositório existente</p>
              </div>
            </label>
          </div>
        </div>

        {tipo === "vincular" && (
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-sm space-y-4">
            <div>
              <h2 className="font-semibold text-[#e6edf3]">Modo de Vinculação</h2>
              <p className="text-xs text-[#8b949e] mt-1">
                Escolha se deseja manter a base tecnológica atual ou realizar um replatforming seguro com IA.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  modoVinculacao === "manter"
                    ? "border-[#58a6ff] bg-[#1a2332]"
                    : "border-[#30363d] bg-[#0d1117] hover:border-[#8b949e]"
                }`}
              >
                <input
                  type="radio"
                  name="modoVinculacao"
                  value="manter"
                  checked={modoVinculacao === "manter"}
                  onChange={() => setModoVinculacao("manter")}
                  className="mt-1 accent-[#58a6ff]"
                />
                <div>
                  <span className="font-semibold text-[#e6edf3]">Manter Stack Atual</span>
                  <p className="mt-1 text-xs text-[#8b949e]">
                    Adiciona a governança ao projeto existente. O agente documentará a stack atual e você continuará evoluindo na mesma base tecnológica.
                  </p>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  modoVinculacao === "migrar"
                    ? "border-[#58a6ff] bg-[#1a2332]"
                    : "border-[#30363d] bg-[#0d1117] hover:border-[#8b949e]"
                }`}
              >
                <input
                  type="radio"
                  name="modoVinculacao"
                  value="migrar"
                  checked={modoVinculacao === "migrar"}
                  onChange={() => setModoVinculacao("migrar")}
                  className="mt-1 accent-[#58a6ff]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#e6edf3]">Migrar para Nova Stack</span>
                    <span className="rounded-full bg-[#58a6ff]/10 border border-[#58a6ff]/20 px-2 py-0.5 text-[10px] font-semibold text-[#58a6ff]">
                      Replatforming
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#8b949e]">
                    Transfere o projeto para uma stack moderna em branch isolada. Preserva 100% da lógica de negócio via inventário De-Para e migração side-by-side.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-sm space-y-4">
          <button type="button" onClick={() => setImportAberto(!importAberto)}
            className="flex w-full items-center justify-between text-left">
          <h2 className="font-semibold text-[#e6edf3]">Importar Documento</h2>
            <span className="text-[#8b949e] text-sm">{importAberto ? "▲" : "▼"}</span>
          </button>
          {importAberto && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input ref={fileInputRef} type="file" accept=".md" onChange={handleFileUpload}
                  className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-2 text-sm text-[#c9d1d9] hover:bg-[#30363d] transition">
                  Upload .md
                </button>
                <span className="text-sm text-[#8b949e] self-center">ou cole o texto abaixo</span>
              </div>
              <textarea value={importTexto} onChange={(e) => setImportTexto(e.target.value)} rows={8}
                className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:border-[#58a6ff] focus:outline-none font-mono"
                placeholder="Cole o conteudo do documento de requisitos (.md) aqui..." />
              <button type="button" onClick={aplicarImport}
                className="rounded-lg bg-[#238636] px-4 py-2 text-sm text-white hover:bg-[#2ea043] transition">
                Aplicar como Descrição
              </button>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-sm space-y-4">
          <h2 className="font-semibold text-[#e6edf3]">Informações Básicas</h2>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#8b949e]">Nome do Projeto *</label>
            <input value={nome} onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:border-[#58a6ff] focus:outline-none"
              placeholder="meu-app" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#8b949e]">Descrição</label>
            <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3}
              className="w-full rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:border-[#58a6ff] focus:outline-none"
              placeholder="O que esse projeto faz?" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[#8b949e]">Caminho {tipo === "vincular" ? <span className="text-[#e94560]">*</span> : <span className="text-[#8b949e]">(opcional)</span>}</label>
            <div className="flex gap-2">
              <input value={caminho} onChange={(e) => setCaminho(e.target.value)}
                className="flex-1 rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:border-[#58a6ff] focus:outline-none"
                placeholder={tipo === "vincular" ? "C:\\Users\\...\\meu-repo" : `Deixe vazio para criar em ./projetos/${nome || "meu-app"}`} />
              <button type="button" onClick={selecionarPasta} disabled={selecionando}
                className="flex items-center gap-1.5 rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-2 text-sm text-[#c9d1d9] hover:bg-[#30363d] disabled:opacity-50 transition whitespace-nowrap">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {selecionando ? "Abrindo..." : "Selecionar Pasta"}
              </button>
            </div>
            {tipo === "vincular" && modoVinculacao === "manter" && (
              <p className="mt-1 text-xs text-[#8b949e]">A stack será documentada pelo agente durante a vinculação. Presets não se aplicam.</p>
            )}
            {tipo === "vincular" && modoVinculacao === "migrar" && (
              <p className="mt-1 text-xs text-[#58a6ff]">O código legado será mantido intacto e a migração ocorrerá em branch separada com migração side-by-side.</p>
            )}
          </div>
        </div>

        {(tipo === "novo" || (tipo === "vincular" && modoVinculacao === "migrar")) && (
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-[#e6edf3]">
                  {tipo === "vincular" ? "Stack Tecnológica de Destino (Alvo da Refatoração)" : "Stack Tecnológica"}
                </h2>
                {tipo === "vincular" && (
                  <p className="text-xs text-[#8b949e] mt-1">
                    Selecione o preset ou combo moderno para o qual o sistema legado será migrado, preservando todas as regras de negócio.
                  </p>
                )}
              </div>
              {tipo === "vincular" && (
                <span className="rounded-full bg-[#58a6ff]/10 border border-[#58a6ff]/20 px-2.5 py-1 text-xs font-semibold text-[#58a6ff]">
                  Alvo da Migração
                </span>
              )}
            </div>

            <div className="flex gap-1 rounded-lg bg-[#0d1117] p-1">
              <button type="button" onClick={() => setAba("conjuntos")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${aba === "conjuntos" ? "bg-[#21262d] text-[#e6edf3]" : "text-[#8b949e] hover:text-[#c9d1d9]"}`}>
                Conjuntos Recomendados
              </button>
              <button type="button" onClick={() => setAba("livre")}
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${aba === "livre" ? "bg-[#21262d] text-[#e6edf3]" : "text-[#8b949e] hover:text-[#c9d1d9]"}`}>
                Escolha Livre
              </button>
            </div>

            {aba === "conjuntos" ? (
              <div className="space-y-3">
                <p className="text-sm text-[#8b949e]">
                  Combinações prontas com as melhores tecnologias para cada tipo de produto.
                  Clique num conjunto para selecionar frontend e backend. Para montar manualmente,
                  use a aba <span className="text-[#c9d1d9]">Escolha Livre</span>.
                </p>
                {fullstacks.length === 0 ? (
                  <p className="text-sm text-[#8b949e]">Nenhum conjunto recomendado disponível.</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {fullstacks.map((c) => (
                      <CardFullstack key={c.id} combo={c}
                        fe={frontends.find((f) => f.id === c.frontend)}
                        be={backends.find((b) => b.id === c.backend)}
                        selecionado={frontend === c.frontend && backend === c.backend}
                        aoSelecionar={() => { setFrontend(c.frontend); setBackend(c.backend); }} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {frontends.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-[#8b949e]">Frontend</p>
                    {frontends.map((f) => (
                      <CardPreset key={f.id} item={f} selecionado={frontend === f.id} aoSelecionar={() => setFrontend(f.id)} nome="frontend" />
                    ))}
                  </div>
                )}
                {backends.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-[#8b949e]">Backend</p>
                    {backends.map((b) => (
                      <CardPreset key={b.id} item={b} selecionado={backend === b.id} aoSelecionar={() => setBackend(b.id)} nome="backend" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {avisoGovernanca && (
          <div className="rounded-xl border border-yellow-600/40 bg-yellow-950/20 p-5 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-400">
                  {tipo === "vincular" ? "Governança Existente no Repositório" : "Governança Existente no Destino"}
                </h3>
                <p className="mt-1 text-sm text-[#c9d1d9]">
                  Este diretório já possui uma pasta <code className="text-yellow-300 font-mono text-xs">governanca/</code>.
                  Deseja sobrescrever todos os arquivos e recomeçar a governança do zero?
                </p>
                <p className="mt-1 text-xs text-[#8b949e]">
                  Nota: Ao recomeçar do zero, os arquivos de governança serão recriados com os templates e presets atuais.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                disabled={enviando}
                onClick={() => enviarCriacao(true)}
                className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-500 disabled:opacity-50 transition"
              >
                {enviando ? "Sobrescrevendo..." : "Sim, Sobrescrever e Recomeçar do Zero"}
              </button>
              <button
                type="button"
                disabled={enviando}
                onClick={() => setAvisoGovernanca(false)}
                className="rounded-lg border border-[#30363d] bg-[#21262d] px-4 py-2 text-sm text-[#c9d1d9] hover:bg-[#30363d] disabled:opacity-50 transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {erro && <p className="text-sm text-[#e94560]">{erro}</p>}

        {!avisoGovernanca && (
          <button type="submit" disabled={enviando}
            className="rounded-lg bg-[#238636] px-6 py-3 text-sm font-medium text-white hover:bg-[#2ea043] disabled:opacity-50 transition">
            {enviando
              ? (tipo === "vincular"
                  ? (modoVinculacao === "migrar" ? "Vinculando com Migração..." : "Vinculando...")
                  : "Criando...")
              : (tipo === "vincular"
                  ? (modoVinculacao === "migrar" ? "Vincular e Iniciar Migração" : "Vincular Governança")
                  : "Criar Projeto")}
          </button>
        )}
      </form>
    </>
  );
}
