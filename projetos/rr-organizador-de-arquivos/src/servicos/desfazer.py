import os
import shutil
from pathlib import Path
from typing import Callable, Optional

from src.dados.repositorio import RepositorioArquivo, RepositorioSessao


class ServicoDesfazer:
    """Serviço responsável por desfazer a movimentação de arquivos (Undo Seguro)."""

    def __init__(
        self,
        repo_sessao: Optional[RepositorioSessao] = None,
        repo_arquivo: Optional[RepositorioArquivo] = None,
    ):
        self.repo_sessao = repo_sessao or RepositorioSessao()
        self.repo_arquivo = repo_arquivo or RepositorioArquivo()

    def desfazer_sessao(
        self,
        sessao_id: int,
        progresso_cb: Optional[Callable[[int, int, str], None]] = None,
    ) -> int:
        """
        Reverte todos os arquivos organizados de uma sessão de volta para seus
        caminhos originais e exclui as pastas de destino criadas que ficarem vazias.
        Returns o número total de arquivos revertidos.
        """
        arquivos = self.repo_arquivo.listar_por_sessao(sessao_id)
        organizados = [
            a for a in arquivos if a.status_organizacao == "organizado" and a.caminho_novo
        ]

        total = len(organizados)
        contador = 0
        pastas_destino_afetadas = set()

        for arq in organizados:
            caminho_atual = arq.caminho_novo
            caminho_origem = arq.caminho_original

            if os.path.exists(caminho_atual):
                pastas_destino_afetadas.add(os.path.dirname(caminho_atual))

                # Garante que a pasta de origem exista antes de mover de volta
                pasta_origem_dir = os.path.dirname(caminho_origem)
                os.makedirs(pasta_origem_dir, exist_ok=True)

                # Move de volta
                shutil.move(caminho_atual, caminho_origem)

            # Reseta estado no modelo e no SQLite
            arq.caminho_novo = ""
            arq.status_organizacao = "pendente"

            self.repo_arquivo.atualizar_caminho_novo_e_status(
                caminho_novo="",
                status="pendente",
                arquivo_id=arq.id,
                caminho_original=arq.caminho_original,
            )

            contador += 1
            if progresso_cb:
                progresso_cb(contador, total, arq.nome_arquivo)

        # Apaga subpastas geradas no destino se ficarem completamente vazias
        for pasta_dst in pastas_destino_afetadas:
            self._remover_pasta_se_vazia(pasta_dst)

        return contador

    def _remover_pasta_se_vazia(self, caminho_pasta: str) -> None:
        """Apaga a pasta de destino se não contiver mais nenhum arquivo."""
        try:
            p = Path(caminho_pasta)
            if p.exists() and p.is_dir() and not any(p.iterdir()):
                p.rmdir()
                if p.parent and p.parent.exists() and not any(p.parent.iterdir()):
                    p.parent.rmdir()
        except (OSError, PermissionError):
            pass
