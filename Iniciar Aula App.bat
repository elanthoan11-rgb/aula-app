@echo off
title Aula App
cd /d "%~dp0"

if not exist node_modules (
  echo Instalando dependencias, esto solo pasa la primera vez...
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo Hubo un problema instalando las dependencias.
    pause
    exit /b 1
  )
)

echo.
echo Iniciando Aula App...
echo El navegador se abrira automaticamente en unos segundos.
echo NO cierres esta ventana mientras uses la app.
echo Para salir, simplemente cierra esta ventana.
echo.

call npm run dev

echo.
echo La aplicacion se ha detenido.
pause
