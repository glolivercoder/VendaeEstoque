@echo off
echo Testando integracao com o WooCommerce...

echo Verificando se o MCP Browser Tools esta em execucao...
npx @agentdeskai/browser-tools-mcp@latest status

if %ERRORLEVEL% NEQ 0 (
  echo Iniciando MCP Browser Tools...
  start /B npx @agentdeskai/browser-tools-mcp@latest
  timeout /t 5
)

echo Testando conexao com o WooCommerce...
node -e "const woocommerce = require('./src/services/woocommerce-mcp'); woocommerce.checkWooCommerceConnection().then(result => console.log(JSON.stringify(result, null, 2))).catch(err => console.error(err));"

echo Teste concluido!
pause
