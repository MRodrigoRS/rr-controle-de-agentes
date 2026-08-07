#!/usr/bin/env pwsh
# governanca/scripts/lint.ps1
# Executa a verificação de linter com ruff
# Uso: ./governanca/scripts/lint.ps1

$ErrorActionPreference = "Stop"
Write-Host "=== Verificando Código (ruff check) ===" -ForegroundColor Cyan

uv run ruff check .

Write-Host "=== Linter Concluído ===" -ForegroundColor Green
