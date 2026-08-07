#!/usr/bin/env pwsh
# governanca/scripts/format.ps1
# Executa a formatação de código com ruff format
# Uso: ./governanca/scripts/format.ps1

$ErrorActionPreference = "Stop"
Write-Host "=== Formatando Código (ruff format) ===" -ForegroundColor Cyan

uv run ruff format .

Write-Host "=== Formatação Concluída ===" -ForegroundColor Green
