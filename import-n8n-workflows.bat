@echo off
echo Importando workflows para o n8n...
echo.
echo IMPORTANTE: Siga estas instruções para importar os workflows:
echo.
echo 1. Abra o n8n no navegador: http://localhost:5679
echo 2. Faça login com as credenciais (admin/admin)
echo 3. Clique em "Workflows" no menu lateral
echo 4. Clique no botão "Import from File"
echo 5. Selecione os arquivos da pasta "n8n-exports" um por um:
echo    - product-sync-workflow.json
echo    - inventory-sync-woo-to-pdv-workflow.json
echo    - inventory-sync-pdv-to-woo-workflow.json
echo    - ai-manager-workflow.json
echo    - product-analysis-workflow.json
echo    - woocommerce-mcp-workflow.json
echo    - woocommerce-mcp-stock-workflow.json
echo 6. Para cada workflow importado, clique em "Save" e depois em "Activate"
echo.
echo Após importar todos os workflows, você terá os seguintes webhooks disponíveis:
echo.
echo Sincronização de Produtos: http://localhost:5679/webhook/pdv-vendas/produtos
echo Sincronização de Estoque (WooCommerce → PDV): http://localhost:5679/webhook/woocommerce/estoque
echo Sincronização de Estoque (PDV → WooCommerce): http://localhost:5679/webhook/pdv-vendas/estoque
echo Gerenciamento com IA: http://localhost:5679/webhook/pdv-vendas/ai-manager
echo Análise de Produtos: http://localhost:5679/webhook/pdv-vendas/analise-produto
echo Sincronização de Produtos via MCP: http://localhost:5679/webhook/pdv-vendas/mcp/produto
echo Sincronização de Estoque via MCP: http://localhost:5679/webhook/pdv-vendas/mcp/estoque
echo.

start http://localhost:5679

echo Pressione qualquer tecla para abrir a pasta com os arquivos de workflow...
pause > nul

explorer n8n-exports

echo Pressione qualquer tecla para sair...
pause > nul
