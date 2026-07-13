"use client";

import { useState, useEffect } from "react";
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
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [frontend, setFrontend] = useState("");
  const [backend, setBackend] = useState("");
  const [caminho, setCaminho] = useState("");
  const [selecionando, setSelecionando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    if (!nome.trim()) { setErro("Nome é obrigatório"); return; }
    setEnviando(true);
    try {
      const res = await fetch("/api/projetos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome.trim(), descricao, frontend, backend, caminho: caminho.trim() || undefined }),
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
            <label className="mb-1 block text-sm font-medium text-[#8b949e]">Caminho <span className="text-[#8b949e]">(opcional)</span></label>
            <div className="flex gap-2">
              <input value={caminho} onChange={(e) => setCaminho(e.target.value)}
                className="flex-1 rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:border-[#58a6ff] focus:outline-none"
                placeholder={`Deixe vazio para criar em ./projetos/${nome || "meu-app"}`} />
              <button type="button" onClick={selecionarPasta} disabled={selecionando}
                className="flex items-center gap-1.5 rounded-lg border border-[#30363d] bg-[#21262d] px-3 py-2 text-sm text-[#c9d1d9] hover:bg-[#30363d] disabled:opacity-50 transition whitespace-nowrap">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                {selecionando ? "Abrindo..." : "Selecionar Pasta"}
              </button>
            </div>
          </div>
        </div>

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

        {erro && <p className="text-sm text-[#e94560]">{erro}</p>}

        <button type="submit" disabled={enviando}
          className="rounded-lg bg-[#238636] px-6 py-3 text-sm font-medium text-white hover:bg-[#2ea043] disabled:opacity-50 transition">
          {enviando ? "Criando..." : "Criar Projeto"}
        </button>
      </form>
    </>
  );
}
