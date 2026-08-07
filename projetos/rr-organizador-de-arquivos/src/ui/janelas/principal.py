import os
from typing import List, Optional

from PySide6.QtCore import Qt, QThread, Signal
from PySide6.QtWidgets import (
    QComboBox,
    QFileDialog,
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QMainWindow,
    QMessageBox,
    QProgressDialog,
    QPushButton,
    QRadioButton,
    QSpinBox,
    QTabWidget,
    QVBoxLayout,
    QWidget,
)

from src.dados.repositorio import RepositorioArquivo, RepositorioSessao
from src.modelos.arquivo import Arquivo
from src.modelos.sessao import Sessao
from src.servicos.desfazer import ServicoDesfazer
from src.servicos.divisor import ResultadoDivisao, ServicoDivisor
from src.servicos.movimentador import ServicoMovimentador
from src.servicos.scanner import ServicoScanner
from src.ui.componentes.gerenciar_extensoes import DialogGerenciarExtensoes
from src.ui.componentes.icones import ProviderIcones
from src.ui.componentes.preview_simulacao import DialogPreviewSimulacao
from src.ui.componentes.tabela_arquivos import TabelaArquivos, formatar_tamanho
from src.ui.componentes.toast import ToastNotification


class WorkerScanner(QThread):
    """Thread em segundo plano para varredura de pastas com sinal de progresso."""

    progresso = Signal(int, str)
    concluido = Signal(object, list)
    erro = Signal(str)

    def __init__(self, scanner: ServicoScanner, caminho_raiz: str, forcar_rescan: bool = False):
        super().__init__()
        self.scanner = scanner
        self.caminho_raiz = caminho_raiz
        self.forcar_rescan = forcar_rescan

    def run(self) -> None:
        try:

            def cb(count: int, filename: str) -> None:
                self.progresso.emit(count, filename)

            sessao, arquivos = self.scanner.escanear_pasta(
                self.caminho_raiz, forcar_rescan=self.forcar_rescan, progresso_cb=cb
            )
            self.concluido.emit(sessao, arquivos)
        except Exception as e:
            self.erro.emit(str(e))


class WorkerMovimentador(QThread):
    """Thread em segundo plano para movimentação de arquivos com sinal de progresso."""

    progresso = Signal(int, int, str)
    concluido = Signal()
    erro = Signal(str)

    def __init__(
        self,
        movimentador: ServicoMovimentador,
        resultado: ResultadoDivisao,
        caminho_matriz: str,
        limpar_origem: bool = True,
    ):
        super().__init__()
        self.movimentador = movimentador
        self.resultado = resultado
        self.caminho_matriz = caminho_matriz
        self.limpar_origem = limpar_origem

    def run(self) -> None:
        try:

            def cb(atual: int, total: int, nome: str) -> None:
                self.progresso.emit(atual, total, nome)

            self.movimentador.executar_movimentacao(
                resultado_divisao=self.resultado,
                caminho_matriz_destino=self.caminho_matriz,
                limpar_pastas_origem_vazias=self.limpar_origem,
                progresso_cb=cb,
            )
            self.concluido.emit()
        except Exception as e:
            self.erro.emit(str(e))


class WorkerDesfazer(QThread):
    """Thread em segundo plano para desfazimento de sessão com sinal de progresso."""

    progresso = Signal(int, int, str)
    concluido = Signal(int)
    erro = Signal(str)

    def __init__(self, desfazer: ServicoDesfazer, sessao_id: int):
        super().__init__()
        self.desfazer = desfazer
        self.sessao_id = sessao_id

    def run(self) -> None:
        try:

            def cb(atual: int, total: int, nome: str) -> None:
                self.progresso.emit(atual, total, nome)

            total_revertidos = self.desfazer.desfazer_sessao(
                sessao_id=self.sessao_id, progresso_cb=cb
            )
            self.concluido.emit(total_revertidos)
        except Exception as e:
            self.erro.emit(str(e))


class JanelaPrincipal(QMainWindow):
    """Janela Principal da aplicação RR Organizador de Arquivos."""

    def __init__(self):
        super().__init__()
        self.setWindowTitle("RR Organizador de Arquivos")
        self.resize(1100, 750)

        self.repo_sessao = RepositorioSessao()
        self.repo_arquivo = RepositorioArquivo()
        self.scanner = ServicoScanner(self.repo_sessao, self.repo_arquivo)

        self.sessao_atual: Optional[Sessao] = None
        self.todos_arquivos: List[Arquivo] = []

        self._construir_interface()
        self._carregar_sessoes_recentes()

    def _construir_interface(self) -> None:
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        layout_principal = QVBoxLayout(central_widget)

        # --- BARRA SUPERIOR: Seleção de Pasta & Dashboard ---
        box_topo = QGroupBox("Varredura e Sessões Recentes")
        layout_topo = QHBoxLayout(box_topo)

        self.txt_caminho_raiz = QLineEdit()
        self.txt_caminho_raiz.setPlaceholderText("Selecione a pasta para escanear...")
        btn_procurar = QPushButton("📁 Procurar")
        btn_procurar.setObjectName("btn_secundario")
        btn_procurar.clicked.connect(self._selecionar_pasta)

        self.btn_escanear = QPushButton("🔍 Escanear Pasta")
        self.btn_escanear.clicked.connect(lambda: self._iniciar_escaneamento(forcar=False))

        self.btn_rescan = QPushButton("🔄 Re-scan")
        self.btn_rescan.setObjectName("btn_secundario")
        self.btn_rescan.clicked.connect(lambda: self._iniciar_escaneamento(forcar=True))

        btn_extensoes = QPushButton("⚙️ Extensões")
        btn_extensoes.setObjectName("btn_secundario")
        btn_extensoes.clicked.connect(self._abrir_gerenciar_extensoes)

        self.combo_sessoes = QComboBox()
        self.combo_sessoes.setMinimumWidth(200)
        self.combo_sessoes.currentIndexChanged.connect(self._on_sessao_selecionada)
        self.combo_sessoes.activated.connect(self._on_sessao_selecionada)

        layout_topo.addWidget(self.txt_caminho_raiz, stretch=3)
        layout_topo.addWidget(btn_procurar)
        layout_topo.addWidget(self.btn_escanear)
        layout_topo.addWidget(self.btn_rescan)
        layout_topo.addWidget(btn_extensoes)
        layout_topo.addWidget(QLabel("Sessões:"))
        layout_topo.addWidget(self.combo_sessoes, stretch=2)

        layout_principal.addWidget(box_topo)

        # --- ÁREA CENTRAL: TABELAS CATEGORIZADAS ---
        self.tabs_categorias = QTabWidget()

        self.tab_videos = TabelaArquivos()
        self.tab_audios = TabelaArquivos()
        self.tab_imagens = TabelaArquivos()
        self.tab_documentos = TabelaArquivos()
        self.tab_atipicos = TabelaArquivos()

        # Conecta sinal de alteração nos checkboxes
        for tab in [
            self.tab_videos,
            self.tab_audios,
            self.tab_imagens,
            self.tab_documentos,
            self.tab_atipicos,
        ]:
            tab.marcado_alterado.connect(self._recalcular_totais)

        self.tabs_categorias.addTab(
            self.tab_videos, ProviderIcones.obter_icone_categoria("videos"), "Vídeos (0)"
        )
        self.tabs_categorias.addTab(
            self.tab_audios, ProviderIcones.obter_icone_categoria("audios"), "Áudios (0)"
        )
        self.tabs_categorias.addTab(
            self.tab_imagens, ProviderIcones.obter_icone_categoria("imagens"), "Imagens (0)"
        )
        self.tabs_categorias.addTab(
            self.tab_documentos,
            ProviderIcones.obter_icone_categoria("documentos"),
            "Documentos (0)",
        )
        self.tabs_categorias.addTab(
            self.tab_atipicos,
            ProviderIcones.obter_icone_categoria("atipicos"),
            "Formatos Atípicos (0)",
        )

        layout_principal.addWidget(self.tabs_categorias, stretch=1)

        # --- PAINEL INFERIOR: Regras de Divisão & Ações ---
        box_regras = QGroupBox("Regras de Organização e Pasta Concentradora Matriz")
        layout_regras = QVBoxLayout(box_regras)

        # Linha 1: Pasta Matriz Destino
        layout_matriz = QHBoxLayout()
        layout_matriz.addWidget(QLabel("Pasta Concentradora Matriz (Destino):"))
        self.txt_pasta_matriz = QLineEdit()
        self.txt_pasta_matriz.setPlaceholderText("Ex: Organizados_2026")
        btn_procurar_matriz = QPushButton("📂 Selecionar Destino")
        btn_procurar_matriz.setObjectName("btn_secundario")
        btn_procurar_matriz.clicked.connect(self._selecionar_pasta_matriz)

        layout_matriz.addWidget(self.txt_pasta_matriz, stretch=3)
        layout_matriz.addWidget(btn_procurar_matriz)
        layout_regras.addLayout(layout_matriz)

        # Linha 1.5: Nome Base Personalizado para Subpastas
        layout_nome_base = QHBoxLayout()
        layout_nome_base.addWidget(QLabel("Nome Base das Subpastas:"))
        self.txt_nome_base = QLineEdit()
        self.txt_nome_base.setPlaceholderText("Ex: Vídeos (ou Apresentações, Cursos, etc.)")
        layout_nome_base.addWidget(self.txt_nome_base, stretch=3)
        layout_regras.addLayout(layout_nome_base)

        # Linha 2: Algoritmo de Divisão
        layout_algos = QHBoxLayout()

        self.radio_qtd_arq = QRadioButton("A) Por Quantidade de Arquivos")
        self.spin_qtd_arq = QSpinBox()
        self.spin_qtd_arq.setRange(1, 10000)
        self.spin_qtd_arq.setValue(100)

        self.radio_qtd_pastas = QRadioButton("B) Por Número de Pastas")
        self.spin_qtd_pastas = QSpinBox()
        self.spin_qtd_pastas.setRange(1, 500)
        self.spin_qtd_pastas.setValue(5)

        self.radio_tamanho = QRadioButton("C) Por Tamanho Máximo (Crescente)")
        self.radio_tamanho.setChecked(True)
        self.spin_tamanho = QSpinBox()
        self.spin_tamanho.setRange(1, 100000)
        self.spin_tamanho.setValue(500)
        self.combo_unidade = QComboBox()
        self.combo_unidade.addItems(["MB", "GB", "KB"])

        layout_algos.addWidget(self.radio_qtd_arq)
        layout_algos.addWidget(self.spin_qtd_arq)
        layout_algos.addSpacing(20)
        layout_algos.addWidget(self.radio_qtd_pastas)
        layout_algos.addWidget(self.spin_qtd_pastas)
        layout_algos.addSpacing(20)
        layout_algos.addWidget(self.radio_tamanho)
        layout_algos.addWidget(self.spin_tamanho)
        layout_algos.addWidget(self.combo_unidade)
        layout_algos.addStretch()

        layout_regras.addLayout(layout_algos)
        layout_principal.addWidget(box_regras)

        # --- BARRA DE RODAPÉ & AÇÕES ---
        layout_rodape = QHBoxLayout()

        self.lbl_estatisticas = QLabel("Total Selecionado: 0 arquivos (0 B)")
        self.lbl_estatisticas.setStyleSheet("font-weight: bold; color: #38BDF8;")
        layout_rodape.addWidget(self.lbl_estatisticas)

        layout_rodape.addStretch()

        self.btn_simular = QPushButton("🌳 Simular Organização (Preview)")
        self.btn_simular.setObjectName("btn_secundario")
        self.btn_simular.clicked.connect(self._executar_simulacao)

        self.btn_executar = QPushButton("⚡ Executar Movimentação")
        self.btn_executar.clicked.connect(self._executar_movimentacao)

        self.btn_desfazer = QPushButton("↩ Desfazer Sessão")
        self.btn_desfazer.setObjectName("btn_perigo")
        self.btn_desfazer.clicked.connect(self._desfazer_sessao)

        layout_rodape.addWidget(self.btn_simular)
        layout_rodape.addWidget(self.btn_executar)
        layout_rodape.addWidget(self.btn_desfazer)

        layout_principal.addLayout(layout_rodape)

    def _selecionar_pasta(self) -> None:
        caminho = QFileDialog.getExistingDirectory(self, "Selecionar Pasta para Escanear")
        if caminho:
            self.txt_caminho_raiz.setText(caminho)

    def _selecionar_pasta_matriz(self) -> None:
        caminho = QFileDialog.getExistingDirectory(self, "Selecionar Pasta Matriz de Destino")
        if caminho:
            self.txt_pasta_matriz.setText(caminho)

    def _abrir_gerenciar_extensoes(self) -> None:
        dialog = DialogGerenciarExtensoes(self)
        if dialog.exec():
            if self.txt_caminho_raiz.text().strip():
                self._iniciar_escaneamento(forcar=True)

    def _iniciar_escaneamento(self, forcar: bool = False) -> None:
        caminho = self.txt_caminho_raiz.text().strip()
        if not caminho or not os.path.exists(caminho):
            QMessageBox.warning(
                self, "Pasta Inválida", "Por favor, selecione uma pasta válida para escanear."
            )
            return

        self.btn_escanear.setEnabled(False)
        self.btn_rescan.setEnabled(False)

        self.progress_dialog = QProgressDialog("Escaneando diretórios...", "", 0, 0, self)
        self.progress_dialog.setWindowTitle("Varredura de Arquivos")
        self.progress_dialog.setWindowModality(Qt.WindowModality.WindowModal)

        self.worker = WorkerScanner(self.scanner, caminho, forcar_rescan=forcar)
        self.worker.progresso.connect(
            lambda count, name: self.progress_dialog.setLabelText(
                f"Escaneando item {count}... ({name})"
            )
        )
        self.worker.concluido.connect(self._on_escaneamento_concluido)
        self.worker.erro.connect(self._on_escaneamento_erro)

        self.progress_dialog.show()
        self.worker.start()

    def _on_escaneamento_concluido(self, sessao: Sessao, arquivos: List[Arquivo]) -> None:
        if hasattr(self, "progress_dialog") and self.progress_dialog:
            self.progress_dialog.close()

        self.btn_escanear.setEnabled(True)
        self.btn_rescan.setEnabled(True)

        self.sessao_atual = sessao
        self.todos_arquivos = arquivos

        # Preenche pasta matriz padrão se vazia
        if not self.txt_pasta_matriz.text():
            matriz_padrao = os.path.join(sessao.caminho_raiz, "Arquivos_Organizados")
            self.txt_pasta_matriz.setText(matriz_padrao)

        self._popular_tabelas_categorias(arquivos)
        self._carregar_sessoes_recentes()
        self._calcular_divisao_atual()
        ToastNotification.exibir(self, "Escaneamento concluído com sucesso!")

    def _on_escaneamento_erro(self, mensagem_erro: str) -> None:
        if hasattr(self, "progress_dialog") and self.progress_dialog:
            self.progress_dialog.close()

        self.btn_escanear.setEnabled(True)
        self.btn_rescan.setEnabled(True)
        QMessageBox.critical(
            self, "Erro no Escaneamento", f"Ocorreu um erro ao escanear a pasta:\n{mensagem_erro}"
        )

    def _popular_tabelas_categorias(self, arquivos: List[Arquivo]) -> None:
        videos = [a for a in arquivos if a.categoria == "videos"]
        audios = [a for a in arquivos if a.categoria == "audios"]
        imagens = [a for a in arquivos if a.categoria == "imagens"]
        documentos = [a for a in arquivos if a.categoria == "documentos"]
        atipicos = [a for a in arquivos if a.categoria == "atipicos"]

        self.tab_videos.carregar_arquivos(videos)
        self.tab_audios.carregar_arquivos(audios)
        self.tab_imagens.carregar_arquivos(imagens)
        self.tab_documentos.carregar_arquivos(documentos)
        self.tab_atipicos.carregar_arquivos(atipicos)

        self.tabs_categorias.setTabText(0, f"Vídeos ({len(videos)})")
        self.tabs_categorias.setTabText(1, f"Áudios ({len(audios)})")
        self.tabs_categorias.setTabText(2, f"Imagens ({len(imagens)})")
        self.tabs_categorias.setTabText(3, f"Documentos ({len(documentos)})")
        self.tabs_categorias.setTabText(4, f"Formatos Atípicos ({len(atipicos)})")

        self._recalcular_totais()

    def _recalcular_totais(self) -> None:
        marcados = [a for a in self.todos_arquivos if a.marcado]
        total_bytes = sum(a.tamanho_bytes for a in marcados)
        sobredim = sum(1 for a in marcados if a.status_organizacao == "sobredimensionado")

        txt = f"Total Selecionado: {len(marcados)} arquivos ({formatar_tamanho(total_bytes)})"
        if sobredim > 0:
            txt += f" | 🛑 {sobredim} sobredimensionado(s) que ficarão de fora"

        self.lbl_estatisticas.setText(txt)

    def _carregar_sessoes_recentes(self) -> None:
        self.combo_sessoes.blockSignals(True)
        self.combo_sessoes.clear()

        self.combo_sessoes.addItem("-- Selecione uma Sessão --", None)

        sessoes = self.repo_sessao.listar_todas()
        for s in sessoes:
            nome_display = f"{s.caminho_raiz} ({s.data_scan[:10]})"
            self.combo_sessoes.addItem(nome_display, s.id)

        self.combo_sessoes.blockSignals(False)

    def _on_sessao_selecionada(self, index: int) -> None:
        sessao_id = self.combo_sessoes.currentData()
        if not sessao_id:
            return

        sessoes = self.repo_sessao.listar_todas()
        sessao_encontrada = next((s for s in sessoes if s.id == sessao_id), None)

        if sessao_encontrada:
            self.sessao_atual = sessao_encontrada
            self.txt_caminho_raiz.setText(sessao_encontrada.caminho_raiz)

            matriz = sessao_encontrada.pasta_matriz_destino or os.path.join(
                sessao_encontrada.caminho_raiz, "Arquivos_Organizados"
            )
            self.txt_pasta_matriz.setText(matriz)

            arquivos = self.repo_arquivo.listar_por_sessao(sessao_id)
            self.todos_arquivos = arquivos
            self._popular_tabelas_categorias(arquivos)
            self._calcular_divisao_atual()
            ToastNotification.exibir(
                self, f"Sessão carregada com sucesso: {sessao_encontrada.caminho_raiz}"
            )

    def _calcular_divisao_atual(self) -> ResultadoDivisao:
        """Calcula o resultado da divisão com base na aba/categoria ativa e regras."""
        idx_aba = self.tabs_categorias.currentIndex()
        cat_map = {0: "Vídeos", 1: "Áudios", 2: "Imagens", 3: "Documentos", 4: "Atípicos"}

        nome_digitado = self.txt_nome_base.text().strip()
        nome_base = nome_digitado if nome_digitado else cat_map.get(idx_aba, "Grupo")

        # Pega arquivos da categoria atual
        widget = self.tabs_categorias.currentWidget()
        if not isinstance(widget, TabelaArquivos):
            return ResultadoDivisao()

        tab_atual: TabelaArquivos = widget
        arquivos = tab_atual.arquivos_mapeados

        if self.radio_qtd_arq.isChecked():
            resultado = ServicoDivisor.dividir_por_quantidade_arquivos(
                arquivos, self.spin_qtd_arq.value(), nome_base
            )
        elif self.radio_qtd_pastas.isChecked():
            resultado = ServicoDivisor.dividir_por_quantidade_pastas(
                arquivos, self.spin_qtd_pastas.value(), nome_base
            )
        else:
            # Tamanho máximo
            unidade = self.combo_unidade.currentText()
            val = self.spin_tamanho.value()
            mult = (
                1024 * 1024
                if unidade == "MB"
                else (1024 * 1024 * 1024 if unidade == "GB" else 1024)
            )
            limite_bytes = val * mult

            resultado = ServicoDivisor.dividir_por_tamanho_maximo_crescente(
                arquivos, limite_bytes, nome_base
            )

        matriz = self.txt_pasta_matriz.text().strip() or (
            os.path.join(self.sessao_atual.caminho_raiz, "Arquivos_Organizados")
            if self.sessao_atual
            else "Arquivos_Organizados"
        )

        for pasta_prop in resultado.pastas:
            subpasta = os.path.join(matriz, pasta_prop.nome_pasta)
            for arq in pasta_prop.arquivos:
                arq.caminho_novo = os.path.join(subpasta, arq.nome_arquivo)

        tab_atual.carregar_arquivos(arquivos)
        return resultado

    def _executar_simulacao(self) -> None:
        if not self.todos_arquivos:
            QMessageBox.information(
                self, "Sem Arquivos", "Escaneie uma pasta antes de simular a organização."
            )
            return

        resultado = self._calcular_divisao_atual()
        matriz = self.txt_pasta_matriz.text().strip() or "Arquivos_Organizados"

        dialog = DialogPreviewSimulacao(resultado, matriz, self)
        if dialog.exec():
            widget = self.tabs_categorias.currentWidget()
            if isinstance(widget, TabelaArquivos):
                widget.carregar_arquivos(widget.arquivos_mapeados)
            self._recalcular_totais()

    def _executar_movimentacao(self) -> None:
        if not self.todos_arquivos or not self.sessao_atual:
            QMessageBox.information(
                self, "Sem Arquivos", "Escaneie uma pasta antes de executar a organização."
            )
            return

        caminho_matriz = self.txt_pasta_matriz.text().strip()
        if not caminho_matriz:
            QMessageBox.warning(
                self,
                "Pasta Matriz em Branco",
                "Por favor, especifique o caminho da Pasta Concentradora Matriz de destino.",
            )
            return

        resultado = self._calcular_divisao_atual()
        total_alocados = resultado.total_arquivos_alocados

        if total_alocados == 0:
            QMessageBox.information(
                self, "Nenhum Arquivo", "Não há arquivos marcados para movimentação."
            )
            return

        msg_confirm = (
            f"Tem certeza que deseja mover <b>{total_alocados}</b> arquivo(s) "
            f"para a Pasta Matriz:\n<b>{caminho_matriz}</b>?\n\n"
            "Esta ação reorganizará os arquivos fisicamente no disco."
        )

        resp = QMessageBox.question(
            self,
            "Confirmar Movimentação",
            msg_confirm,
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
            QMessageBox.StandardButton.Yes,
        )

        if resp != QMessageBox.StandardButton.Yes:
            return

        self.progress_dialog = QProgressDialog(
            "Iniciando movimentação...", "", 0, total_alocados, self
        )
        self.progress_dialog.setWindowTitle("Movimentação Física de Arquivos")
        self.progress_dialog.setWindowModality(Qt.WindowModality.WindowModal)

        movimentador = ServicoMovimentador(self.repo_sessao, self.repo_arquivo)
        self.worker_mov = WorkerMovimentador(
            movimentador=movimentador,
            resultado=resultado,
            caminho_matriz=caminho_matriz,
            limpar_origem=True,
        )

        def on_mov_progresso(atual: int, total: int, nome: str) -> None:
            self.progress_dialog.setValue(atual)
            self.progress_dialog.setLabelText(f"Movendo {atual} de {total}... ({nome})")

        self.worker_mov.progresso.connect(on_mov_progresso)
        self.worker_mov.concluido.connect(lambda: self._on_movimentacao_concluida(caminho_matriz))
        self.worker_mov.erro.connect(self._on_movimentacao_erro)

        self.progress_dialog.show()
        self.worker_mov.start()

    def _on_movimentacao_concluida(self, caminho_matriz: str) -> None:
        if hasattr(self, "progress_dialog") and self.progress_dialog:
            self.progress_dialog.close()

        if self.sessao_atual and self.sessao_atual.id is not None:
            self.repo_sessao.atualizar_matriz_destino(self.sessao_atual.id, caminho_matriz)
            arquivos_atualizados = self.repo_arquivo.listar_por_sessao(self.sessao_atual.id)
            self.todos_arquivos = arquivos_atualizados
            self._popular_tabelas_categorias(arquivos_atualizados)

        ToastNotification.exibir(
            self, "Registro salvo e movimentação física concluída com sucesso!"
        )

    def _on_movimentacao_erro(self, mensagem_erro: str) -> None:
        if hasattr(self, "progress_dialog") and self.progress_dialog:
            self.progress_dialog.close()

        ToastNotification.exibir(
            self, "Erro ao salvar e mover registro. Tente novamente.", sucesso=False
        )
        QMessageBox.critical(
            self,
            "Erro na Movimentação",
            f"Ocorreu um erro durante a movimentação:\n{mensagem_erro}",
        )

    def _desfazer_sessao(self) -> None:
        if not self.sessao_atual or self.sessao_atual.id is None:
            QMessageBox.information(
                self, "Sem Sessão", "Nenhuma sessão ativa selecionada para desfazer."
            )
            return

        sessao_id = self.sessao_atual.id

        resp = QMessageBox.question(
            self,
            "Confirmar Desfazer (Undo)",
            f"Tem certeza que deseja desfazer a organização da sessão:\n"
            f"<b>{self.sessao_atual.caminho_raiz}</b>?\n\n"
            "Todos os arquivos movidos retornarão aos seus locais de origem e as pastas "
            "de destino criadas no processo serão removidas. Esta ação não pode ser desfeita.",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
            QMessageBox.StandardButton.No,
        )

        if resp != QMessageBox.StandardButton.Yes:
            return

        self.progress_dialog = QProgressDialog("Iniciando reversão...", "", 0, 100, self)
        self.progress_dialog.setWindowTitle("Desfazendo Organização")
        self.progress_dialog.setWindowModality(Qt.WindowModality.WindowModal)

        desfazer = ServicoDesfazer(self.repo_sessao, self.repo_arquivo)
        self.worker_undo = WorkerDesfazer(desfazer=desfazer, sessao_id=sessao_id)

        def on_undo_progresso(atual: int, total: int, nome: str) -> None:
            if total > 0:
                self.progress_dialog.setMaximum(total)
            self.progress_dialog.setValue(atual)
            self.progress_dialog.setLabelText(f"Revertendo {atual} de {total}... ({nome})")

        self.worker_undo.progresso.connect(on_undo_progresso)
        self.worker_undo.concluido.connect(
            lambda total_rev: self._on_desfazer_concluido(sessao_id, total_rev)
        )
        self.worker_undo.erro.connect(self._on_desfazer_erro)

        self.progress_dialog.show()
        self.worker_undo.start()

    def _on_desfazer_concluido(self, sessao_id: int, total_revertidos: int) -> None:
        if hasattr(self, "progress_dialog") and self.progress_dialog:
            self.progress_dialog.close()

        arquivos_atualizados = self.repo_arquivo.listar_por_sessao(sessao_id)
        self.todos_arquivos = arquivos_atualizados
        self._popular_tabelas_categorias(arquivos_atualizados)

        ToastNotification.exibir(
            self, f"Registro desfeito com sucesso! ({total_revertidos} arquivos revertidos)"
        )

    def _on_desfazer_erro(self, mensagem_erro: str) -> None:
        if hasattr(self, "progress_dialog") and self.progress_dialog:
            self.progress_dialog.close()

        ToastNotification.exibir(self, "Erro ao desfazer registro. Tente novamente.", sucesso=False)
        QMessageBox.critical(
            self, "Erro no Desfazer", f"Ocorreu um erro ao desfazer a sessão:\n{mensagem_erro}"
        )
