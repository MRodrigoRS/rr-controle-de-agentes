from src.dados.conexao import inicializar_banco, obter_conexao


def test_inicializar_banco_em_memoria():
    caminho = "file:memdb1?mode=memory&cache=shared"
    conn = obter_conexao(caminho)
    inicializar_banco(caminho)

    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tabelas = [row[0] for row in cursor.fetchall()]

    assert "Sessoes" in tabelas
    assert "Arquivos" in tabelas


def test_inicializar_banco_arquivo(tmp_path):
    caminho_db = tmp_path / "teste_organizador.db"
    inicializar_banco(caminho_db)

    assert caminho_db.exists()

    conn = obter_conexao(caminho_db)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tabelas = [row[0] for row in cursor.fetchall()]

    assert "Sessoes" in tabelas
    assert "Arquivos" in tabelas
