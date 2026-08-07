# Visão Geral da Arquitetura — RR Organizador De Arquivos

**Projeto:** RR Organizador De Arquivos
**Gerado em:** 2026-08-07
**Última Atualização:** 2026-08-07

## Stack

- **GUI / Desktop:** Python 3.12 + PySide6 (Qt6) + QSS Stylesheet
- **Persistência Local:** SQLite (`dados_organizador.db` na raiz)
- **Gerenciador de Dependências:** `uv`
- **Qualidade & Testes:** `pytest`, `pytest-qt`, `ruff`, `mypy`
- **Build / Packaging:** `pyinstaller`

## Estrutura de Diretórios

```
src/
├── dados/         ← conexões SQLite e repositórios DAO (bulk insert)
├── modelos/       ← dataclasses de entidades (Sessao, Arquivo)
├── servicos/      ← serviços de negócio (Scanner, Divisor, Movimentador, Desfazer)
├── recursos/      ← folhas de estilo QSS (estilo.qss)
└── ui/
    ├── main.py    ← ponto de entrada QApplication
    ├── janelas/   ← janela principal (JanelaPrincipal)
    └── componentes/ ← tabela categorizada, dialog de simulação, toast e ícones
```

## Decisões Arquiteturais

1. **Separação de Camadas**: Interface desacoplada da lógica de negócios e do banco de dados (DAOs em `src/dados`, serviços em `src/servicos`).
2. **Scanner Não Bloqueante**: Execução da varredura em `QThread` dedicada (`WorkerScanner`) para manter a UI fluida.
3. **Persistência Atômica e Rastreável**: Todo arquivo processado é associado a um `caminho_original` e `caminho_novo` no SQLite, garantindo suporte ao **Desfazer (Undo)** seguro.
4. **Algoritmo de Divisão Ganancioso Crescente (Greedy Ascending)**: Ordenação do menor para o maior arquivo com marcação visual de alerta (vermelho) para arquivos que sobredimensionam o limite da pasta.
