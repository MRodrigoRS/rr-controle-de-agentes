import sqlite3
from pathlib import Path
from typing import Union

NOME_BANCO_PADRAO = "dados_organizador.db"


def obter_caminho_banco(nome_banco: str = NOME_BANCO_PADRAO) -> Path:
    """Retorna o caminho absoluto do arquivo do banco de dados na raiz do programa."""
    raiz = Path(__file__).resolve().parent.parent.parent
    return raiz / nome_banco


def obter_conexao(caminho: Union[str, Path, None] = None) -> sqlite3.Connection:
    """Abre e retorna uma conexão com o SQLite habilitando suporte a Foreign Keys."""
    if caminho is None:
        caminho = obter_caminho_banco()
    elif isinstance(caminho, str) and caminho != ":memory:":
        caminho = Path(caminho)

    conn = sqlite3.connect(str(caminho))
    conn.execute("PRAGMA foreign_keys = ON;")
    conn.row_factory = sqlite3.Row
    return conn


def inicializar_banco(caminho: Union[str, Path, None] = None) -> None:
    """Cria a estrutura das tabelas Sessoes e Arquivos se ainda não existirem."""
    with obter_conexao(caminho) as conn:
        cursor = conn.cursor()

        # Tabela Sessoes
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS Sessoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                caminho_raiz TEXT NOT NULL,
                pasta_matriz_destino TEXT DEFAULT '',
                data_scan TEXT NOT NULL,
                configuracoes TEXT DEFAULT '{}'
            );
            """
        )

        # Tabela Arquivos
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS Arquivos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sessao_id INTEGER NOT NULL,
                nome_arquivo TEXT NOT NULL,
                caminho_original TEXT NOT NULL,
                caminho_novo TEXT DEFAULT '',
                extensao TEXT NOT NULL,
                tamanho_bytes INTEGER NOT NULL,
                marcado INTEGER DEFAULT 1,
                status_organizacao TEXT DEFAULT 'pendente',
                categoria TEXT DEFAULT 'atipicos',
                FOREIGN KEY (sessao_id) REFERENCES Sessoes(id) ON DELETE CASCADE
            );
            """
        )

        # Índices para busca rápida
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_arquivos_sessao ON Arquivos(sessao_id);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_arquivos_extensao ON Arquivos(extensao);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessoes_caminho ON Sessoes(caminho_raiz);")

        conn.commit()
