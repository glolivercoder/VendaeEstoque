@echo off
echo Verificando o n8n no Docker...
wsl -e docker ps | findstr n8n
echo.
echo Verificando a versao do n8n no Docker...
wsl -e docker exec N8N n8n --version
echo.
pause
