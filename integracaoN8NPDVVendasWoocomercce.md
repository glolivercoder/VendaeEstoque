# Integração n8n com PDV Vendas e WooCommerce

Este documento descreve a integração entre o PDV Vendas, o WooCommerce e o n8n para sincronização de produtos, estoque e outras funcionalidades.

## Visão Geral

A integração utiliza o n8n como middleware para conectar o PDV Vendas ao WooCommerce, permitindo:

1. Sincronização de produtos do PDV Vendas para o WooCommerce
2. Sincronização bidirecional de estoque
3. Integração com IA para análise e sugestões

## Requisitos

- n8n instalado via Docker no WSL
- Credenciais do WooCommerce (Consumer Key e Consumer Secret)
- API Key do n8n configurada no arquivo .env

## Configuração do n8n

### Atualização do n8n

Para atualizar o n8n para a versão 1.88.0 com MCP integrado, execute o script `update-n8n.sh`:

```bash
./update-n8n.sh
```

### Acesso ao n8n

- URL: http://localhost:5679
- Usuário: admin
- Senha: admin

### Versão do n8n

Esta integração utiliza o n8n versão 1.88.0 que inclui o Management Control Panel (MCP) integrado, permitindo a criação automática de workflows e credenciais.

## Fluxos de Trabalho no n8n

### 1. Sincronização de Produtos (PDV Vendas → WooCommerce)

Este fluxo de trabalho recebe produtos do PDV Vendas e os cria/atualiza no WooCommerce.

**Webhook**: `http://localhost:5679/webhook/pdv-vendas/produtos`

**Passos do fluxo:**
1. Receber dados do produto via webhook
2. Processar imagens e dados do produto
3. Verificar se o produto já existe no WooCommerce
4. Criar ou atualizar o produto no WooCommerce
5. Retornar status da operação

### 2. Sincronização de Estoque (PDV Vendas → WooCommerce)

Este fluxo de trabalho atualiza o estoque no WooCommerce quando há alterações no PDV Vendas.

**Webhook**: `http://localhost:5679/webhook/pdv-vendas/estoque`

**Passos do fluxo:**
1. Receber dados de estoque via webhook
2. Identificar o produto no WooCommerce
3. Atualizar a quantidade em estoque
4. Retornar status da operação

### 3. Sincronização de Estoque (WooCommerce → PDV Vendas)

Este fluxo de trabalho atualiza o estoque no PDV Vendas quando há vendas no WooCommerce.

**Webhook**: `http://localhost:5679/webhook/woocommerce/estoque`

**Passos do fluxo:**
1. Configurar webhook no WooCommerce para notificar sobre vendas
2. Processar a notificação de venda
3. Atualizar o estoque no PDV Vendas
4. Retornar status da operação

### 4. Gerenciamento com IA

Este fluxo de trabalho utiliza IA para análise e sugestões relacionadas aos produtos.

**Webhook**: `http://localhost:5679/webhook/pdv-vendas/ai-manager`

**Passos do fluxo:**
1. Receber consulta via webhook
2. Processar a consulta usando IA (Gemini, Claude ou DeepSeek)
3. Retornar resposta da IA

## Integração no PDV Vendas

A integração com o n8n é gerenciada através dos seguintes componentes:

1. **Configuração**: Arquivo `.env` com a API Key do n8n
2. **Serviço n8n**: Arquivo `src/services/n8n.js` para comunicação com o n8n
3. **Configuração n8n**: Arquivo `src/config/n8n-config.js` com as configurações da integração
4. **Interface de Usuário**: Componente `N8nIntegrationSettings.jsx` para gerenciar a integração

### Management Control Panel (MCP)

A versão 1.88.0 do n8n inclui o MCP (Management Control Panel) que permite criar workflows e credenciais automaticamente. Para acessar o MCP, vá para a página de configurações de integração do n8n no PDV Vendas.

## Uso da Integração

### Sincronizar Produtos com o WooCommerce

1. Selecione os produtos que deseja sincronizar
2. Clique no botão "Sincronizar com WooCommerce"
3. Os produtos serão enviados para o n8n, que os processará e enviará para o WooCommerce

### Consultar a IA para Análise

1. Acesse a seção de IA na interface
2. Digite sua consulta
3. A consulta será processada pelo n8n e a resposta da IA será exibida

## Solução de Problemas

### Verificar Status do n8n

```bash
wsl -e docker ps | grep n8n
```

### Verificar Logs do n8n

```bash
wsl -e docker logs n8n
```

### Reiniciar o n8n

```bash
wsl -e docker restart n8n
```

## Recursos Adicionais

- [Documentação do n8n](https://docs.n8n.io/)
- [API do WooCommerce](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [Webhooks do WooCommerce](https://woocommerce.github.io/woocommerce-rest-api-docs/#webhooks)


