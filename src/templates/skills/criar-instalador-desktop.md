# Skill: Criar o Instalador Desktop

> Instrui o agente a empacotar o aplicativo desktop (PySide6) em executável
> standalone e, quando comercial, protegê-lo contra engenharia reversa e
> pirataria. Cobre os dois caminhos: **livre** (Nuitka) e **comercial**
> (Nuitka + PyArmor + Inno Setup).

## Quando Executar

- **Antes de distribuir** o produto ao usuário final
- **Após cada release** que altere código, dependências ou a lógica de licença
- **Sob demanda** — quando o usuário pedir "gerar o executável"

## Pré-requisitos

- `uv run` funcionando (todas as dependências instaladas)
- Aplicativo roda corretamente em desenvolvimento (`uv run python -m src.ui.main` ou entry point definido)
- Para o caminho comercial: `pyarmor` instalado (`uv add --dev pyarmor`)

## Caminho Livre (Nuitka)

Compila para executável standalone sem exigir Python instalado na máquina do usuário:

```bash
uv run python -m nuitka --standalone --windows-console-mode=disable \
  --enable-plugin=pyside6 --output-dir=dist src/ui/main.py
```

O executável sai em `dist/main/main.exe`. Agrupe a pasta em um ZIP ou gere um
instalador simples (Inno Setup opcional) e **teste em uma máquina limpa sem Python**.

## Caminho Comercial (Nuitka + PyArmor + Inno Setup)

### 1. Gere as Chaves de Licença (uma única vez)

```bash
pyarmor gen-key
pyarmor gen-machine --ipv4 --ipv6 --mac
```

> Guarde `pyarmor.key` e o certificado da máquina em local seguro (fora do
> repositório). A chave assina as licenças; sem ela não se emite novas.

### 2. Crie o Módulo de Licenciamento

Implemente a validação no código (ponto único, sem hardcode de segredo):

```python
# src/seguranca/licenca.py
import pyarmor
# valida a licença (vencimento, bind de hardware, trial) e levanta exceção se inválida
```

Regras:
- **Licença assinada** (HMAC/Ed25519) com vencimento e bind de hardware
- A validação roda **antes** do fluxo principal, em um ponto único
- **Nunca** embute a chave de assinatura ou uma flag "liberado" no binário —
  seria removida por engenharia reversa

### 3. Ofusque e Compile

```bash
pyarmor gen --pack dist/main src/seguranca   # ofusca o módulo de licença
uv run python -m nuitka --standalone --windows-console-mode=disable \
  --enable-plugin=pyside6 --output-dir=dist src/ui/main.py
```

O binário resultante mistura o código C compilado com o módulo ofuscado em
runtime — a combinação de mais difícil reversão prática em Python.

### 4. Instalador com Inno Setup

Crie `scripts/instalador.iss` instalando o executável, o registro (Start Menu),
desinstalador e atalho. Compile com `ISCC.exe`:

```bash
ISCC.exe scripts/instalador.iss
```

### 5. Teste em Máquina Limpa

- Máquina **sem Python instalado** e sem dependências
- Vencimento de licença expirada → app bloqueia com mensagem clara
- Licença copiada de outra máquina (bind de hardware) → app recusa
- Trial → contagem regressiva respeitada

## Registro

Após gerar, registre nas notas persistentes do `AGENTS.md`:

```
Scripts disponíveis:
- build.ps1 — compila o executável (Nuitka + PyArmor se comercial)
- instalador.iss — Inno Setup do instalador
```

## Regras

- **O produto final é o executável/instalador**, não o código-fonte. Teste
  sempre a distribuição, nunca apenas o `uv run`
- Caminho comercial: a proteção real é a **licença** (assinada, com vencimento
  e bind de hardware). O Nuitka + PyArmor apenas dificulta a análise
- **Nunca** hardcode validações de licença, chaves ou flags "pro" que possam
  ser descobertas e removidas do binário
- Distribua somente o conteúdo de `dist/` + o instalador — nunca o código-fonte
- A skill só existe em projetos desktop (presets `pyside6-desktop`). Para
  detalhes de licenciamento veja a regra `Distribuição Desktop` no `AGENTS.md`
