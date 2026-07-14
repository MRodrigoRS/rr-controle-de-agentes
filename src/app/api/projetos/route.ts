import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { obterFrontend, obterBackend } from "@/presets";
import { criarEstruturaGovernanca } from "@/servidor/gerador";
import { registrarProjeto, type ProjetoRegistro } from "@/servidor/projetos";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, descricao, frontend: frontendId, backend: backendId, caminho: caminhoInput, vinculado } = body;
    const ehVinculado = vinculado === true;

    if (!nome || !nome.trim()) {
      return NextResponse.json({ erro: "Nome é obrigatório" }, { status: 400 });
    }

    if (ehVinculado) {
      if (!caminhoInput || !caminhoInput.trim()) {
        return NextResponse.json({ erro: "Caminho é obrigatório para vincular repositório existente" }, { status: 400 });
      }
      const caminhoExistente = path.resolve(caminhoInput.trim());
      if (!fs.existsSync(caminhoExistente)) {
        return NextResponse.json({ erro: "Caminho do repositório não encontrado no disco" }, { status: 404 });
      }
      if (!fs.statSync(caminhoExistente).isDirectory()) {
        return NextResponse.json({ erro: "Caminho não é um diretório" }, { status: 400 });
      }
      if (fs.existsSync(path.join(caminhoExistente, "governanca"))) {
        return NextResponse.json({ erro: "Já existe uma pasta governanca/ neste diretório" }, { status: 409 });
      }
      const presetNenhum = obterFrontend("nenhum");
      const presetBackendNenhum = obterBackend("nenhum");
      if (!presetNenhum || !presetBackendNenhum) {
        return NextResponse.json({ erro: "Preset 'nenhum' não encontrado" }, { status: 500 });
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await criarEstruturaGovernanca({
        nome: nome.trim(),
        descricao: descricao || "",
        caminho: caminhoExistente,
        presetFrontend: presetNenhum,
        presetBackend: presetBackendNenhum,
        repositorioExistente: true,
      });
      const projetoRegistro: ProjetoRegistro = {
        id,
        nome: nome.trim(),
        descricao: descricao || "",
        presetFrontend: "nenhum",
        presetBackend: "nenhum",
        caminho: caminhoExistente,
        criadoEm: new Date().toISOString(),
        vinculado: true,
      };
      registrarProjeto(projetoRegistro);
      return NextResponse.json(projetoRegistro, { status: 201 });
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

    if (fs.existsSync(path.join(caminhoProjeto, "governanca"))) {
      return NextResponse.json({ erro: "Já existe uma pasta governanca/ neste diretório" }, { status: 409 });
    }

    if (!fs.existsSync(caminhoProjeto)) {
      fs.mkdirSync(caminhoProjeto, { recursive: true });
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
