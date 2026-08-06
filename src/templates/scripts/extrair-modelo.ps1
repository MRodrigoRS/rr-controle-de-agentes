#!/usr/bin/env pwsh
# governanca/scripts/extrair-modelo.ps1
# Extrai o schema do banco PostgreSQL (via DATABASE_URL) e gera modelo-de-dados/
# Uso: ./governanca/scripts/extrair-modelo.ps1

$ErrorActionPreference = "Stop"
Write-Host "=== Extrair Modelo de Dados ===" -ForegroundColor Cyan

npx tsx governanca/scripts/extrair-modelo.ts

Write-Host "=== Concluído ===" -ForegroundColor Green
