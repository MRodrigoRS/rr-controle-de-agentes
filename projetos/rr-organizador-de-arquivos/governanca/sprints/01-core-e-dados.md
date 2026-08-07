---
status: concluida
ultima_modificacao: 2026-08-07
sessao_atual: 1
---

# Sprint 1: Core de Dados, Scanner e Algoritmos de Divisão — RR Organizador De Arquivos

**Objetivo:** Estabelecer a infraestrutura base do projeto Python (ambiente, scripts auxiliares), o modelo e conexão do banco de dados SQLite, o scanner de arquivos leves e a nova lógica de divisão por tamanho (do menor para o maior com alerta de arquivos que estouram o limite) com testes automatizados.

---

## Etapas

### Etapa 1: Setup do Ambiente e Scripts Auxiliares

**Objetivo:** Inicializar as configurações do projeto em Python (`pyproject.toml`, `pytest`, `ruff`, `mypy`) e criar os scripts utilitários em `governanca/scripts/`.

**Tarefas:**
- [x] Criar `pyproject.toml` configurando dependências (`PySide6`, `pytest`, `pytest-qt`, `ruff`, `mypy`).
- [x] Criar os scripts PowerShell em `governanca/scripts/`: `dev.ps1`, `test.ps1`, `lint.ps1`, `format.ps1`, `typecheck.ps1`.
- [x] Instalar dependências no ambiente virtual via `uv sync` e validar a suíte básica.

### Etapa 2: Banco de Dados SQLite (Dados e Modelos)

**Objetivo:** Criar a camada de persistência local SQLite em `src/dados/` e `src/modelos/`.

**Tarefas:**
- [x] Criar conexão com SQLite nativo em `src/dados/conexao.py` (`dados_organizador.db`).
- [x] Criar schema e DDL das tabelas `Sessoes` e `Arquivos`.
- [x] Criar repositórios/DAOs em `src/dados/repositorio.py` com suporte a inserção em lote (`bulk_insert`).

### Etapa 3: Serviço de Escaneamento (Scanner)

**Objetivo:** Implementar a varredura recursiva de diretórios gravando metadados leves no SQLite.

**Tarefas:**
- [x] Implementar `src/servicos/scanner.py` (`os.walk` extraindo Nome, Extensão, Caminho Original e Tamanho em bytes).
- [x] Implementar funcionalidade de Re-scan (sincronização de arquivos adicionados/removidos no SO).

### Etapa 4: Algoritmos de Divisão e Tratamento de Excedentes

**Objetivo:** Implementar os algoritmos de divisão física de arquivos em `src/servicos/divisor.py`.

**Tarefas:**
- [x] Lógica A (por quantidade de arquivos por pasta).
- [x] Lógica B (por quantidade fixa de pastas).
- [x] Lógica C (por tamanho máximo, ordenando do menor para o maior): arquivos menores preenchem a pasta; se o próximo estoura, fecha a pasta e abre a próxima.
- [x] Identificação e flag nos arquivos cujo tamanho individual é maior do que o limite da pasta (status de sobredimensionado para alerta em cor na UI).

---

## Andamento

- [x] Etapa em andamento
- [x] Testes passando
- [x] Código revisado

---

## Instruções ao Agente

1. Execute cada tarefa em ordem.
2. Escreva os testes em `testes/` à medida que implementa os módulos backend.
3. Ao finalizar, atualize `status: concluida`.

---

## Conclusão

**Mensagem de commit sugerida:**
```
sprint-1: setup do ambiente, banco sqlite, scanner e algoritmos de divisão
```

---

## Aprendizados e Decisões

### Aprendizados Técnicos
- Configuração do `hatchling` com `packages = ["src"]` em `pyproject.toml` para empacotamento correto com `uv`.
- Uso do SQLite com `PRAGMA foreign_keys = ON` e inserção em lote (`executemany`) para máxima performance em varreduras de grandes quantidades de arquivos.

### Decisões de Design Confirmadas
- A Lógica C ordena os arquivos do menor para o maior antes do empacotamento ganancioso (Greedy Ascending), marcando arquivos com tamanho maior que o limite da pasta com o status `sobredimensionado` em vez de abortar o processo.
