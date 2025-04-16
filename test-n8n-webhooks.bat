@echo off
echo Testando webhooks do n8n...
echo.
echo Este script enviará requisições de teste para os webhooks do n8n.
echo Certifique-se de que os workflows estão importados e ativos antes de executar este teste.
echo.

echo Instalando dependências...
npm install axios

echo.
echo Testando webhook de sincronização de produtos...
curl -X POST "http://localhost:5679/webhook/pdv-vendas/produtos" -H "Content-Type: application/json" -d "{\"nome\":\"Produto de Teste\",\"preco\":99.99,\"descricao\":\"Este é um produto de teste para verificar a integração com o WooCommerce.\",\"descricao_curta\":\"Produto de teste\",\"categorias\":[{\"id\":1}],\"imagens\":[{\"url\":\"https://achadinhoshopp.com.br/loja/wp-content/uploads/woocommerce-placeholder.png\",\"nome\":\"Imagem de teste\",\"alt\":\"Imagem de teste\"}],\"codigo\":\"TESTE123\",\"estoque\":10}"

echo.
echo Testando webhook de sincronização de estoque (PDV → WooCommerce)...
curl -X POST "http://localhost:5679/webhook/pdv-vendas/estoque" -H "Content-Type: application/json" -d "{\"produto_id\":\"TESTE123\",\"estoque\":5}"

echo.
echo Testando webhook de gerenciamento com IA...
curl -X POST "http://localhost:5679/webhook/pdv-vendas/ai-manager" -H "Content-Type: application/json" -d "{\"message\":\"Qual é o prazo de entrega para o CEP 12345-678?\",\"customer_id\":\"cliente123\"}"

echo.
echo Testando webhook de análise de produtos...
curl -X POST "http://localhost:5679/webhook/pdv-vendas/analise-produto" -H "Content-Type: application/json" -d "{\"nome\":\"Smartphone XYZ\",\"descricao\":\"Smartphone com 128GB de armazenamento, 6GB de RAM, tela de 6.5 polegadas e câmera de 48MP.\",\"preco\":1299.99,\"categorias\":[\"Eletrônicos\",\"Smartphones\"],\"imagens\":[{\"url\":\"https://achadinhoshopp.com.br/loja/wp-content/uploads/woocommerce-placeholder.png\",\"nome\":\"Smartphone XYZ\",\"alt\":\"Smartphone XYZ - Vista frontal\"}]}"

echo.
echo Testes concluídos. Verifique os logs do n8n para mais detalhes.
echo.

echo Pressione qualquer tecla para sair...
pause > nul
