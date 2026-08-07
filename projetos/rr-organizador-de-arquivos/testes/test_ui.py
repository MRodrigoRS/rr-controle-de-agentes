from src.modelos.arquivo import Arquivo
from src.servicos.divisor import PastaProposta, ResultadoDivisao
from src.ui.componentes.preview_simulacao import DialogPreviewSimulacao
from src.ui.componentes.tabela_arquivos import TabelaArquivos


def test_tabela_arquivos_carregamento(qtbot):
    tabela = TabelaArquivos()
    qtbot.addWidget(tabela)

    arquivos = [
        Arquivo(
            sessao_id=1,
            nome_arquivo="video1.mp4",
            caminho_original="/origem/video1.mp4",
            extensao=".mp4",
            tamanho_bytes=2048,
            categoria="videos",
            status_organizacao="pendente",
        ),
        Arquivo(
            sessao_id=1,
            nome_arquivo="foto_gigante.raw",
            caminho_original="/origem/foto_gigante.raw",
            extensao=".raw",
            tamanho_bytes=999999,
            categoria="imagens",
            status_organizacao="sobredimensionado",
        ),
    ]

    tabela.carregar_arquivos(arquivos)

    assert tabela.rowCount() == 2
    # Verifica item destacado (sobredimensionado) na coluna 4
    item_status = tabela.item(0, 4)  # Ordenado por tamanho decrescente, foto_gigante na linha 0
    assert item_status is not None
    assert "Sobredimensionado" in item_status.text()


def test_dialog_preview_simulacao(qtbot):
    resultado = ResultadoDivisao(
        pastas=[
            PastaProposta(
                nome_pasta="Vídeos - Parte 1",
                arquivos=[
                    Arquivo(
                        sessao_id=1,
                        nome_arquivo="filme.mp4",
                        caminho_original="/filme.mp4",
                        extensao=".mp4",
                        tamanho_bytes=1000,
                        categoria="videos",
                    )
                ],
            )
        ],
        arquivos_sobredimensionados=[
            Arquivo(
                sessao_id=1,
                nome_arquivo="gigante.mp4",
                caminho_original="/gigante.mp4",
                extensao=".mp4",
                tamanho_bytes=9000,
                status_organizacao="sobredimensionado",
            )
        ],
    )

    dialog = DialogPreviewSimulacao(resultado, "Minha_Matriz")
    qtbot.addWidget(dialog)

    assert "Simulação Prévia da Organização" in dialog.windowTitle()
    assert dialog.tree_destino.topLevelItemCount() == 2  # Raiz + Nó de Alerta Sobredimensionado
    assert dialog.tree_origem.topLevelItemCount() == 1  # Pasta de origem HD
