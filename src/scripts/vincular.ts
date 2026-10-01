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
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { criarEstruturaGovernanca } from "@/servidor/gerador";
import { obterFrontend, obterBackend, presetsFrontend, presetsBackend } from "@/presets";
import { registrarProjeto, obterProjetoPorCaminho } from "@/servidor/projetos";

function mostrarAjuda() {
  console.log(`
Uso: npx tsx src/scripts/vincular.ts <caminho> [--frontend <id>] [--backend <id>] [--migrar] [--forcar]

Argumentos:
  caminho                  Caminho do repositório existente (obrigatório)
  --frontend, -f <id>      ID do preset frontend (default: nenhum)
  --backend, -b <id>       ID do preset backend (default: nenhum)
  --migrar, -m             Ativa o modo de Modernização de Stack (Replatforming side-by-side)
  --forcar, -y             Sobrescreve a governança existente sem pedir confirmação interativa

Presets Frontend:
${presetsFrontend.map((p) => `  ${p.id.padEnd(30)} ${p.nome}`).join("\n")}

Presets Backend:
${presetsBackend.map((p) => `  ${p.id.padEnd(30)} ${p.nome}`).join("\n")}

Exemplos:
  npx tsx src/scripts/vincular.ts ../meu-app
  npx tsx src/scripts/vincular.ts ../api --frontend nenhum --backend sqlite-local
  npx tsx src/scripts/vincular.ts ../legado --frontend nextjs-app-router --backend sqlite-local --migrar
  npx tsx src/scripts/vincular.ts ../legado --forcar
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    mostrarAjuda();
    process.exit(0);
  }

  const caminhoIndex = args.findIndex((a) => !a.startsWith("-"));
  if (caminhoIndex === -1) {
    console.error("Erro: Caminho do repositório é obrigatório.");
    mostrarAjuda();
    process.exit(1);
  }

  const caminho = path.resolve(args[caminhoIndex]);
  const frontendId = (args.includes("--frontend") ? args[args.indexOf("--frontend") + 1] : args.includes("-f") ? args[args.indexOf("-f") + 1] : "nenhum");
  const backendId = (args.includes("--backend") ? args[args.indexOf("--backend") + 1] : args.includes("-b") ? args[args.indexOf("-b") + 1] : "nenhum");
  const ehMigracao = args.includes("--migrar") || args.includes("-m");
  const forcar = args.includes("--forcar") || args.includes("-y");

  if (!fs.existsSync(caminho)) {
    console.error(`Erro: Caminho não encontrado: ${caminho}`);
    process.exit(1);
  }

  const governancaPath = path.join(caminho, "governanca");
  if (fs.existsSync(governancaPath)) {
    if (!forcar) {
      console.log(`\n⚠️  Aviso: Já existe uma pasta governanca/ em:\n   ${governancaPath}\n`);
      const rl = readline.createInterface({ input, output });
      const resposta = await rl.question("Deseja sobrescrever todos os arquivos e recomeçar a governança do zero? (s/N): ");
      rl.close();

      const confirmou = ["s", "sim", "y", "yes"].includes(resposta.trim().toLowerCase());
      if (!confirmou) {
        console.log("\n❌ Operação cancelada. Nenhuma alteração foi realizada na governança.");
        process.exit(0);
      }
      console.log("\n🔄 Sobrescrevendo governança e recomeçando do zero...");
    } else {
      console.log("\n⚠️  Governança existente detectada. Flag --forcar acionada: sobrescrevendo do zero...");
    }
  }

  if (ehMigracao && frontendId === "nenhum" && backendId === "nenhum") {
    console.error("Erro: Ao utilizar --migrar, especifique ao menos um preset de destino (--frontend ou --backend).");
    mostrarAjuda();
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
  if (ehMigracao) {
    console.log("🚀 Modo: Modernização de Stack (Replatforming Side-by-Side)");
    console.log(`🎯 Stack Alvo: ${presetFrontend.nome} + ${presetBackend.nome}`);
  } else {
    console.log(`Frontend: ${presetFrontend.nome}`);
    console.log(`Backend: ${presetBackend.nome}`);
  }
  console.log("");

  await criarEstruturaGovernanca({
    nome,
    descricao: ehMigracao
      ? "Repositório existente vinculado para modernização de stack (replatforming)."
      : "Repositório existente vinculado à governança.",
    caminho,
    presetFrontend,
    presetBackend,
    repositorioExistente: true,
    modoMigracao: ehMigracao,
  });

  console.log("✅ Governança criada com sucesso!");
  console.log(`📁 ${governancaPath}`);

  const projetoExistente = obterProjetoPorCaminho(caminho);
  const id = projetoExistente ? projetoExistente.id : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  registrarProjeto({
    id,
    nome,
    descricao: ehMigracao
      ? "Repositório existente vinculado para modernização de stack (replatforming)."
      : "Repositório existente vinculado à governança.",
    presetFrontend: frontendId,
    presetBackend: backendId,
    caminho: path.resolve(caminho),
    criadoEm: projetoExistente ? projetoExistente.criadoEm : new Date().toISOString(),
    vinculado: true,
    modoMigracao: ehMigracao,
  });
  console.log(`📋 Projeto ${projetoExistente ? "atualizado" : "registrado"} na progenitora (ID: ${id})`);
  console.log("");
  if (ehMigracao) {
    console.log("Próximos passos:");
    console.log("1. Crie a branch de trabalho isolada indicada no VINCULAR.md");
    console.log("2. Siga o protocolo side-by-side em governanca/skills/migrar-stack-legada.md");
  } else {
    console.log("Próximo passo: o agente deve examinar o VINCULAR.md para documentar a stack e criar as sprints.");
  }
}

main().catch((err) => {
  console.error("Erro:", err.message);
  process.exit(1);
});
