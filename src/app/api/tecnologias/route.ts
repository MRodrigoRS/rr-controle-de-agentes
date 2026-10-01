import { NextResponse } from "next/server";
import { obterTodasTecnologias, inserirTecnologia, obterTecnologiaPorNome } from "@/servidor/db";
import { gerarCatalogoMarkdown } from "@/servidor/dados/gerar-catalogo";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const tecnologias = obterTodasTecnologias();
    return NextResponse.json(tecnologias);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, categoria, aplicabilidade, descricao } = body;

    if (!nome || !nome.trim()) {
      return NextResponse.json({ erro: "Nome é obrigatório" }, { status: 400 });
    }
    if (!categoria || !categoria.trim()) {
      return NextResponse.json({ erro: "Categoria é obrigatória" }, { status: 400 });
    }
    if (!aplicabilidade || !aplicabilidade.trim()) {
      return NextResponse.json({ erro: "Aplicabilidade é obrigatória" }, { status: 400 });
    }
    if (!descricao || !descricao.trim()) {
      return NextResponse.json({ erro: "Descrição é obrigatória" }, { status: 400 });
    }

    const existente = obterTecnologiaPorNome(nome.trim());
    if (existente) {
      return NextResponse.json(
        { erro: `Tecnologia já cadastrada com o ID ${existente.id}`, tecnologia: existente },
        { status: 409 }
      );
    }

    const nova = inserirTecnologia({
      nome: nome.trim(),
      categoria: categoria.trim(),
      aplicabilidade: aplicabilidade.trim(),
      descricao: descricao.trim(),
    });

    // Atualiza o CATALOGO_TECNOLOGIAS.md
    try {
      const catalogoPath = path.resolve(process.cwd(), "src/templates/skills/CATALOGO_TECNOLOGIAS.md");
      const catalogoMd = gerarCatalogoMarkdown();
      fs.writeFileSync(catalogoPath, catalogoMd, "utf-8");
    } catch {
      // ignore
    }

    return NextResponse.json(nova, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
