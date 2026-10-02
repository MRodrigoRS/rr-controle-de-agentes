import fs from "fs";
import path from "path";
import {
  obterDb,
  obterTodasTecnologias,
  obterProjetoPorId,
  inserirProjeto,
  exportarSnapshotTecnologias,
  type ProjetoRegistro,
} from "../db";

interface TecnologiaSeed {
  id?: number;
  nome: string;
  categoria: string;
  aplicabilidade: string;
  descricao: string;
  criado_em?: string;
}

export function executarMigracao(): void {
  console.log("\n🚀 Iniciando migração para o SQLite (dados/rr.db)...");

  const db = obterDb();

  // 1. Migração de Tecnologias (Prioriza dados/tecnologias-snapshot.json, fallback para src/servidor/dados/tecnologias.json)
  const caminhoSnapshot = path.resolve(process.cwd(), "dados/tecnologias-snapshot.json");
  const caminhoTecnologiasJson = path.resolve(process.cwd(), "src/servidor/dados/tecnologias.json");
  const caminhoFonte = fs.existsSync(caminhoSnapshot)
    ? caminhoSnapshot
    : fs.existsSync(caminhoTecnologiasJson)
    ? caminhoTecnologiasJson
    : null;

  if (caminhoFonte) {
    const raw = fs.readFileSync(caminhoFonte, "utf-8");
    const legadas: TecnologiaSeed[] = JSON.parse(raw);

    const stmtCheck = db.prepare("SELECT id FROM tecnologias WHERE LOWER(nome) = LOWER(?) OR (id IS NOT NULL AND id = ?)");
    const stmtInsertComId = db.prepare(`
      INSERT INTO tecnologias (id, nome, categoria, aplicabilidade, descricao, criado_em)
      VALUES (?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
    `);
    const stmtInsertSemId = db.prepare(`
      INSERT INTO tecnologias (nome, categoria, aplicabilidade, descricao)
      VALUES (?, ?, ?, ?)
    `);

    let inseridas = 0;
    for (const t of legadas) {
      const existe = stmtCheck.get(t.nome.trim(), t.id ?? -1);
      if (!existe) {
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
        inseridas++;
      }
    }
    console.log(`✅ Tecnologias migradas: ${inseridas} novas inseridas (total no banco: ${obterTodasTecnologias().length})`);
  } else {
    console.warn("⚠️ Arquivo tecnologias-snapshot.json ou tecnologias.json não encontrado para seed.");
  }

  // 2. Migração de Projetos
  const caminhoProjetosJson = path.resolve(process.cwd(), "dados/projetos.json");
  if (fs.existsSync(caminhoProjetosJson)) {
    const raw = fs.readFileSync(caminhoProjetosJson, "utf-8");
    const projetosLegados: ProjetoRegistro[] = JSON.parse(raw);

    let projetosInseridos = 0;
    for (const p of projetosLegados) {
      const existente = obterProjetoPorId(p.id);
      if (!existente) {
        inserirProjeto(p);
        projetosInseridos++;
      }
    }
    console.log(`✅ Projetos migrados: ${projetosInseridos} novos projetos sincronizados.`);
  }

  // 3. Exportar Snapshot sincronizado com os novos IDs
  exportarSnapshotTecnologias();
  console.log("📸 Snapshot sincronizado exportado para dados/tecnologias-snapshot.json e src/servidor/dados/tecnologias.json.");
  console.log("🎉 Migração concluída com sucesso!\n");
}

if (require.main === module) {
  executarMigracao();
}
