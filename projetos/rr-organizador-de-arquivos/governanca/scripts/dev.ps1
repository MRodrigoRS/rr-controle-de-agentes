#!/usr/bin/env pwsh
# governanca/scripts/dev.ps1
# Inicia a aplicação RR Organizador de Arquivos em modo de desenvolvimento
# Uso: ./governanca/scripts/dev.ps1

$ErrorActionPreference = "Stop"
Write-Host "=== Iniciando RR Organizador de Arquivos (Dev) ===" -ForegroundColor Cyan

uv run python -m src.ui.main

Write-Host "=== Execução Concluída ===" -ForegroundColor Green
