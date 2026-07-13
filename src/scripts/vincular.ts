/**
 * CLI: Vincular um repositório existente à governança.
 *
 * Uso:
 *   npx tsx src/scripts/vincular.ts /caminho/do/projeto [--frontend id] [--backend id]
 *
 * Exemplos:
 *   npx tsx src/scripts/vincular.ts ../meu-app
 *   npx tsx src/scripts/vincular.ts ../api --frontend nenhum --backend sqlite-local
 */

import fs from "fs";
import path from "path";
import { criarEstruturaGovernanca } from "@/servidor/gerador";
import { obterFrontend, obterBackend, presetsFrontend, presetsBackend } from "@/presets";

function mostrarAjuda() {
  console.log(`
Uso: npx tsx src/scripts/vincular.ts <caminho> [--frontend <id>] [--backend <id>]

Argumentos:
  caminho                  Caminho do repositório existente (obrigatório)
  --frontend, -f <id>      ID do preset frontend (default: nenhum)
  --backend, -b <id>       ID do preset backend (default: nenhum)

Presets Frontend:
${presetsFrontend.map((p) => `  ${p.id.padEnd(30)} ${p.nome}`).join("\n")}

Presets Backend:
${presetsBackend.map((p) => `  ${p.id.padEnd(30)} ${p.nome}`).join("\n")}

Exemplos:
  npx tsx src/scripts/vincular.ts ../meu-app
  npx tsx src/scripts/vincular.ts ../api --frontend nenhum --backend sqlite-local
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    mostrarAjuda();
    process.exit(0);
  }

  const caminhoIndex = args.findIndex((a) => !a.startsWith("--"));
  if (caminhoIndex === -1) {
    console.error("Erro: Caminho do repositório é obrigatório.");
    mostrarAjuda();
    process.exit(1);
  }

  const caminho = path.resolve(args[caminhoIndex]);
  const frontendId = (args.includes("--frontend") ? args[args.indexOf("--frontend") + 1] : args.includes("-f") ? args[args.indexOf("-f") + 1] : "nenhum");
  const backendId = (args.includes("--backend") ? args[args.indexOf("--backend") + 1] : args.includes("-b") ? args[args.indexOf("-b") + 1] : "nenhum");

  if (!fs.existsSync(caminho)) {
    console.error(`Erro: Caminho não encontrado: ${caminho}`);
    process.exit(1);
  }

  const governancaPath = path.join(caminho, "governanca");
  if (fs.existsSync(governancaPath)) {
    console.error("Erro: Este projeto já possui uma pasta governanca/.");
    process.exit(1);
  }

  const presetFrontend = obterFrontend(frontendId);
  if (!presetFrontend) {
    console.error(`Erro: Frontend "${frontendId}" não encontrado.`);
    mostrarAjuda();
    process.exit(1);
  }

  const presetBackend = obterBackend(backendId);
  if (!presetBackend) {
    console.error(`Erro: Backend "${backendId}" não encontrado.`);
    mostrarAjuda();
    process.exit(1);
  }

  const nome = path.basename(caminho);

  console.log(`Vinculando repositório: ${caminho}`);
  console.log(`Frontend: ${presetFrontend.nome}`);
  console.log(`Backend: ${presetBackend.nome}`);
  console.log("");

  await criarEstruturaGovernanca({
    nome,
    descricao: "Repositório existente vinculado à governança.",
    caminho,
    presetFrontend,
    presetBackend,
    repositorioExistente: true,
  });

  console.log("✅ Governança criada com sucesso!");
  console.log(`📁 ${governancaPath}`);
  console.log("");
  console.log("Próximo passo: o agente deve examinar o VINCULAR.md para documentar a stack e criar as sprints.");
}

main().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
