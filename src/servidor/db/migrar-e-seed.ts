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

interface TecnologiaLegada {
  nome: string;
  categoria: string;
  aplicabilidade: string;
  descricao: string;
}

export function executarMigracao(): void {
  console.log("\n🚀 Iniciando migração para o SQLite (dados/rr.db)...");

  const db = obterDb();

  // 1. Migração de Tecnologias
  const caminhoTecnologiasJson = path.resolve(process.cwd(), "src/servidor/dados/tecnologias.json");
  if (fs.existsSync(caminhoTecnologiasJson)) {
    const raw = fs.readFileSync(caminhoTecnologiasJson, "utf-8");
    const legadas: TecnologiaLegada[] = JSON.parse(raw);

    const stmtCheck = db.prepare("SELECT id FROM tecnologias WHERE LOWER(nome) = LOWER(?)");
    const stmtInsert = db.prepare(`
      INSERT INTO tecnologias (nome, categoria, aplicabilidade, descricao)
      VALUES (?, ?, ?, ?)
    `);

    let inseridas = 0;
    for (const t of legadas) {
      const existe = stmtCheck.get(t.nome.trim());
      if (!existe) {
        stmtInsert.run(
          t.nome.trim(),
          t.categoria.trim(),
          t.aplicabilidade.trim(),
          t.descricao.trim()
        );
        inseridas++;
      }
    }
    console.log(`✅ Tecnologias migradas: ${inseridas} novas inseridas (total no banco: ${obterTodasTecnologias().length})`);
  } else {
    console.warn("⚠️ Arquivo tecnologias.json não encontrado para seed.");
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
