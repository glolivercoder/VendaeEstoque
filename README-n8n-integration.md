# Integração PDV Vendas com WordPress/WooCommerce usando n8n e MCP

Este projeto contém os arquivos necessários para integrar o PDV Vendas com o WordPress/WooCommerce usando o n8n como plataforma de integração e o Model Context Protocol (MCP) para uma comunicação mais direta.

## Arquivos Incluídos

### Arquivos de Workflow (pasta `n8n-exports`)
- `product-sync-workflow.json`: Sincronização de produtos do PDV Vendas para o WooCommerce
- `inventory-sync-woo-to-pdv-workflow.json`: Sincronização de estoque do WooCommerce para o PDV Vendas
- `inventory-sync-pdv-to-woo-workflow.json`: Sincronização de estoque do PDV Vendas para o WooCommerce
- `ai-manager-workflow.json`: Gerenciamento de consultas de clientes usando IA (Gemini e Deepseek)
- `product-analysis-workflow.json`: Análise de produtos usando IA para otimização de e-commerce
- `woocommerce-mcp-workflow.json`: Sincronização de produtos usando o MCP de WooCommerce
- `woocommerce-mcp-stock-workflow.json`: Sincronização de estoque usando o MCP de WooCommerce

### Scripts de Configuração e Teste
- `setup-n8n-dependencies.bat`: Script para instalar todas as dependências necessárias
- `import-n8n-workflows.bat`: Script para importar os workflows no n8n
- `test-n8n-webhooks.bat`: Script para testar os webhooks
- `run-n8n-logger.js`: Script para registrar logs da integração
- `n8n-integration-logger.js`: Módulo de logging para a integração
- `woocommerce-mcp-integration.js`: Script para integração direta com o WooCommerce via MCP
- `test-woocommerce-mcp.js`: Script para testar a integração com o MCP de WooCommerce
- `setup-woocommerce-mcp.bat`: Script para configurar a integração com o MCP de WooCommerce
- `test-woocommerce-mcp.bat`: Script para testar a integração com o MCP de WooCommerce
- `start-mcp-browser-tools.bat`: Script para iniciar o MCP Browser Tools
- `start-all-services.bat`: Script para iniciar todos os serviços necessários
- `stop-all-services.bat`: Script para parar todos os serviços

## Pré-requisitos

- Node.js 14 ou superior
- n8n instalado e rodando na porta 5679
- MCP Browser Tools rodando na porta 3025
- Acesso ao WordPress/WooCommerce (achadinhoshopp.com.br/loja)
- Acesso ao PDV Vendas

## Instalação

Para instalar todas as dependências necessárias, execute o script:

```
setup-n8n-dependencies.bat
```

Ou usando npm:

```
npm run n8n:setup
```

Este script irá instalar:
- axios e dotenv (dependências para os scripts de integração)
- MCP Browser Tools (para integração direta com o WooCommerce)

## Configuração

### 1. Iniciar todos os serviços

Para iniciar todos os serviços necessários (n8n e MCP Browser Tools), execute o script:

```
start-all-services.bat
```

Ou usando npm:

```
npm run n8n:start
```

Este script irá:
1. Iniciar o n8n na porta 5679
2. Iniciar o MCP Browser Tools na porta 3025
3. Abrir o n8n no navegador

Alternativamente, você pode iniciar os serviços manualmente:

```
# Iniciar n8n
docker start n8n-mcp-simple

# Iniciar MCP Browser Tools
npx @agentdeskai/browser-tools-mcp@latest
```

### 2. Importar os Workflows

Execute o script de importação:

```
import-n8n-workflows.bat
```

Ou usando npm:

```
npm run n8n:import
```

Siga as instruções na tela para importar os workflows no n8n.

### 3. Configurar Credenciais no n8n

Após importar os workflows, você precisará configurar as credenciais:

1. Abra o n8n no navegador: http://localhost:5679
2. Vá para "Credentials" no menu lateral
3. Clique em "Create New"
4. Configure as seguintes credenciais:

   a. **WooCommerce API**:
      - Nome: WooCommerce Achadinho
      - URL: https://achadinhoshopp.com.br/loja
      - Consumer Key: ck_a117i65gmQYOokVzyA8QRLSw
      - Consumer Secret: cs_a117i65gmQYOokVzyA8QRLSw

   b. **HTTP Basic Auth** (para PDV Vendas):
      - Nome: PDV Vendas API
      - User: gloliverx
      - Password: Juli@3110

   c. **HTTP Header Auth** (para Deepseek):
      - Nome: Deepseek API
      - Name: Authorization
      - Value: Bearer sk-eb357d575853453ca118bd1dd77c72c6

### 3.1. Configurar Integração com MCP de WooCommerce

Para configurar a integração com o MCP de WooCommerce:

1. Certifique-se de que o MCP Browser Tools está rodando na porta 3025:
   ```
   npx @agentdeskai/browser-tools-mcp@latest
   ```

2. Execute o script de configuração:
   ```
   setup-woocommerce-mcp.bat
   ```

   Ou usando npm:
   ```
   npm run n8n:setup:mcp
   ```

3. Importe os workflows de MCP no n8n:
   - `woocommerce-mcp-workflow.json`
   - `woocommerce-mcp-stock-workflow.json`

### 4. Ativar os Workflows

Após configurar as credenciais, ative cada workflow:

1. Vá para "Workflows" no menu lateral
2. Abra cada workflow
3. Clique no botão "Activate" no canto superior direito

### 5. Testar os Webhooks

Execute os scripts de teste:

```
test-n8n-webhooks.bat
test-woocommerce-mcp.bat
```

Ou usando npm:

```
npm run n8n:test
npm run n8n:test:mcp
```

## Webhooks Disponíveis

Após a configuração, você terá os seguintes webhooks disponíveis:

### Webhooks Padrão

- **Sincronização de Produtos**: `http://localhost:5679/webhook/pdv-vendas/produtos`
- **Sincronização de Estoque (WooCommerce → PDV)**: `http://localhost:5679/webhook/woocommerce/estoque`
- **Sincronização de Estoque (PDV → WooCommerce)**: `http://localhost:5679/webhook/pdv-vendas/estoque`
- **Gerenciamento com IA**: `http://localhost:5679/webhook/pdv-vendas/ai-manager`
- **Análise de Produtos**: `http://localhost:5679/webhook/pdv-vendas/analise-produto`

### Webhooks MCP

- **Sincronização de Produtos via MCP**: `http://localhost:5679/webhook/pdv-vendas/mcp/produto`
- **Sincronização de Estoque via MCP**: `http://localhost:5679/webhook/pdv-vendas/mcp/estoque`

## Formatos de Dados

### 1. Sincronização de Produtos

**Método**: POST
**URL**: `http://localhost:5679/webhook/pdv-vendas/produtos`
**Formato**:
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

### 2. Sincronização de Estoque (WooCommerce → PDV)

**Método**: POST
**URL**: `http://localhost:5679/webhook/woocommerce/estoque`
**Formato**:
```json
{
  "product_id": "123",
  "stock_quantity": 5
}
```

### 3. Sincronização de Estoque (PDV → WooCommerce)

**Método**: POST
**URL**: `http://localhost:5679/webhook/pdv-vendas/estoque`
**Formato**:
```json
{
  "produto_id": "123",
  "estoque": 5
}
```

### 4. Gerenciamento com IA

**Método**: POST
**URL**: `http://localhost:5679/webhook/pdv-vendas/ai-manager`
**Formato**:
```json
{
  "message": "Qual é o prazo de entrega para o CEP 12345-678?",
  "customer_id": "cliente123"
}
```

### 5. Análise de Produtos

**Método**: POST
**URL**: `http://localhost:5679/webhook/pdv-vendas/analise-produto`
**Formato**:
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

### 6. Sincronização de Produtos via MCP

**Método**: POST
**URL**: `http://localhost:5679/webhook/pdv-vendas/mcp/produto`
**Formato**:
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

### 7. Sincronização de Estoque via MCP

**Método**: POST
**URL**: `http://localhost:5679/webhook/pdv-vendas/mcp/estoque`
**Formato**:
```json
{
  "produto_id": "123",
  "estoque": 5
}
```

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

## Logs e Monitoramento

Para monitorar a integração, execute o script de logging:

```
run-n8n-logger.bat
```

Ou usando npm:

```
npm run n8n:logs
```

Os logs serão salvos nas pastas:
- `logs/`: Logs gerais da integração
- `system-logs/`: Logs do sistema

## Solução de Problemas

Se encontrar problemas com a integração:

1. Verifique se o n8n está rodando: `docker ps | grep n8n`
2. Verifique os logs do n8n: `docker logs n8n-mcp-simple`
3. Execute o script de logging: `run-n8n-logger.bat`
4. Verifique se as credenciais estão configuradas corretamente
5. Verifique se os workflows estão ativos

## Integrações de IA

O sistema utiliza duas APIs de IA:

1. **Google Gemini**: Utilizada para consultas sobre produtos, pedidos e informações gerais.
2. **Deepseek**: Utilizada para consultas sobre frete e suporte técnico.

O sistema analisa automaticamente o tipo de consulta e direciona para a IA mais adequada.

## Integração com MCP de WooCommerce

O sistema utiliza o Model Context Protocol (MCP) para uma integração mais direta com o WooCommerce. O MCP é uma tecnologia que permite que modelos de linguagem interajam com ferramentas externas de forma padronizada.

### Vantagens da Integração MCP

1. **Comunicação Direta**: O MCP permite uma comunicação direta entre o PDV Vendas e o WooCommerce, sem a necessidade de intermediários.

2. **Maior Flexibilidade**: A integração MCP oferece maior flexibilidade na manipulação de dados e na execução de operações.

3. **Melhor Desempenho**: A comunicação direta resulta em melhor desempenho e menor latência.

4. **Facilidade de Manutenção**: A estrutura modular do MCP facilita a manutenção e a atualização da integração.

### Configuração do MCP

Para configurar o MCP de WooCommerce:

1. Inicie o MCP Browser Tools:
   ```
   npx @agentdeskai/browser-tools-mcp@latest
   ```

2. Execute o script de configuração:
   ```
   setup-woocommerce-mcp.bat
   ```

3. Importe os workflows de MCP no n8n:
   - `woocommerce-mcp-workflow.json`
   - `woocommerce-mcp-stock-workflow.json`

4. Teste a integração:
   ```
   test-woocommerce-mcp.bat
   ```

## Suporte

Para suporte, entre em contato com a equipe de desenvolvimento.
