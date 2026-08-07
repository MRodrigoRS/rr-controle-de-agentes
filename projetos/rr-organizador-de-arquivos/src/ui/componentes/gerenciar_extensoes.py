from typing import Dict, Set

from PySide6.QtWidgets import (
    QDialog,
    QFormLayout,
    QGroupBox,
    QHBoxLayout,
    QLabel,
    QLineEdit,
    QMessageBox,
    QPushButton,
    QVBoxLayout,
)

from src.servicos.scanner import MAPA_EXTENSOES_CUSTOMIZADO


class DialogGerenciarExtensoes(QDialog):
    """Dialog para gerenciamento e customização de extensões por categoria."""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.setWindowTitle("⚙️ Gerenciar Extensões por Categoria")
        self.resize(550, 420)
        self.mapa_temp: Dict[str, Set[str]] = {
            cat: set(exts) for cat, exts in MAPA_EXTENSOES_CUSTOMIZADO.items()
        }

        self._construir_interface()

    def _construir_interface(self) -> None:
        layout_principal = QVBoxLayout(self)

        lbl_info = QLabel(
            "Adicione ou remova extensões separadas por vírgula para cada categoria.\n"
            "Arquivos com extensões adicionadas serão categorizados no próximo scan."
        )
        lbl_info.setWordWrap(True)
        layout_principal.addWidget(lbl_info)

        group = QGroupBox("Formato de Extensões (.ext)")
        form_layout = QFormLayout(group)

        self.input_videos = QLineEdit()
        self.input_videos.setText(", ".join(sorted(self.mapa_temp["videos"])))
        form_layout.addRow("🎬 Vídeos:", self.input_videos)

        self.input_audios = QLineEdit()
        self.input_audios.setText(", ".join(sorted(self.mapa_temp["audios"])))
        form_layout.addRow("🎵 Áudios:", self.input_audios)

        self.input_imagens = QLineEdit()
        self.input_imagens.setText(", ".join(sorted(self.mapa_temp["imagens"])))
        form_layout.addRow("🖼️ Imagens:", self.input_imagens)

        self.input_documentos = QLineEdit()
        self.input_documentos.setText(", ".join(sorted(self.mapa_temp["documentos"])))
        form_layout.addRow("📄 Documentos:", self.input_documentos)

        layout_principal.addWidget(group)

        # Botões
        layout_botoes = QHBoxLayout()
        btn_restaurar = QPushButton("↺ Restaurar Padrão")
        btn_restaurar.clicked.connect(self._restaurar_padrao)

        btn_salvar = QPushButton("💾 Salvar Alterações")
        btn_salvar.clicked.connect(self._salvar_alteracoes)

        btn_cancelar = QPushButton("Cancelar")
        btn_cancelar.clicked.connect(self.reject)

        layout_botoes.addWidget(btn_restaurar)
        layout_botoes.addStretch()
        layout_botoes.addWidget(btn_cancelar)
        layout_botoes.addWidget(btn_salvar)

        layout_principal.addLayout(layout_botoes)

    def _processar_input(self, texto: str) -> Set[str]:
        partes = [p.strip().lower() for p in texto.split(",") if p.strip()]
        resultado = set()
        for p in partes:
            if not p.startswith("."):
                p = "." + p
            resultado.add(p)
        return resultado

    def _restaurar_padrao(self) -> None:
        self.input_videos.setText(
            ".mp4, .mkv, .avi, .mov, .wmv, .flv, .webm, .m4v, .ts, .m2ts, .vob"
        )
        self.input_audios.setText(".mp3, .wav, .flac, .aac, .ogg, .m4a, .wma, .opus")
        self.input_imagens.setText(".jpg, .jpeg, .png, .gif, .bmp, .svg, .webp, .tiff, .ico, .heic")
        self.input_documentos.setText(
            ".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .csv, .odt, .rtf"
        )

    def _salvar_alteracoes(self) -> None:
        MAPA_EXTENSOES_CUSTOMIZADO["videos"] = self._processar_input(self.input_videos.text())
        MAPA_EXTENSOES_CUSTOMIZADO["audios"] = self._processar_input(self.input_audios.text())
        MAPA_EXTENSOES_CUSTOMIZADO["imagens"] = self._processar_input(self.input_imagens.text())
        MAPA_EXTENSOES_CUSTOMIZADO["documentos"] = self._processar_input(
            self.input_documentos.text()
        )

        QMessageBox.information(
            self,
            "Sucesso",
            "Configurações de extensões salvas com sucesso!\n"
            "Elas serão aplicadas no próximo escaneamento.",
        )
        self.accept()
