import os
import sys
from typing import List, Optional

from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QBrush, QColor
from PySide6.QtWidgets import (
    QAbstractItemView,
    QHeaderView,
    QTableWidget,
    QTableWidgetItem,
)

from src.modelos.arquivo import Arquivo
from src.ui.componentes.icones import ProviderIcones


def formatar_tamanho(bytes_val: int) -> str:
    """Formata bytes em string legível (B, KB, MB, GB)."""
    if bytes_val < 1024:
        return f"{bytes_val} B"
    elif bytes_val < 1024 * 1024:
        return f"{bytes_val / 1024:.1f} KB"
    elif bytes_val < 1024 * 1024 * 1024:
        return f"{bytes_val / (1024 * 1024):.2f} MB"
    else:
        return f"{bytes_val / (1024 * 1024 * 1024):.2f} GB"


class TabelaArquivos(QTableWidget):
    """Tabela leve e de alta performance para exibição de arquivos categorizados."""

    marcado_alterado = Signal()

    def __init__(self, parent: Optional[QTableWidget] = None):
        super().__init__(parent)
        self.arquivos_mapeados: List[Arquivo] = []
        self._configurar_tabela()

    def _configurar_tabela(self) -> None:
        self.setColumnCount(5)
        self.setHorizontalHeaderLabels(
            [
                "Incluir",
                "Nome do Arquivo",
                "Extensão",
                "Tamanho",
                "Status",
            ]
        )
        self.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        self.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        self.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        self.setSortingEnabled(True)
        self.itemChanged.connect(self._on_item_changed)
        self.cellDoubleClicked.connect(self._on_cell_double_clicked)

    def carregar_arquivos(self, arquivos: List[Arquivo]) -> None:
        """Popula a tabela com a lista de arquivos passados."""
        self.blockSignals(True)
        self.clearContents()
        self.setRowCount(0)
        self.arquivos_mapeados = arquivos

        for i, arq in enumerate(arquivos):
            self.insertRow(i)

            # Col 0: Checkbox + Objeto Arquivo no UserRole
            item_check = QTableWidgetItem()
            item_check.setFlags(Qt.ItemFlag.ItemIsUserCheckable | Qt.ItemFlag.ItemIsEnabled)
            item_check.setCheckState(
                Qt.CheckState.Checked if arq.marcado else Qt.CheckState.Unchecked
            )
            item_check.setData(Qt.ItemDataRole.UserRole, arq)

            # Col 1: Nome com ícone e Tooltip detalhado de caminhos
            item_nome = QTableWidgetItem(arq.nome_arquivo)
            item_nome.setIcon(ProviderIcones.obter_icone_categoria(arq.categoria))

            tooltip_txt = (
                f"Nome: {arq.nome_arquivo}\n"
                f"Origem: {arq.caminho_original}\n"
                f"Destino: {arq.caminho_novo if arq.caminho_novo else '(Ainda não movido)'}"
            )
            item_nome.setToolTip(tooltip_txt)

            # Col 2: Extensão
            item_ext = QTableWidgetItem(arq.extensao.upper())

            # Col 3: Tamanho (com UserRole numérico para ordenação correta)
            item_tam = QTableWidgetItem(formatar_tamanho(arq.tamanho_bytes))
            item_tam.setData(Qt.ItemDataRole.UserRole, arq.tamanho_bytes)

            # Col 4: Status
            if arq.status_organizacao == "sobredimensionado":
                status_txt = "Sobredimensionado (Fica Fora)"
            elif arq.status_organizacao == "organizado":
                status_txt = "Organizado"
            else:
                status_txt = "Pendente"

            item_status = QTableWidgetItem(status_txt)
            item_status.setToolTip(f"Status: {status_txt}")

            # Destaque de cor em vermelho/alerta para arquivos sobredimensionados
            if arq.status_organizacao == "sobredimensionado":
                cor_fundo = QBrush(QColor(120, 20, 20, 180))
                cor_texto = QBrush(QColor(255, 200, 200))
                for item in [item_check, item_nome, item_ext, item_tam, item_status]:
                    item.setBackground(cor_fundo)
                    item.setForeground(cor_texto)

            self.setItem(i, 0, item_check)
            self.setItem(i, 1, item_nome)
            self.setItem(i, 2, item_ext)
            self.setItem(i, 3, item_tam)
            self.setItem(i, 4, item_status)

        # Ordenar por tamanho decrescente por padrão (coluna 3)
        self.sortItems(3, Qt.SortOrder.DescendingOrder)
        self.blockSignals(False)
        self.marcado_alterado.emit()

    def _on_item_changed(self, item: QTableWidgetItem) -> None:
        if item.column() == 0:
            arq = item.data(Qt.ItemDataRole.UserRole)
            if isinstance(arq, Arquivo):
                arq.marcado = item.checkState() == Qt.CheckState.Checked
            elif 0 <= item.row() < len(self.arquivos_mapeados):
                self.arquivos_mapeados[item.row()].marcado = (
                    item.checkState() == Qt.CheckState.Checked
                )
            self.marcado_alterado.emit()

    def _on_cell_double_clicked(self, row: int, column: int) -> None:
        item_check = self.item(row, 0)
        arq: Optional[Arquivo] = item_check.data(Qt.ItemDataRole.UserRole) if item_check else None

        caminho = None
        if arq:
            if arq.caminho_novo and os.path.exists(arq.caminho_novo):
                caminho = arq.caminho_novo
            elif os.path.exists(arq.caminho_original):
                caminho = arq.caminho_original

        if caminho:
            if sys.platform == "win32":
                os.startfile(caminho)
            else:
                import subprocess

                subprocess.Popen(["xdg-open", caminho])
