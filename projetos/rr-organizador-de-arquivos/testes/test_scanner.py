from src.dados.conexao import inicializar_banco
from src.dados.repositorio import RepositorioArquivo, RepositorioSessao
from src.servicos.scanner import ServicoScanner, classificar_categoria


def test_classificacao_categorias():
    assert classificar_categoria(".mp4") == "videos"
    assert classificar_categoria(".MP3") == "audios"
    assert classificar_categoria(".PNG") == "imagens"
    assert classificar_categoria(".pdf") == "documentos"
    assert classificar_categoria(".xyz") == "atipicos"


def test_escaneamento_recursivo(tmp_path):
    caminho_db = tmp_path / "teste_scanner.db"
    inicializar_banco(caminho_db)

    # Cria estrutura de arquivos fictícios no tmp_path
    pasta_teste = tmp_path / "arquivos_origem"
    pasta_teste.mkdir()
    subpasta = pasta_teste / "subpasta"
    subpasta.mkdir()

    (pasta_teste / "video.mp4").write_text("conteudo video")
    (pasta_teste / "documento.pdf").write_text("conteudo pdf")
    (subpasta / "foto.jpg").write_text("conteudo foto")

    repo_s = RepositorioSessao(caminho_db)
    repo_a = RepositorioArquivo(caminho_db)
    scanner = ServicoScanner(repo_s, repo_a)

    sessao, arquivos = scanner.escanear_pasta(str(pasta_teste))

    assert sessao.id is not None
    assert len(arquivos) == 3

    categorias = {a.categoria for a in arquivos}
    assert "videos" in categorias
    assert "documentos" in categorias
    assert "imagens" in categorias
