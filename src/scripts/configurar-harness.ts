import path from "path";
import fs from "fs";
import { configurarHarnessNoProjeto } from "@/servidor/harness";

function main() {
  const args = process.argv.slice(2);
  const caminhoInput = args[0] || ".";
  const caminhoAbs = path.resolve(caminhoInput);

  if (!fs.existsSync(caminhoAbs)) {
    console.error(`❌ Caminho não encontrado: ${caminhoAbs}`);
    process.exit(1);
  }

  console.log(`\n⚙️ Configurando Harness em: ${caminhoAbs}...`);
  const resultado = configurarHarnessNoProjeto(caminhoAbs);

  if (resultado.sucesso) {
    console.log(`✅ ${resultado.mensagem}`);
    console.log("🎉 Harness pronto! Workflows registrados como slash commands e regras ativas.\n");
  } else {
    console.error(`❌ ${resultado.mensagem}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
