@echo off
echo Instalando dependências para integração n8n...

echo Instalando axios e dotenv...
npm install axios dotenv

echo Instalando MCP Browser Tools...
npm install -g @agentdeskai/browser-tools-mcp@latest

echo Dependências instaladas com sucesso!
echo.
echo Para iniciar a integração, execute:
echo start-all-services.bat
echo.
echo Ou usando npm:
echo npm run n8n:start
echo.

pause
