@echo off
echo Configurando integração com o MCP de WooCommerce...

echo Instalando dependências...
npm install axios dotenv

echo Executando script de integração...
node woocommerce-mcp-integration.js

echo Configuração concluída. Pressione qualquer tecla para sair...
pause > nul
