@echo off
echo Configurando integração n8n com WordPress/WooCommerce e PDV Vendas

echo Instalando dependências...
npm install axios dotenv

echo Configurando credenciais...
node setup-n8n-credentials.js

echo Importando workflows...
node import-n8n-workflows.js

echo Processo concluído!
echo.
echo URLs dos webhooks:
echo Sincronização de Produtos: http://localhost:5679/webhook/pdv-vendas/produtos
echo Sincronização de Estoque (WooCommerce → PDV): http://localhost:5679/webhook/woocommerce/estoque
echo Sincronização de Estoque (PDV → WooCommerce): http://localhost:5679/webhook/pdv-vendas/estoque
echo Gerenciamento com IA: http://localhost:5679/webhook/pdv-vendas/ai-manager
echo Análise de Produtos: http://localhost:5679/webhook/pdv-vendas/analise-produto
echo.
echo Abra o n8n no navegador: http://localhost:5679

pause
