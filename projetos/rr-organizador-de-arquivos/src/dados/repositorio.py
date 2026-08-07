from pathlib import Path
from typing import List, Optional, Union

from src.dados.conexao import obter_conexao
from src.modelos.arquivo import Arquivo
from src.modelos.sessao import Sessao


class RepositorioSessao:
    """Repositório de dados para a entidade Sessao."""

    def __init__(self, caminho_banco: Union[str, Path, None] = None):
        self.caminho_banco = caminho_banco

    def criar(self, sessao: Sessao) -> Sessao:
        """Insere uma nova sessão no banco de dados e atualiza seu ID."""
        with obter_conexao(self.caminho_banco) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO Sessoes (caminho_raiz, pasta_matriz_destino, data_scan, configuracoes)
                VALUES (?, ?, ?, ?)
                """,
                (
                    sessao.caminho_raiz,
                    sessao.pasta_matriz_destino,
                    sessao.data_scan,
                    sessao.configuracoes,
                ),
            )
            conn.commit()
            sessao.id = cursor.lastrowid
            return sessao

    def buscar_por_caminho_raiz(self, caminho_raiz: str) -> Optional[Sessao]:
        """Busca a sessão ativa existente para um caminho raiz."""
        with obter_conexao(self.caminho_banco) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, caminho_raiz, pasta_matriz_destino, data_scan, configuracoes
                FROM Sessoes
                WHERE caminho_raiz = ?
                ORDER BY id DESC LIMIT 1
                """,
                (caminho_raiz,),
            )
            row = cursor.fetchone()
            if row:
                return Sessao(
                    id=row["id"],
                    caminho_raiz=row["caminho_raiz"],
                    pasta_matriz_destino=row["pasta_matriz_destino"],
                    data_scan=row["data_scan"],
                    configuracoes=row["configuracoes"],
                )
            return None

    def listar_todas(self) -> List[Sessao]:
        """Lista todas as sessões registradas no banco."""
        with obter_conexao(self.caminho_banco) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, caminho_raiz, pasta_matriz_destino, data_scan, configuracoes
                FROM Sessoes
                ORDER BY id DESC
                """
            )
            rows = cursor.fetchall()
            return [
                Sessao(
                    id=r["id"],
                    caminho_raiz=r["caminho_raiz"],
                    pasta_matriz_destino=r["pasta_matriz_destino"],
                    data_scan=r["data_scan"],
                    configuracoes=r["configuracoes"],
                )
                for r in rows
            ]

    def atualizar_matriz_destino(self, sessao_id: int, pasta_matriz: str) -> None:
        """Atualiza o caminho da pasta matriz de destino para a sessão."""
        with obter_conexao(self.caminho_banco) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE Sessoes SET pasta_matriz_destino = ? WHERE id = ?",
                (pasta_matriz, sessao_id),
            )
            conn.commit()


class RepositorioArquivo:
    """Repositório de dados para a entidade Arquivo."""

    def __init__(self, caminho_banco: Union[str, Path, None] = None):
        self.caminho_banco = caminho_banco

    def inserir_lote(self, arquivos: List[Arquivo]) -> None:
        """Insere uma lista de arquivos no banco utilizando transação em lote (bulk insert)."""
        if not arquivos:
            return

        dados = [
            (
                a.sessao_id,
                a.nome_arquivo,
                a.caminho_original,
                a.caminho_novo,
                a.extensao,
                a.tamanho_bytes,
                1 if a.marcado else 0,
                a.status_organizacao,
                a.categoria,
            )
            for a in arquivos
        ]

        with obter_conexao(self.caminho_banco) as conn:
            cursor = conn.cursor()
            cursor.executemany(
                """
                INSERT INTO Arquivos (
                    sessao_id, nome_arquivo, caminho_original, caminho_novo,
                    extensao, tamanho_bytes, marcado, status_organizacao, categoria
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                dados,
            )
            conn.commit()

    def listar_por_sessao(self, sessao_id: int) -> List[Arquivo]:
        """Recupera todos os arquivos associados a uma sessão."""
        with obter_conexao(self.caminho_banco) as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                SELECT id, sessao_id, nome_arquivo, caminho_original, caminho_novo,
                       extensao, tamanho_bytes, marcado, status_organizacao, categoria
                FROM Arquivos
                WHERE sessao_id = ?
                ORDER BY tamanho_bytes DESC
                """,
                (sessao_id,),
            )
            rows = cursor.fetchall()
            return [
                Arquivo(
                    id=r["id"],
                    sessao_id=r["sessao_id"],
                    nome_arquivo=r["nome_arquivo"],
                    caminho_original=r["caminho_original"],
                    caminho_novo=r["caminho_novo"],
                    extensao=r["extensao"],
                    tamanho_bytes=r["tamanho_bytes"],
                    marcado=bool(r["marcado"]),
                    status_organizacao=r["status_organizacao"],
                    categoria=r["categoria"],
                )
                for r in rows
            ]

    def atualizar_marcado(self, arquivo_id: int, marcado: bool) -> None:
        """Atualiza a flag de marcado de um arquivo."""
        with obter_conexao(self.caminho_banco) as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE Arquivos SET marcado = ? WHERE id = ?",
                (1 if marcado else 0, arquivo_id),
            )
            conn.commit()

    def atualizar_caminho_novo_e_status(
        self,
        caminho_novo: str,
        status: str,
        arquivo_id: Optional[int] = None,
        caminho_original: Optional[str] = None,
    ) -> None:
        """Atualiza o novo caminho e o status do arquivo no SQLite por ID ou caminho original."""
        with obter_conexao(self.caminho_banco) as conn:
            cursor = conn.cursor()
            if arquivo_id is not None:
                cursor.execute(
                    """
                    UPDATE Arquivos
                    SET caminho_novo = ?, status_organizacao = ?
                    WHERE id = ? OR (caminho_original = ? AND sessao_id IS NOT NULL)
                    """,
                    (caminho_novo, status, arquivo_id, caminho_original or ""),
                )
            elif caminho_original:
                cursor.execute(
                    """
                    UPDATE Arquivos
                    SET caminho_novo = ?, status_organizacao = ?
                    WHERE caminho_original = ?
                    """,
                    (caminho_novo, status, caminho_original),
                )
            conn.commit()

    def limpar_arquivos_sessao(self, sessao_id: int) -> None:
        """Remove todos os arquivos cadastrados de uma sessão (usado no re-scan)."""
        with obter_conexao(self.caminho_banco) as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM Arquivos WHERE sessao_id = ?", (sessao_id,))
            conn.commit()
