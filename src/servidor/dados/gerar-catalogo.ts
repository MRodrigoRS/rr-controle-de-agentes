import { obterTodasTecnologias, type TecnologiaRegistro } from "../db";
import tecnologiasFallback from "./tecnologias.json";

type Agrupado = Record<string, TecnologiaRegistro[]>;

function carregarTecnologias(): TecnologiaRegistro[] {
  try {
    const tecs = obterTodasTecnologias();
    if (tecs && tecs.length > 0) return tecs;
  } catch {
    // fallback caso ocorra em ambiente isolado sem acesso ao banco
  }
  return tecnologiasFallback as TecnologiaRegistro[];
}

export function gerarCatalogoMarkdown(): string {
  const data = carregarTecnologias();

  const agrupado: Agrupado = {};
  for (const t of data) {
    if (!agrupado[t.categoria]) agrupado[t.categoria] = [];
    agrupado[t.categoria].push(t);
  }

  const categorias = Object.keys(agrupado).sort();

  let md = "# Catálogo de Tecnologias\n\n";
  md += `> Catálogo oficial gerado a partir do RR Controle de Agentes.\n`;
  md += `> Total: ${data.length} tecnologias em ${categorias.length} categorias.\n\n`;

  for (const cat of categorias) {
    const items = agrupado[cat].sort((a, b) => a.nome.localeCompare(b.nome));
    md += `## ${cat}\n\n`;
    md += `| ID | Tecnologia | Aplicabilidade |\n`;
    md += `|:--:|------------|----------------|\n`;
    for (const t of items) {
      const idStr = t.id !== undefined ? String(t.id) : "-";
      md += `| ${idStr} | **${t.nome}** | ${t.aplicabilidade} |\n`;
    }
    md += "\n";
  }

  md += "---\n\n";
  md += "### Como cadastrar uma nova tecnologia no catálogo\n\n";
  md += "Execute o comando atômico no terminal da progenitora:\n\n";
  md += "```bash\n";
  md += 'npm run rr:tecnologia -- --nome "Nome" --categoria "Categoria" --aplicabilidade "..." --descricao "..."\n';
  md += "```\n\n";
  md += "O banco SQLite atribuirá um ID numérico auto-incremental imediatamente e sincronizará o catálogo.\n\n";
  md += "*Template gerado por RR Tech Studio (Rodrigo Rafael).*\n";

  return md;
}

export function extrairCategorias(): string[] {
  const data = carregarTecnologias();
  return [...new Set(data.map((t) => t.categoria))].sort();
}
