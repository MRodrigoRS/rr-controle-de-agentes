import os
import shutil
from pathlib import Path
from typing import Callable, Optional

from src.dados.repositorio import RepositorioArquivo, RepositorioSessao
from src.servicos.divisor import ResultadoDivisao


class ServicoMovimentador:
    """Serviço responsável pela movimentação física de arquivos para a Pasta Matriz."""

    def __init__(
        self,
        repo_sessao: Optional[RepositorioSessao] = None,
        repo_arquivo: Optional[RepositorioArquivo] = None,
    ):
        self.repo_sessao = repo_sessao or RepositorioSessao()
        self.repo_arquivo = repo_arquivo or RepositorioArquivo()

    @staticmethod
    def gerar_caminho_sem_colisao(caminho_destino: str) -> str:
        """
        Gera um caminho único adicionando sufixo numérico incremental
        se já existir um arquivo homônimo no destino (ex: arquivo (1).mp4).
        """
        if not os.path.exists(caminho_destino):
            return caminho_destino

        pasta, nome = os.path.split(caminho_destino)
        base, ext = os.path.splitext(nome)
        contador = 1

        while True:
            novo_nome = f"{base} ({contador}){ext}"
            novo_caminho = os.path.join(pasta, novo_nome)
            if not os.path.exists(novo_caminho):
                return novo_caminho
            contador += 1

    def executar_movimentacao(
        self,
        resultado_divisao: ResultadoDivisao,
        caminho_matriz_destino: str,
        limpar_pastas_origem_vazias: bool = False,
        progresso_cb: Optional[Callable[[int, int, str], None]] = None,
    ) -> None:
        """
        Executa a movimentação física dos arquivos para subpastas geradas
        dentro da Pasta Concentradora Matriz.
        """
        path_matriz = Path(caminho_matriz_destino).resolve()
        path_matriz.mkdir(parents=True, exist_ok=True)

        total_arquivos = resultado_divisao.total_arquivos_alocados
        contador = 0

        pastas_origem_afetadas = set()

        for pasta_prop in resultado_divisao.pastas:
            subpasta_destino = path_matriz / pasta_prop.nome_pasta
            subpasta_destino.mkdir(parents=True, exist_ok=True)

            for arq in pasta_prop.arquivos:
                caminho_origem = arq.caminho_original

                if not os.path.exists(caminho_origem):
                    continue

                pastas_origem_afetadas.add(os.path.dirname(caminho_origem))

                caminho_alvo = str(subpasta_destino / arq.nome_arquivo)
                caminho_alvo_final = self.gerar_caminho_sem_colisao(caminho_alvo)

                # Movimenta o arquivo no sistema de arquivos
                shutil.move(caminho_origem, caminho_alvo_final)

                # Atualiza objeto em memória e no SQLite
                arq.caminho_novo = caminho_alvo_final
                arq.status_organizacao = "organizado"

                self.repo_arquivo.atualizar_caminho_novo_e_status(
                    caminho_novo=caminho_alvo_final,
                    status="organizado",
                    arquivo_id=arq.id,
                    caminho_original=arq.caminho_original,
                )

                contador += 1
                if progresso_cb:
                    progresso_cb(contador, total_arquivos, arq.nome_arquivo)

        # Atualiza o status dos arquivos sobredimensionados no SQLite (que ficam na origem)
        for arq_sob in resultado_divisao.arquivos_sobredimensionados:
            self.repo_arquivo.atualizar_caminho_novo_e_status(
                caminho_novo="",
                status="sobredimensionado",
                arquivo_id=arq_sob.id,
                caminho_original=arq_sob.caminho_original,
            )

        # Limpeza opcional de pastas vazias na origem
        if limpar_pastas_origem_vazias:
            for pasta_origem in pastas_origem_afetadas:
                self._remover_se_vazia_recursivo(pasta_origem)

    def _remover_se_vazia_recursivo(self, caminho_pasta: str) -> None:
        """Remove a pasta e suas ancestrais de origem se estiverem completamente vazias."""
        try:
            p = Path(caminho_pasta)
            if p.exists() and p.is_dir() and not any(p.iterdir()):
                p.rmdir()
                # Tenta remover recursivamente a pasta pai se também estiver vazia
                if p.parent and p.parent.exists():
                    self._remover_se_vazia_recursivo(str(p.parent))
        except (OSError, PermissionError):
            pass
