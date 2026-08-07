import os
from datetime import datetime
from pathlib import Path
from typing import Callable, List, Optional, Tuple

from src.dados.repositorio import RepositorioArquivo, RepositorioSessao
from src.modelos.arquivo import Arquivo
from src.modelos.sessao import Sessao

EXTENSOES_VIDEOS = {
    ".mp4",
    ".mkv",
    ".avi",
    ".mov",
    ".wmv",
    ".flv",
    ".webm",
    ".m4v",
    ".ts",
    ".m2ts",
    ".vob",
}
EXTENSOES_AUDIOS = {".mp3", ".wav", ".flac", ".aac", ".ogg", ".m4a", ".wma", ".opus"}
EXTENSOES_IMAGENS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".bmp",
    ".svg",
    ".webp",
    ".tiff",
    ".ico",
    ".heic",
}
EXTENSOES_DOCUMENTOS = {
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".ppt",
    ".pptx",
    ".txt",
    ".csv",
    ".odt",
    ".rtf",
}

MAPA_EXTENSOES_CUSTOMIZADO = {
    "videos": set(EXTENSOES_VIDEOS),
    "audios": set(EXTENSOES_AUDIOS),
    "imagens": set(EXTENSOES_IMAGENS),
    "documentos": set(EXTENSOES_DOCUMENTOS),
}


def classificar_categoria(extensao: str, mapa_custom: Optional[dict] = None) -> str:
    """Classifica a extensão de um arquivo usando mapa customizado ou padrão."""
    ext = extensao.lower()
    mapa = mapa_custom or MAPA_EXTENSOES_CUSTOMIZADO

    for cat, exts in mapa.items():
        if ext in exts:
            return cat
    return "atipicos"


class ServicoScanner:
    """Serviço responsável por escaneamento recursivo e sincronização no SQLite."""

    def __init__(
        self,
        repo_sessao: Optional[RepositorioSessao] = None,
        repo_arquivo: Optional[RepositorioArquivo] = None,
    ):
        self.repo_sessao = repo_sessao or RepositorioSessao()
        self.repo_arquivo = repo_arquivo or RepositorioArquivo()

    def escanear_pasta(
        self,
        caminho_raiz: str,
        forcar_rescan: bool = False,
        progresso_cb: Optional[Callable[[int, str], None]] = None,
    ) -> Tuple[Sessao, List[Arquivo]]:
        """
        Escaneia uma pasta recursivamente. Se a sessão já existir e não for forçado
        o re-scan, carrega instantaneamente do banco SQLite.
        """
        caminho_abs = str(Path(caminho_raiz).resolve())
        sessao_existente = self.repo_sessao.buscar_por_caminho_raiz(caminho_abs)

        if sessao_existente and not forcar_rescan:
            assert sessao_existente.id is not None
            arquivos_existentes = self.repo_arquivo.listar_por_sessao(sessao_existente.id)
            return sessao_existente, arquivos_existentes

        # Se forçar rescan em sessão existente, limpa registros antigos
        if sessao_existente and forcar_rescan:
            sessao = sessao_existente
            assert sessao.id is not None
            sessao.data_scan = datetime.now().isoformat()
            self.repo_arquivo.limpar_arquivos_sessao(sessao.id)
        else:
            sessao = Sessao(
                caminho_raiz=caminho_abs,
                data_scan=datetime.now().isoformat(),
            )
            sessao = self.repo_sessao.criar(sessao)

        assert sessao.id is not None
        sessao_id_valida: int = sessao.id

        arquivos_encontrados: List[Arquivo] = []
        contador = 0

        # Varredura no sistema de arquivos
        for raiz, _, nomes_arquivos in os.walk(caminho_abs):
            for nome in nomes_arquivos:
                caminho_completo = os.path.join(raiz, nome)
                try:
                    stats = os.stat(caminho_completo)
                    extensao = os.path.splitext(nome)[1].lower()
                    categoria = classificar_categoria(extensao)

                    arq = Arquivo(
                        sessao_id=sessao_id_valida,
                        nome_arquivo=nome,
                        caminho_original=caminho_completo,
                        extensao=extensao,
                        tamanho_bytes=stats.st_size,
                        categoria=categoria,
                        marcado=True,
                        status_organizacao="pendente",
                    )
                    arquivos_encontrados.append(arq)
                    contador += 1

                    if progresso_cb and contador % 50 == 0:
                        progresso_cb(contador, nome)
                except (OSError, PermissionError):
                    continue

        # Inserção em lote no SQLite
        self.repo_arquivo.inserir_lote(arquivos_encontrados)

        # Retorna arquivos inseridos
        arquivos_banco = self.repo_arquivo.listar_por_sessao(sessao_id_valida)
        return sessao, arquivos_banco
