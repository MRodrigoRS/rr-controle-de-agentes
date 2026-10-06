/**
 * CLI: Sincronizar a governança de um repositório a partir da matriz.
 *
 * Uso:
 *   npx tsx src/scripts/sincronizar.ts [caminho] [--total] [--forcar]
 *   npm run rr:sync -- [caminho] [--total]
 *
 * Modos:
 *   Modo Essencial (padrão): Atualiza padrões, workflows e skills sem alterar o contexto local.
 *   Modo Total (--total): Regenera toda a governança do zero (exige confirmação e cria backup automático).
 */

import fs from "fs";
import path from "path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { criarEstruturaGovernanca } from "@/servidor/gerador";
import { obterFrontend, obterBackend } from "@/presets";
import { obterProjetoPorCaminho, carregarProjetos } from "@/servidor/projetos";

function mostrarAjuda() {
  console.log(`
Uso: npx tsx src/scripts/sincronizar.ts [caminho] [--total] [--forcar]

Argumentos:
  caminho          Caminho do repositório a sincronizar (default: diretório atual ".")
  --total, -t      Regeneração total da governança a partir dos templates da matriz
  --forcar, -y     Pula confirmação interativa no modo total (automação/CI)

Exemplos:
  npx tsx src/scripts/sincronizar.ts                          # Sincroniza essencial no diretório atual
  npx tsx src/scripts/sincronizar.ts ../meu-app               # Sincroniza essencial em ../meu-app
  npx tsx src/scripts/sincronizar.ts ../meu-app --total       # Regeneração total com confirmação e backup
  npm run rr:sync -- ../meu-app                               # Via npm script da progenitora
`);
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    mostrarAjuda();
    process.exit(0);
  }

  const ehModoTotal = args.includes("--total") || args.includes("-t");
  const forcar = args.includes("--forcar") || args.includes("-y") || args.includes("--sim");

  const caminhoArg = args.find((a) => !a.startsWith("-")) || ".";
  const caminhoAbs = path.resolve(caminhoArg);

  if (!fs.existsSync(caminhoAbs)) {
    console.error(`❌ Erro: Caminho não encontrado: ${caminhoAbs}`);
    process.exit(1);
  }

  const governancaDir = path.join(caminhoAbs, "governanca");
  if (!fs.existsSync(governancaDir)) {
    console.error(`❌ Erro: Pasta governanca/ não encontrada em ${caminhoAbs}.`);
    console.log("   Utilize 'npm run rr:vincular -- " + caminhoArg + "' para vincular o projeto pela primeira vez.");
    process.exit(1);
  }

  // Identifica configurações e presets do projeto
  const projetoRegistrado = obterProjetoPorCaminho(caminhoAbs);
  let frontendId = projetoRegistrado?.presetFrontend || "nenhum";
  let backendId = projetoRegistrado?.presetBackend || "nenhum";
  let nomeProjeto = projetoRegistrado?.nome || path.basename(caminhoAbs);
  let descricaoProjeto = projetoRegistrado?.descricao || "Projeto governado por RR Tech Studio";

  // Se não estiver no banco, tenta ler do .matriz.json
  const matrizConfigPath = path.join(governancaDir, ".matriz.json");
  if (fs.existsSync(matrizConfigPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(matrizConfigPath, "utf-8"));
      if (meta.presetFrontend && frontendId === "nenhum") frontendId = meta.presetFrontend;
      if (meta.presetBackend && backendId === "nenhum") backendId = meta.presetBackend;
    } catch {
      // Ignora erro de parse
    }
  }

  const presetFrontend = obterFrontend(frontendId) || obterFrontend("nenhum")!;
  const presetBackend = obterBackend(backendId) || obterBackend("nenhum")!;

  console.log("\n========================================================");
  console.log(`📡 RR Tech Studio — Sincronização de Governança`);
  console.log(`   Projeto: ${nomeProjeto} (${caminhoAbs})`);
  console.log(`   Presets: Frontend [${presetFrontend.nome}] | Backend [${presetBackend.nome}]`);
  console.log(`   Modo:    ${ehModoTotal ? "🔴 TOTAL (Hard Reset com Backup)" : "🟢 ESSENCIAL (Seguro)"}`);
  console.log("========================================================\n");

  if (ehModoTotal) {
    console.log("⚠️  ATENÇÃO: MODO DE REGENERAÇÃO TOTAL SELECIONADO!");
    console.log("   Todos os arquivos de governança serão sobrescritos com os templates virgens,");
    console.log("   incluindo SESSAO.md, PRD.md, sprints/ e livro-arquitetura/.\n");

    if (!forcar) {
      const rl = readline.createInterface({ input, output });
      const resposta = await rl.question("Digite 'REGENERAR TUDO' para confirmar: ");
      rl.close();

      if (resposta.trim() !== "REGENERAR TUDO") {
        console.log("\n❌ Operação cancelada. Nenhum arquivo foi modificado.\n");
        process.exit(0);
      }
    }

    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(caminhoAbs, `.backup-governanca-${ts}`);
    console.log(`💾 Criando backup prévio em: ${path.basename(backupDir)}...`);
    fs.cpSync(governancaDir, backupDir, { recursive: true });
    console.log("✅ Backup salvo com sucesso!\n");
  }

  console.log(`🔄 Sincronizando arquivos da matriz...`);
  await criarEstruturaGovernanca({
    nome: nomeProjeto,
    descricao: descricaoProjeto,
    caminho: caminhoAbs,
    presetFrontend,
    presetBackend,
    repositorioExistente: true,
    regenerar: true,
    modoRegeneracao: ehModoTotal ? "total" : "essencial",
  });

  console.log(`\n🎉 Governança sincronizada com sucesso no modo ${ehModoTotal ? "TOTAL" : "ESSENCIAL"}!\n`);
}

main().catch((err) => {
  console.error("\n❌ Erro durante a sincronização:", err);
  process.exit(1);
});
