import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { obterFrontend, obterBackend } from "@/presets";
import { criarEstruturaGovernanca } from "@/servidor/gerador";
import { registrarProjeto, obterProjetoPorCaminho, type ProjetoRegistro } from "@/servidor/projetos";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nome, descricao, frontend: frontendId, backend: backendId, caminho: caminhoInput, vinculado, migrarStack, sobrescrever } = body;
    const ehVinculado = vinculado === true;
    const ehMigracao = ehVinculado && migrarStack === true;
    const deveSobrescrever = sobrescrever === true;

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
      if (fs.existsSync(path.join(caminhoExistente, "governanca")) && !deveSobrescrever) {
        return NextResponse.json({
          erro: "Já existe uma pasta governanca/ neste repositório.",
          governancaExistente: true,
        }, { status: 409 });
      }

      let presetFE = obterFrontend(frontendId || "nenhum");
      let presetBE = obterBackend(backendId || "nenhum");

      if (ehMigracao) {
        if (!presetFE || presetFE.id === "nenhum" || !presetBE || presetBE.id === "nenhum") {
          return NextResponse.json({ erro: "Presets de frontend e backend de destino são obrigatórios para modernização da stack" }, { status: 400 });
        }
      } else {
        presetFE = obterFrontend("nenhum");
        presetBE = obterBackend("nenhum");
        if (!presetFE || !presetBE) {
          return NextResponse.json({ erro: "Preset 'nenhum' não encontrado" }, { status: 500 });
        }
      }

      const projetoExistente = obterProjetoPorCaminho(caminhoExistente);
      const id = projetoExistente ? projetoExistente.id : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      await criarEstruturaGovernanca({
        nome: nome.trim(),
        descricao: descricao || "",
        caminho: caminhoExistente,
        presetFrontend: presetFE,
        presetBackend: presetBE,
        repositorioExistente: true,
        modoMigracao: ehMigracao,
      });

      const projetoRegistro: ProjetoRegistro = {
        id,
        nome: nome.trim(),
        descricao: descricao || "",
        presetFrontend: presetFE.id,
        presetBackend: presetBE.id,
        caminho: caminhoExistente,
        criadoEm: projetoExistente ? projetoExistente.criadoEm : new Date().toISOString(),
        vinculado: true,
        modoMigracao: ehMigracao,
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

    if (fs.existsSync(path.join(caminhoProjeto, "governanca")) && !deveSobrescrever) {
      return NextResponse.json({
        erro: "Já existe uma pasta governanca/ neste diretório.",
        governancaExistente: true,
      }, { status: 409 });
    }

    if (!fs.existsSync(caminhoProjeto)) {
      fs.mkdirSync(caminhoProjeto, { recursive: true });
    }

    const projetoExistente = obterProjetoPorCaminho(caminhoProjeto);
    const id = projetoExistente ? projetoExistente.id : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

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
      criadoEm: projetoExistente ? projetoExistente.criadoEm : new Date().toISOString(),
    };

    registrarProjeto(projetoRegistro);

    return NextResponse.json(projetoRegistro, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ erro: msg }, { status: 500 });
  }
}
