import fs from "fs";
import path from "path";

/**
 * Configura o harness do agente no diretório do projeto (.agents/, CLAUDE.md).
 * Garante que a governança seja a única fonte da verdade e registra
 * workflows como slash commands e skills como ponteiros leves.
 */
export function configurarHarnessNoProjeto(caminhoProjeto: string): { sucesso: boolean; mensagem: string } {
  const caminhoAbs = path.resolve(caminhoProjeto);
  const governancaDir = path.join(caminhoAbs, "governanca");

  if (!fs.existsSync(governancaDir)) {
    return { sucesso: false, mensagem: `Pasta governanca/ não encontrada em ${caminhoAbs}` };
  }

  function escreverPonteiroSeguro(caminhoArquivo: string, novoConteudo: string, marcador: string) {
    if (fs.existsSync(caminhoArquivo)) {
      const conteudoAtual = fs.readFileSync(caminhoArquivo, "utf-8");
      if (!conteudoAtual.includes(marcador)) {
        const backupPath = `${caminhoArquivo}.backup`;
        if (!fs.existsSync(backupPath)) {
          fs.writeFileSync(backupPath, conteudoAtual, "utf-8");
        }
      }
    }
    fs.writeFileSync(caminhoArquivo, novoConteudo, "utf-8");
  }

  // 1. Ponteiro universal AGENTS.md na raiz (Cursor, Windsurf, Roo, OpenCode, Codex)
  const rootAgentsMdPath = path.join(caminhoAbs, "AGENTS.md");
  const rootAgentsMdConteudo = `# Governança do Projeto — RR Tech Studio\n\nAs diretrizes e regras oficiais deste projeto estão em:\n👉 [governanca/AGENTS.md](governanca/AGENTS.md)\n\nNotas persistentes e sprint ativa em:\n👉 [governanca/SESSAO.md](governanca/SESSAO.md)\n`;
  escreverPonteiroSeguro(rootAgentsMdPath, rootAgentsMdConteudo, "governanca/AGENTS.md");

  // 2. Ponteiro ativo CLAUDE.md na raiz (Claude Code)
  const claudeMdPath = path.join(caminhoAbs, "CLAUDE.md");
  const claudeMdConteudo = `# Governança do Projeto — RR Tech Studio\n\nEste projeto é governado por regras estritas da RR Tech Studio.\n- **Regras e Padrões Oficiais:** Consulte [governanca/AGENTS.md](governanca/AGENTS.md)\n- **Sessão Atual e Sprint Ativa:** Consulte [governanca/SESSAO.md](governanca/SESSAO.md)\n- **Primeira Sessão:** Siga o roteiro em [governanca/INICIO.md](governanca/INICIO.md) (ou VINCULAR.md)\n- **Workflows:** Procedimentos disponíveis em [governanca/workflows/](governanca/workflows/)\n`;
  escreverPonteiroSeguro(claudeMdPath, claudeMdConteudo, "governanca/AGENTS.md");

  // 3. Regra ativa .agents/rules/000-governanca.md (Antigravity e IDEs compatíveis)
  const agentsDir = path.join(caminhoAbs, ".agents");
  const rulesDir = path.join(agentsDir, "rules");
  fs.mkdirSync(rulesDir, { recursive: true });

  const rulePath = path.join(rulesDir, "000-governanca.md");
  const ruleConteudo = `# Governança — RR Tech Studio\n\nAs diretrizes oficiais deste projeto estão em [governanca/AGENTS.md](governanca/AGENTS.md).\nConsulte [governanca/SESSAO.md](governanca/SESSAO.md) para a sprint ativa e histórico de sessões.\n`;
  fs.writeFileSync(rulePath, ruleConteudo, "utf-8");

  // 3. Registrar Workflows em .agents/workflows/ (viram Slash Commands nativos)
  const workflowsSrcDir = path.join(governancaDir, "workflows");
  const workflowsHarnessDir = path.join(agentsDir, "workflows");
  fs.mkdirSync(workflowsHarnessDir, { recursive: true });

  const activeWorkflows = new Set<string>();
  if (fs.existsSync(workflowsSrcDir)) {
    for (const arquivo of fs.readdirSync(workflowsSrcDir)) {
      if (arquivo.endsWith(".md")) {
        activeWorkflows.add(arquivo);
        const srcFile = path.join(workflowsSrcDir, arquivo);
        const destFile = path.join(workflowsHarnessDir, arquivo);
        fs.copyFileSync(srcFile, destFile);
      }
    }
  }

  // Limpeza de workflows obsoletos no harness
  if (fs.existsSync(workflowsHarnessDir)) {
    for (const arquivo of fs.readdirSync(workflowsHarnessDir)) {
      if (arquivo.endsWith(".md") && !activeWorkflows.has(arquivo)) {
        fs.unlinkSync(path.join(workflowsHarnessDir, arquivo));
      }
    }
  }

  // 4. Registrar Skills em .agents/skills/<nome>/SKILL.md (ponteiros leves)
  const skillsSrcDir = path.join(governancaDir, "skills");
  const skillsHarnessDir = path.join(agentsDir, "skills");
  fs.mkdirSync(skillsHarnessDir, { recursive: true });

  const activeSkills = new Set<string>();
  if (fs.existsSync(skillsSrcDir)) {
    for (const arquivo of fs.readdirSync(skillsSrcDir)) {
      if (arquivo.endsWith(".md") && arquivo !== "CATALOGO_TECNOLOGIAS.md") {
        const nomeSkill = path.basename(arquivo, ".md");
        activeSkills.add(nomeSkill);

        const skillFolder = path.join(skillsHarnessDir, nomeSkill);
        fs.mkdirSync(skillFolder, { recursive: true });

        // Extrai frontmatter ou monta padrão
        const conteudo = fs.readFileSync(path.join(skillsSrcDir, arquivo), "utf-8");
        let name = nomeSkill;
        let description = `Executa o procedimento da skill ${nomeSkill}.`;

        const fmMatch = conteudo.match(/^---\r?\n([\s\S]*?)\r?\n---/);
        if (fmMatch) {
          const fm = fmMatch[1];
          const nameMatch = fm.match(/name:\s*(.+)/);
          const descMatch = fm.match(/description:\s*(.+)/);
          if (nameMatch) name = nameMatch[1].trim();
          if (descMatch) description = descMatch[1].trim();
        }

        const skillMdConteudo = `---
name: ${name}
description: ${description}
---

# Skill: ${name}

> Ponteiro do Harness para governança oficial. A fonte única da verdade é o arquivo de governança do projeto.

## Instruções de Execução

Consulte e execute as instruções atualizadas em:
👉 [governanca/skills/${arquivo}](../../governanca/skills/${arquivo})
`;
        fs.writeFileSync(path.join(skillFolder, "SKILL.md"), skillMdConteudo, "utf-8");
      }
    }
  }

  // Limpeza de pastas de skills obsoletas no harness (renomeadas ou deletadas)
  if (fs.existsSync(skillsHarnessDir)) {
    for (const item of fs.readdirSync(skillsHarnessDir)) {
      const itemPath = path.join(skillsHarnessDir, item);
      if (fs.statSync(itemPath).isDirectory() && !activeSkills.has(item)) {
        fs.rmSync(itemPath, { recursive: true, force: true });
      }
    }
  }

  // 5. Garantir que .agents/ esteja no .gitignore do projeto (governanca/ é a única fonte da verdade versionada)
  const gitignorePath = path.join(caminhoAbs, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const gitignoreConteudo = fs.readFileSync(gitignorePath, "utf-8");
    if (!gitignoreConteudo.includes(".agents")) {
      const quebra = gitignoreConteudo.endsWith("\n") ? "" : "\n";
      const novoConteudo = `${gitignoreConteudo}${quebra}\n# Harness local dos agentes (fonte oficial: governanca/)\n.agents/\n`;
      fs.writeFileSync(gitignorePath, novoConteudo, "utf-8");
    }
  }

  // 6. Gerar script autônomo governanca/scripts/harness.mjs (executável com 'node governanca/scripts/harness.mjs' sem dependências)
  const scriptsDir = path.join(governancaDir, "scripts");
  fs.mkdirSync(scriptsDir, { recursive: true });
  const harnessScriptPath = path.join(scriptsDir, "harness.mjs");
  const harnessScriptConteudo = `#!/usr/bin/env node
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
fs.writeFileSync(path.join(raiz, "AGENTS.md"), "# Governança do Projeto — RR Tech Studio\\n\\nAs diretrizes e regras oficiais deste projeto estão em:\\n👉 [governanca/AGENTS.md](governanca/AGENTS.md)\\n\\nNotas persistentes e sprint ativa em:\\n👉 [governanca/SESSAO.md](governanca/SESSAO.md)\\n", "utf-8");
fs.writeFileSync(path.join(raiz, "CLAUDE.md"), "# Governança do Projeto — RR Tech Studio\\n\\nEste projeto é governado por regras estritas da RR Tech Studio.\\n- **Regras e Padrões Oficiais:** Consulte [governanca/AGENTS.md](governanca/AGENTS.md)\\n- **Sessão Atual e Sprint Ativa:** Consulte [governanca/SESSAO.md](governanca/SESSAO.md)\\n- **Primeira Sessão:** Siga o roteiro em [governanca/INICIO.md](governanca/INICIO.md) (ou VINCULAR.md)\\n- **Workflows:** Procedimentos disponíveis em [governanca/workflows/](governanca/workflows/)\\n", "utf-8");

// 2. Regras .agents
const agentsDir = path.join(raiz, ".agents");
const rulesDir = path.join(agentsDir, "rules");
fs.mkdirSync(rulesDir, { recursive: true });
fs.writeFileSync(path.join(rulesDir, "000-governanca.md"), "# Governança — RR Tech Studio\\n\\nAs diretrizes oficiais deste projeto estão em [governanca/AGENTS.md](governanca/AGENTS.md).\\nConsulte [governanca/SESSAO.md](governanca/SESSAO.md) para a sprint ativa e histórico de sessões.\\n", "utf-8");

// 3. Workflows como slash commands
const wfSrc = path.join(govDir, "workflows");
const wfDest = path.join(agentsDir, "workflows");
fs.mkdirSync(wfDest, { recursive: true });
const activeWf = new Set();
if (fs.existsSync(wfSrc)) {
  for (const f of fs.readdirSync(wfSrc)) {
    if (f.endsWith(".md")) {
      activeWf.add(f);
      fs.copyFileSync(path.join(wfSrc, f), path.join(wfDest, f));
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
      const fmMatch = content.match(/^---\\r?\\n([\\s\\S]*?)\\r?\\n---/);
      if (fmMatch) {
        const nMatch = fmMatch[1].match(/name:\\s*(.+)/);
        const dMatch = fmMatch[1].match(/description:\\s*(.+)/);
        if (nMatch) skillName = nMatch[1].trim();
        if (dMatch) desc = dMatch[1].trim();
      }
      fs.writeFileSync(path.join(folder, "SKILL.md"), "---\\nname: " + skillName + "\\ndescription: " + desc + "\\n---\\n\\n# Skill: " + skillName + "\\n\\n> Ponteiro do Harness para governança oficial.\\n\\n## Instruções de Execução\\n\\nConsulte e execute as instruções atualizadas em:\\n👉 [governanca/skills/" + f + "](../../governanca/skills/" + f + ")\\n", "utf-8");
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
`;
  fs.writeFileSync(harnessScriptPath, harnessScriptConteudo, "utf-8");

  return {
    sucesso: true,
    mensagem: `Harness configurado com sucesso em ${caminhoAbs} (${activeWorkflows.size} workflows, ${activeSkills.size} skills).`,
  };
}

