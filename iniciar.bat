@echo off
title Iniciar Reinos e Masmorras (Modo Tibia)
echo ===================================================
echo    Iniciando Reinos ^& Masmorras (D^&D 5e Online)
echo ===================================================
echo.
echo 1. Compilando as ultimas alteracoes (npm run build)...
call npm run build
echo.
echo 2. Iniciando Servidor Backend (Porta 3001)...
start "Servidor Backend (Porta 3001)" cmd /k "cd /d %~dp0 && npm run server"
timeout /t 2 /nobreak >nul
echo.
echo 3. Iniciando Cliente Frontend (Vite)...
start "Cliente Frontend (Vite)" cmd /k "cd /d %~dp0 && npm run dev"
timeout /t 2 /nobreak >nul
echo.
echo 4. Abrindo navegador em http://localhost:5173...
start http://localhost:5173
echo.
echo Tudo pronto! Para jogar, mantenha as janelas do servidor e do frontend abertas.
pause
