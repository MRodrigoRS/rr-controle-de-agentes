"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PresetOpcao {
  id: string;
  nome: string;
  descricao: string;
  destaque: string;
  stack: string[];
}

const frontends: PresetOpcao[] = [
  { id: "nextjs-app-router", nome: "Next.js (App Router)", destaque: "Fullstack com React Server Components", descricao: "Framework fullstack para produção com React 19, renderização híbrida (SSR + SSG + ISR). Ideal para SaaS corporativos e portais.", stack: ["Next.js 16", "React 19", "TypeScript 5", "Tailwind CSS 4", "shadcn/ui", "Zod", "Biome", "Vitest", "pnpm"] },
  { id: "vite-react-ts", nome: "Vite + React + TypeScript", destaque: "SPA rápida com Vite e React 19", descricao: "SPA moderna e ultrarrápida com HMR instantâneo. Ideal para dashboards administrativos e apps single-page.", stack: ["React 19", "Vite 6", "TypeScript 5", "Tailwind CSS 4", "TanStack Query", "Zustand", "Zod", "Vitest"] },
  { id: "html-css-js", nome: "HTML + CSS + JavaScript", destaque: "Estática, sem dependências", descricao: "Página web estática clássica sem frameworks. Ideal para landing pages, sites institucionais e protótipos rápidos.", stack: ["HTML5", "CSS3", "JavaScript"] },
  { id: "threejs-rapier-gsap", nome: "Three.js + Rapier + GSAP", destaque: "3D interativo com física e animações", descricao: "Aplicação 3D interativa com WebGL, física realista e animações profissionais. Ideal para visualizações e jogos 3D.", stack: ["Three.js", "Rapier", "GSAP", "TypeScript 5"] },
  { id: "pixijs-gsap-zustand", nome: "PixiJS + GSAP + Zustand", destaque: "Jogos 2D e visualizações pesadas", descricao: "Renderização 2D ultrarrápida via WebGL com animações suaves e estado global. Ideal para jogos HTML5 e dashboards.", stack: ["PixiJS", "GSAP", "Zustand", "TypeScript 5"] },
  { id: "gas-web-app", nome: "Google Apps Script (Web App)", destaque: "Web App integrado ao Google Workspace", descricao: "Web App Google que roda na nuvem com planilha como banco. Ideal para automações internas e ferramentas corporativas.", stack: ["Google Apps Script (V8)", "HTML/CSS/JS", "Google Sheets", "clasp"] },
  { id: "browser-extension-mv3", nome: "Extensão de Navegador (MV3)", destaque: "Extensão Chrome/Edge MV3", descricao: "Extensão Manifest V3 com popup, service worker e content scripts. Ideal para automação de navegação e produtividade.", stack: ["Manifest V3", "JavaScript", "HTML/CSS", "Chrome APIs"] },
  { id: "nenhum", nome: "Nenhum", destaque: "Apenas backend", descricao: "Sem frontend. Útil para APIs puras, pacotes npm e microsserviços.", stack: [] },
];

const backends: PresetOpcao[] = [
  { id: "sqlite-local", nome: "SQLite + Prisma", destaque: "Banco local embutido, zero setup", descricao: "Banco em arquivo único .db via Prisma ORM. Ideal para aplicações locais, MVPs e ferramentas desktop.", stack: ["Node.js 22", "SQLite", "Prisma 7", "Biome", "GitHub Actions"] },
  { id: "postgres-drizzle", nome: "PostgreSQL + Drizzle", destaque: "ORM leve com SQL puro", descricao: "PostgreSQL com Drizzle ORM — SQL puro com tipagem forte. Ideal para consultas complexas e migrações versionadas.", stack: ["Node.js 22", "PostgreSQL", "Drizzle ORM", "Biome", "GitHub Actions"] },
  { id: "supabase-online", nome: "Supabase (Cloud)", destaque: "Backend cloud completo", descricao: "Banco PostgreSQL + autenticação + storage + Realtime. Tudo gerenciado via SDK. Ideal para startups e MVPs.", stack: ["Node.js 22", "Supabase", "PostgreSQL", "Supabase Client", "Biome"] },
  { id: "trpc-backend", nome: "tRPC", destaque: "API type-safe sem REST/GraphQL", descricao: "API com tipos inferidos automaticamente do backend pro frontend. Elimina SDKs e contratos de API.", stack: ["Node.js 22", "tRPC", "Prisma 7", "SQLite/PostgreSQL", "Biome"] },
  { id: "go-fiber-postgres", nome: "Go + Fiber + PostgreSQL", destaque: "Alta performance com concorrência nativa", descricao: "API ultrarrápida em Go com Fiber e PostgreSQL. Ideal para microsserviços e sistemas de baixa latência.", stack: ["Go 1.22", "Fiber", "PostgreSQL", "pgx", "golangci-lint", "GitHub Actions"] },
  { id: "gas-sheets", nome: "Google Apps Script (Planilha)", destaque: "Planilha como banco no ecossistema Google", descricao: "Backend no Google Apps Script com Sheets como banco. Ideal para CRMs leves e workflow interno.", stack: ["Google Apps Script (V8)", "Google Sheets", "clasp", "ESLint"] },
  { id: "nenhum", nome: "Nenhum", destaque: "Apenas frontend", descricao: "Sem backend. Útil para sites estáticos e landing pages.", stack: [] },
];

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
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [frontend, setFrontend] = useState("nextjs-app-router");
  const [backend, setBackend] = useState("nenhum");
  const [caminho, setCaminho] = useState("");
  const [selecionando, setSelecionando] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function selecionarPasta() {
    setSelecionando(true);
    try {
      const res = await fetch("/api/selecionar-pasta");
      const data = await res.json();
      if (data.caminho) setCaminho(data.caminho);
    } catch {
      // usuário cancelou ou erro
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
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#8b949e]">Frontend</p>
              {frontends.map((f) => (
                <CardPreset key={f.id} item={f} selecionado={frontend === f.id} aoSelecionar={() => setFrontend(f.id)} nome="frontend" />
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#8b949e]">Backend</p>
              {backends.map((b) => (
                <CardPreset key={b.id} item={b} selecionado={backend === b.id} aoSelecionar={() => setBackend(b.id)} nome="backend" />
              ))}
            </div>
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
