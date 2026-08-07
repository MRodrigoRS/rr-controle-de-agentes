from src.dados.conexao import inicializar_banco
from src.dados.repositorio import RepositorioArquivo, RepositorioSessao
from src.modelos.arquivo import Arquivo
from src.modelos.sessao import Sessao
from src.servicos.desfazer import ServicoDesfazer
from src.servicos.divisor import PastaProposta, ResultadoDivisao
from src.servicos.movimentador import ServicoMovimentador


def test_desfazer_sessao_completo(tmp_path):
    caminho_db = tmp_path / "teste_undo.db"
    inicializar_banco(caminho_db)

    repo_s = RepositorioSessao(caminho_db)
    repo_a = RepositorioArquivo(caminho_db)

    # Cria arquivo original
    pasta_origem = tmp_path / "origem"
    pasta_origem.mkdir()
    arq_orig = pasta_origem / "foto.png"
    arq_orig.write_text("dados foto")

    sessao = repo_s.criar(Sessao(caminho_raiz=str(pasta_origem), data_scan="2026-08-07"))
    modelo_arq = Arquivo(
        sessao_id=sessao.id,
        nome_arquivo="foto.png",
        caminho_original=str(arq_orig),
        extensao=".png",
        tamanho_bytes=len("dados foto"),
        categoria="imagens",
    )
    repo_a.inserir_lote([modelo_arq])
    arquivos_banco = repo_a.listar_por_sessao(sessao.id)

    # Executa movimentação
    pasta_matriz = tmp_path / "Matriz_Undo"
    resultado = ResultadoDivisao(
        pastas=[PastaProposta(nome_pasta="Fotos - Parte 1", arquivos=[arquivos_banco[0]])]
    )

    movimentador = ServicoMovimentador(repo_s, repo_a)
    movimentador.executar_movimentacao(resultado, str(pasta_matriz))

    caminho_novo_esperado = pasta_matriz / "Fotos - Parte 1" / "foto.png"
    assert caminho_novo_esperado.exists()
    assert not arq_orig.exists()

    # Executa DESFAZER (Undo)
    desfazer = ServicoDesfazer(repo_s, repo_a)
    total_revertidos = desfazer.desfazer_sessao(sessao.id)

    assert total_revertidos == 1
    assert arq_orig.exists()
    assert not caminho_novo_esperado.exists()
    # Verifica se a pasta de destino foi removida por ficar vazia
    assert not (pasta_matriz / "Fotos - Parte 1").exists()

    # Verifica status no SQLite
    arquivos_final = repo_a.listar_por_sessao(sessao.id)
    assert arquivos_final[0].status_organizacao == "pendente"
    assert arquivos_final[0].caminho_novo == ""
