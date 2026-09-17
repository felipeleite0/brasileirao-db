@echo off
setlocal

set "NODE_EXE=node"
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if not exist "%NODE_EXE%" if "%NODE_EXE%" NEQ "node" (
    echo Nao foi possivel encontrar o Node.js neste computador.
    pause
    exit /b 1
)

start "Brasileirao DB - Servidor" "%NODE_EXE%" src\server.js
timeout /t 2 /nobreak >nul
start "" http://127.0.0.1:3210
