@echo off
title RR Controle de Agentes 1.1
cd /d "%~dp0"
echo Abrindo http://localhost:3000 ...
start http://localhost:3000
echo Iniciando servidor...
npm run dev
pause
