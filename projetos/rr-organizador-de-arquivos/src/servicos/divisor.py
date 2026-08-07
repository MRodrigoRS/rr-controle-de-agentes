import math
from dataclasses import dataclass, field
from typing import List

from src.modelos.arquivo import Arquivo


@dataclass
class PastaProposta:
    """Representa uma pasta de destino simulada com os arquivos que ela conterá."""

    nome_pasta: str
    arquivos: List[Arquivo] = field(default_factory=list)

    @property
    def tamanho_total_bytes(self) -> int:
        return sum(a.tamanho_bytes for a in self.arquivos)

    @property
    def quantidade_arquivos(self) -> int:
        return len(self.arquivos)


@dataclass
class ResultadoDivisao:
    """Resultado final do fatiamento/agrupamento de arquivos."""

    pastas: List[PastaProposta] = field(default_factory=list)
    arquivos_sobredimensionados: List[Arquivo] = field(default_factory=list)
    arquivos_ignorados: List[Arquivo] = field(default_factory=list)

    @property
    def total_pastas_criadas(self) -> int:
        return len(self.pastas)

    @property
    def total_arquivos_alocados(self) -> int:
        return sum(p.quantidade_arquivos for p in self.pastas)


class ServicoDivisor:
    """Serviço responsável pelos algoritmos de divisão e agrupamento de arquivos."""

    @staticmethod
    def dividir_por_quantidade_arquivos(
        arquivos: List[Arquivo],
        qtd_por_pasta: int,
        nome_base: str = "Grupo",
    ) -> ResultadoDivisao:
        """Lógica A: Fatiamento simples de N em N arquivos."""
        if qtd_por_pasta <= 0:
            raise ValueError("A quantidade por pasta deve ser maior que zero.")

        marcados = [a for a in arquivos if a.marcado]
        ignorados = [a for a in arquivos if not a.marcado]

        resultado = ResultadoDivisao(arquivos_ignorados=ignorados)
        total = len(marcados)

        if total == 0:
            return resultado

        num_pastas = math.ceil(total / qtd_por_pasta)
        for idx in range(num_pastas):
            inicio = idx * qtd_por_pasta
            fim = inicio + qtd_por_pasta
            fatia = marcados[inicio:fim]
            nome_pasta = f"{nome_base} - Parte {idx + 1}"
            resultado.pastas.append(PastaProposta(nome_pasta=nome_pasta, arquivos=fatia))

        return resultado

    @staticmethod
    def dividir_por_quantidade_pastas(
        arquivos: List[Arquivo],
        total_pastas: int,
        nome_base: str = "Grupo",
    ) -> ResultadoDivisao:
        """Lógica B: Distribuição equilibrada dos arquivos em N pastas."""
        if total_pastas <= 0:
            raise ValueError("O número total de pastas deve ser maior que zero.")

        marcados = [a for a in arquivos if a.marcado]
        ignorados = [a for a in arquivos if not a.marcado]

        resultado = ResultadoDivisao(arquivos_ignorados=ignorados)
        total = len(marcados)

        if total == 0:
            return resultado

        # Cria as pastas de destino
        for idx in range(min(total_pastas, total)):
            resultado.pastas.append(PastaProposta(nome_pasta=f"{nome_base} - Parte {idx + 1}"))

        # Distribui os arquivos em round-robin
        for idx, arq in enumerate(marcados):
            pasta_idx = idx % len(resultado.pastas)
            resultado.pastas[pasta_idx].arquivos.append(arq)

        return resultado

    @staticmethod
    def dividir_por_tamanho_maximo_crescente(
        arquivos: List[Arquivo],
        limite_bytes_por_pasta: int,
        nome_base: str = "Grupo",
    ) -> ResultadoDivisao:
        """
        Lógica C (Simplificada/Crescente):
        - Separa os arquivos marcados.
        - Identifica arquivos individuais maiores que o limite máximo da pasta (sobredimensionados).
        - Ordena os arquivos válidos do MENOR para o MAIOR.
        - Preenche a pasta sequencialmente; se o próximo estoura a capacidade, abre nova pasta.
        """
        if limite_bytes_por_pasta <= 0:
            raise ValueError("O limite de tamanho por pasta deve ser maior que zero.")

        marcados = [a for a in arquivos if a.marcado]
        ignorados = [a for a in arquivos if not a.marcado]

        validos: List[Arquivo] = []
        sobredimensionados: List[Arquivo] = []

        for arq in marcados:
            if arq.tamanho_bytes > limite_bytes_por_pasta:
                arq.status_organizacao = "sobredimensionado"
                sobredimensionados.append(arq)
            else:
                validos.append(arq)

        # Ordenação do MENOR para o MAIOR
        validos.sort(key=lambda a: a.tamanho_bytes)

        resultado = ResultadoDivisao(
            arquivos_sobredimensionados=sobredimensionados,
            arquivos_ignorados=ignorados,
        )

        if not validos:
            return resultado

        pasta_atual_idx = 1
        pasta_atual = PastaProposta(nome_pasta=f"{nome_base} - Parte {pasta_atual_idx}")
        tamanho_acumulado = 0

        for arq in validos:
            if tamanho_acumulado + arq.tamanho_bytes <= limite_bytes_por_pasta:
                pasta_atual.arquivos.append(arq)
                tamanho_acumulado += arq.tamanho_bytes
            else:
                # Fecha a pasta atual e cria uma nova
                resultado.pastas.append(pasta_atual)
                pasta_atual_idx += 1
                pasta_atual = PastaProposta(nome_pasta=f"{nome_base} - Parte {pasta_atual_idx}")
                pasta_atual.arquivos.append(arq)
                tamanho_acumulado = arq.tamanho_bytes

        if pasta_atual.arquivos:
            resultado.pastas.append(pasta_atual)

        return resultado
