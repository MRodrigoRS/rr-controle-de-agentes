# Stack Tecnológica — RR Organizador De Arquivos

**Gerado em:** 2026-08-07

## Componentes

| Camada | Tecnologia | Versão | Justificativa |
|--------|------------|--------|---------------|
| Linguagem | Python | >= 3.12 | Performance moderna, tipagem estática robusta e suporte a dataclasses. |
| Interface Desktop | PySide6 (Qt 6) | >= 6.6.0 | Framework nativo Qt para interfaces desktop responsivas, ricas e multiplataforma. |
| Banco de Dados | SQLite | Nativo | Leve, monousuário, sem necessidade de servidores externos. |
| Gerenciador | uv | >= 0.11 | Instalação ultrarrápida de dependências e gerenciamento determinístico de venv. |
| Testes | pytest / pytest-qt | >= 8.0 / 4.4 | Suíte de testes unitários e de integração de UI headless. |
| Linters & Tipos | ruff / mypy | >= 0.3 / 1.9 | Verificação estática de código e tipagem rigorosa. |
| Packaging | PyInstaller | >= 6.5 | Compilação em executável standalone (`dist/RROrganizadorDeArquivos.exe`). |
