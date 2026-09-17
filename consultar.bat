@echo off
setlocal

set "NODE_EXE=node"
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if not exist "%NODE_EXE%" if "%NODE_EXE%" NEQ "node" (
    echo Nao foi possivel encontrar o Node.js neste computador.
    echo Abra o projeto no Codex para receber ajuda com a instalacao.
    pause
    exit /b 1
)

"%NODE_EXE%" src\app.js consultar
echo.
pause
