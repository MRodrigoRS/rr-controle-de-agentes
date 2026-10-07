#!/usr/bin/env node
/**
 * Sincroniza a governança deste projeto a partir do repositório matriz da RR Tech Studio.
 * Zero dependências externas — executa com Node.js nativo (18+) em qualquer máquina ou SO.
 *
 * Modos de Uso:
 *   node governanca/scripts/sincronizar.mjs           -> Modo Essencial (Seguro): atualiza padrões, workflows e skills sem alterar contexto local.
 *   node governanca/scripts/sincronizar.mjs --remoto  -> Força busca remota via GitHub Raw (ignora detecção de pasta local).
 *   node governanca/scripts/sincronizar.mjs --total   -> Modo Total (Hard Reset): regenera tudo a partir da matriz (exige confirmação e cria backup).
 *   node governanca/scripts/sincronizar.mjs --total -y -> Modo Total sem confirmação interativa (automação/CI).
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ehSubpastaScripts = path.basename(__dirname) === "scripts" && path.basename(path.dirname(__dirname)) === "governanca";
const raiz = ehSubpastaScripts ? path.resolve(__dirname, "../..") : process.cwd();
const govDir = path.join(raiz, "governanca");
const matrizConfigPath = path.join(govDir, ".matriz.json");

if (!fs.existsSync(govDir)) {
  fs.mkdirSync(govDir, { recursive: true });
}

// 1. Carregar configuração da matriz
let configMatriz = {
  repositorio: "https://github.com/MRodrigoRS/rr-controle-de-agentes",
  branch: "master",
  versaoMatriz: "1.1.0",
};

if (fs.existsSync(matrizConfigPath)) {
  try {
    const raw = fs.readFileSync(matrizConfigPath, "utf-8");
    configMatriz = { ...configMatriz, ...JSON.parse(raw) };
  } catch (err) {
    console.warn("⚠️ Aviso: Não foi possível ler .matriz.json. Usando padrões.");
  }
}

// 2. Processar argumentos
const args = process.argv.slice(2);
const ehModoTotal = args.includes("--total") || args.includes("-t");
const pularConfirmacao = args.includes("--sim") || args.includes("-y") || args.includes("--forcar");
const forcarRemoto = args.includes("--remoto") || args.includes("--online") || args.includes("-r");

const branchArgIdx = args.findIndex((a) => a === "--branch" || a === "-b");
if (branchArgIdx !== -1 && args[branchArgIdx + 1]) {
  configMatriz.branch = args[branchArgIdx + 1];
}

// Extrai owner e repo da URL
let repoOwner = "MRodrigoRS";
let repoName = "rr-controle-de-agentes";
try {
  const urlParts = configMatriz.repositorio.replace(/\.git$/, "").split("/");
  if (urlParts.length >= 2) {
    repoName = urlParts.pop() || repoName;
    repoOwner = urlParts.pop() || repoOwner;
  }
} catch {
  // Mantém padrão
}

async function main() {
  console.log("\n========================================================");
  console.log(`📡 RR Tech Studio — Sincronizador de Governança`);
  console.log(`   Origem: ${repoOwner}/${repoName} (${configMatriz.branch})`);
  console.log(`   Modo: ${ehModoTotal ? "🔴 TOTAL (Hard Reset)" : "🟢 ESSENCIAL (Seguro)"}`);
  if (forcarRemoto) {
    console.log(`   Rede: 🌐 REMOTO FORÇADO (ignora busca local)`);
  }
  console.log("========================================================\n");

  // 3. Travas de segurança para o modo Total
  if (ehModoTotal) {
    console.log("⚠️  ATENÇÃO: VOCÊ SELECIONOU O MODO DE REGENERAÇÃO TOTAL!");
    console.log("   Esta ação irá sobrescrever TODOS os arquivos da governança,");
    console.log("   incluindo SESSAO.md, PRD.md, sprints/ e livro-arquitetura/.");
    console.log("   Um backup automático será criado antes da substituição.\n");

    if (!pularConfirmacao) {
      const rl = readline.createInterface({ input, output });
      const resposta = await rl.question("Digite 'REGENERAR TUDO' para confirmar: ");
      rl.close();

      if (resposta.trim() !== "REGENERAR TUDO") {
        console.log("\n❌ Operação cancelada. Nenhum arquivo foi modificado.\n");
        process.exit(0);
      }
    }

    // Criar backup prévio
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupDir = path.join(raiz, `.backup-governanca-${ts}`);
    console.log(`💾 Criando backup prévio em: ${path.basename(backupDir)}...`);
    fs.cpSync(govDir, backupDir, { recursive: true });
    console.log("✅ Backup salvo com sucesso!\n");

    // Limpa resíduos de pastas do projeto para garantir um reset total de fábrica
    console.log("🧹 Modo Total: limpando resíduos de sprints, relatórios e modelos de dados antigos...");
    const pastasParaResetar = [
      path.join(govDir, "sprints"),
      path.join(govDir, "relatorios"),
      path.join(govDir, "livro-arquitetura"),
      path.join(govDir, "padroes"),
      path.join(govDir, "workflows"),
      path.join(govDir, "skills"),
      path.join(govDir, "templates"),
    ];
    for (const p of pastasParaResetar) {
      if (fs.existsSync(p)) {
        fs.rmSync(p, { recursive: true, force: true });
      }
    }
  }

  // 4. Estratégia de obtenção dos arquivos (Local com fallback para Remoto GitHub)
  let sucessoObtencao = false;

  // Tentativa A: Progenitora presente localmente
  const caminhosLocaisPossiveis = [
    path.resolve(process.cwd()),
  ];

  // Busca subindo os diretórios pais recursivamente (até 5 níveis) para achar a progenitora
  let dirCursor = path.resolve(raiz, "..");
  for (let i = 0; i < 5; i++) {
    caminhosLocaisPossiveis.push(dirCursor);
    caminhosLocaisPossiveis.push(path.join(dirCursor, "rr-controle-de-agentes-1.1"));
    caminhosLocaisPossiveis.push(path.join(dirCursor, "rr-controle-de-agentes"));
    caminhosLocaisPossiveis.push(path.join(dirCursor, repoName));
    const pai = path.dirname(dirCursor);
    if (pai === dirCursor) break;
    dirCursor = pai;
  }

  let progenitoraLocal = null;
  if (!forcarRemoto) {
    for (const c of caminhosLocaisPossiveis) {
      if (fs.existsSync(path.join(c, "src", "templates")) && c !== raiz) {
        progenitoraLocal = c;
        break;
      }
    }
  } else {
    console.log("🌐 Flag --remoto / --online ativada: ignorando progenitora local e forçando busca via GitHub...");
  }

  if (progenitoraLocal) {
    console.log(`📁 Fonte local detectada em: ${progenitoraLocal}`);
    sucessoObtencao = sincronizarDeOrigemLocal(progenitoraLocal);
  }

  // Tentativa B: Remoto via GitHub API / Raw
  if (!sucessoObtencao) {
    if (!forcarRemoto) {
      console.log(`🌐 Buscando atualizações remotas via GitHub (${repoOwner}/${repoName})...`);
    }
    sucessoObtencao = await sincronizarDeGitHubRemoto();
  }

  if (!sucessoObtencao) {
    console.error("\n❌ Não foi possível sincronizar da matriz. Verifique sua conexão ou configuração.");
    process.exit(1);
  }

  // 5. Atualizar metadados (.matriz.json)
  configMatriz.atualizadoEm = new Date().toISOString();
  configMatriz.modoRegeneracaoUltimo = ehModoTotal ? "total" : "essencial";
  fs.writeFileSync(matrizConfigPath, JSON.stringify(configMatriz, null, 2), "utf-8");

  // 6. Garantir ponteiros na raiz do projeto (AGENTS.md e CLAUDE.md)
  const agentsRoot = path.join(raiz, "AGENTS.md");
  if (!fs.existsSync(agentsRoot)) {
    fs.writeFileSync(
      agentsRoot,
      `# Governança do Projeto — RR Tech Studio\n\nAs diretrizes e regras oficiais deste projeto estão em:\n👉 [governanca/AGENTS.md](governanca/AGENTS.md)\n\nNotas persistentes e sprint ativa em:\n👉 [governanca/SESSAO.md](governanca/SESSAO.md)\n\n---\n\n### Como Iniciar uma Sessão (Intenção Macro)\nPara ativar imediatamente o fluxo correto e evitar adivinhações do agente:\n- **Projeto novo (do zero):** \`"Inicie o onboarding do projeto [Nome]"\` → segue [governanca/INICIO.md](governanca/INICIO.md)\n- **Projeto existente com código:** \`"Vincule este projeto à governança"\` → segue [governanca/VINCULAR.md](governanca/VINCULAR.md)\n- **Continuar sprint ativa:** \`"Execute /status e continue a sprint ativa"\` → segue [governanca/SESSAO.md](governanca/SESSAO.md)\n- **Atualizar governança com a matriz:** \`"Sincronize a governança com a matriz"\` → skill [governanca/skills/sincronizar-governanca.md](governanca/skills/sincronizar-governanca.md)\n`,
      "utf-8"
    );
    console.log("📝 Criado ponteiro raiz: AGENTS.md");
  }

  const claudeRoot = path.join(raiz, "CLAUDE.md");
  if (!fs.existsSync(claudeRoot)) {
    fs.writeFileSync(
      claudeRoot,
      `# Governança do Projeto — RR Tech Studio\n\nConsulte:\n- Diretrizes: [governanca/AGENTS.md](governanca/AGENTS.md)\n- Estado atual e regras ativas: [governanca/SESSAO.md](governanca/SESSAO.md)\n\n---\n\n### Como Iniciar uma Sessão (Intenção Macro)\n- **Projeto novo (do zero):** \`"Inicie o onboarding do projeto [Nome]"\` → segue [governanca/INICIO.md](governanca/INICIO.md)\n- **Projeto existente com código:** \`"Vincule este projeto à governança"\` → segue [governanca/VINCULAR.md](governanca/VINCULAR.md)\n- **Continuar sprint ativa:** \`"Execute /status e continue a sprint ativa"\` → segue [governanca/SESSAO.md](governanca/SESSAO.md)\n- **Atualizar governança:** \`"Sincronize a governança com a matriz"\` → skill [governanca/skills/sincronizar-governanca.md](governanca/skills/sincronizar-governanca.md)\n`,
      "utf-8"
    );
    console.log("📝 Criado ponteiro raiz: CLAUDE.md");
  }

  // 6.1 Garantir CHANGELOG.md de produto na raiz se não existir (preserva se já existir)
  const changelogRoot = path.join(raiz, "CHANGELOG.md");
  if (!fs.existsSync(changelogRoot)) {
    const nomeProj = path.basename(raiz);
    const dataHoje = new Date().toISOString().split("T")[0];
    const changelogInicial = `# Changelog — ${nomeProj}

Todas as alterações notáveis, novas funcionalidades, melhorias e correções deste software são documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

> **Diretriz para Agentes IA e Desenvolvedores:**
> - Atualize este arquivo **antes de fechar qualquer commit** que altere regras de negócio, telas, dados ou APIs do produto.
> - Registre apenas o **delta consolidado** (o que foi adicionado, modificado ou corrigido).
> - **Não acumule** processo de edição, histórico de tentativas ou micro-passos. O commit no Git já registra o histórico detalhado linha por linha.

---

## [Não lançado]

### Adicionado
- Estrutura base da aplicação e regras de governança.

---

## [0.1.0] — ${dataHoje}

### Adicionado
- Inicialização do projeto sob a Governança Oficial RR Tech Studio.
- Definição da stack tecnológica oficial em [governanca/livro-arquitetura/02-stack.md](governanca/livro-arquitetura/02-stack.md).
`;
    fs.writeFileSync(changelogRoot, changelogInicial, "utf-8");
    console.log("📝 Criado changelog de produto na raiz: CHANGELOG.md");
  }

  // Se executado fora de governanca/scripts/, garantir cópia em governanca/scripts/sincronizar.mjs
  const destSincronizar = path.join(govDir, "scripts", "sincronizar.mjs");
  fs.mkdirSync(path.join(govDir, "scripts"), { recursive: true });
  const scriptAtual = fileURLToPath(import.meta.url);
  if (!fs.existsSync(destSincronizar) && fs.existsSync(scriptAtual)) {
    fs.copyFileSync(scriptAtual, destSincronizar);
  }

  // 7. Invocar o script do harness para refletir as mudanças em .agents/
  const harnessScript = path.join(govDir, "scripts", "harness.mjs");
  if (fs.existsSync(harnessScript)) {
    console.log("\n⚙️  Re-sincronizando o harness do agente local (.agents/)...");
    const { execSync } = await import("node:child_process");
    try {
      execSync(`node "${harnessScript}"`, { stdio: "inherit", cwd: raiz });
    } catch {
      console.warn("⚠️ Não foi possível rodar harness.mjs automaticamente.");
    }
  }

  console.log(`\n🎉 Governança sincronizada com sucesso no modo ${ehModoTotal ? "TOTAL" : "ESSENCIAL"}!\n`);
}

const CLAUSULAS_PADRAO = [
  "1. **Não implementar fora do escopo:** Não implementar funcionalidades fora do escopo da sprint/etapa atual. Se algo urgente surgir, registre e alinhe com o usuário antes.",
  "2. **Não avançar com testes falhando:** Não avançar para a próxima etapa enquanto houver testes falhando. Corrija antes de prosseguir.",
  "3. **Não expor segredos:** Não expor chaves secretas, tokens, senhas ou dados sensíveis. Use variáveis de ambiente e .env.example.",
  "4. **Português brasileiro no código:** Nomes de entidades, regras de negócio, tabelas de banco, variáveis e funções devem ser escritos em português brasileiro (ex: obterUsuario, salvarPedido, cliente). Termos técnicos universais (id, payload, props, handler, middleware, token, status, req/res) permanecem em inglês sem tradução forçada.",
  "5. **Backend como autoridade única (Zero-Trust no cliente):** O frontend é uma camada de apresentação manipulável. Toda regra de negócio, cálculo de valores/preços, checagem de permissões e validação de transição de estado deve obrigatoriamente ser recalculada e validada no backend.",
  "6. **Dependências com justificativa:** Não instalar dependências sem justificativa prévia registrada.",
  "7. **Changelog a Cada Commit:**\n   - **Produto:** Registre obrigatoriamente o delta consolidado (Adicionado/Modificado/Corrigido) no `CHANGELOG.md` da raiz (`../CHANGELOG.md`) antes de fechar qualquer commit com código, APIs ou regras de negócio.\n   - **Governança:** Alterações estruturais ou em manuais são registradas em [governanca/CHANGELOG.md](CHANGELOG.md)."
].join("\n\n");

const QUALIDADE_PADRAO = [
  "- **Build sem erros:** Código deve passar em `npm run build` (ou equivalente) sem erros.",
  "- **Commits descritivos:** Commits devem ter mensagens descritivas em português, explicando o que foi feito e por quê.",
  "- **Changelog do produto na raiz:** Todo commit de desenvolvimento de software deve refletir seu delta no `CHANGELOG.md` da raiz do projeto.",
  "- **Testes incrementais:** Testes devem ser incrementais — nunca regrida a suíte de testes existente.",
  "- **Responsividade e Usabilidade:** Aplicações Web devem ser 100% responsivas (Mobile-First) e acessíveis por padrão.",
  "- **Estrutura de pastas:** Siga a estrutura de pastas definida em [convencoes-estrutura-de-pastas.md](skills/convencoes-estrutura-de-pastas.md).",
  "- **Documentação de decisões:** Decisões técnicas relevantes devem ser registradas em [livro-arquitetura/](livro-arquitetura/)."
].join("\n");

function detectarSeEhProjetoExistente(dirRaiz) {
  if (fs.existsSync(path.join(dirRaiz, "governanca", "VINCULAR.md"))) return true;
  if (fs.existsSync(path.join(dirRaiz, "governanca", "INICIO.md"))) return false;

  const arquivosCodigo = [
    "package.json", "tsconfig.json", "composer.json", "pom.xml", "build.gradle",
    "Cargo.toml", "go.mod", "requirements.txt", "Pipfile", "pyproject.toml",
    "Gemfile", "Makefile", "Dockerfile", ".clasp.json"
  ];
  for (const a of arquivosCodigo) {
    if (fs.existsSync(path.join(dirRaiz, a))) return true;
  }
  const pastasCodigo = ["src", "app", "lib", "pages", "server", "client", "api"];
  for (const p of pastasCodigo) {
    if (fs.existsSync(path.join(dirRaiz, p))) return true;
  }
  return false;
}

function aplicarContextoBasico(conteudo, nomeProjeto) {
  const dataHoje = new Date().toISOString().split("T")[0];
  let c = conteudo;
  c = c.replaceAll("{{nomeProjeto}}", nomeProjeto);
  c = c.replaceAll("{{data}}", dataHoje);
  c = c.replaceAll("{{clausulas}}", CLAUSULAS_PADRAO);
  c = c.replaceAll("{{qualidade}}", QUALIDADE_PADRAO);
  c = c.replaceAll("{{branchSugerida}}", "refactor/modernizacao-stack");
  c = c.replaceAll("{{frontend}}", "A definir");
  c = c.replaceAll("{{backend}}", "A definir");
  c = c.replaceAll("{{numero}}", "01");
  c = c.replaceAll("{{titulo}}", "Diagnóstico e Onboarding");
  c = c.replaceAll("{{objetivo}}", "Mapeamento inicial do projeto e estruturação da base.");
  c = c.replaceAll("{{numeroEtapa}}", "1");
  c = c.replaceAll("{{tituloEtapa}}", "Análise de Arquitetura");
  c = c.replaceAll("{{objetivoEtapa}}", "Investigar o repositório e preencher o livro de arquitetura.");
  c = c.replaceAll("{{comandoTeste}}", "npm test");
  c = c.replaceAll("{{sugestaoCommit}}", "feat(init): onboarding da governanca inicializado");
  c = c.replace(/\{\{#if[\s\S]*?\{\{\/if\}\}/g, "");
  return c;
}

function sincronizarDeOrigemLocal(caminhoOrigem) {
  try {
    const templatesDir = path.join(caminhoOrigem, "src", "templates");
    copiarPastasMatriz(templatesDir, caminhoOrigem);
    return true;
  } catch (err) {
    console.warn("⚠️ Falha na cópia local: " + err.message);
    return false;
  }
}

async function sincronizarDeGitHubRemoto() {
  const headers = { "User-Agent": "RR-Controle-De-Agentes-Sync" };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    // Busca árvore de arquivos recursiva via GitHub API
    const treeUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/git/trees/${configMatriz.branch}?recursive=1`;
    const res = await fetch(treeUrl, { headers });

    if (!res.ok) {
      console.warn(`⚠️ API do GitHub retornou status ${res.status}: ${res.statusText}`);
      return false;
    }

    const data = await res.json();
    if (!data.tree || !Array.isArray(data.tree)) {
      return false;
    }

    const arquivosTemplates = data.tree.filter((item) =>
      item.type === "blob" && (item.path.startsWith("src/templates/") || item.path.endsWith("CATALOGO_TECNOLOGIAS.md"))
    );

    console.log(`📦 Encontrados ${arquivosTemplates.length} arquivos gerenciados na matriz.`);

    const exclusivosMatriz = new Set([
      "skills/auditar-maturidade-governanca.md",
      "workflows/auditar-governanca.md",
      "relatorios/_template_evolucao_governanca.md",
    ]);

    const nomeProjeto = path.basename(raiz);
    const ehMatriz = fs.existsSync(path.join(raiz, "src", "templates"));
    const ehProjetoExistente = detectarSeEhProjetoExistente(raiz);
    const docEntradaEsperado = ehProjetoExistente ? "VINCULAR.md" : "INICIO.md";

    let falhasDownload = 0;
    for (const item of arquivosTemplates) {
      const relPath = item.path.replace(/^src\/templates\//, "");

      // Se for satélite (não matriz), não baixa ferramentas exclusivas de P&D da matriz
      if (!ehMatriz && exclusivosMatriz.has(relPath)) {
        continue;
      }

      // Determinar destino no projeto
      let destRel = null;

      if (item.path.endsWith("CATALOGO_TECNOLOGIAS.md")) {
        destRel = path.join("skills", "CATALOGO_TECNOLOGIAS.md");
      } else if (relPath === "AGENTS.md") {
        destRel = "AGENTS.md";
      } else if (relPath === "CHANGELOG.md") {
        destRel = "CHANGELOG.md";
      } else if (relPath === "SPRINT.md") {
        destRel = path.join("sprints", "_template.md");
      } else if (relPath === "INICIO.md" || relPath === "VINCULAR.md") {
        if (relPath === docEntradaEsperado) {
          destRel = docEntradaEsperado;
        } else {
          continue;
        }
      } else if (relPath.startsWith("padroes/")) {
        destRel = relPath;
      } else if (relPath.startsWith("workflows/")) {
        destRel = relPath;
      } else if (relPath.startsWith("skills/")) {
        destRel = relPath;
      } else if (relPath.startsWith("relatorios/")) {
        destRel = relPath;
      } else if (relPath.startsWith("scripts/")) {
        destRel = relPath.endsWith(".template")
          ? path.join("templates", path.basename(relPath))
          : path.join("scripts", path.basename(relPath));
      } else if (relPath.startsWith("arquitetura/")) {
        const destLivro = path.join("livro-arquitetura", relPath.replace(/^arquitetura\//, ""));
        const destAbsLivro = path.join(govDir, destLivro);
        if (ehModoTotal || !fs.existsSync(destAbsLivro)) {
          destRel = destLivro;
        } else {
          continue;
        }
      } else if (relPath === "SESSAO.md" || relPath === "PRD.md" || relPath === "PLANO.md") {
        const destAbsDoc = path.join(govDir, relPath);
        if (ehModoTotal || !fs.existsSync(destAbsDoc)) {
          destRel = relPath;
        } else {
          continue;
        }
      }

      if (!destRel) continue;

      const destAbs = path.join(govDir, destRel);

      // Se for a própria matriz, preserva seu AGENTS.md mestre
      if (destRel === "AGENTS.md" && ehMatriz && fs.existsSync(destAbs)) {
        continue;
      }

      fs.mkdirSync(path.dirname(destAbs), { recursive: true });

      // Baixa o conteúdo cru do arquivo
      const rawUrl = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${configMatriz.branch}/${item.path}`;
      const rawRes = await fetch(rawUrl, { headers });
      if (rawRes.ok) {
        let conteudo = await rawRes.text();
        if (destRel.endsWith(".md") && !destRel.startsWith("padroes/") && !destRel.startsWith("workflows/") && !destRel.startsWith("skills/")) {
          conteudo = aplicarContextoBasico(conteudo, nomeProjeto);
        }
        fs.writeFileSync(destAbs, conteudo, "utf-8");
      } else {
        console.error(`❌ Falha ao baixar ${item.path} (HTTP ${rawRes.status}: ${rawRes.statusText})`);
        falhasDownload++;
      }
    }

    if (falhasDownload > 0) {
      console.error(`\n❌ Sincronização incompleta: ${falhasDownload} arquivo(s) falharam no download.`);
      return false;
    }

    return true;
  } catch (err) {
    console.warn("⚠️ Falha no download remoto: " + err.message);
    return false;
  }
}

function copiarPastasMatriz(templatesDir, raizOrigem) {
  const nomeProjeto = path.basename(raiz);
  const ehMatriz = fs.existsSync(path.join(raiz, "src", "templates"));
  const ehProjetoExistente = detectarSeEhProjetoExistente(raiz);
  const docEntradaEsperado = ehProjetoExistente ? "VINCULAR.md" : "INICIO.md";

  const subpastas = ["padroes", "workflows", "skills", "relatorios"];
  const exclusivosMatriz = new Set([
    "auditar-maturidade-governanca.md",
    "auditar-governanca.md",
    "_template_evolucao_governanca.md",
  ]);

  // 1. Subpastas padrão (padroes, workflows, skills, relatorios)
  for (const sub of subpastas) {
    const srcDir = path.join(templatesDir, sub);
    const destDir = path.join(govDir, sub);
    if (fs.existsSync(srcDir)) {
      fs.mkdirSync(destDir, { recursive: true });
      for (const f of fs.readdirSync(srcDir)) {
        if (f.endsWith(".md")) {
          if (!ehMatriz && exclusivosMatriz.has(f)) {
            continue;
          }
          fs.copyFileSync(path.join(srcDir, f), path.join(destDir, f));
        }
      }
    }
  }

  // 2. AGENTS.md na pasta governanca/ (sempre mantido atualizado no satélite)
  const agentsOrigem = path.join(templatesDir, "AGENTS.md");
  const agentsDest = path.join(govDir, "AGENTS.md");
  if (fs.existsSync(agentsOrigem)) {
    if (!ehMatriz || !fs.existsSync(agentsDest)) {
      const conteudo = aplicarContextoBasico(fs.readFileSync(agentsOrigem, "utf-8"), nomeProjeto);
      fs.writeFileSync(agentsDest, conteudo, "utf-8");
    }
  }

  // 3. Documento de entrada (INICIO.md ou VINCULAR.md)
  const docOrigem = path.join(templatesDir, docEntradaEsperado);
  const docDest = path.join(govDir, docEntradaEsperado);
  if (fs.existsSync(docOrigem)) {
    if (ehModoTotal || !fs.existsSync(docDest)) {
      const conteudo = aplicarContextoBasico(fs.readFileSync(docOrigem, "utf-8"), nomeProjeto);
      fs.writeFileSync(docDest, conteudo, "utf-8");
    }
  }

  // 4. Template de Sprint (SPRINT.md -> governanca/sprints/_template.md)
  const sprintOrigem = path.join(templatesDir, "SPRINT.md");
  const sprintDestDir = path.join(govDir, "sprints");
  fs.mkdirSync(sprintDestDir, { recursive: true });
  if (fs.existsSync(sprintOrigem)) {
    const conteudo = aplicarContextoBasico(fs.readFileSync(sprintOrigem, "utf-8"), nomeProjeto);
    fs.writeFileSync(path.join(sprintDestDir, "_template.md"), conteudo, "utf-8");
  }

  // 5. CHANGELOG da matriz
  const changelogOrigem = path.join(templatesDir, "CHANGELOG.md");
  const changelogDest = path.join(govDir, "CHANGELOG.md");
  if (fs.existsSync(changelogOrigem)) {
    fs.copyFileSync(changelogOrigem, changelogDest);
  }

  // 6. Catálogo de tecnologias
  const catalogoSrc = path.join(govDir, "skills", "CATALOGO_TECNOLOGIAS.md");
  const catalogoOrigem = path.join(raizOrigem, "governanca", "skills", "CATALOGO_TECNOLOGIAS.md");
  if (fs.existsSync(catalogoOrigem)) {
    fs.copyFileSync(catalogoOrigem, catalogoSrc);
  }

  // 7. Scripts e templates
  const scriptsSrc = path.join(templatesDir, "scripts");
  const scriptsDest = path.join(govDir, "scripts");
  const templatesDest = path.join(govDir, "templates");
  if (fs.existsSync(scriptsSrc)) {
    fs.mkdirSync(scriptsDest, { recursive: true });
    fs.mkdirSync(templatesDest, { recursive: true });
    for (const f of fs.readdirSync(scriptsSrc)) {
      if (f.endsWith(".template")) {
        fs.copyFileSync(path.join(scriptsSrc, f), path.join(templatesDest, f));
      } else {
        fs.copyFileSync(path.join(scriptsSrc, f), path.join(scriptsDest, f));
      }
    }
  }

  // 8. Livro de arquitetura (no total ou se não existir)
  const arqSrc = path.join(templatesDir, "arquitetura");
  const arqDest = path.join(govDir, "livro-arquitetura");
  if (fs.existsSync(arqSrc)) {
    fs.mkdirSync(arqDest, { recursive: true });
    fs.mkdirSync(path.join(arqDest, "decisoes"), { recursive: true });
    for (const f of fs.readdirSync(arqSrc)) {
      const srcFile = path.join(arqSrc, f);
      const destFile = path.join(arqDest, f);
      if (f.endsWith(".md")) {
        if (ehModoTotal || !fs.existsSync(destFile)) {
          const conteudo = aplicarContextoBasico(fs.readFileSync(srcFile, "utf-8"), nomeProjeto);
          fs.writeFileSync(destFile, conteudo, "utf-8");
        }
      }
    }
  }

  // 9. SESSAO.md, PRD.md, PLANO.md (no total ou se não existir)
  for (const f of ["SESSAO.md", "PRD.md", "PLANO.md"]) {
    const srcFile = path.join(templatesDir, f);
    const destFile = path.join(govDir, f);
    if (fs.existsSync(srcFile)) {
      if (ehModoTotal || !fs.existsSync(destFile)) {
        const conteudo = aplicarContextoBasico(fs.readFileSync(srcFile, "utf-8"), nomeProjeto);
        fs.writeFileSync(destFile, conteudo, "utf-8");
      }
    }
  }
}

main().catch((err) => {
  console.error("❌ Erro fatal durante a sincronização:", err);
  process.exit(1);
});
