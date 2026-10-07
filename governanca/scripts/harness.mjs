#!/usr/bin/env node
/**
 * Re-sincroniza o harness local do agente (.agents/, CLAUDE.md, AGENTS.md)
 * a partir da governança oficial versionada do projeto.
 * Zero dependências externas — executa com Node.js nativo em qualquer máquina ou SO.
 *
 * Uso:
 *   node governanca/scripts/harness.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raiz = path.resolve(__dirname, "../..");
const govDir = path.join(raiz, "governanca");

if (!fs.existsSync(govDir)) {
  console.error("Pasta governanca/ nao encontrada em " + raiz);
  process.exit(1);
}

// 1. Ponteiros raiz
fs.writeFileSync(path.join(raiz, "AGENTS.md"), "# Governança do Projeto — RR Tech Studio\n\nAs diretrizes e regras oficiais deste projeto estão em:\n👉 [governanca/AGENTS.md](governanca/AGENTS.md)\n\nNotas persistentes e sprint ativa em:\n👉 [governanca/SESSAO.md](governanca/SESSAO.md)\n\n---\n\n### Como Iniciar uma Sessão (Intenção Macro)\nPara ativar imediatamente o fluxo correto e evitar adivinhações do agente:\n- **Projeto novo (do zero):** `\"Inicie o onboarding do projeto [Nome]\"` → segue [governanca/INICIO.md](governanca/INICIO.md)\n- **Projeto existente com código:** `\"Vincule este projeto à governança\"` → segue [governanca/VINCULAR.md](governanca/VINCULAR.md)\n- **Continuar sprint ativa:** `\"Execute /status e continue a sprint ativa\"` → segue [governanca/SESSAO.md](governanca/SESSAO.md)\n- **Atualizar governança com a matriz:** `\"Sincronize a governança com a matriz\"` → skill [governanca/skills/sincronizar-governanca.md](governanca/skills/sincronizar-governanca.md)\n", "utf-8");

const temInicio = fs.existsSync(path.join(govDir, "INICIO.md"));
const roteiroInicial = temInicio ? "[governanca/INICIO.md](governanca/INICIO.md)" : "[governanca/VINCULAR.md](governanca/VINCULAR.md)";
fs.writeFileSync(path.join(raiz, "CLAUDE.md"), "# Governança do Projeto — RR Tech Studio\n\nEste projeto é governado por regras estritas da RR Tech Studio.\n- **Regras e Padrões Oficiais:** Consulte [governanca/AGENTS.md](governanca/AGENTS.md)\n- **Sessão Atual e Sprint Ativa:** Consulte [governanca/SESSAO.md](governanca/SESSAO.md)\n- **Primeira Sessão:** Siga o roteiro em " + roteiroInicial + "\n- **Workflows:** Procedimentos disponíveis em [governanca/workflows/](governanca/workflows/)\n\n---\n\n### Como Iniciar uma Sessão (Intenção Macro)\n- **Projeto novo (do zero):** `\"Inicie o onboarding do projeto [Nome]\"` → segue [governanca/INICIO.md](governanca/INICIO.md)\n- **Projeto existente com código:** `\"Vincule este projeto à governança\"` → segue [governanca/VINCULAR.md](governanca/VINCULAR.md)\n- **Continuar sprint ativa:** `\"Execute /status e continue a sprint ativa\"` → segue [governanca/SESSAO.md](governanca/SESSAO.md)\n- **Atualizar governança:** `\"Sincronize a governança com a matriz\"` → skill [governanca/skills/sincronizar-governanca.md](governanca/skills/sincronizar-governanca.md)\n", "utf-8");

// 2. Regras .agents
const agentsDir = path.join(raiz, ".agents");
const rulesDir = path.join(agentsDir, "rules");
fs.mkdirSync(rulesDir, { recursive: true });
fs.writeFileSync(path.join(rulesDir, "000-governanca.md"), "# Governança — RR Tech Studio\n\nAs diretrizes oficiais deste projeto estão em [governanca/AGENTS.md](../../governanca/AGENTS.md).\nConsulte [governanca/SESSAO.md](../../governanca/SESSAO.md) para a sprint ativa e histórico de sessões.\n", "utf-8");

// 3. Workflows como slash commands
const wfSrc = path.join(govDir, "workflows");
const wfDest = path.join(agentsDir, "workflows");
fs.mkdirSync(wfDest, { recursive: true });
const activeWf = new Set();
if (fs.existsSync(wfSrc)) {
  for (const f of fs.readdirSync(wfSrc)) {
    if (f.endsWith(".md")) {
      activeWf.add(f);
      let wfConteudo = fs.readFileSync(path.join(wfSrc, f), "utf-8");
      wfConteudo = wfConteudo.replace(/\(\.\.\//g, "(../../governanca/");
      fs.writeFileSync(path.join(wfDest, f), wfConteudo, "utf-8");
    }
  }
}
for (const f of fs.readdirSync(wfDest)) {
  if (f.endsWith(".md") && !activeWf.has(f)) fs.unlinkSync(path.join(wfDest, f));
}

// 4. Skills como ponteiros leves
const skSrc = path.join(govDir, "skills");
const skDest = path.join(agentsDir, "skills");
fs.mkdirSync(skDest, { recursive: true });
const activeSk = new Set();
if (fs.existsSync(skSrc)) {
  for (const f of fs.readdirSync(skSrc)) {
    if (f.endsWith(".md") && f !== "CATALOGO_TECNOLOGIAS.md") {
      const name = path.basename(f, ".md");
      activeSk.add(name);
      const folder = path.join(skDest, name);
      fs.mkdirSync(folder, { recursive: true });
      const content = fs.readFileSync(path.join(skSrc, f), "utf-8");
      let skillName = name;
      let desc = "Executa o procedimento da skill " + name + ".";
      const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (fmMatch) {
        const nMatch = fmMatch[1].match(/name:\s*(.+)/);
        const dMatch = fmMatch[1].match(/description:\s*(.+)/);
        if (nMatch) skillName = nMatch[1].trim();
        if (dMatch) desc = dMatch[1].trim();
      }
      fs.writeFileSync(path.join(folder, "SKILL.md"), "---\nname: " + skillName + "\ndescription: " + desc + "\n---\n\n# Skill: " + skillName + "\n\n> Ponteiro do Harness para governança oficial.\n\n## Instruções de Execução\n\nConsulte e execute as instruções atualizadas em:\n👉 [governanca/skills/" + f + "](../../../governanca/skills/" + f + ")\n", "utf-8");
    }
  }
}
for (const item of fs.readdirSync(skDest)) {
  const p = path.join(skDest, item);
  if (fs.statSync(p).isDirectory() && !activeSk.has(item)) {
    fs.rmSync(p, { recursive: true, force: true });
  }
}

console.log("✅ Harness do agente sincronizado com sucesso (" + activeWf.size + " workflows, " + activeSk.size + " skills).");
