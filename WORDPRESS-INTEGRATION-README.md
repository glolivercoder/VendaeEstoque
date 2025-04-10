# Integração PDV Vendas com WordPress/WooCommerce

Este documento contém instruções para configurar e utilizar a integração entre o PDV Vendas e o WordPress/WooCommerce.

## Configuração da API do WooCommerce

As credenciais da API do WooCommerce foram configuradas no arquivo `.env` com os seguintes valores:

```
VITE_WORDPRESS_URL=https://achadinhoshopp.com.br/loja
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_a117i65gmQYOokVzyA8QRLSw
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_a117i65gmQYOokVzyA8QRLSw
VITE_WORDPRESS_USERNAME=glolivercoder
VITE_WORDPRESS_EMAIL=glolivercoder@gmail.com
```

## Como Usar a Integração

A interface de usuário permanece a mesma, mas agora a integração é mais robusta e confiável:

### Sincronizar Produtos:
1. Selecione os produtos no PDV Vendas
2. Clique no botão "WordPress Sync" no menu lateral
3. Os produtos serão enviados para o WordPress usando a API do WooCommerce

### Atualizar Estoque:
- Quando o estoque é atualizado no PDV Vendas, ele também será atualizado no WordPress
- Quando ocorrer uma venda no WordPress, o estoque será atualizado no PDV Vendas (via webhook)

## Aumentar Memória do WordPress

Para resolver problemas de desempenho do WooCommerce devido à pouca memória de cache, foi criado um plugin para aumentar o limite de memória do WordPress para 1024MB e otimizar o desempenho do WooCommerce.

### Instalação do Plugin de Aumento de Memória:

1. Faça o download do arquivo `pdv-vendas-memory-plugin.zip`
2. No painel de administração do WordPress, vá para "Plugins" > "Adicionar Novo"
3. Clique em "Enviar Plugin" e selecione o arquivo ZIP
4. Ative o plugin após a instalação
5. Acesse "Ferramentas" > "Configurações de Memória" para verificar as configurações

### Otimizações Incluídas no Plugin:

- Aumento do limite de memória para 1024MB
- Aumento do tempo máximo de execução para 5 minutos
- Aumento dos limites de upload para 64MB
- Otimização de consultas de produtos no WooCommerce
- Aumento do limite de produtos por página na API REST
- Gerenciamento de cache para melhor desempenho

### Configuração Manual (Alternativa):

Se preferir configurar manualmente, adicione as seguintes linhas ao arquivo `wp-config.php` do WordPress:

```php
define('WP_MEMORY_LIMIT', '1024M');
define('WP_MAX_MEMORY_LIMIT', '1024M');
```

Você também pode adicionar as seguintes linhas ao arquivo `.htaccess`:

```
php_value memory_limit 1024M
php_value upload_max_filesize 64M
php_value post_max_size 64M
php_value max_execution_time 300
```

## Vantagens Desta Abordagem

- **Sem Plugins Personalizados**: Não é necessário instalar plugins adicionais no WordPress, o que reduz o risco de conflitos e problemas de segurança.
- **API Oficial**: Estamos usando a API oficial do WooCommerce, que é bem documentada, estável e mantida pela equipe do WooCommerce.
- **Segurança**: A autenticação OAuth é mais segura e robusta que métodos personalizados.
- **Manutenção Simplificada**: Como estamos usando APIs padrão, a manutenção é mais simples e menos propensa a quebrar com atualizações do WordPress.
- **Compatibilidade**: Esta solução é compatível com qualquer instalação do WordPress que tenha o WooCommerce ativado.

## Webhook para Sincronização Bidirecional

Para configurar o webhook que permite a sincronização bidirecional:

1. No painel de administração do WordPress, vá para WooCommerce > Configurações > Avançado > Webhooks
2. Adicione um novo webhook com os seguintes dados:
   - Nome: PDV Vendas Integration
   - Tópico: Pedido atualizado
   - URL de entrega: https://api.pdvvendas.com/webhook/wordpress-sync
   - Segredo: (use o mesmo valor de VITE_WOOCOMMERCE_CONSUMER_SECRET)
