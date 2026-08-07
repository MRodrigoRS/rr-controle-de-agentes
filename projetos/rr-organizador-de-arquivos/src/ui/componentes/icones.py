from PySide6.QtGui import QIcon
from PySide6.QtWidgets import QApplication, QStyle


class ProviderIcones:
    """Provedor de ícones temáticos para a interface gráfica."""

    _cache: dict = {}

    @classmethod
    def obter_icone_categoria(cls, categoria: str) -> QIcon:
        if categoria in cls._cache:
            return cls._cache[categoria]

        style = QApplication.style()
        if style is None:
            return QIcon()

        if categoria == "videos":
            icon = style.standardIcon(QStyle.StandardPixmap.SP_MediaPlay)
        elif categoria == "audios":
            icon = style.standardIcon(QStyle.StandardPixmap.SP_MediaVolume)
        elif categoria == "imagens":
            icon = style.standardIcon(QStyle.StandardPixmap.SP_FileDialogContentsView)
        elif categoria == "documentos":
            icon = style.standardIcon(QStyle.StandardPixmap.SP_FileIcon)
        elif categoria == "pasta":
            icon = style.standardIcon(QStyle.StandardPixmap.SP_DirIcon)
        else:
            icon = style.standardIcon(QStyle.StandardPixmap.SP_FileIcon)

        cls._cache[categoria] = icon
        return icon
