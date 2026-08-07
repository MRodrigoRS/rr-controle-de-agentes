from dataclasses import dataclass
from typing import Optional


@dataclass
class Arquivo:
    """Modelo representando um arquivo catalogado em uma sessão."""

    sessao_id: int
    nome_arquivo: str
    caminho_original: str
    extensao: str
    tamanho_bytes: int
    caminho_novo: str = ""
    marcado: bool = True
    status_organizacao: str = "pendente"
    categoria: str = "atipicos"
    id: Optional[int] = None
