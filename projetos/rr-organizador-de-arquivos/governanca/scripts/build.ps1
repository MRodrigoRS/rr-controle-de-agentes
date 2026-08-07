#!/usr/bin/env pwsh
# governanca/scripts/build.ps1
# Gera o executável standalone desktop da aplicação RR Organizador de Arquivos
# Uso: ./governanca/scripts/build.ps1

$ErrorActionPreference = "Stop"
Write-Host "=== Compilando Executável Desktop (PyInstaller) ===" -ForegroundColor Cyan

uv run pyinstaller --noconfirm --onedir --windowed `
    --name "RROrganizadorDeArquivos" `
    --add-data "src/recursos;src/recursos" `
    src/ui/main.py

Write-Host "=== Compilação Concluída! Executável gerado na pasta dist/ ===" -ForegroundColor Green
