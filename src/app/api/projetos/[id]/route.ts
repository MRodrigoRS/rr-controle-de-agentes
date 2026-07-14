import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { obterFrontend, obterBackend } from "@/presets";
import { criarEstruturaGovernanca } from "@/servidor/gerador";
import { carregarProjetos, salvarProjetos, atualizarProjeto } from "@/servidor/projetos";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json();
  const { presetFrontend, presetBackend } = body;

  if (!presetFrontend || !presetBackend) {
    return NextResponse.json({ erro: "presetFrontend e presetBackend são obrigatórios" }, { status: 400 });
  }

  const projeto = atualizarProjeto(id, { presetFrontend, presetBackend });
  if (!projeto) {
    return NextResponse.json({ erro: "Projeto não encontrado" }, { status: 404 });
  }

  return NextResponse.json(projeto);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projetos = carregarProjetos();
  const index = projetos.findIndex((p) => p.id === id);

  if (index === -1) {
    return NextResponse.json({ erro: "Projeto não encontrado" }, { status: 404 });
  }

  projetos.splice(index, 1);
  salvarProjetos(projetos);

  return NextResponse.json({ sucesso: true });
}

export async function PUT(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projetos = carregarProjetos();
  const projeto = projetos.find((p) => p.id === id);

  if (!projeto) {
    return NextResponse.json({ erro: "Projeto não encontrado" }, { status: 404 });
  }

  const presetFrontend = obterFrontend(projeto.presetFrontend);
  const presetBackend = obterBackend(projeto.presetBackend);
  if (!presetFrontend || !presetBackend) {
    return NextResponse.json({ erro: "Presets não encontrados" }, { status: 400 });
  }

  const caminhoAbs = path.resolve(projeto.caminho);
  if (!fs.existsSync(caminhoAbs)) {
    return NextResponse.json({ erro: "Pasta do projeto não encontrada no disco" }, { status: 404 });
  }

  const ehVinculado = projeto.vinculado === true;

  try {
    await criarEstruturaGovernanca({
      nome: projeto.nome,
      descricao: projeto.descricao,
      caminho: caminhoAbs,
      presetFrontend,
      presetBackend,
      repositorioExistente: ehVinculado,
      regenerar: true,
    });

    return NextResponse.json({ sucesso: true, mensagem: "Governança recriada com sucesso" });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
