# Integração PDV Vendas com WordPress/WooCommerce

Este documento contém instruções para implementar e configurar a integração entre o aplicativo PDV Vendas e o site WordPress com WooCommerce.

## Arquivos Incluídos

1. **pdv-vendas-woocommerce-style.css** - Estilos personalizados para o tema do WooCommerce
2. **pdv-vendas-woocommerce-script.js** - Scripts JavaScript para melhorar a funcionalidade do site
3. **pdv-vendas-woocommerce-integration.php** - Plugin WordPress para integração com PDV Vendas
4. **banner.jpg** - Imagem de banner para a página principal da loja

## Instruções de Instalação

### 1. Instalar o Plugin de Integração

1. Crie um arquivo ZIP contendo os seguintes arquivos:
   - pdv-vendas-woocommerce-integration.php
   - pdv-vendas-woocommerce-style.css
   - pdv-vendas-woocommerce-script.js
   - banner.jpg

2. No painel administrativo do WordPress, vá para **Plugins > Adicionar Novo > Enviar Plugin**

3. Selecione o arquivo ZIP criado e clique em **Instalar Agora**

4. Após a instalação, ative o plugin

### 2. Configurar as Credenciais da API WooCommerce

1. No painel administrativo do WordPress, vá para **WooCommerce > Configurações > Avançado > API REST**

2. Clique em **Adicionar chave**

3. Preencha os seguintes dados:
   - **Descrição**: PDV Vendas Integration
   - **Usuário**: Selecione um usuário com privilégios de administrador
   - **Permissões**: Selecione **Leitura/Escrita**

4. Clique em **Gerar chave de API**

5. Anote a **Chave do consumidor** e o **Segredo do consumidor**

6. No aplicativo PDV Vendas, atualize o arquivo `.env` com as novas credenciais:
   ```
   VITE_WOOCOMMERCE_CONSUMER_KEY=sua_nova_chave_aqui
   VITE_WOOCOMMERCE_CONSUMER_SECRET=seu_novo_segredo_aqui
   VITE_WOOCOMMERCE_SITE_URL=https://achadinhoshopp.com.br/loja
   ```

### 3. Configurar o Webhook no WordPress

1. No painel administrativo do WordPress, vá para **WooCommerce > Configurações > Avançado > Webhooks**

2. Clique em **Adicionar webhook**

3. Preencha os seguintes dados:
   - **Nome**: PDV Vendas Sync
   - **Status**: Ativo
   - **Tópico**: Produto atualizado
   - **URL de entrega**: https://api.pdvvendas.com/webhook/wordpress-sync
   - **Segredo**: Crie uma chave secreta aleatória

4. Clique em **Salvar webhook**

5. Repita o processo para criar webhooks adicionais para:
   - Produto criado
   - Produto excluído
   - Pedido criado
   - Pedido atualizado

### 4. Personalizar o Tema do WooCommerce

Se você quiser personalizar ainda mais o tema do WooCommerce, pode editar o arquivo CSS incluído:

1. No painel administrativo do WordPress, vá para **Aparência > Personalizar > CSS Adicional**

2. Cole o conteúdo do arquivo `pdv-vendas-woocommerce-style.css`

3. Clique em **Publicar**

### 5. Testar a Integração

1. No aplicativo PDV Vendas, selecione alguns produtos para sincronizar

2. Clique no botão **Sincronizar Produtos Selecionados**

3. Verifique se os produtos aparecem corretamente no site WordPress

4. Verifique se as imagens dos produtos estão sendo exibidas corretamente

## Solução de Problemas

### Imagens não aparecem no WordPress

Se as imagens não estiverem aparecendo no WordPress, verifique:

1. **Permissões de Upload**: Certifique-se de que o diretório `wp-content/uploads` tenha permissões de escrita (geralmente 755 para diretórios e 644 para arquivos)

2. **Tamanho Máximo de Upload**: Verifique o tamanho máximo de upload no PHP (php.ini):
   ```
   upload_max_filesize = 10M
   post_max_size = 10M
   ```

3. **Formato das Imagens**: Certifique-se de que as imagens estejam em um formato suportado (JPG, PNG, GIF, WebP)

4. **Credenciais da API**: Verifique se as credenciais da API têm permissões para fazer upload de mídia

### Erro de Autenticação

Se você receber erros de autenticação:

1. **Regenerar Chaves**: Tente regenerar as chaves da API do WooCommerce

2. **Verificar Permissões**: Certifique-se de que o usuário associado às chaves da API tenha permissões de administrador

3. **Verificar URL**: Certifique-se de que a URL do site WordPress esteja correta no arquivo `.env`

### Produtos não sincronizam

Se os produtos não estiverem sincronizando:

1. **Verificar Console**: Verifique o console do navegador para erros JavaScript

2. **Verificar Logs**: Verifique os logs do WordPress (se o WP_DEBUG estiver ativado)

3. **Testar API Manualmente**: Teste a API do WooCommerce manualmente usando uma ferramenta como Postman

## Personalização Adicional

### Banner da Loja

Para personalizar o banner da loja:

1. Crie uma imagem de banner com aproximadamente 1200x300 pixels

2. Substitua o arquivo `banner.jpg` no diretório do plugin

### Cores do Tema

Para personalizar as cores do tema:

1. Edite o arquivo `pdv-vendas-woocommerce-style.css`

2. Modifique as variáveis CSS no início do arquivo:
   ```css
   :root {
     --pdv-primary: #2271b1;
     --pdv-secondary: #135e96;
     --pdv-accent: #72aee6;
     --pdv-text: #333333;
     --pdv-light: #f0f0f1;
     --pdv-success: #00a32a;
     --pdv-danger: #d63638;
   }
   ```

## Suporte

Para obter suporte adicional, entre em contato com a equipe de desenvolvimento do PDV Vendas.
