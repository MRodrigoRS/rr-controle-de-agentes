import os
import sys
from typing import Optional

from PySide6.QtCore import Qt
from PySide6.QtGui import QBrush, QColor
from PySide6.QtWidgets import (
    QDialog,
    QGroupBox,
    QHBoxLayout,
    QHeaderView,
    QLabel,
    QPushButton,
    QTreeWidget,
    QTreeWidgetItem,
    QVBoxLayout,
    QWidget,
)

from src.modelos.arquivo import Arquivo
from src.servicos.divisor import PastaProposta, ResultadoDivisao
from src.ui.componentes.icones import ProviderIcones
from src.ui.componentes.tabela_arquivos import formatar_tamanho


class DialogPreviewSimulacao(QDialog):
    """Dialog interativo exibindo a simulação da estrutura de pastas com seleção de pastas."""

    def __init__(
        self,
        resultado: ResultadoDivisao,
        nome_pasta_matriz: str,
        parent: Optional[QWidget] = None,
    ):
        super().__init__(parent)
        self.resultado = resultado
        self.nome_pasta_matriz = nome_pasta_matriz or "Pasta_Concentradora_Matriz"
        self.setWindowTitle("🌳 Simulação Prévia da Organização")
        self.resize(800, 600)
        self._construir_interface()

    def _construir_interface(self) -> None:
        layout_principal = QVBoxLayout(self)

        # Header explicativo
        lbl_titulo = QLabel("🌳 Preview Interativo da Estrutura de Destino")
        lbl_titulo.setStyleSheet("font-size: 16px; font-weight: bold; color: #38BDF8;")
        layout_principal.addWidget(lbl_titulo)

        lbl_desc = QLabel(
            "Desmarque o checkbox de qualquer subpasta para deixá-la de fora da movimentação.\n"
            "Dê duplo clique em qualquer arquivo para abri-lo."
        )
        lbl_desc.setWordWrap(True)
        layout_principal.addWidget(lbl_desc)

        # Resumo Estatístico
        box_resumo = QGroupBox("Métricas da Organização")
        layout_resumo = QHBoxLayout(box_resumo)

        self.lbl_pastas = QLabel(f"📁 Pastas a criar: <b>{self.resultado.total_pastas_criadas}</b>")
        self.lbl_arquivos = QLabel(
            f"📄 Arquivos alocados: <b>{self.resultado.total_arquivos_alocados}</b>"
        )
        lbl_sobredim = QLabel(
            f"⚠️ Fora do limite: <b>{len(self.resultado.arquivos_sobredimensionados)}</b>"
        )
        lbl_sobredim.setStyleSheet("color: #F87171;")

        layout_resumo.addWidget(self.lbl_pastas)
        layout_resumo.addWidget(self.lbl_arquivos)
        layout_resumo.addWidget(lbl_sobredim)
        layout_principal.addWidget(box_resumo)

        # Árvore da Estrutura
        self.tree = QTreeWidget()
        self.tree.setHeaderLabels(["Estrutura de Pastas e Arquivos", "Tamanho"])
        self.tree.header().setSectionResizeMode(0, QHeaderView.ResizeMode.Stretch)

        # Nó Matriz Raiz
        node_raiz = QTreeWidgetItem(self.tree, [f"📦 [MATRIZ] {self.nome_pasta_matriz}", ""])
        node_raiz.setIcon(0, ProviderIcones.obter_icone_categoria("pasta"))
        node_raiz.setExpanded(True)

        # Subpastas geradas
        for pasta_prop in self.resultado.pastas:
            node_pasta = QTreeWidgetItem(
                node_raiz,
                [
                    f"📁 {pasta_prop.nome_pasta} ({pasta_prop.quantidade_arquivos} arquivos)",
                    formatar_tamanho(pasta_prop.tamanho_total_bytes),
                ],
            )
            node_pasta.setIcon(0, ProviderIcones.obter_icone_categoria("pasta"))
            node_pasta.setFlags(
                node_pasta.flags()
                | Qt.ItemFlag.ItemIsUserCheckable
                | Qt.ItemFlag.ItemIsAutoTristate
            )
            node_pasta.setCheckState(0, Qt.CheckState.Checked)
            node_pasta.setData(0, Qt.ItemDataRole.UserRole, pasta_prop)
            node_pasta.setExpanded(True)

            for arq in pasta_prop.arquivos:
                node_arq = QTreeWidgetItem(
                    node_pasta, [f"📄 {arq.nome_arquivo}", formatar_tamanho(arq.tamanho_bytes)]
                )
                node_arq.setIcon(0, ProviderIcones.obter_icone_categoria(arq.categoria))
                node_arq.setFlags(node_arq.flags() | Qt.ItemFlag.ItemIsUserCheckable)
                node_arq.setCheckState(
                    0, Qt.CheckState.Checked if arq.marcado else Qt.CheckState.Unchecked
                )
                node_arq.setData(0, Qt.ItemDataRole.UserRole, arq)

        # Se houver arquivos sobredimensionados, exibe nó destacado
        if self.resultado.arquivos_sobredimensionados:
            qtd_sob = len(self.resultado.arquivos_sobredimensionados)
            node_alerta = QTreeWidgetItem(
                self.tree,
                [
                    f"⚠️ ARQUIVOS FORA DO LIMITE (Permanecerão na Origem) - {qtd_sob} itens",
                    "",
                ],
            )
            node_alerta.setBackground(0, QBrush(QColor(120, 20, 20, 180)))
            node_alerta.setForeground(0, QBrush(QColor(255, 200, 200)))
            node_alerta.setExpanded(True)

            for arq in self.resultado.arquivos_sobredimensionados:
                node_arq_sob = QTreeWidgetItem(
                    node_alerta,
                    [
                        f"🛑 {arq.nome_arquivo} (Excede o limite da pasta)",
                        formatar_tamanho(arq.tamanho_bytes),
                    ],
                )
                node_arq_sob.setForeground(0, QBrush(QColor(255, 180, 180)))
                node_arq_sob.setData(0, Qt.ItemDataRole.UserRole, arq)

        self.tree.itemChanged.connect(self._on_tree_item_changed)
        self.tree.itemDoubleClicked.connect(self._on_tree_item_double_clicked)
        layout_principal.addWidget(self.tree)

        # Botão Fechar / Confirmar
        layout_botoes = QHBoxLayout()
        layout_botoes.addStretch()
        btn_fechar = QPushButton("Aplicar e Fechar")
        btn_fechar.clicked.connect(self.accept)
        layout_botoes.addWidget(btn_fechar)

        layout_principal.addLayout(layout_botoes)

    def _on_tree_item_changed(self, item: QTreeWidgetItem, column: int) -> None:
        if column != 0:
            return

        self.tree.blockSignals(True)
        data = item.data(0, Qt.ItemDataRole.UserRole)
        state = item.checkState(0)

        # Se for um nó de pasta proposta
        if isinstance(data, PastaProposta):
            is_checked = state == Qt.CheckState.Checked
            for i in range(item.childCount()):
                child = item.child(i)
                child.setCheckState(
                    0, Qt.CheckState.Checked if is_checked else Qt.CheckState.Unchecked
                )
                child_arq = child.data(0, Qt.ItemDataRole.UserRole)
                if isinstance(child_arq, Arquivo):
                    child_arq.marcado = is_checked

        # Se for um nó de arquivo
        elif isinstance(data, Arquivo):
            data.marcado = state == Qt.CheckState.Checked

        self.tree.blockSignals(False)

    def _on_tree_item_double_clicked(self, item: QTreeWidgetItem, column: int) -> None:
        data = item.data(0, Qt.ItemDataRole.UserRole)
        if isinstance(data, Arquivo):
            caminho = None
            if data.caminho_novo and os.path.exists(data.caminho_novo):
                caminho = data.caminho_novo
            elif os.path.exists(data.caminho_original):
                caminho = data.caminho_original

            if caminho:
                if sys.platform == "win32":
                    os.startfile(caminho)
                else:
                    import subprocess

                    subprocess.Popen(["xdg-open", caminho])
