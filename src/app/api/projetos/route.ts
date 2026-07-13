import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { obterFrontend, obterBackend } from "@/presets";
import { criarEstruturaGovernanca } from "@/servidor/gerador";
import { registrarProjeto, type ProjetoRegistro } from "@/servidor/projetos";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, descricao, frontend: frontendId, backend: backendId, caminho: caminhoInput } = body;

    if (!nome || !nome.trim()) {
      return NextResponse.json({ erro: "Nome é obrigatório" }, { status: 400 });
    }

    const presetFrontend = obterFrontend(frontendId);
    if (!presetFrontend) {
      return NextResponse.json({ erro: "Frontend inválido" }, { status: 400 });
    }

    const presetBackend = obterBackend(backendId);
    if (!presetBackend) {
      return NextResponse.json({ erro: "Backend inválido" }, { status: 400 });
    }

    const projetosDir = path.resolve("projetos");

    const caminhoProjeto = caminhoInput && caminhoInput.trim()
      ? path.resolve(caminhoInput.trim())
      : path.join(projetosDir, nome.trim().toLowerCase().replace(/\s+/g, "-"));

    const governancaExiste = fs.existsSync(path.join(caminhoProjeto, "governanca"));

    if (caminhoInput && caminhoInput.trim()) {
      if (governancaExiste) {
        return NextResponse.json({ erro: "Já existe uma pasta governanca/ neste diretório" }, { status: 409 });
      }
      if (!fs.existsSync(caminhoProjeto)) {
        fs.mkdirSync(caminhoProjeto, { recursive: true });
      }
    } else {
      if (fs.existsSync(caminhoProjeto)) {
        return NextResponse.json({ erro: "Já existe um projeto com este nome" }, { status: 409 });
      }
      if (!fs.existsSync(projetosDir)) {
        fs.mkdirSync(projetosDir, { recursive: true });
      }
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await criarEstruturaGovernanca({
      nome: nome.trim(),
      descricao: descricao || "",
      caminho: caminhoProjeto,
      presetFrontend,
      presetBackend,
    });

    const projetoRegistro: ProjetoRegistro = {
      id,
      nome: nome.trim(),
      descricao: descricao || "",
      presetFrontend: frontendId,
      presetBackend: backendId,
      caminho: caminhoProjeto,
      criadoEm: new Date().toISOString(),
    };

    registrarProjeto(projetoRegistro);

    return NextResponse.json(projetoRegistro, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
