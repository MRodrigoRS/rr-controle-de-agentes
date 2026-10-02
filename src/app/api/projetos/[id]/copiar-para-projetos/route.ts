import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { carregarProjetos, registrarProjeto, type ProjetoRegistro } from "@/servidor/projetos";
import { configurarHarnessNoProjeto } from "@/servidor/harness";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const projetoOrigem = carregarProjetos().find((p) => p.id === id);

  if (!projetoOrigem) {
    return NextResponse.json({ erro: "Projeto de origem não encontrado" }, { status: 404 });
  }

  const caminhoOrigem = path.resolve(projetoOrigem.caminho);
  if (!fs.existsSync(caminhoOrigem)) {
    return NextResponse.json({ erro: "Diretório de origem não encontrado no disco" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const novoNome = (body.novoNome && typeof body.novoNome === "string" && body.novoNome.trim())
    ? body.novoNome.trim()
    : `${projetoOrigem.nome} (Cópia)`;

  // Define diretório de destino dentro de projetos/
  const pastaProjetosBase = path.resolve("projetos");
  if (!fs.existsSync(pastaProjetosBase)) {
    fs.mkdirSync(pastaProjetosBase, { recursive: true });
  }

  // Gera slug seguro para o nome da pasta
  const slugBase = novoNome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "projeto-copia";

  let nomePastaDestino = slugBase;
  let caminhoDestino = path.join(pastaProjetosBase, nomePastaDestino);
  let sufixo = 2;

  while (fs.existsSync(caminhoDestino)) {
    nomePastaDestino = `${slugBase}-${sufixo}`;
    caminhoDestino = path.join(pastaProjetosBase, nomePastaDestino);
    sufixo++;
  }

  // Impede copiar para o próprio caminho
  if (path.resolve(caminhoOrigem).toLowerCase() === path.resolve(caminhoDestino).toLowerCase()) {
    return NextResponse.json({ erro: "O destino não pode ser o mesmo da origem" }, { status: 400 });
  }

  try {
    // Cópia recursiva completa de todos os arquivos físicos
    fs.cpSync(caminhoOrigem, caminhoDestino, { recursive: true, force: true });

    // Novo ID para o projeto copiado
    const novoId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const novoProjeto: ProjetoRegistro = {
      id: novoId,
      nome: novoNome,
      descricao: projetoOrigem.descricao
        ? `${projetoOrigem.descricao} (Cópia local)`
        : "Cópia local em projetos/",
      presetFrontend: projetoOrigem.presetFrontend,
      presetBackend: projetoOrigem.presetBackend,
      caminho: caminhoDestino,
      criadoEm: new Date().toISOString(),
      vinculado: false,
      modoMigracao: false,
    };

    registrarProjeto(novoProjeto);

    // Reconfigura o harness no destino para que os links apontem para os caminhos corretos
    configurarHarnessNoProjeto(caminhoDestino);

    return NextResponse.json(
      {
        sucesso: true,
        projeto: novoProjeto,
        mensagem: "Projeto copiado com sucesso para a pasta projetos/",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao copiar projeto:", error);
    const msg = error instanceof Error ? error.message : "Erro desconhecido ao copiar arquivos";
    return NextResponse.json(
      {
        erro: `Não foi possível copiar o projeto. Verifique se há arquivos bloqueados por processos ativos na pasta de origem: ${msg}`,
      },
      { status: 500 }
    );
  }
}
