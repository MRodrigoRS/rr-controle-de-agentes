import tecnologias from "./tecnologias.json";

interface Tecnologia {
  nome: string;
  categoria: string;
  ranking: number;
  aplicabilidade: string;
  descricao: string;
}

type Agrupado = Record<string, Tecnologia[]>;

export function gerarCatalogoMarkdown(): string {
  const data = tecnologias as Tecnologia[];

  const agrupado: Agrupado = {};
  for (const t of data) {
    if (!agrupado[t.categoria]) agrupado[t.categoria] = [];
    agrupado[t.categoria].push(t);
  }

  const categorias = Object.keys(agrupado).sort();

  let md = "# Catálogo de Tecnologias\n\n";
  md += `> Catálogo gerado a partir do RR Controle de Agentes.\n`;
  md += `> Total: ${data.length} tecnologias em ${categorias.length} categorias.\n\n`;

  for (const cat of categorias) {
    const items = agrupado[cat].sort((a, b) => a.ranking - b.ranking);
    md += `## ${cat}\n\n`;
    md += `| # | Tecnologia | Aplicabilidade |\n`;
    md += `|---|------------|----------------|\n`;
    for (const t of items) {
      md += `| ${t.ranking} | **${t.nome}** | ${t.aplicabilidade} |\n`;
    }
    md += "\n";
  }

  md += "---\n\n";
  md += "### Como adicionar uma nova tecnologia\n\n";
  md += "Edite o arquivo `tecnologias.json` na progenitora seguindo o formato:\n\n";
  md += "```json\n";
  md += '{"nome": "Tecnologia", "categoria": "Categoria", "ranking": 1, "aplicabilidade": "...", "descricao": "..."}\n';
  md += "```\n\n";
  md += "Consulte a skill `contribuir-tecnologias.md` para instruções detalhadas.\n";

  return md;
}

export function extrairCategorias(): string[] {
  const data = tecnologias as Tecnologia[];
  return [...new Set(data.map((t) => t.categoria))].sort();
}
