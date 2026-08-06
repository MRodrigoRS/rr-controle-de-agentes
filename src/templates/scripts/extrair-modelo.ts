#!/usr/bin/env node
// MODELO VIRGEM — NÃO EDITE ESTE ARQUIVO.
//
// Este arquivo regenera junto com a governança (governanca/templates/).
// Para usar no projeto:
//   1. Copie para governanca/scripts/extrair-modelo.ts
//   2. Preencha DOMINIO_MANUAL e DOMINIO_PREFIXO com as tabelas reais
//      deste repositório (o script avisa as tabelas que ficarem em "Outros")
//   3. Crie o wrapper governanca/scripts/extrair-modelo.ps1
// Veja a skill governanca/skills/criar-extrair-modelo.md.
//
// Pré-requisitos:
//   - npm i -D pg tsx
//   - DATABASE_URL em .env.local (ou variável de ambiente)
// Uso: npx tsx governanca/scripts/extrair-modelo.ts

import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import { mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from "fs";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

// 1. Carregamento seguro das variáveis de ambiente com fallback nativo sem depender estritamente de dotenv
function carregarEnvLocal() {
  if (process.env.DATABASE_URL) return;

  const envPath = resolve(__dirname, "../../.env.local");
  if (existsSync(envPath)) {
    const conteudo = readFileSync(envPath, "utf-8");
    for (const linha of conteudo.split("\n")) {
      const trimLine = linha.trim();
      if (!trimLine || trimLine.startsWith("#")) continue;
      const indexEq = trimLine.indexOf("=");
      if (indexEq > 0) {
        const chave = trimLine.substring(0, indexEq).trim();
        const valor = trimLine.substring(indexEq + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[chave]) {
          process.env[chave] = valor;
        }
      }
    }
  }
}

carregarEnvLocal();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ ERRO: DATABASE_URL não encontrada em .env.local nem nas variáveis de ambiente.");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: DATABASE_URL });

const OUT_DIR = resolve(__dirname, "../../modelo-de-dados");
const TABELAS_DIR = join(OUT_DIR, "tabelas");

interface TabelaInfo {
  nome: string;
  comentario: string | null;
  rlsHabilitado: boolean;
  colunas: ColunaInfo[];
  primaryKey: string[];
  foreignKeys: FKInfo[];
  uniqueConstraints: string[];
  checkConstraints: CheckInfo[];
  triggers: TriggerInfo[];
  policies: PolicyInfo[];
  indices: IndiceInfo[];
}

interface ColunaInfo {
  nome: string;
  tipo: string;
  nullable: boolean;
  padrao: string | null;
  comentario: string | null;
}

interface FKInfo {
  coluna: string;
  tabelaRef: string;
  colunaRef: string;
  onDelete: string;
}

interface CheckInfo {
  nome: string;
  expressao: string;
}

interface TriggerInfo {
  nome: string;
  tipo: string;
  eventos: string;
  funcao: string;
}

interface PolicyInfo {
  nome: string;
  comando: string;
  permissive: string;
  expression: string | null;
  withCheck: string | null;
}

interface IndiceInfo {
  nome: string;
  definicao: string;
}

interface FuncaoInfo {
  nome: string;
  tipoRetorno: string;
  linguagem: string;
}

interface ViewInfo {
  nome: string;
  definicao: string;
}

interface EnumInfo {
  nome: string;
  valores: string[];
}

interface DominioStats {
  tabelas: TabelaInfo[];
  fksRecebidas: { dominioOrigem: string; count: number }[];
  fksEmitidas: { dominioDestino: string; count: number }[];
}

// --- Inferência de domínio ---

// Preencha com os nomes EXATOS das tabelas deste repositório → domínio.
// Tem prioridade sobre o mapa de prefixos. Exemplo:
//   perfis: "Autenticação",
//   pedidos: "Vendas",
// Deixe vazio se preferir usar apenas prefixos.
const DOMINIO_MANUAL: Record<string, string> = {};

// Preencha com prefixos de tabela → domínio. Primeiro match vence. Exemplo:
//   ["pedido", "Vendas"],
//   ["cliente", "CRM"],
// Se o projeto não usa domínios, deixe vazio — tudo cai em "Outros".
const DOMINIO_PREFIXO: [string, string][] = [];

function inferirDominio(nomeTabela: string): string {
  if (DOMINIO_MANUAL[nomeTabela]) return DOMINIO_MANUAL[nomeTabela];
  for (const [prefixo, dominio] of DOMINIO_PREFIXO) {
    if (nomeTabela.startsWith(prefixo)) return dominio;
  }
  return "Outros";
}

function dominioArquivo(dominio: string): string {
  return dominio
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// --- Tipos ---

function tipoAbreviado(tipoRaw: string): string {
  const match = tipoRaw.match(/^([a-z ]+?)(?:\((\d+)\))?$/i);
  const base = match?.[1] ?? tipoRaw;
  const len = match?.[2];
  const mapa: Record<string, string> = {
    uuid: "uuid",
    "character varying": "varchar",
    character: "char",
    text: "text",
    boolean: "bool",
    "timestamp with time zone": "timestamptz",
    "timestamp without time zone": "timestamp",
    date: "date",
    integer: "int",
    bigint: "bigint",
    numeric: "numeric",
    jsonb: "jsonb",
    json: "json",
    "double precision": "float8",
    real: "float4",
    smallint: "smallint",
    "time without time zone": "time",
    "time with time zone": "timetz",
  };
  const abrev = mapa[base] ?? base;
  return len ? `${abrev}(${len})` : abrev;
}

// --- Consultas ---

async function consultar<T>(query: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(query, params);
  return result.rows as T[];
}

async function extrairTabelas(): Promise<TabelaInfo[]> {
  const tablesResult = await consultar<{
    nome: string;
    comentario: string | null;
    rls_habilitado: boolean;
  }>(`
    SELECT
      t.table_name AS nome,
      pg_catalog.obj_description(c.oid, 'pg_class') AS comentario,
      c.relrowsecurity AS rls_habilitado
    FROM information_schema.tables t
    JOIN pg_catalog.pg_class c ON c.relname = t.table_name
      AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
    ORDER BY t.table_name
  `);

  const tabelas: TabelaInfo[] = [];

  for (const t of tablesResult) {
    const colunas = await consultar<ColunaInfo>(
      `
      SELECT
        c.column_name AS nome,
        c.data_type AS tipo,
        c.is_nullable = 'YES' AS nullable,
        c.column_default AS padrao,
        pg_catalog.col_description(
          (SELECT oid FROM pg_catalog.pg_class
           WHERE relname = $1
             AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')),
          c.ordinal_position::int
        ) AS comentario
      FROM information_schema.columns c
      WHERE c.table_schema = 'public' AND c.table_name = $1
      ORDER BY c.ordinal_position
    `,
      [t.nome],
    );

    const pkResult = await consultar<{ coluna: string }>(
      `
      SELECT kcu.column_name AS coluna
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = $1
        AND tc.constraint_type = 'PRIMARY KEY'
      ORDER BY kcu.ordinal_position
    `,
      [t.nome],
    );

    const fkResult = await consultar<FKInfo>(
      `
      SELECT
        kcu.column_name AS coluna,
        ccu.table_name AS "tabelaRef",
        ccu.column_name AS "colunaRef",
        rc.delete_rule AS "onDelete"
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      JOIN information_schema.referential_constraints rc
        ON rc.constraint_name = tc.constraint_name
      WHERE tc.table_schema = 'public'
        AND tc.table_name = $1
        AND tc.constraint_type = 'FOREIGN KEY'
    `,
      [t.nome],
    );

    const uniqueResult = await consultar<{ colunas: string }>(
      `
      SELECT STRING_AGG(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) AS colunas
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = $1
        AND tc.constraint_type = 'UNIQUE'
      GROUP BY tc.constraint_name
    `,
      [t.nome],
    );

    const checkResult = await consultar<CheckInfo>(
      `
      SELECT
        con.conname AS nome,
        pg_get_constraintdef(con.oid) AS expressao
      FROM pg_constraint con
      JOIN pg_class c ON c.oid = con.conrelid
      WHERE c.relname = $1
        AND con.contype = 'c'
    `,
      [t.nome],
    );

    const triggers = await consultar<TriggerInfo>(
      `
      SELECT
        tg.tgname AS nome,
        CASE WHEN tg.tgtype & 2 = 2 THEN 'BEFORE' ELSE 'AFTER' END AS tipo,
        STRING_AGG(DISTINCT CASE
          WHEN tg.tgtype & 4 = 4 THEN 'INSERT'
          WHEN tg.tgtype & 8 = 8 THEN 'DELETE'
          WHEN tg.tgtype & 16 = 16 THEN 'UPDATE'
          WHEN tg.tgtype & 64 = 64 THEN 'TRUNCATE'
        END, ', ') AS eventos,
        p.proname AS funcao
      FROM pg_trigger tg
      JOIN pg_class c ON c.oid = tg.tgrelid
      JOIN pg_proc p ON p.oid = tg.tgfoid
      WHERE c.relname = $1 AND tg.tgisinternal = false
      GROUP BY tg.tgname, tg.tgtype, p.proname
    `,
      [t.nome],
    );

    const policies = await consultar<PolicyInfo>(
      `
      SELECT
        polname AS nome,
        CASE polcmd::text
          WHEN 'r' THEN 'SELECT'
          WHEN 'a' THEN 'INSERT'
          WHEN 'w' THEN 'UPDATE'
          WHEN 'd' THEN 'DELETE'
          WHEN '*' THEN 'ALL'
          ELSE polcmd::text
        END AS comando,
        CASE WHEN polpermissive THEN 'PERMISSIVE' ELSE 'RESTRICTIVE' END AS permissive,
        pg_get_expr(polqual, polrelid) AS expression,
        pg_get_expr(polwithcheck, polrelid) AS "withCheck"
      FROM pg_policy pol
      JOIN pg_class c ON c.oid = pol.polrelid
      WHERE c.relname = $1
    `,
      [t.nome],
    );

    const indices = await consultar<IndiceInfo>(
      `
      SELECT
        indexname AS nome,
        indexdef AS definicao
      FROM pg_indexes
      WHERE schemaname = 'public' AND tablename = $1
        AND indexname NOT LIKE '%_pkey'
      ORDER BY indexname
    `,
      [t.nome],
    );

    tabelas.push({
      nome: t.nome,
      comentario: t.comentario,
      rlsHabilitado: t.rls_habilitado,
      colunas,
      primaryKey: pkResult.map((r) => r.coluna),
      foreignKeys: fkResult,
      uniqueConstraints: uniqueResult.map((r) => r.colunas),
      checkConstraints: checkResult,
      triggers,
      policies,
      indices,
    });
  }

  return tabelas;
}

async function extrairViews(): Promise<ViewInfo[]> {
  return consultar<ViewInfo>(`
    SELECT
      t.table_name AS nome,
      pg_get_viewdef(c.oid) AS definicao
    FROM information_schema.tables t
    JOIN pg_catalog.pg_class c ON c.relname = t.table_name
      AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    WHERE t.table_schema = 'public'
      AND t.table_type = 'VIEW'
    ORDER BY t.table_name
  `);
}

async function extrairEnums(): Promise<EnumInfo[]> {
  const rows = await consultar<{ nome: string; valor: string }>(`
    SELECT
      t.typname AS nome,
      e.enumlabel AS valor
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    ORDER BY t.typname, e.enumsortorder
  `);

  const mapa = new Map<string, string[]>();
  for (const r of rows) {
    if (!mapa.has(r.nome)) mapa.set(r.nome, []);
    mapa.get(r.nome)!.push(r.valor);
  }

  return [...mapa.entries()].map(([nome, valores]) => ({ nome, valores }));
}

async function extrairFuncoes(): Promise<FuncaoInfo[]> {
  return consultar<FuncaoInfo>(`
    SELECT
      p.proname AS nome,
      COALESCE(t.typname, 'void') AS "tipoRetorno",
      l.lanname AS linguagem
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    JOIN pg_type t ON t.oid = p.prorettype
    JOIN pg_language l ON l.oid = p.prolang
    WHERE n.nspname = 'public'
      AND p.proname NOT LIKE '%updated_at'
      AND p.proname NOT LIKE 'handle_%'
    ORDER BY p.proname
  `);
}

// --- Geração de Markdown ---

function gerarTabelaMarkdown(t: TabelaInfo): string {
  const linhas: string[] = [];

  linhas.push(`### \`${t.nome}\``);
  linhas.push(`* **RLS (Row Level Security)**: ${t.rlsHabilitado ? '✅ Habilitado' : '⚠️ Desabilitado'}`);
  if (t.comentario) linhas.push(`> ${t.comentario}`);
  linhas.push("");

  linhas.push("**Colunas:**");
  linhas.push("");
  linhas.push("| Coluna | Tipo | Obrigatório | Padrão | Comentário |");
  linhas.push("|--------|------|-------------|--------|------------|");

  for (const c of t.colunas) {
    const pk = t.primaryKey.includes(c.nome) ? "🔑 " : "";
    const fk = t.foreignKeys.some((f) => f.coluna === c.nome);
    const fkSufixo = fk ? " ⛓" : "";
    const nome = pk + c.nome + fkSufixo;
    const tipo = tipoAbreviado(c.tipo);
    const obrigatorio = c.nullable ? "Não" : "Sim";
    const padrao = c.padrao ?? "";
    const comentario = c.comentario ?? "";
    linhas.push(
      `| \`${nome}\` | \`${tipo}\` | ${obrigatorio} | \`${padrao}\` | ${comentario} |`,
    );
  }

  linhas.push("");

  if (t.foreignKeys.length > 0) {
    linhas.push("**Relacionamentos:**");
    linhas.push("");
    for (const fk of t.foreignKeys) {
      const regraDelete =
        fk.onDelete && fk.onDelete !== "NO ACTION"
          ? ` (ON DELETE ${fk.onDelete})`
          : "";
      linhas.push(
        `- \`${fk.coluna}\` → \`${fk.tabelaRef}.${fk.colunaRef}\`${regraDelete}`,
      );
    }
    linhas.push("");
  }

  if (t.uniqueConstraints.length > 0) {
    linhas.push("**Unique:**");
    linhas.push("");
    for (const u of t.uniqueConstraints) {
      linhas.push(`- \`${u}\``);
    }
    linhas.push("");
  }

  if (t.checkConstraints.length > 0) {
    linhas.push("**CHECK Constraints:**");
    linhas.push("");
    for (const c of t.checkConstraints) {
      linhas.push(`- \`${c.nome}\`: ${c.expressao}`);
    }
    linhas.push("");
  }

  if (t.triggers.length > 0) {
    linhas.push("**Triggers:**");
    linhas.push("");
    for (const tr of t.triggers) {
      linhas.push(
        `- \`${tr.nome}\`: ${tr.tipo} ${tr.eventos} → \`${tr.funcao}\``,
      );
    }
    linhas.push("");
  }

  if (t.policies.length > 0) {
    linhas.push("**RLS Policies:**");
    linhas.push("");
    for (const p of t.policies) {
      linhas.push(`- \`${p.nome}\`: ${p.comando} (${p.permissive})`);
    }
    linhas.push("");
  }

  if (t.indices.length > 0) {
    linhas.push("**Índices:**");
    linhas.push("");
    for (const i of t.indices) {
      linhas.push(`- \`${i.nome}\``);
    }
    linhas.push("");
  }

  return linhas.join("\n");
}

function gerarGeracaoMarkdown(tabelas: TabelaInfo[]) {
  const dominios = [
    ...new Set(tabelas.map((t) => inferirDominio(t.nome))),
  ].sort();

  const dominioParaTabelas = new Map<string, TabelaInfo[]>();
  for (const d of dominios) {
    dominioParaTabelas.set(
      d,
      tabelas.filter((t) => inferirDominio(t.nome) === d),
    );
  }

  const stats = new Map<string, DominioStats>();
  for (const d of dominios) {
    stats.set(d, {
      tabelas: dominioParaTabelas.get(d)!,
      fksRecebidas: [],
      fksEmitidas: [],
    });
  }

  for (const tab of tabelas) {
    const dominioOrigem = inferirDominio(tab.nome);
    for (const fk of tab.foreignKeys) {
      const dominioDestino = inferirDominio(fk.tabelaRef);
      if (dominioOrigem !== dominioDestino) {
        const origemStats = stats.get(dominioOrigem)!;
        const existingEmit = origemStats.fksEmitidas.find(
          (e) => e.dominioDestino === dominioDestino,
        );
        if (existingEmit) existingEmit.count++;
        else origemStats.fksEmitidas.push({ dominioDestino, count: 1 });

        const destinoStats = stats.get(dominioDestino)!;
        const existingReceb = destinoStats.fksRecebidas.find(
          (r) => r.dominioOrigem === dominioOrigem,
        );
        if (existingReceb) existingReceb.count++;
        else destinoStats.fksRecebidas.push({ dominioOrigem, count: 1 });
      }
    }
  }

  return { dominios, dominioParaTabelas, stats };
}

function gerarDiagramaMermaid(
  stats: Map<string, DominioStats>,
  dominios: string[],
): string {
  const linhas: string[] = [];
  linhas.push("```mermaid");
  linhas.push("erDiagram");

  const edges = new Set<string>();

  for (const dom of dominios) {
    const s = stats.get(dom)!;
    for (const emit of s.fksEmitidas) {
      const key = `${dom}→${emit.dominioDestino}`;
      if (!edges.has(key)) {
        edges.add(key);
        linhas.push(
          `    ${dominioLabel(dom)} ||--o{ ${dominioLabel(emit.dominioDestino)} : "${emit.count} FK(s)"`,
        );
      }
    }
  }

  linhas.push("```");
  return linhas.join("\n");
}

function dominioLabel(d: string): string {
  return d.replace(/[^a-zA-Z0-9]/g, "_").toUpperCase();
}

function gerarIndexMarkdown(
  tabelas: TabelaInfo[],
  funcoes: FuncaoInfo[],
  views: ViewInfo[],
  enums: EnumInfo[],
  stats: Map<string, DominioStats>,
  dominios: string[],
): string {
  const linhas: string[] = [];
  linhas.push("# Modelo de Dados — {{nomeProjeto}}");
  linhas.push("");
  linhas.push(
    "> Gerado automaticamente por `governanca/scripts/extrair-modelo.ts` a partir do estado real do banco. Não edite manualmente.",
  );
  linhas.push(`> Gerado em: ${new Date().toISOString()}`);
  linhas.push("");

  linhas.push("## Sumário");
  linhas.push("");

  let totalTabelas = 0;
  for (const d of dominios) {
    const qtd = stats.get(d)!.tabelas.length;
    totalTabelas += qtd;
    linhas.push(
      `- [${d}](tabelas/${dominioArquivo(d)}.md) — ${qtd} tabela(s)`,
    );
  }
  linhas.push("");
  linhas.push(`- [Views](views.md) — ${views.length} view(s)`);
  linhas.push(`- [Enums](enums.md) — ${enums.length} enum(s)`);
  linhas.push(
    `- [Funções do Banco](funcoes.md) — ${funcoes.length} função(ões)`,
  );
  linhas.push("");
  linhas.push(
    `**Total:** ${totalTabelas} tabelas, ${views.length} views, ${enums.length} enums, ${funcoes.length} funções`,
  );
  linhas.push("");

  linhas.push("## Dependências entre Domínios (FKs)");
  linhas.push("");

  for (const d of dominios) {
    const s = stats.get(d)!;
    if (s.fksEmitidas.length > 0 || s.fksRecebidas.length > 0) {
      linhas.push(`### ${d}`);
      linhas.push("");
      if (s.fksEmitidas.length > 0) {
        linhas.push("**Referencia:**");
        for (const e of s.fksEmitidas) {
          linhas.push(`- ${e.dominioDestino} (${e.count} FK)`);
        }
        linhas.push("");
      }
      if (s.fksRecebidas.length > 0) {
        linhas.push("**Referenciado por:**");
        for (const r of s.fksRecebidas) {
          linhas.push(`- ${r.dominioOrigem} (${r.count} FK)`);
        }
        linhas.push("");
      }
    }
  }

  linhas.push("## Diagrama Entidade-Relacionamento (Domínios)");
  linhas.push("");
  linhas.push(gerarDiagramaMermaid(stats, dominios));
  linhas.push("");

  return linhas.join("\n");
}

function escreverArquivos(
  tabelas: TabelaInfo[],
  funcoes: FuncaoInfo[],
  views: ViewInfo[],
  enums: EnumInfo[],
) {
  if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true });
  mkdirSync(TABELAS_DIR, { recursive: true });

  const { dominios, dominioParaTabelas, stats } =
    gerarGeracaoMarkdown(tabelas);

  for (const d of dominios) {
    const tabelasDominio = dominioParaTabelas.get(d)!;
    const linhas: string[] = [];

    linhas.push(`# ${d}`);
    linhas.push("");
    linhas.push(`> ${tabelasDominio.length} tabela(s)`);
    linhas.push("");

    for (const t of tabelasDominio) {
      linhas.push(gerarTabelaMarkdown(t));
      linhas.push("");
      linhas.push("---");
      linhas.push("");
    }

    const nomeArquivo = dominioArquivo(d) + ".md";
    writeFileSync(join(TABELAS_DIR, nomeArquivo), linhas.join("\n"), "utf-8");
    console.log(`  📄 tabelas/${nomeArquivo}`);
  }

  const funcoesLinhas: string[] = [];
  funcoesLinhas.push("# Funções do Banco");
  funcoesLinhas.push("");
  funcoesLinhas.push(
    "> Funções armazenadas no schema `public`. Exclui gatilhos `updated_at` e `handle_*`.",
  );
  funcoesLinhas.push("");
  funcoesLinhas.push("| Nome | Retorno | Linguagem |");
  funcoesLinhas.push("|------|---------|-----------|");

  for (const f of funcoes) {
    funcoesLinhas.push(`| \`${f.nome}\` | ${f.tipoRetorno} | ${f.linguagem} |`);
  }

  writeFileSync(join(OUT_DIR, "funcoes.md"), funcoesLinhas.join("\n"), "utf-8");
  console.log("  📄 funcoes.md");

  const viewsLinhas: string[] = [];
  viewsLinhas.push("# Views");
  viewsLinhas.push("");
  viewsLinhas.push(
    "> Views no schema `public`. Extraídas do estado real do banco.",
  );
  viewsLinhas.push("");

  if (views.length === 0) {
    viewsLinhas.push("Nenhuma view encontrada.");
  } else {
    for (const v of views) {
      viewsLinhas.push(`### \`${v.nome}\``);
      viewsLinhas.push("");
      viewsLinhas.push("```sql");
      viewsLinhas.push(v.definicao);
      viewsLinhas.push("```");
      viewsLinhas.push("");
      viewsLinhas.push("---");
      viewsLinhas.push("");
    }
  }

  writeFileSync(join(OUT_DIR, "views.md"), viewsLinhas.join("\n"), "utf-8");
  console.log("  📄 views.md");

  const enumsLinhas: string[] = [];
  enumsLinhas.push("# Enums");
  enumsLinhas.push("");
  enumsLinhas.push(
    "> Tipos enumerados definidos no banco. Extraídos do estado real.",
  );
  enumsLinhas.push("");

  if (enums.length === 0) {
    enumsLinhas.push("Nenhum enum encontrado.");
  } else {
    for (const e of enums) {
      enumsLinhas.push(`### \`${e.nome}\``);
      enumsLinhas.push("");
      enumsLinhas.push("| Valor |");
      enumsLinhas.push("|-------|");
      for (const v of e.valores) {
        enumsLinhas.push(`| \`${v}\` |`);
      }
      enumsLinhas.push("");
    }
  }

  writeFileSync(join(OUT_DIR, "enums.md"), enumsLinhas.join("\n"), "utf-8");
  console.log("  📄 enums.md");

  const indexConteudo = gerarIndexMarkdown(
    tabelas,
    funcoes,
    views,
    enums,
    stats,
    dominios,
  );
  writeFileSync(join(OUT_DIR, "index.md"), indexConteudo, "utf-8");
  console.log("  📄 index.md");

  const naoClassificadas = tabelas.filter(
    (t) => inferirDominio(t.nome) === "Outros",
  );
  if (naoClassificadas.length > 0) {
    console.log(
      `\n⚠️  ${naoClassificadas.length} tabela(s) não classificadas → domínio "Outros":`,
    );
    for (const t of naoClassificadas) {
      console.log(`   - ${t.nome}`);
    }
    console.log(
      "   Adicione prefixos em DOMINIO_PREFIXO ou nomes exatos em DOMINIO_MANUAL.",
    );
  }
}

// --- Main ---

async function main() {
  console.log("Conectando ao banco...");
  const client = await pool.connect();
  try {
    console.log("Extraindo tabelas...");
    const tabelas = await extrairTabelas();
    console.log(`  ${tabelas.length} tabelas encontradas.`);

    console.log("Extraindo views...");
    const views = await extrairViews();
    console.log(`  ${views.length} views encontradas.`);

    console.log("Extraindo enums...");
    const enums = await extrairEnums();
    console.log(`  ${enums.length} enums encontrados.`);

    console.log("Extraindo funções...");
    const funcoes = await extrairFuncoes();
    console.log(`  ${funcoes.length} funções encontradas.`);

    console.log(`\nGerando modelo em ${OUT_DIR}...`);
    escreverArquivos(tabelas, funcoes, views, enums);

    console.log(`\n✅ Modelo gerado em ${OUT_DIR}/`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
