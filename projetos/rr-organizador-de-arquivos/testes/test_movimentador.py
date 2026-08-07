from src.dados.conexao import inicializar_banco
from src.dados.repositorio import RepositorioArquivo, RepositorioSessao
from src.modelos.arquivo import Arquivo
from src.modelos.sessao import Sessao
from src.servicos.divisor import PastaProposta, ResultadoDivisao
from src.servicos.movimentador import ServicoMovimentador


def test_gerar_caminho_sem_colisao(tmp_path):
    arquivo_existente = tmp_path / "teste.mp4"
    arquivo_existente.write_text("conteudo")

    caminho_gerado = ServicoMovimentador.gerar_caminho_sem_colisao(str(arquivo_existente))
    assert caminho_gerado == str(tmp_path / "teste (1).mp4")


def test_executar_movimentacao_fisica(tmp_path):
    caminho_db = tmp_path / "teste_movimentacao.db"
    inicializar_banco(caminho_db)

    repo_s = RepositorioSessao(caminho_db)
    repo_a = RepositorioArquivo(caminho_db)

    # Origem
    pasta_origem = tmp_path / "origem"
    pasta_origem.mkdir()
    arq1 = pasta_origem / "doc1.pdf"
    arq1.write_text("conteudo pdf")

    sessao = repo_s.criar(Sessao(caminho_raiz=str(pasta_origem), data_scan="2026-08-07"))
    modelo_arq1 = Arquivo(
        sessao_id=sessao.id,
        nome_arquivo="doc1.pdf",
        caminho_original=str(arq1),
        extensao=".pdf",
        tamanho_bytes=len("conteudo pdf"),
        categoria="documentos",
    )
    repo_a.inserir_lote([modelo_arq1])
    arquivos_banco = repo_a.listar_por_sessao(sessao.id)

    # Destino Matriz
    pasta_matriz = tmp_path / "Matriz_Destino"

    resultado = ResultadoDivisao(
        pastas=[PastaProposta(nome_pasta="Documentos - Parte 1", arquivos=[arquivos_banco[0]])]
    )

    movimentador = ServicoMovimentador(repo_s, repo_a)
    movimentador.executar_movimentacao(resultado, str(pasta_matriz))

    # Verifica se o arquivo foi movido fisicamente
    assert not arq1.exists()
    caminho_esperado = pasta_matriz / "Documentos - Parte 1" / "doc1.pdf"
    assert caminho_esperado.exists()

    # Verifica atualização no SQLite
    arquivos_atualizados = repo_a.listar_por_sessao(sessao.id)
    assert arquivos_atualizados[0].status_organizacao == "organizado"
    assert arquivos_atualizados[0].caminho_novo == str(caminho_esperado)
