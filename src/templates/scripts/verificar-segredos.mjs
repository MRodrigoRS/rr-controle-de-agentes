#!/usr/bin/env node
/**
 * verificar-segredos.mjs — Scanner Determinístico contra Vazamento de Segredos
 * 
 * Parte da Governança RR Tech Studio.
 * Verifica arquivos em staged (ou todo o repositório) em busca de chaves de API,
 * tokens de autenticação, senhas hardcoded e certificados privados.
 * 
 * Uso:
 *   node governanca/scripts/verificar-segredos.mjs          # Varre arquivos em staging (git diff --staged)
 *   node governanca/scripts/verificar-segredos.mjs --all    # Varre todos os arquivos rastreados
 * 
 * Zero dependências externas (Node.js 18+ nativo).
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const ehModoAll = args.includes("--all");
const raiz = process.cwd();

// Padrões de alta precisão para tokens e segredos reais
const PADROES_SECRETOS = [
  { nome: "Chave de API OpenAI", regex: /sk-[a-zA-Z0-9_-]{32,}|sk-proj-[a-zA-Z0-9_-]{30,}/g },
  { nome: "Chave de API Anthropic", regex: /sk-ant-[a-zA-Z0-9_-]{32,}/g },
  { nome: "Chave Secreta Stripe (Live)", regex: /(sk|rk)_live_[0-9a-zA-Z]{24,}/g },
  { nome: "Chave de Acesso AWS", regex: /AKIA[0-9A-Z]{16}/g },
  { nome: "Chave Privada Criptográfica", regex: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g },
  { nome: "Token Pessoal GitHub", regex: /ghp_[0-9a-zA-Z]{36}|github_pat_[0-9a-zA-Z_]{22,}/g },
  { nome: "Chave de API Google Cloud", regex: /AIza[0-9A-Za-z\-_]{35}/g },
  { nome: "Chave Slack / Webhook", regex: /xox[baprs]-[0-9a-zA-Z]{10,48}/g },
];

// Extensões e caminhos a ignorar
const EXTENSOES_IGNORADAS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp",
  ".woff", ".woff2", ".ttf", ".eot",
  ".lock", ".sqlite", ".db", ".bin"
]);

function ehArquivoIgnorado(relPath) {
  const normalizado = relPath.replace(/\\/g, "/");
  if (normalizado.includes("node_modules/") || normalizado.includes(".git/")) return true;
  if (normalizado.endsWith(".env.example") || normalizado.endsWith(".template")) return true;
  // Ignora o próprio script para não acusar os regexes
  if (normalizado.endsWith("verificar-segredos.mjs")) return true;
  const ext = path.extname(normalizado).toLowerCase();
  return EXTENSOES_IGNORADAS.has(ext);
}

function verificarGitleaksInstalado() {
  try {
    const stdout = execSync("gitleaks version", { encoding: "utf-8", stdio: ["pipe", "pipe", "ignore"] });
    return Boolean(stdout && (stdout.toLowerCase().includes("gitleaks") || /v?\d+\.\d+/.test(stdout)));
  } catch {
    return false;
  }
}

function executarComGitleaks() {
  if (!verificarGitleaksInstalado()) {
    return false;
  }

  console.log("🔒 Executável Gitleaks detectado no ambiente.");
  const cmd = ehModoAll
    ? "gitleaks detect -v --no-banner"
    : "gitleaks protect --staged -v --no-banner";

  console.log(`🔍 Executando Gitleaks (${ehModoAll ? "repositório completo" : "arquivos staged"})...`);
  try {
    execSync(cmd, { stdio: "inherit", cwd: raiz });
    console.log("✅ Nenhuma vulnerabilidade ou segredo detectado pelo Gitleaks.");
    return true;
  } catch {
    console.error("\n❌ Gitleaks detectou potenciais segredos não autorizados!");
    process.exit(1);
  }
}

function obterArquivosParaVerificar() {
  try {
    const cmd = ehModoAll
      ? "git ls-files"
      : "git diff --staged --name-only --diff-filter=ACMR";
    
    const output = execSync(cmd, { encoding: "utf-8", cwd: raiz }).trim();
    if (!output) return [];
    return output.split(/\r?\n/).filter(f => Boolean(f) && !ehArquivoIgnorado(f));
  } catch {
    // Se não for repositório git ou falhar, retorna lista vazia
    return [];
  }
}

function escanearArquivosNativo(arquivos) {
  console.log(`🔎 Executando Scanner Nativo de Segredos em ${arquivos.length} arquivo(s)...`);
  let achados = 0;

  for (const arqRel of arquivos) {
    const arqAbs = path.join(raiz, arqRel);
    if (!fs.existsSync(arqAbs)) continue;

    let conteudo;
    try {
      conteudo = fs.readFileSync(arqAbs, "utf-8");
    } catch {
      continue; // Arquivo binário ou ilegível
    }

    const linhas = conteudo.split(/\r?\n/);
    linhas.forEach((linha, numLinha) => {
      // Ignora comentários que explicitamente indicam teste/mock fictício
      if (linha.includes("example") || linha.includes("ficticio") || linha.includes("mock") || linha.includes("placeholder")) {
        return;
      }

      for (const padrao of PADROES_SECRETOS) {
        padrao.regex.lastIndex = 0;
        if (padrao.regex.test(linha)) {
          console.error(`\n🚨 [ALERTA DE SEGURANÇA] ${padrao.nome} detectada!`);
          console.error(`   Arquivo: ${arqRel}:${numLinha + 1}`);
          console.error(`   Trecho ofuscado: ${linha.trim().substring(0, 15)}...[OCULTO]`);
          achados++;
        }
      }
    });
  }

  if (achados > 0) {
    console.error(`\n❌ Bloqueio de Segurança: ${achados} potencial(is) segredo(s) detectado(s).`);
    console.error("   Remova as chaves e use variáveis de ambiente (.env) antes de prosseguir com o commit ou deploy.\n");
    process.exit(1);
  }

  console.log("✅ Varredura limpa: nenhum segredo hardcoded encontrado.");
}

async function main() {
  console.log("\n🛡️  RR Tech Studio — Verificação Determinística de Segredos");

  // 1. Tenta usar o binário oficial gitleaks se instalado
  const usouGitleaks = executarComGitleaks();
  if (usouGitleaks) return;

  // 2. Fallback para scanner nativo por regex
  const arquivos = obterArquivosParaVerificar();
  if (arquivos.length === 0) {
    console.log("ℹ️  Nenhum arquivo relevante para escanear no momento.");
    return;
  }

  escanearArquivosNativo(arquivos);
}

main().catch((err) => {
  console.error("💥 Erro fatal ao verificar segredos:", err);
  process.exit(1);
});
