import fs from "node:fs";
import path from "node:path";

export function compilarSateliteUi(): string {
  const raiz = process.cwd();
  const sateliteUiDir = path.join(raiz, "src", "satelite-ui");
  const viewsDir = path.join(sateliteUiDir, "views");
  const clientDir = path.join(sateliteUiDir, "client");
  const serverDir = path.join(sateliteUiDir, "server");

  const estilosCss = fs.readFileSync(path.join(viewsDir, "estilos.css"), "utf-8").trim();
  const templateHtml = fs.readFileSync(path.join(viewsDir, "template.html"), "utf-8").trim();
  const clientJs = fs.readFileSync(path.join(clientDir, "app.js"), "utf-8").trim();
  const servidorMjs = fs.readFileSync(path.join(serverDir, "servidor.mjs"), "utf-8");

  // 1. Injetar estilos e script do cliente no template HTML
  const htmlComCss = templateHtml.replace("/* INJECT_STYLES */", estilosCss);
  const htmlCompleto = htmlComCss.replace("/* INJECT_SCRIPT */", clientJs);

  // 2. Injetar a página HTML como string imutável e segura no servidor
  const htmlJsonLiteral = JSON.stringify(htmlCompleto);

  const funcaoHtmlGerada = `const PAGINA_HTML_EMBARCADA = ${htmlJsonLiteral};\n\nfunction gerarPaginaHtml() {\n  return PAGINA_HTML_EMBARCADA;\n}`;

  let bundleServidor = servidorMjs.replace(
    /function gerarPaginaHtml\(\)\s*\{[\s\S]*?\}/,
    funcaoHtmlGerada
  );

  // 3. Adicionar cabeçalho de aviso no topo
  const cabecalhoAviso = `#!/usr/bin/env node
/**
 * ⚠️ ARQUIVO GERADO AUTOMATICAMENTE — NÃO EDITE DIRETAMENTE
 * 
 * Fonte: src/satelite-ui/ (views/, client/, server/)
 * Para modificar esta interface, edite os fontes modulares em src/satelite-ui/ e execute:
 *   npm run build:ui
 * 
 * RR Tech Studio — Interface Web Dedicada do Projeto Satélite (Zero Dependências)
 */
`;

  // Remove shebang duplicado se existir e anexa o cabeçalho oficial
  bundleServidor = bundleServidor.replace(/^#!.*\n/, "");
  const bundleFinal = cabecalhoAviso + "\n" + bundleServidor.trim() + "\n";

  return bundleFinal;
}

export function executarBuildSateliteUi(): void {
  const raiz = process.cwd();
  const bundle = compilarSateliteUi();

  const destinos = [
    path.join(raiz, "governanca", "scripts", "ui.mjs"),
    path.join(raiz, "src", "templates", "scripts", "ui.mjs"),
  ];

  for (const destino of destinos) {
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.writeFileSync(destino, bundle, "utf-8");
  }

  console.log("✅ Bundle do Painel Satélite compilado com sucesso!");
  console.log(`   Destinos atualizados:`);
  console.log(`   - governanca/scripts/ui.mjs`);
  console.log(`   - src/templates/scripts/ui.mjs`);
}

// Execução direta via CLI (tsx src/scripts/build-satelite-ui.ts)
if (process.argv[1]?.endsWith("build-satelite-ui.ts")) {
  executarBuildSateliteUi();
}
