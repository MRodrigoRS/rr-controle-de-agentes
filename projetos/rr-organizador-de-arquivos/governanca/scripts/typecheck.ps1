#!/usr/bin/env pwsh
# governanca/scripts/typecheck.ps1
# Executa a verificação estática de tipos com mypy
# Uso: ./governanca/scripts/typecheck.ps1

$ErrorActionPreference = "Stop"
Write-Host "=== Verificando Tipos (mypy) ===" -ForegroundColor Cyan

uv run mypy src

Write-Host "=== Checagem de Tipos Concluída ===" -ForegroundColor Green
