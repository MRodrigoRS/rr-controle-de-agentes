import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RR Controle de Agentes — RR Tech Studio",
  description: "Progenitora de projetos governados",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[#0d1117] text-[#e6edf3] antialiased">
        <header className="border-b border-[#30363d] bg-[#161b22]">
          <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
            <a href="/" className="text-lg font-bold tracking-tight text-[#e6edf3]">
              RR Tech Studio <span className="text-sm font-normal text-[#8b949e]">| Controle de Agentes</span>
            </a>

            <nav className="flex gap-4 text-sm">
              <a href="/criar" className="text-[#8b949e] hover:text-[#e6edf3] transition">Criar Projeto</a>
              <a href="/" className="text-[#8b949e] hover:text-[#e6edf3] transition">Projetos</a>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
