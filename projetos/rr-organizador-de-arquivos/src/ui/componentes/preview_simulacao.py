import os
import sys
from typing import Dict, List, Optional

from PySide6.QtCore import Qt
from PySide6.QtGui import QBrush, QColor
from PySide6.QtWidgets import (
    QDialog,
    QGroupBox,
    QHBoxLayout,
    QHeaderView,
    QLabel,
    QLineEdit,
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
    """Dialog comparativo (Dual Tree) da Origem e Destino com busca e sincronização bilateral."""

    def __init__(
        self,
        resultado: ResultadoDivisao,
        nome_pasta_matriz: str,
        parent: Optional[QWidget] = None,
    ):
        super().__init__(parent)
        self.resultado = resultado
        self.nome_pasta_matriz = nome_pasta_matriz or "Pasta_Concentradora_Matriz"
        self.setWindowTitle("🌳 Simulação Prévia da Organização (Lado a Lado)")
        self.setWindowFlags(self.windowFlags() | Qt.WindowType.WindowMinMaxButtonsHint)
        self.resize(1200, 700)

        # Mapeamentos para sincronização rápida bilateral em O(1)
        self.mapa_nos_origem: Dict[int, QTreeWidgetItem] = {}
        self.mapa_nos_destino: Dict[int, QTreeWidgetItem] = {}
        self.mapa_pastas_origem_nos: Dict[str, QTreeWidgetItem] = {}
        self.mapa_pastas_destino_nos: Dict[int, QTreeWidgetItem] = {}

        self._construir_interface()

    def _construir_interface(self) -> None:
        layout_principal = QVBoxLayout(self)

        # Header explicativo
        lbl_titulo = QLabel("🌳 Preview Comparativo Lado a Lado (Origem x Destino)")
        lbl_titulo.setStyleSheet("font-size: 16px; font-weight: bold; color: #38BDF8;")
        layout_principal.addWidget(lbl_titulo)

        lbl_desc = QLabel(
            "Desmarque arquivos ou pastas na Origem (esquerda) ou no Destino (direita). "
            "A desmarcação em qualquer um dos lados atualiza o outro em tempo real.\n"
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
        self.lbl_sobredim = QLabel(
            f"⚠️ Fora do limite: <b>{len(self.resultado.arquivos_sobredimensionados)}</b>"
        )
        self.lbl_sobredim.setStyleSheet("color: #F87171;")

        layout_resumo.addWidget(self.lbl_pastas)
        layout_resumo.addWidget(self.lbl_arquivos)
        layout_resumo.addWidget(self.lbl_sobredim)
        layout_principal.addWidget(box_resumo)

        # Barra de Ações Rápidas & Buscador em Tempo Real
        layout_controles = QHBoxLayout()

        self._pastas_expandidas = True
        self.btn_toggle_expandir = QPushButton("📁 Recolher Tudo")
        self.btn_toggle_expandir.setObjectName("btn_secundario")
        self.btn_toggle_expandir.clicked.connect(self._toggle_expandir_pastas)

        self._todos_marcados = True
        self.btn_toggle_marcar = QPushButton("☐ Desmarcar Todos")
        self.btn_toggle_marcar.setObjectName("btn_secundario")
        self.btn_toggle_marcar.clicked.connect(self._toggle_marcar_todos)

        self.txt_busca = QLineEdit()
        self.txt_busca.setPlaceholderText("🔍 Buscar arquivo ou pasta no preview...")
        self.txt_busca.setClearButtonEnabled(True)
        self.txt_busca.textChanged.connect(self._filtrar_arvores)

        layout_controles.addWidget(self.btn_toggle_expandir)
        layout_controles.addWidget(self.btn_toggle_marcar)
        layout_controles.addWidget(self.txt_busca, stretch=1)
        layout_principal.addLayout(layout_controles)

        # --- PAINÉIS LADO A LADO ---
        layout_dual = QHBoxLayout()

        # PAINEL DA ESQUERDA: ESTRUTURA DE ORIGEM
        box_origem = QGroupBox("📁 1. Estrutura de Origem (HD Atual)")
        layout_box_origem = QVBoxLayout(box_origem)
        self.tree_origem = QTreeWidget()
        self.tree_origem.setHeaderLabels(["Pastas e Arquivos de Origem", "Tamanho"])
        self.tree_origem.header().setSectionResizeMode(0, QHeaderView.ResizeMode.Stretch)
        layout_box_origem.addWidget(self.tree_origem)
        layout_dual.addWidget(box_origem, stretch=1)

        # PAINEL DA DIREITA: ESTRUTURA DE DESTINO PROPOSTA
        box_destino = QGroupBox("📦 2. Estrutura Proposta (Pasta Matriz)")
        layout_box_destino = QVBoxLayout(box_destino)
        self.tree_destino = QTreeWidget()
        self.tree_destino.setHeaderLabels(["Pastas Propostas e Arquivos", "Tamanho"])
        self.tree_destino.header().setSectionResizeMode(0, QHeaderView.ResizeMode.Stretch)
        layout_box_destino.addWidget(self.tree_destino)
        layout_dual.addWidget(box_destino, stretch=1)

        layout_principal.addLayout(layout_dual, stretch=1)

        # Popula as duas árvores
        self._popular_arvore_origem()
        self._popular_arvore_destino()
        self._atualizar_metricas()

        # Conecta eventos de alteração de caixas de seleção
        self.tree_origem.itemChanged.connect(self._on_tree_origem_changed)
        self.tree_destino.itemChanged.connect(self._on_tree_destino_changed)

        # Conecta evento de duplo clique em ambas as árvores
        self.tree_origem.itemDoubleClicked.connect(self._on_tree_item_double_clicked)
        self.tree_destino.itemDoubleClicked.connect(self._on_tree_item_double_clicked)

        # Botão Fechar / Confirmar
        layout_botoes = QHBoxLayout()
        layout_botoes.addStretch()
        btn_fechar = QPushButton("Aplicar e Fechar")
        btn_fechar.clicked.connect(self.accept)
        layout_botoes.addWidget(btn_fechar)

        layout_principal.addLayout(layout_botoes)

    def _popular_arvore_origem(self) -> None:
        """Popula a árvore da esquerda agrupada por pastas de origem originais do HD."""
        self.tree_origem.blockSignals(True)
        self.tree_origem.clear()
        self.mapa_nos_origem.clear()
        self.mapa_pastas_origem_nos.clear()

        todos_os_arquivos: List[Arquivo] = []
        for p in self.resultado.pastas:
            todos_os_arquivos.extend(p.arquivos)
        todos_os_arquivos.extend(self.resultado.arquivos_sobredimensionados)

        # Agrupa arquivos por pasta pai de origem
        grupos_origem: Dict[str, List[Arquivo]] = {}
        for arq in todos_os_arquivos:
            dir_pai = os.path.dirname(arq.caminho_original) or "Pasta Raiz"
            if dir_pai not in grupos_origem:
                grupos_origem[dir_pai] = []
            grupos_origem[dir_pai].append(arq)

        for dir_path, arqs in grupos_origem.items():
            nome_dir = os.path.basename(dir_path) or dir_path
            tamanho_total = sum(a.tamanho_bytes for a in arqs)
            node_pasta = QTreeWidgetItem(
                self.tree_origem,
                [
                    f"📁 {nome_dir} ({len(arqs)} arquivos - {formatar_tamanho(tamanho_total)})",
                    formatar_tamanho(tamanho_total),
                ],
            )
            node_pasta.setIcon(0, ProviderIcones.obter_icone_categoria("pasta"))
            node_pasta.setFlags(
                node_pasta.flags()
                | Qt.ItemFlag.ItemIsUserCheckable
                | Qt.ItemFlag.ItemIsAutoTristate
            )
            node_pasta.setCheckState(0, Qt.CheckState.Checked)
            node_pasta.setData(0, Qt.ItemDataRole.UserRole, dir_path)
            node_pasta.setExpanded(True)
            self.mapa_pastas_origem_nos[dir_path] = node_pasta

            for arq in arqs:
                node_arq = QTreeWidgetItem(
                    node_pasta, [f"📄 {arq.nome_arquivo}", formatar_tamanho(arq.tamanho_bytes)]
                )
                node_arq.setIcon(0, ProviderIcones.obter_icone_categoria(arq.categoria))
                node_arq.setFlags(node_arq.flags() | Qt.ItemFlag.ItemIsUserCheckable)
                node_arq.setCheckState(
                    0, Qt.CheckState.Checked if arq.marcado else Qt.CheckState.Unchecked
                )
                node_arq.setData(0, Qt.ItemDataRole.UserRole, arq)
                self.mapa_nos_origem[id(arq)] = node_arq

        self.tree_origem.blockSignals(False)

    def _popular_arvore_destino(self) -> None:
        """Popula a árvore da direita agrupada por subpastas propostas da Pasta Matriz."""
        self.tree_destino.blockSignals(True)
        self.tree_destino.clear()
        self.mapa_nos_destino.clear()
        self.mapa_pastas_destino_nos.clear()

        # Nó Matriz Raiz
        node_raiz = QTreeWidgetItem(
            self.tree_destino, [f"📦 [MATRIZ] {self.nome_pasta_matriz}", ""]
        )
        node_raiz.setIcon(0, ProviderIcones.obter_icone_categoria("pasta"))
        node_raiz.setExpanded(True)

        for pasta_prop in self.resultado.pastas:
            lbl_pasta = (
                f"📁 {pasta_prop.nome_pasta} ({pasta_prop.quantidade_arquivos} arquivos - "
                f"{formatar_tamanho(pasta_prop.tamanho_total_bytes)})"
            )
            node_pasta = QTreeWidgetItem(
                node_raiz,
                [lbl_pasta, formatar_tamanho(pasta_prop.tamanho_total_bytes)],
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
            self.mapa_pastas_destino_nos[id(pasta_prop)] = node_pasta

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
                self.mapa_nos_destino[id(arq)] = node_arq

        # Sobredimensionados
        if self.resultado.arquivos_sobredimensionados:
            qtd_sob = len(self.resultado.arquivos_sobredimensionados)
            node_alerta = QTreeWidgetItem(
                self.tree_destino,
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
                        f"🛑 {arq.nome_arquivo} (Excede o limite)",
                        formatar_tamanho(arq.tamanho_bytes),
                    ],
                )
                node_arq_sob.setForeground(0, QBrush(QColor(255, 180, 180)))
                node_arq_sob.setData(0, Qt.ItemDataRole.UserRole, arq)
                self.mapa_nos_destino[id(arq)] = node_arq_sob

        self.tree_destino.blockSignals(False)

    def _on_tree_origem_changed(self, item: QTreeWidgetItem, column: int) -> None:
        if column != 0:
            return
        self._sincronizar_bilateral(origem_is_esquerda=True, item=item)

    def _on_tree_destino_changed(self, item: QTreeWidgetItem, column: int) -> None:
        if column != 0:
            return
        self._sincronizar_bilateral(origem_is_esquerda=False, item=item)

    def _sincronizar_bilateral(self, origem_is_esquerda: bool, item: QTreeWidgetItem) -> None:
        """Sincroniza estados de seleção entre a árvore da Origem e do Destino sem loops."""
        self.tree_origem.blockSignals(True)
        self.tree_destino.blockSignals(True)

        data = item.data(0, Qt.ItemDataRole.UserRole)
        state = item.checkState(0)
        is_checked = state == Qt.CheckState.Checked

        # Se for alteração em uma pasta
        if isinstance(data, str) or isinstance(data, PastaProposta):
            for i in range(item.childCount()):
                child = item.child(i)
                child.setCheckState(
                    0, Qt.CheckState.Checked if is_checked else Qt.CheckState.Unchecked
                )
                child_arq = child.data(0, Qt.ItemDataRole.UserRole)
                if isinstance(child_arq, Arquivo):
                    child_arq.marcado = is_checked
                    # Atualiza o nó espelho do outro lado
                    node_espelho = (
                        self.mapa_nos_destino.get(id(child_arq))
                        if origem_is_esquerda
                        else self.mapa_nos_origem.get(id(child_arq))
                    )
                    if node_espelho:
                        node_espelho.setCheckState(
                            0, Qt.CheckState.Checked if is_checked else Qt.CheckState.Unchecked
                        )

        # Se for alteração em um arquivo individual
        elif isinstance(data, Arquivo):
            data.marcado = is_checked
            node_espelho = (
                self.mapa_nos_destino.get(id(data))
                if origem_is_esquerda
                else self.mapa_nos_origem.get(id(data))
            )
            if node_espelho:
                node_espelho.setCheckState(
                    0, Qt.CheckState.Checked if is_checked else Qt.CheckState.Unchecked
                )

        self._atualizar_estados_pastas_pai()
        self._atualizar_metricas()

        self.tree_origem.blockSignals(False)
        self.tree_destino.blockSignals(False)

    def _atualizar_estados_pastas_pai(self) -> None:
        """Atualiza a caixa de seleção de cada pasta pai (Checked / Unchecked / Partial)."""
        for pasta_node in self.mapa_pastas_origem_nos.values():
            self._atualizar_pasta_node_state(pasta_node)

        for pasta_node in self.mapa_pastas_destino_nos.values():
            self._atualizar_pasta_node_state(pasta_node)

    def _atualizar_pasta_node_state(self, node: QTreeWidgetItem) -> None:
        child_count = node.childCount()
        if child_count == 0:
            return

        checked_count = sum(
            1 for i in range(child_count) if node.child(i).checkState(0) == Qt.CheckState.Checked
        )
        if checked_count == child_count:
            node.setCheckState(0, Qt.CheckState.Checked)
        elif checked_count == 0:
            node.setCheckState(0, Qt.CheckState.Unchecked)
        else:
            node.setCheckState(0, Qt.CheckState.PartiallyChecked)

    def _atualizar_metricas(self) -> None:
        todos_arquivos: List[Arquivo] = []
        for p in self.resultado.pastas:
            todos_arquivos.extend(p.arquivos)

        alocados_marcados = [a for a in todos_arquivos if a.marcado]
        bytes_marcados = sum(a.tamanho_bytes for a in alocados_marcados)
        total_alocados = len(todos_arquivos)

        self.lbl_arquivos.setText(
            f"📄 Arquivos alocados: <b>{len(alocados_marcados)}</b> de <b>{total_alocados}</b> "
            f"({formatar_tamanho(bytes_marcados)})"
        )

    def _filtrar_arvores(self, texto: str) -> None:
        """Filtra os nós das duas árvores em tempo real conforme a digitação."""
        term = texto.strip().lower()

        for tree in (self.tree_origem, self.tree_destino):
            root_count = tree.topLevelItemCount()
            for i in range(root_count):
                parent_node = tree.topLevelItem(i)
                if parent_node:
                    self._filtrar_noh_recursivo(parent_node, term)

    def _filtrar_noh_recursivo(self, node: QTreeWidgetItem, term: str) -> bool:
        """Retorna True se o nó ou algum dos seus filhos correspondem à busca."""
        if not term:
            node.setHidden(False)
            for i in range(node.childCount()):
                self._filtrar_noh_recursivo(node.child(i), term)
            return True

        node_text = node.text(0).lower()
        match_self = term in node_text

        child_match = False
        for i in range(node.childCount()):
            if self._filtrar_noh_recursivo(node.child(i), term):
                child_match = True

        visible = match_self or child_match
        node.setHidden(not visible)
        if visible and child_match:
            node.setExpanded(True)

        return visible

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

    def _toggle_expandir_pastas(self) -> None:
        """Alterna entre expandir e recolher todas as pastas nas duas árvores."""
        if self._pastas_expandidas:
            self.tree_origem.collapseAll()
            self.tree_destino.collapseAll()
            self.btn_toggle_expandir.setText("📂 Expandir Tudo")
            self._pastas_expandidas = False
        else:
            self.tree_origem.expandAll()
            self.tree_destino.expandAll()
            self.btn_toggle_expandir.setText("📁 Recolher Tudo")
            self._pastas_expandidas = True

    def _toggle_marcar_todos(self) -> None:
        """Alterna entre marcar e desmarcar todos os itens em ambas as árvores."""
        self.tree_origem.blockSignals(True)
        self.tree_destino.blockSignals(True)

        novo_estado = not self._todos_marcados
        state_enum = Qt.CheckState.Checked if novo_estado else Qt.CheckState.Unchecked

        todos_os_arquivos: List[Arquivo] = []
        for p in self.resultado.pastas:
            todos_os_arquivos.extend(p.arquivos)
        todos_os_arquivos.extend(self.resultado.arquivos_sobredimensionados)

        for arq in todos_os_arquivos:
            arq.marcado = novo_estado
            node_orig = self.mapa_nos_origem.get(id(arq))
            if node_orig:
                node_orig.setCheckState(0, state_enum)
            node_dest = self.mapa_nos_destino.get(id(arq))
            if node_dest:
                node_dest.setCheckState(0, state_enum)

        self._atualizar_estados_pastas_pai()
        self._atualizar_metricas()

        self.tree_origem.blockSignals(False)
        self.tree_destino.blockSignals(False)

        self._todos_marcados = novo_estado
        if novo_estado:
            self.btn_toggle_marcar.setText("☐ Desmarcar Todos")
        else:
            self.btn_toggle_marcar.setText("☑️ Marcar Todos")
