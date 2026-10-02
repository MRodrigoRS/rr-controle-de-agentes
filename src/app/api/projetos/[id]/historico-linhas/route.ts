import { NextResponse } from "next/server";
import path from "path";
import { carregarProjetos, obterHistoricoLinhasCommits } from "@/servidor/projetos";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projeto = carregarProjetos().find((p) => p.id === id);

  if (!projeto) {
    return NextResponse.json({ erro: "Projeto não encontrado" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const limitParam = parseInt(searchParams.get("limit") || "10", 10);
  const offsetParam = parseInt(searchParams.get("offset") || "0", 10);

  const limit = isNaN(limitParam) || limitParam <= 0 ? 10 : Math.min(limitParam, 100);
  const offset = isNaN(offsetParam) || offsetParam < 0 ? 0 : offsetParam;

  try {
    const caminhoProjeto = path.resolve(projeto.caminho);
    const historico = obterHistoricoLinhasCommits(caminhoProjeto, limit, offset);

    return NextResponse.json(historico);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Erro ao carregar histórico de linhas";
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
