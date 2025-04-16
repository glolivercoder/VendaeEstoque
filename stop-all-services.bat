@echo off
echo Parando todos os serviços...

echo.
echo 1. Parando n8n...
wsl -e docker stop n8n-mcp-simple

echo.
echo 2. Parando processos do MCP Browser Tools...
taskkill /f /im node.exe /fi "WINDOWTITLE eq *MCP Browser Tools*"

echo.
echo Todos os serviços foram parados!
echo.
echo Pressione qualquer tecla para sair...
pause > nul
