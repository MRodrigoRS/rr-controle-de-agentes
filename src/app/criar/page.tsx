"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface PresetOpcao {
  id: string;
  nome: string;
  descricao: string;
  destaque: string;
  stack: string[];
}

function CardPreset({ item, selecionado, aoSelecionar, nome }: { item: PresetOpcao; selecionado: boolean; aoSelecionar: () => void; nome: string }) {
  return (
    <label className={`block cursor-pointer rounded-xl border p-4 transition ${selecionado ? "border-[#58a6ff] bg-[#1a2332]" : "border-[#30363d] bg-[#161b22] hover:border-[#8b949e]"}`}>
      <div className="flex items-start gap-3">
        <input type="radio" name={nome} value={item.id} checked={selecionado} onChange={aoSelecionar} className="mt-1 accent-[#58a6ff]" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#e6edf3]">{item.nome}</span>
            {item.id !== "nenhum" && (
              <span className="rounded-full bg-[#58a6ff]/10 px-2 py-0.5 text-xs text-[#58a6ff]">{item.destaque}</span>
            )}
          </div>
          <p className="mt-1 text-sm text-[#8b949e]">{item.descricao}</p>
          {item.stack.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.stack.map((t) => (
                <span key={t} className="rounded-md bg-[#0d1117] px-2 py-0.5 text-xs text-[#8b949e] border border-[#30363d]">{t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </label>
  );
}

export default function CriarProjeto() {
  const router = useRouter();
  const [frontends, setFrontends] = useState<PresetOpcao[]>([]);
  const [backends, setBackends] = useState<PresetOpcao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [tipo, setTipo] = useState<"novo" | "vincular">("novo");
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [frontend, setFrontend] = useState("");
  const [backend, setBackend] = useState("");
  const [caminho, setCaminho] = useState("");
  const [selecionando, setSelecionando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
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

  async function selecionarPasta() {
    setSelecionando(true);
    try {
      const res = await fetch("/api/selecionar-pasta");
      const data = await res.json();
      if (data.caminho) setCaminho(data.caminho);
    } catch {
    } finally {
      setSelecionando(false);
    }
  }

  useEffect(() => {
    fetch("/api/presets")
      .then((res) => res.json())
      .then((data) => {
        setFrontends(data.frontend);
        setBackends(data.backend);
        if (data.frontend.length > 0) setFrontend(data.frontend[0].id);
        if (data.backend.length > 0) setBackend(data.backend[0].id);
        setCarregando(false);
      })
      .catch(() => {
        setErro("Falha ao carregar presets");
        setCarregando(false);
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!nome.trim()) { setErro("Nome é obrigatório"); return; }
    if (tipo === "vincular" && !caminho.trim()) { setErro("Caminho do repositório é obrigatório para vincular"); return; }
    setEnviando(true);
    try {
      const body: Record<string, unknown> = { nome: nome.trim(), descricao, caminho: caminho.trim() || undefined };
      if (tipo === "vincular") {
        body.vinculado = true;
      } else {
        body.frontend = frontend;
        body.backend = backend;
      }
      const res = await fetch("/api/projetos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.erro || "Erro ao criar projeto");
      }
      const data = await res.json();
      router.push(`/projetos/${data.id}`);
    } catch (err: unknown) {
      setErro(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setEnviando(false);
    }
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
            {tipo === "vincular" && (
              <p className="mt-1 text-xs text-[#8b949e]">A stack será documentada pelo agente durante a vinculação. Presets não se aplicam.</p>
            )}
          </div>
        </div>

        {tipo === "novo" && (
          <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-[#e6edf3]">Stack Tecnológica</h2>
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
          </div>
        )}

        {erro && <p className="text-sm text-[#e94560]">{erro}</p>}

        <button type="submit" disabled={enviando}
          className="rounded-lg bg-[#238636] px-6 py-3 text-sm font-medium text-white hover:bg-[#2ea043] disabled:opacity-50 transition">
          {enviando ? (tipo === "vincular" ? "Vinculando..." : "Criando...") : (tipo === "vincular" ? "Vincular Governança" : "Criar Projeto")}
        </button>
      </form>
    </>
  );
}
