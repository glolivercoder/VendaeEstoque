@echo off
echo Iniciando o n8n versao 1.88.0 com MCP integrado...
wsl -e docker start n8n-mcp-simple
echo.
echo n8n iniciado na porta 5679!
echo URL: http://localhost:5679
echo Usuario: admin
echo Senha: admin
echo.
echo Pressione qualquer tecla para continuar...
pause > nul
