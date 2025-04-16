@echo off
echo Testando integração n8n com WordPress/WooCommerce e PDV Vendas

echo Instalando dependências...
npm install axios

echo Testando webhooks...
node test-n8n-webhooks.js

echo Processo concluído!
echo.
echo Para mais informações, consulte o arquivo n8n-integration-README.md

pause
