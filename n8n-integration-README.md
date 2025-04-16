# Integração PDV Vendas com WordPress/WooCommerce usando n8n

Este projeto contém os workflows e scripts necessários para integrar o PDV Vendas com o WordPress/WooCommerce usando o n8n como plataforma de integração.

## Pré-requisitos

- Node.js 14 ou superior
- n8n instalado e rodando na porta 5679
- Acesso ao WordPress/WooCommerce (achadinhoshopp.com.br/loja)
- Acesso ao PDV Vendas

## Configuração

1. Certifique-se de que o n8n está rodando na porta 5679:
   ```
   docker ps | grep n8n
   ```

2. Execute o script de configuração:
   ```
   setup-n8n-integration.bat
   ```

3. O script irá:
   - Instalar as dependências necessárias
   - Configurar as credenciais do Gemini e Deepseek no n8n
   - Importar os workflows para o n8n
   - Ativar os workflows

## Workflows

### 1. PDV Vendas - Sincronização de Produtos

Este workflow sincroniza produtos do PDV Vendas para o WooCommerce.

- **Webhook**: `http://localhost:5679/webhook/pdv-vendas/produtos`
- **Método**: POST
- **Formato de dados**:
  ```json
  {
    "nome": "Nome do Produto",
    "preco": 99.99,
    "descricao": "Descrição detalhada do produto",
    "descricao_curta": "Descrição curta",
    "categorias": [{"id": 1}],
    "imagens": [
      {
        "url": "https://exemplo.com/imagem.jpg",
        "nome": "Nome da imagem",
        "alt": "Texto alternativo"
      }
    ],
    "codigo": "SKU123",
    "estoque": 10
  }
  ```

### 2. PDV Vendas - Sincronização de Estoque (WooCommerce → PDV)

Este workflow sincroniza atualizações de estoque do WooCommerce para o PDV Vendas.

- **Webhook**: `http://localhost:5679/webhook/woocommerce/estoque`
- **Método**: POST
- **Formato de dados**:
  ```json
  {
    "product_id": "123",
    "stock_quantity": 5
  }
  ```

### 3. PDV Vendas - Sincronização de Estoque (PDV → WooCommerce)

Este workflow sincroniza atualizações de estoque do PDV Vendas para o WooCommerce.

- **Webhook**: `http://localhost:5679/webhook/pdv-vendas/estoque`
- **Método**: POST
- **Formato de dados**:
  ```json
  {
    "produto_id": "123",
    "estoque": 5
  }
  ```

### 4. PDV Vendas - IA Manager

Este workflow utiliza IA (Gemini e Deepseek) para responder a consultas de clientes sobre produtos, fretes, pedidos e suporte.

- **Webhook**: `http://localhost:5679/webhook/pdv-vendas/ai-manager`
- **Método**: POST
- **Formato de dados**:
  ```json
  {
    "message": "Qual é o prazo de entrega para o CEP 12345-678?",
    "customer_id": "cliente123"
  }
  ```

### 5. PDV Vendas - Análise de Produtos

Este workflow utiliza IA (Gemini e Deepseek) para analisar produtos e fornecer sugestões de otimização para e-commerce.

- **Webhook**: `http://localhost:5679/webhook/pdv-vendas/analise-produto`
- **Método**: POST
- **Formato de dados**:
  ```json
  {
    "nome": "Nome do Produto",
    "descricao": "Descrição detalhada do produto",
    "preco": 99.99,
    "categorias": ["Categoria 1", "Categoria 2"],
    "imagens": [
      {
        "url": "https://exemplo.com/imagem.jpg",
        "nome": "Nome da imagem",
        "alt": "Texto alternativo"
      }
    ]
  }
  ```

## Integrações de IA

O sistema utiliza duas APIs de IA:

1. **Google Gemini**: Utilizada para consultas sobre produtos, pedidos e informações gerais.
2. **Deepseek**: Utilizada para consultas sobre frete e suporte técnico.

O sistema analisa automaticamente o tipo de consulta e direciona para a IA mais adequada.

## Configuração no WordPress/WooCommerce

Para que a integração funcione corretamente, é necessário configurar webhooks no WooCommerce:

1. Acesse o painel administrativo do WordPress
2. Vá para WooCommerce > Configurações > Avançado > Webhooks
3. Adicione um novo webhook:
   - Nome: Atualização de Estoque
   - Status: Ativo
   - Tópico: Produto atualizado
   - URL de entrega: `http://localhost:5679/webhook/woocommerce/estoque`
   - Segredo: (deixe em branco)

## Solução de Problemas

Se encontrar problemas com a integração:

1. Verifique se o n8n está rodando: `docker ps | grep n8n`
2. Verifique os logs do n8n: `docker logs n8n-mcp-simple`
3. Acesse a interface do n8n em `http://localhost:5679` e verifique o status dos workflows
4. Verifique se as credenciais estão configuradas corretamente

## Suporte

Para suporte, entre em contato com a equipe de desenvolvimento.
