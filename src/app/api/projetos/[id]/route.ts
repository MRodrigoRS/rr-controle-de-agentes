import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { obterFrontend, obterBackend } from "@/presets";
import { criarEstruturaGovernanca } from "@/servidor/gerador";
import { carregarProjetos, atualizarProjeto, excluirProjeto } from "@/servidor/projetos";

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
  const ok = excluirProjeto(id);

  if (!ok) {
    return NextResponse.json({ erro: "Projeto não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ sucesso: true });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projetos = carregarProjetos();
  const projeto = projetos.find((p) => p.id === id);

  if (!projeto) {
    return NextResponse.json({ erro: "Projeto não encontrado" }, { status: 404 });
  }

  let modo: "essencial" | "total" = "essencial";
  try {
    const body = await request.json();
    if (body?.modo === "total") {
      modo = "total";
    }
  } catch {
    // Body opcional; padrão é "essencial"
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
    let backupCriado: string | null = null;
    const governancaPath = path.join(caminhoAbs, "governanca");

    if (modo === "total" && fs.existsSync(governancaPath)) {
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      const backupDir = path.join(caminhoAbs, `.backup-governanca-${ts}`);
      fs.cpSync(governancaPath, backupDir, { recursive: true });
      backupCriado = backupDir;

      // Limpa resíduos de pastas do projeto para garantir reset total de fábrica
      const pastasParaResetar = ["sprints", "relatorios", "livro-arquitetura", "padroes", "workflows", "skills", "templates"];
      for (const sub of pastasParaResetar) {
        const subPath = path.join(governancaPath, sub);
        if (fs.existsSync(subPath)) {
          fs.rmSync(subPath, { recursive: true, force: true });
        }
      }
    }

    await criarEstruturaGovernanca({
      nome: projeto.nome,
      descricao: projeto.descricao,
      caminho: caminhoAbs,
      presetFrontend,
      presetBackend,
      repositorioExistente: ehVinculado,
      regenerar: true,
      modoRegeneracao: modo,
      modoMigracao: projeto.modoMigracao,
    });

    const mensagem = modo === "total"
      ? `Governança regenerada totalmente com sucesso! (Backup salvo em: ${path.basename(backupCriado || "")})`
      : "Governança sincronizada com sucesso (modo essencial)!";

    return NextResponse.json({ sucesso: true, mensagem, backup: backupCriado });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
