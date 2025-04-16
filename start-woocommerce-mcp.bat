@echo off
echo Iniciando MCP do WooCommerce...

echo Verificando se o MCP Browser Tools esta em execucao...
npx @agentdeskai/browser-tools-mcp@latest status

if %ERRORLEVEL% NEQ 0 (
  echo Iniciando MCP Browser Tools...
  start /B npx @agentdeskai/browser-tools-mcp@latest
  timeout /t 5
)

echo Abrindo o site do WooCommerce...
start https://achadinhoshopp.com.br/loja/wp-admin/edit.php?post_type=product

echo Configurando integracao com o WooCommerce...
echo Por favor, aguarde enquanto o MCP e configurado...

echo Processo concluido!
echo Para mais informacoes, consulte o arquivo woocommerce-mcp-README.md

pause
