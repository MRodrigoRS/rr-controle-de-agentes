import sys
from pathlib import Path

from PySide6.QtWidgets import QApplication

from src.dados.conexao import inicializar_banco
from src.ui.janelas.principal import JanelaPrincipal


def carregar_qss(app: QApplication) -> None:
    """Carrega o stylesheet QSS para personalização da UI."""
    caminho_qss = Path(__file__).resolve().parent.parent / "recursos" / "estilo.qss"
    if caminho_qss.exists():
        with open(caminho_qss, "r", encoding="utf-8") as f:
            app.setStyleSheet(f.read())


def main() -> None:
    """Ponto de entrada principal da aplicação desktop PySide6."""
    # Inicializa o banco de dados SQLite nativo
    inicializar_banco()

    app = QApplication(sys.argv)
    app.setStyle("Fusion")
    carregar_qss(app)

    janela = JanelaPrincipal()
    janela.show()

    sys.exit(app.exec())


if __name__ == "__main__":
    main()
