import { inserirTecnologia, obterTecnologiaPorNome } from "@/servidor/db";
import { gerarCatalogoMarkdown } from "@/servidor/dados/gerar-catalogo";
import fs from "fs";
import path from "path";

function parseArgs(args: string[]): Record<string, string> {
  const params: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : "true";
      params[key] = val;
    }
  }
  return params;
}

function main() {
  const args = process.argv.slice(2);
  const params = parseArgs(args);

  if (!params.nome || !params.categoria || !params.aplicabilidade || !params.descricao) {
    console.log(`
Uso: npx tsx src/scripts/cadastrar-tecnologia.ts --nome <nome> --categoria <categoria> --aplicabilidade <aplicabilidade> --descricao <descricao>

Exemplo:
  npx tsx src/scripts/cadastrar-tecnologia.ts \\
    --nome "Hono" \\
    --categoria "Backend" \\
    --aplicabilidade "APIs ultra-leves e rápidas em TypeScript" \\
    --descricao "Framework web moderno e tipado de altíssima performance para Edge, Cloudflare Workers e Node.js."
`);
    process.exit(1);
  }

  const nome = params.nome.trim();
  const categoria = params.categoria.trim();
  const aplicabilidade = params.aplicabilidade.trim();
  const descricao = params.descricao.trim();

  const existente = obterTecnologiaPorNome(nome);
  if (existente) {
    console.log(`ℹ️ A tecnologia "${nome}" já está cadastrada com o ID: ${existente.id} (${existente.categoria})`);
    process.exit(0);
  }

  const inserida = inserirTecnologia({
    nome,
    categoria,
    aplicabilidade,
    descricao,
  });

  // Atualiza também o CATALOGO_TECNOLOGIAS.md na governança da progenitora
  const catalogoPath = path.resolve(process.cwd(), "governanca/skills/CATALOGO_TECNOLOGIAS.md");
  const catalogoMd = gerarCatalogoMarkdown();
  fs.writeFileSync(catalogoPath, catalogoMd, "utf-8");

  console.log(`\n🎉 Tecnologia cadastrada com sucesso!`);
  console.log(`   ID:             ${inserida.id}`);
  console.log(`   Nome:           ${inserida.nome}`);
  console.log(`   Categoria:      ${inserida.categoria}`);
  console.log(`   Aplicabilidade: ${inserida.aplicabilidade}`);
  console.log(`\n📸 Snapshot JSON e CATALOGO_TECNOLOGIAS.md atualizados automaticamente.\n`);
}

if (require.main === module) {
  main();
}
