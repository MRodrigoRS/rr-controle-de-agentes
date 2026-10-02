import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { carregarProjetos } from "@/servidor/projetos";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projeto = carregarProjetos().find((p) => p.id === id);
  if (!projeto) {
    return NextResponse.json({ erro: "Projeto não encontrado" }, { status: 404 });
  }

  const arquivoStack = path.join(path.resolve(projeto.caminho), "governanca", "livro-arquitetura", "02-stack.md");
  if (!fs.existsSync(arquivoStack)) {
    return NextResponse.json({ existe: false }, { status: 404 });
  }

  try {
    const conteudo = fs.readFileSync(arquivoStack, "utf-8");
    return NextResponse.json({
      existe: true,
      caminho: arquivoStack,
      conteudo,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro ao ler arquivo de stack";
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projeto = carregarProjetos().find((p) => p.id === id);
  if (!projeto) {
    return NextResponse.json({ erro: "Projeto não encontrado" }, { status: 404 });
  }

  const arquivoStack = path.join(path.resolve(projeto.caminho), "governanca", "livro-arquitetura", "02-stack.md");
  if (!fs.existsSync(arquivoStack)) {
    return NextResponse.json({ erro: "Arquivo 02-stack.md não encontrado" }, { status: 404 });
  }

  // Tenta abrir no VS Code primeiro; se falhar, abre pelo comando nativo do SO
  exec(`code "${arquivoStack}"`, (err) => {
    if (err) {
      const cmd = process.platform === "win32" ? `start "" "${arquivoStack}"` : `open "${arquivoStack}"`;
      exec(cmd);
    }
  });

  return NextResponse.json({ sucesso: true, caminho: arquivoStack });
}
