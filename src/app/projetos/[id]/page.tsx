import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { BotaoDeletarProjeto } from "@/componentes/botao-deletar-projeto";
import { BotaoRecriarGovernanca } from "@/componentes/botao-recriar-governanca";
import { BotaoVerStack } from "@/componentes/botao-ver-stack";
import { BotaoCopiarProjeto } from "@/componentes/botao-copiar-projeto";
import { DescricaoColapsavel } from "@/componentes/descricao-colapsavel";
import { CardListaArquivos } from "@/componentes/card-lista-arquivos";
import { GraficoEvolucaoLinhas } from "@/componentes/grafico-evolucao-linhas";
import {
  carregarProjetos,
  obterMetadadosGit,
  obterMetricasCodigo,
  temArquivoStack,
  formatarTokensEstimados,
  estaNaPastaProjetos,
} from "@/servidor/projetos";

export const dynamic = "force-dynamic";

function listarArquivos(dir: string): string[] {
  const fullPath = path.resolve(dir);
  if (!fs.existsSync(fullPath)) return [];
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  const arquivos: string[] = [];
  function walk(d: string, prefix = "") {
    const entries = fs.readdirSync(d, { withFileTypes: true });
    for (const e of entries) {
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      if (e.isDirectory()) walk(path.join(d, e.name), rel);
      else if (e.name.endsWith(".md")) arquivos.push(rel);
    }
  }
  walk(fullPath);
  return arquivos;
}

export default async function DetalheProjeto({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const projeto = carregarProjetos().find((p) => p.id === id) ?? null;
  if (!projeto) notFound();

  const caminhoProjeto = path.resolve(projeto.caminho);
  const caminhoGovernanca = path.join(caminhoProjeto, "governanca");
  const commit = obterMetadadosGit(caminhoProjeto);
  const metricas = commit ? obterMetricasCodigo(caminhoProjeto, commit.hash) : null;
  const temStack = temArquivoStack(caminhoProjeto);
  const estaEmProjetos = estaNaPastaProjetos(caminhoProjeto);
  const padroes = listarArquivos(path.join(caminhoGovernanca, "padroes"));
  const workflows = listarArquivos(path.join(caminhoGovernanca, "workflows"));
  const skills = listarArquivos(path.join(caminhoGovernanca, "skills"));
  const arquitetura = listarArquivos(path.join(caminhoGovernanca, "livro-arquitetura"));
  const sprints = listarArquivos(path.join(caminhoGovernanca, "sprints"));

  return (
    <>
      <a href="/" className="mb-6 inline-block text-sm text-[#58a6ff] hover:text-[#79c0ff] transition">&larr; Voltar</a>

      <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[#e6edf3]">{projeto.nome}</h1>
              {estaEmProjetos ? (
                <span
                  className="rounded-full bg-[#238636]/10 border border-[#238636]/30 px-2.5 py-0.5 text-xs font-medium text-[#3fb950]"
                  title="Projeto localizado na pasta projetos/ da governança"
                >
                  Local (projetos/)
                </span>
              ) : (
                <span
                  className="rounded-full bg-[#f0883e]/10 border border-[#f0883e]/30 px-2.5 py-0.5 text-xs font-medium text-[#f0883e]"
                  title={`Projeto localizado em pasta externa: ${projeto.caminho}`}
                >
                  Externo
                </span>
              )}
            </div>
            {projeto.descricao && <DescricaoColapsavel texto={projeto.descricao} />}
          </div>
          <div className="flex items-center gap-3">
            {metricas && metricas.totalLinhas > 0 && (
              <span
                className="rounded-full border border-[#30363d] bg-[#0d1117] px-3 py-1 text-xs font-mono text-[#58a6ff]"
                title={`${metricas.totalLinhas.toLocaleString("pt-BR")} linhas, ${metricas.totalCaracteres.toLocaleString("pt-BR")} caracteres e ${formatarTokensEstimados(metricas.totalCaracteres)} estimados`}
              >
                {metricas.totalLinhas.toLocaleString("pt-BR")} linhas
              </span>
            )}
            <BotaoCopiarProjeto
              projetoId={projeto.id}
              projetoNome={projeto.nome}
              caminhoAtual={projeto.caminho}
              estaNaPastaProjetos={estaEmProjetos}
            />
            {temStack && (
              <BotaoVerStack projetoId={projeto.id} nomeProjeto={projeto.nome} />
            )}
            <BotaoRecriarGovernanca projetoId={projeto.id} />
            <BotaoDeletarProjeto projetoId={projeto.id} projetoNome={projeto.nome} />
          </div>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-[#8b949e]">
          <p><span className="font-medium text-[#e6edf3]">Caminho:</span> {projeto.caminho}</p>
          {commit ? (
            <p>
              <span className="font-medium text-[#e6edf3]">Último commit:</span>{" "}
              <span className="text-[#3fb950] font-medium">{commit.relativo}</span>{" "}
              <span className="text-[#7d8590]">({new Date(commit.iso).toLocaleString("pt-BR")})</span>{" "}
              <span className="font-mono text-[#58a6ff]">[{commit.hash}]</span>{" "}
              <span className="text-[#e6edf3]">— {commit.mensagem}</span>
            </p>
          ) : (
            <p><span className="font-medium text-[#e6edf3]">Git:</span> Sem commits ou repositório não inicializado</p>
          )}
          {metricas && metricas.totalLinhas > 0 && (
            <p>
              <span className="font-medium text-[#e6edf3]">Volume de Código:</span>{" "}
              <span className="font-medium text-[#58a6ff]">{metricas.totalLinhas.toLocaleString("pt-BR")} linhas</span>{" "}
              <span className="text-[#8b949e]">
                ({metricas.totalCaracteres.toLocaleString("pt-BR")} caracteres •{" "}
                <span
                  className="text-[#a5d6ff] font-medium"
                  title="Estimativa média para código-fonte: ~3,8 caracteres por token"
                >
                  {formatarTokensEstimados(metricas.totalCaracteres)} est.
                </span>
                )
              </span>{" "}
              <span className="text-[#7d8590]">em {metricas.totalArquivos.toLocaleString("pt-BR")} arquivos rastreados</span>
            </p>
          )}
          <p><span className="font-medium text-[#e6edf3]">Criado em:</span> {new Date(projeto.criadoEm).toLocaleString("pt-BR")}</p>
          <p><span className="font-medium text-[#e6edf3]">ID:</span> {projeto.id}</p>
        </div>
      </div>

      <GraficoEvolucaoLinhas projetoId={projeto.id} />

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CardListaArquivos
          titulo="Padrões de Engenharia"
          arquivos={padroes}
          mensagemVazio="Nenhum padrão encontrado."
        />
        <CardListaArquivos
          titulo="Workflows"
          arquivos={workflows}
          mensagemVazio="Nenhum workflow encontrado."
        />
        <CardListaArquivos
          titulo="Skills"
          arquivos={skills}
          mensagemVazio="Nenhuma skill encontrada."
        />
        <CardListaArquivos
          titulo="Arquitetura"
          arquivos={arquitetura}
          mensagemVazio="Nenhum registro de arquitetura."
        />
        <CardListaArquivos
          titulo="Sprints"
          arquivos={sprints}
          mensagemVazio="Nenhuma sprint encontrada."
        />
      </div>

    </>
  );
}

