@echo off
echo Iniciando todos os serviços necessários para a integração...

echo.
echo 1. Iniciando n8n...
start cmd /k "wsl -e docker start n8n-mcp-simple"

echo.
echo 2. Iniciando MCP Browser Tools...
start cmd /k "npx @agentdeskai/browser-tools-mcp@latest"

echo.
echo 3. Abrindo n8n no navegador...
timeout /t 5
start http://localhost:5679

echo.
echo Todos os serviços foram iniciados!
echo.
echo Serviços disponíveis:
echo - n8n: http://localhost:5679
echo - MCP Browser Tools: http://localhost:3025
echo.
echo Pressione qualquer tecla para sair...
pause > nul
