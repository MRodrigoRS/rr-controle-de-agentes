import fs from "fs";
import path from "path";
// @ts-expect-error node:sqlite is native in Node 22+ but types may not be in @types/node 20
import { DatabaseSync } from "node:sqlite";

export interface TecnologiaRegistro {
  id: number;
  nome: string;
  categoria: string;
  aplicabilidade: string;
  descricao: string;
  criado_em?: string;
}

export interface ProjetoRegistro {
  id: string;
  nome: string;
  descricao: string;
  presetFrontend: string;
  presetBackend: string;
  caminho: string;
  criadoEm: string;
  vinculado?: boolean;
  modoMigracao?: boolean;
}

const dbDir = path.resolve(process.cwd(), "dados");
const dbPath = path.join(dbDir, "rr.db");
const snapshotPath = path.join(dbDir, "tecnologias-snapshot.json");
const legacyJsonPath = path.resolve(process.cwd(), "src/servidor/dados/tecnologias.json");

let dbInstance: DatabaseSync | null = null;

export function obterDb(): DatabaseSync {
  if (dbInstance) return dbInstance;

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbInstance = new DatabaseSync(dbPath);
  dbInstance.exec("PRAGMA journal_mode = WAL;");

  dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS tecnologias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL UNIQUE,
      categoria TEXT NOT NULL,
      aplicabilidade TEXT NOT NULL,
      descricao TEXT NOT NULL,
      criado_em TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projetos (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      descricao TEXT,
      preset_frontend TEXT NOT NULL,
      preset_backend TEXT NOT NULL,
      caminho TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      vinculado INTEGER DEFAULT 0,
      modo_migracao INTEGER DEFAULT 0
    );
  `);

  try {
    dbInstance.exec("ALTER TABLE projetos ADD COLUMN modo_migracao INTEGER DEFAULT 0;");
  } catch {
    // Coluna já existe no banco
  }

  try {
    const row = dbInstance.prepare("SELECT COUNT(*) as total FROM tecnologias").get() as { total: number } | undefined;
    if (!row || Number(row.total) === 0) {
      const caminhoSnapshot = path.resolve(process.cwd(), "dados/tecnologias-snapshot.json");
      const caminhoTecnologiasJson = path.resolve(process.cwd(), "src/servidor/dados/tecnologias.json");
      const caminhoFonte = fs.existsSync(caminhoSnapshot)
        ? caminhoSnapshot
        : fs.existsSync(caminhoTecnologiasJson)
        ? caminhoTecnologiasJson
        : null;

      if (caminhoFonte) {
        const raw = fs.readFileSync(caminhoFonte, "utf-8");
        const tecs: Array<{ id?: number; nome: string; categoria: string; aplicabilidade: string; descricao: string; criado_em?: string }> = JSON.parse(raw);
        const stmtInsertComId = dbInstance.prepare(`
          INSERT INTO tecnologias (id, nome, categoria, aplicabilidade, descricao, criado_em)
          VALUES (?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
        `);
        const stmtInsertSemId = dbInstance.prepare(`
          INSERT INTO tecnologias (nome, categoria, aplicabilidade, descricao)
          VALUES (?, ?, ?, ?)
        `);

        for (const t of tecs) {
          if (t.id !== undefined && t.id > 0) {
            stmtInsertComId.run(
              t.id,
              t.nome.trim(),
              t.categoria.trim(),
              t.aplicabilidade.trim(),
              t.descricao.trim(),
              t.criado_em || null
            );
          } else {
            stmtInsertSemId.run(
              t.nome.trim(),
              t.categoria.trim(),
              t.aplicabilidade.trim(),
              t.descricao.trim()
            );
          }
        }
      }
    }
  } catch {
    // ignore
  }

  return dbInstance;
}

// ─── TECNOLOGIAS ───

export function obterTodasTecnologias(): TecnologiaRegistro[] {
  const db = obterDb();
  const rows = db.prepare(`
    SELECT id, nome, categoria, aplicabilidade, descricao, criado_em
    FROM tecnologias
    ORDER BY categoria ASC, nome ASC
  `).all();
  return rows as unknown as TecnologiaRegistro[];
}

export function obterTecnologiaPorId(id: number): TecnologiaRegistro | undefined {
  const db = obterDb();
  const row = db.prepare(`
    SELECT id, nome, categoria, aplicabilidade, descricao, criado_em
    FROM tecnologias
    WHERE id = ?
  `).get(id);
  return row as unknown as TecnologiaRegistro | undefined;
}

export function obterTecnologiasPorIds(ids: number[]): TecnologiaRegistro[] {
  if (!ids || ids.length === 0) return [];
  const db = obterDb();
  const placeholders = ids.map(() => "?").join(",");
  const rows = db.prepare(`
    SELECT id, nome, categoria, aplicabilidade, descricao, criado_em
    FROM tecnologias
    WHERE id IN (${placeholders})
    ORDER BY categoria ASC, nome ASC
  `).all(...ids);
  return rows as unknown as TecnologiaRegistro[];
}

export function obterTecnologiaPorNome(nome: string): TecnologiaRegistro | undefined {
  const db = obterDb();
  const row = db.prepare(`
    SELECT id, nome, categoria, aplicabilidade, descricao, criado_em
    FROM tecnologias
    WHERE LOWER(nome) = LOWER(?)
  `).get(nome.trim());
  return row as unknown as TecnologiaRegistro | undefined;
}

export function inserirTecnologia(dados: {
  nome: string;
  categoria: string;
  aplicabilidade: string;
  descricao: string;
}): TecnologiaRegistro {
  const db = obterDb();

  const stmt = db.prepare(`
    INSERT INTO tecnologias (nome, categoria, aplicabilidade, descricao)
    VALUES (?, ?, ?, ?)
  `);

  const resultado = stmt.run(
    dados.nome.trim(),
    dados.categoria.trim(),
    dados.aplicabilidade.trim(),
    dados.descricao.trim()
  );

  const novoId = Number(resultado.lastInsertRowid);
  exportarSnapshotTecnologias();

  return {
    id: novoId,
    nome: dados.nome.trim(),
    categoria: dados.categoria.trim(),
    aplicabilidade: dados.aplicabilidade.trim(),
    descricao: dados.descricao.trim(),
  };
}

export function exportarSnapshotTecnologias(): void {
  const todas = obterTodasTecnologias();
  const jsonContent = JSON.stringify(todas, null, 2);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  fs.writeFileSync(snapshotPath, jsonContent, "utf-8");

  // Mantém também o src/servidor/dados/tecnologias.json atualizado para imports estáticos
  const legacyDir = path.dirname(legacyJsonPath);
  if (fs.existsSync(legacyDir)) {
    fs.writeFileSync(legacyJsonPath, jsonContent, "utf-8");
  }
}

// ─── PROJETOS ───

export function obterTodosProjetos(): ProjetoRegistro[] {
  const db = obterDb();
  const rows = db.prepare(`
    SELECT id, nome, descricao, preset_frontend, preset_backend, caminho, criado_em, vinculado, modo_migracao
    FROM projetos
    ORDER BY criado_em DESC
  `).all();

  return (rows as Array<{
    id: string;
    nome: string;
    descricao: string;
    preset_frontend: string;
    preset_backend: string;
    caminho: string;
    criado_em: string;
    vinculado: number;
    modo_migracao: number;
  }>).map((r) => ({
    id: r.id,
    nome: r.nome,
    descricao: r.descricao || "",
    presetFrontend: r.preset_frontend,
    presetBackend: r.preset_backend,
    caminho: r.caminho,
    criadoEm: r.criado_em,
    vinculado: r.vinculado === 1,
    modoMigracao: r.modo_migracao === 1,
  }));
}

export function obterProjetoPorId(id: string): ProjetoRegistro | undefined {
  const db = obterDb();
  const row = db.prepare(`
    SELECT id, nome, descricao, preset_frontend, preset_backend, caminho, criado_em, vinculado, modo_migracao
    FROM projetos
    WHERE id = ?
  `).get(id) as {
    id: string;
    nome: string;
    descricao: string;
    preset_frontend: string;
    preset_backend: string;
    caminho: string;
    criado_em: string;
    vinculado: number;
    modo_migracao: number;
  } | undefined;

  if (!row) return undefined;

  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao || "",
    presetFrontend: row.preset_frontend,
    presetBackend: row.preset_backend,
    caminho: row.caminho,
    criadoEm: row.criado_em,
    vinculado: row.vinculado === 1,
    modoMigracao: row.modo_migracao === 1,
  };
}

export function obterProjetoPorCaminho(caminho: string): ProjetoRegistro | undefined {
  const db = obterDb();
  const caminhoNormalizado = path.resolve(caminho);
  const rows = db.prepare(`
    SELECT id, nome, descricao, preset_frontend, preset_backend, caminho, criado_em, vinculado, modo_migracao
    FROM projetos
  `).all() as Array<{
    id: string;
    nome: string;
    descricao: string;
    preset_frontend: string;
    preset_backend: string;
    caminho: string;
    criado_em: string;
    vinculado: number;
    modo_migracao: number;
  }>;

  const row = rows.find((r) => path.resolve(r.caminho).toLowerCase() === caminhoNormalizado.toLowerCase());
  if (!row) return undefined;

  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao || "",
    presetFrontend: row.preset_frontend,
    presetBackend: row.preset_backend,
    caminho: row.caminho,
    criadoEm: row.criado_em,
    vinculado: row.vinculado === 1,
    modoMigracao: row.modo_migracao === 1,
  };
}

export function inserirProjeto(projeto: ProjetoRegistro): void {
  const db = obterDb();
  db.prepare(`
    INSERT OR REPLACE INTO projetos (id, nome, descricao, preset_frontend, preset_backend, caminho, criado_em, vinculado, modo_migracao)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    projeto.id,
    projeto.nome,
    projeto.descricao || "",
    projeto.presetFrontend,
    projeto.presetBackend,
    projeto.caminho,
    projeto.criadoEm,
    projeto.vinculado ? 1 : 0,
    projeto.modoMigracao ? 1 : 0
  );
}

export function atualizarProjetoDb(id: string, campos: Partial<ProjetoRegistro>): ProjetoRegistro | null {
  const existente = obterProjetoPorId(id);
  if (!existente) return null;

  const atualizado: ProjetoRegistro = {
    ...existente,
    ...campos,
  };

  inserirProjeto(atualizado);
  return atualizado;
}

export function excluirProjetoDb(id: string): boolean {
  const db = obterDb();
  const resultado = db.prepare("DELETE FROM projetos WHERE id = ?").run(id);
  return Number(resultado.changes) > 0;
}
