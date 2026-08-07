#!/usr/bin/env pwsh
# governanca/scripts/test.ps1
# Executa os testes automatizados com pytest
# Uso: ./governanca/scripts/test.ps1

$ErrorActionPreference = "Stop"
Write-Host "=== Executando Testes Automatizados (pytest) ===" -ForegroundColor Cyan

uv run pytest

Write-Host "=== Testes Concluídos ===" -ForegroundColor Green
