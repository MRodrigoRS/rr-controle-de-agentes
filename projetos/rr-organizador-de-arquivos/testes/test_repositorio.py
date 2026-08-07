import pytest

from src.dados.conexao import inicializar_banco
from src.dados.repositorio import RepositorioArquivo, RepositorioSessao
from src.modelos.arquivo import Arquivo
from src.modelos.sessao import Sessao


@pytest.fixture
def db_temp(tmp_path):
    caminho_db = tmp_path / "teste_repo.db"
    inicializar_banco(caminho_db)
    return caminho_db


def test_crud_sessao(db_temp):
    repo_sessao = RepositorioSessao(db_temp)

    sessao = Sessao(caminho_raiz="/caminho/teste", data_scan="2026-08-07T00:00:00")
    sessao_criada = repo_sessao.criar(sessao)

    assert sessao_criada.id is not None
    assert sessao_criada.caminho_raiz == "/caminho/teste"

    buscada = repo_sessao.buscar_por_caminho_raiz("/caminho/teste")
    assert buscada is not None
    assert buscada.id == sessao_criada.id

    todas = repo_sessao.listar_todas()
    assert len(todas) == 1


def test_crud_arquivos_lote(db_temp):
    repo_sessao = RepositorioSessao(db_temp)
    repo_arquivo = RepositorioArquivo(db_temp)

    sessao = repo_sessao.criar(Sessao(caminho_raiz="/origem", data_scan="2026-08-07"))

    arquivos = [
        Arquivo(
            sessao_id=sessao.id,
            nome_arquivo="video1.mp4",
            caminho_original="/origem/video1.mp4",
            extensao=".mp4",
            tamanho_bytes=1000,
            categoria="videos",
        ),
        Arquivo(
            sessao_id=sessao.id,
            nome_arquivo="foto1.jpg",
            caminho_original="/origem/foto1.jpg",
            extensao=".jpg",
            tamanho_bytes=500,
            categoria="imagens",
        ),
    ]

    repo_arquivo.inserir_lote(arquivos)

    lista = repo_arquivo.listar_por_sessao(sessao.id)
    assert len(lista) == 2
    # Ordenado por tamanho_bytes decrescente por padrão no repo
    assert lista[0].nome_arquivo == "video1.mp4"
    assert lista[1].nome_arquivo == "foto1.jpg"
