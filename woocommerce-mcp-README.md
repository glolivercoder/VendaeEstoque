# Integração PDV Vendas com WooCommerce usando MCP

Este documento contém instruções para configurar e utilizar a integração entre o PDV Vendas e o WooCommerce usando o MCP (Management Control Panel).

## Pré-requisitos

- Node.js 14 ou superior
- Acesso ao WordPress/WooCommerce (achadinhoshopp.com.br/loja)
- Acesso ao PDV Vendas
- MCP Browser Tools instalado

## Configuração

1. Certifique-se de que o MCP Browser Tools está instalado:
   ```
   npm install -g @agentdeskai/browser-tools-mcp
   ```

2. Execute o script de inicialização:
   ```
   start-woocommerce-mcp.bat
   ```

3. O script irá:
   - Verificar se o MCP Browser Tools está em execução
   - Iniciar o MCP Browser Tools se necessário
   - Abrir o site do WooCommerce
   - Configurar a integração com o WooCommerce

## Uso da Integração

### Exportar Produtos para o WooCommerce

1. No PDV Vendas, vá para a tela principal
2. Clique no botão "Exportar para Site"
3. Selecione o método de exportação "WooCommerce"
4. Selecione os produtos que deseja exportar
5. Clique em "Exportar"

### Importar Produtos do WooCommerce

1. No PDV Vendas, vá para a tela principal
2. Clique no botão "Exportar para Site"
3. Selecione o método de exportação "WooCommerce"
4. Clique em "Importar Produtos do WooCommerce"

## Configuração Avançada

A configuração da integração está no arquivo `woocommerce-mcp-config.json`. Você pode editar este arquivo para personalizar a integração:

```json
{
  "woocommerce": {
    "url": "https://achadinhoshopp.com.br/loja",
    "consumer_key": "ck_a117i65gmQYOokVzyA8QRLSw",
    "consumer_secret": "cs_a117i65gmQYOokVzyA8QRLSw",
    "version": "wc/v3"
  },
  "pdv_vendas": {
    "url": "http://localhost:3000",
    "api_key": "OxCq4oUPrd5hqxPEq1zdjEd4",
    "username": "gloliverx",
    "password": "Juli@3110"
  },
  "mcp": {
    "url": "http://localhost:3025",
    "version": "v1"
  },
  "webhooks": {
    "product_updated": {
      "name": "PDV Vendas - Atualização de Produto",
      "topic": "product.updated",
      "delivery_url": "http://localhost:3000/api/webhooks/woocommerce/estoque"
    },
    "product_created": {
      "name": "PDV Vendas - Criação de Produto",
      "topic": "product.created",
      "delivery_url": "http://localhost:3000/api/webhooks/woocommerce/produto"
    },
    "order_updated": {
      "name": "PDV Vendas - Atualização de Pedido",
      "topic": "order.updated",
      "delivery_url": "http://localhost:3000/api/webhooks/woocommerce/pedido"
    }
  },
  "sync": {
    "interval": 300,
    "batch_size": 50,
    "enabled": true
  },
  "logging": {
    "level": "info",
    "file": "logs/woocommerce-mcp.log",
    "console": true
  }
}
```

## Solução de Problemas

Se encontrar problemas com a integração:

1. Verifique se o MCP Browser Tools está em execução:
   ```
   npx @agentdeskai/browser-tools-mcp@latest status
   ```

2. Verifique as credenciais do WooCommerce no arquivo `woocommerce-mcp-config.json`

3. Verifique se o site do WooCommerce está acessível:
   ```
   curl https://achadinhoshopp.com.br/loja/wp-json/wc/v3/products
   ```

4. Verifique os logs da integração:
   ```
   cat logs/woocommerce-mcp.log
   ```

## Suporte

Para suporte, entre em contato com a equipe de desenvolvimento.
