from typing import Optional

from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QColor
from PySide6.QtWidgets import QGraphicsDropShadowEffect, QHBoxLayout, QLabel, QWidget


class ToastNotification(QWidget):
    """Toast Notification customizado para feedback de operações."""

    def __init__(self, mensagem: str, sucesso: bool = True, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.SubWindow)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setAttribute(Qt.WidgetAttribute.WA_ShowWithoutActivating)

        layout = QHBoxLayout(self)
        layout.setContentsMargins(16, 12, 16, 12)

        lbl = QLabel(mensagem)
        cor_fundo = "#10B981" if sucesso else "#EF4444"
        lbl.setStyleSheet(
            f"""
            background-color: {cor_fundo};
            color: #FFFFFF;
            font-weight: bold;
            font-size: 13px;
            border-radius: 6px;
            padding: 8px 16px;
            """
        )
        layout.addWidget(lbl)

        # Sombra
        shadow = QGraphicsDropShadowEffect(self)
        shadow.setBlurRadius(15)
        shadow.setColor(QColor(0, 0, 0, 150))
        shadow.setYOffset(3)
        self.setGraphicsEffect(shadow)

        # Auto-destruição em 4 segundos (4000ms)
        QTimer.singleShot(4000, self.close)

    @classmethod
    def exibir(cls, parent: QWidget, mensagem: str, sucesso: bool = True) -> "ToastNotification":
        toast = cls(mensagem, sucesso, parent)
        # Posiciona no canto inferior direito do container pai
        parent_rect = parent.rect()
        toast.adjustSize()
        x = parent_rect.width() - toast.width() - 20
        y = parent_rect.height() - toast.height() - 20
        toast.move(x, y)
        toast.show()
        return toast
