@echo off
echo Testando integração com o MCP de WooCommerce...

echo Instalando dependências...
npm install axios dotenv

echo Executando testes...
node test-woocommerce-mcp.js

echo Testes concluídos. Pressione qualquer tecla para sair...
pause > nul
