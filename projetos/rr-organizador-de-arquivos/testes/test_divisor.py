from src.modelos.arquivo import Arquivo
from src.servicos.divisor import ServicoDivisor


def criar_arquivo_fake(nome: str, tamanho: int, marcado: bool = True) -> Arquivo:
    return Arquivo(
        sessao_id=1,
        nome_arquivo=nome,
        caminho_original=f"/fake/{nome}",
        extensao=".mp4",
        tamanho_bytes=tamanho,
        marcado=marcado,
    )


def test_divisao_por_quantidade_arquivos():
    arquivos = [
        criar_arquivo_fake("a.mp4", 100),
        criar_arquivo_fake("b.mp4", 100),
        criar_arquivo_fake("c.mp4", 100),
        criar_arquivo_fake("d.mp4", 100),
        criar_arquivo_fake("e.mp4", 100),
    ]

    resultado = ServicoDivisor.dividir_por_quantidade_arquivos(
        arquivos, qtd_por_pasta=2, nome_base="Vídeos"
    )

    assert resultado.total_pastas_criadas == 3
    assert resultado.pastas[0].quantidade_arquivos == 2
    assert resultado.pastas[1].quantidade_arquivos == 2
    assert resultado.pastas[2].quantidade_arquivos == 1


def test_divisao_por_quantidade_pastas():
    arquivos = [
        criar_arquivo_fake("a.mp4", 100),
        criar_arquivo_fake("b.mp4", 100),
        criar_arquivo_fake("c.mp4", 100),
    ]

    resultado = ServicoDivisor.dividir_por_quantidade_pastas(
        arquivos, total_pastas=2, nome_base="Fotos"
    )

    assert resultado.total_pastas_criadas == 2
    assert resultado.pastas[0].quantidade_arquivos == 2
    assert resultado.pastas[1].quantidade_arquivos == 1


def test_divisao_por_tamanho_maximo_crescente():
    # limite de 500 bytes por pasta
    arquivos = [
        criar_arquivo_fake("gigante.mp4", 600),  # Sobredimensionado (> 500)
        criar_arquivo_fake("medio.mp4", 300),
        criar_arquivo_fake("pequeno1.mp4", 100),
        criar_arquivo_fake("pequeno2.mp4", 150),
    ]

    resultado = ServicoDivisor.dividir_por_tamanho_maximo_crescente(
        arquivos, limite_bytes_por_pasta=500, nome_base="Mídia"
    )

    # 1 arquivo sobredimensionado
    assert len(resultado.arquivos_sobredimensionados) == 1
    assert resultado.arquivos_sobredimensionados[0].nome_arquivo == "gigante.mp4"
    assert resultado.arquivos_sobredimensionados[0].status_organizacao == "sobredimensionado"

    # Arquivos válidos (100, 150, 300) ordenados crescentemente:
    # Pasta 1: pequeno1 (100) + pequeno2 (150) + medio (300) = 550 > 500.
    # Então Pasta 1 terá 100 + 150 = 250 bytes.
    # Pasta 2 terá medio (300 bytes).
    assert resultado.total_pastas_criadas == 2

    pasta1 = resultado.pastas[0]
    assert pasta1.tamanho_total_bytes == 250
    assert [a.nome_arquivo for a in pasta1.arquivos] == ["pequeno1.mp4", "pequeno2.mp4"]

    pasta2 = resultado.pastas[1]
    assert pasta2.tamanho_total_bytes == 300
    assert [a.nome_arquivo for a in pasta2.arquivos] == ["medio.mp4"]
