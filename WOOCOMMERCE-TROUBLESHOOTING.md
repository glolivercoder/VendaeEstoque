# Guia de Solução de Problemas - Integração WooCommerce

Este guia ajudará você a resolver problemas comuns na integração entre o PDV Vendas e o WooCommerce.

## Problemas de Conexão

Se você estiver enfrentando problemas para conectar o PDV Vendas ao WooCommerce, siga estas etapas:

### 1. Verificar Credenciais da API

As credenciais da API do WooCommerce são essenciais para a integração. Siga estas etapas para verificar e atualizar suas credenciais:

1. Acesse o painel administrativo do WordPress: `https://achadinhoshopp.com.br/loja/wp-admin/`
2. Navegue até **WooCommerce > Configurações > Avançado > API REST**
3. Clique em **Adicionar chave**
4. Preencha os seguintes dados:
   - **Descrição**: PDV Vendas Integration
   - **Usuário**: glolivercoder
   - **Permissões**: Leitura/Escrita
5. Clique em **Gerar chave de API**
6. Anote a **Chave do consumidor** e o **Segredo do consumidor**
7. Atualize o arquivo `.env` com as novas chaves:
   ```
   VITE_WORDPRESS_URL=https://achadinhoshopp.com.br/loja
   VITE_WOOCOMMERCE_CONSUMER_KEY=sua_nova_chave_aqui
   VITE_WOOCOMMERCE_CONSUMER_SECRET=seu_novo_segredo_aqui
   ```

### 2. Verificar Configurações do WooCommerce

Certifique-se de que o WooCommerce está configurado corretamente:

1. Verifique se o WooCommerce está ativado e atualizado
2. Navegue até **WooCommerce > Configurações > Produtos > Inventário**
3. Certifique-se de que a opção **Gerenciar estoque** está habilitada
4. Verifique se a opção **Visibilidade do estoque** está configurada corretamente

### 3. Verificar Configurações do Servidor

Problemas de servidor podem afetar a integração:

1. Verifique se o site WordPress está acessível: `https://achadinhoshopp.com.br/loja/`
2. Verifique se a API REST do WooCommerce está acessível: `https://achadinhoshopp.com.br/loja/wp-json/wc/v3`
3. Verifique se o servidor tem memória suficiente (recomendado: pelo menos 256MB)
4. Verifique se o servidor tem tempo de execução suficiente (recomendado: pelo menos 60 segundos)

### 4. Verificar Plugins de Cache e Segurança

Plugins de cache e segurança podem bloquear a API REST:

1. Desative temporariamente plugins de cache (como WP Super Cache, W3 Total Cache)
2. Desative temporariamente plugins de segurança (como Wordfence, iThemes Security)
3. Verifique se o firewall do servidor não está bloqueando requisições da API

## Problemas de Sincronização

Se os produtos não estiverem aparecendo no WooCommerce após a sincronização:

### 1. Verificar Status dos Produtos

1. Acesse o painel administrativo do WordPress
2. Navegue até **Produtos > Todos os Produtos**
3. Verifique se os produtos estão listados
4. Verifique o status dos produtos (Publicado, Rascunho, etc.)
5. Verifique se os produtos estão visíveis na loja

### 2. Verificar Categorias e Atributos

1. Verifique se as categorias dos produtos existem no WooCommerce
2. Verifique se os atributos dos produtos estão configurados corretamente

### 3. Verificar Logs de Erro

1. Ative o modo de depuração no WordPress:
   - Edite o arquivo `wp-config.php`
   - Adicione ou modifique estas linhas:
     ```php
     define('WP_DEBUG', true);
     define('WP_DEBUG_LOG', true);
     ```
2. Verifique o arquivo de log em `wp-content/debug.log`

## Problemas de Desempenho

Se a sincronização estiver muito lenta:

### 1. Aumentar Limites do PHP

1. Edite o arquivo `wp-config.php` e adicione:
   ```php
   define('WP_MEMORY_LIMIT', '256M');
   define('WP_MAX_MEMORY_LIMIT', '512M');
   ```

2. Se tiver acesso ao arquivo `.htaccess`, adicione:
   ```
   php_value memory_limit 512M
   php_value max_execution_time 300
   php_value upload_max_filesize 64M
   php_value post_max_size 64M
   ```

### 2. Otimizar Banco de Dados

1. Use um plugin como WP-Optimize para otimizar o banco de dados
2. Limpe dados desnecessários (revisões, lixeira, etc.)

## Contato para Suporte

Se você continuar enfrentando problemas após seguir este guia, entre em contato com o suporte:

- Email: glolivercoder@gmail.com
- WhatsApp: [Número de contato]
