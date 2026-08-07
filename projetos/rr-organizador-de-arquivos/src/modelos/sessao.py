from dataclasses import dataclass
from typing import Optional


@dataclass
class Sessao:
    """Modelo representando uma sessão de varredura/organização."""

    caminho_raiz: str
    pasta_matriz_destino: str = ""
    data_scan: str = ""
    configuracoes: str = "{}"
    id: Optional[int] = None
