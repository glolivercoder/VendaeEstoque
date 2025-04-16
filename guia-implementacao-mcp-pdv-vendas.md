# Guia de Implementação: Integração PDV Vendas e WordPress via MCP

Este guia descreve como implementar a integração entre o PDV Vendas e o WordPress/WooCommerce usando o n8n como MCP (Microservice Control Panel) para resolver os problemas de carregamento de imagens e estilos CSS.

## Visão Geral da Solução

A solução consiste em três componentes principais:

1. **n8n** - Plataforma de automação de fluxo de trabalho que gerencia a comunicação entre o PDV Vendas e o WordPress
2. **Plugin PDV Vendas CSS Injector** - Plugin WordPress para injetar estilos CSS personalizados
3. **Plugin PDV Vendas Image Handler** - Plugin WordPress para melhorar o tratamento de imagens

## Pré-requisitos

- WordPress com WooCommerce instalado e configurado
- Acesso administrativo ao WordPress
- Credenciais da API WooCommerce (já configuradas)
- Acesso ao servidor para instalar o n8n (opcional, pode usar a versão cloud)

## Passo 1: Instalar os Plugins WordPress

1. Acesse o painel administrativo do WordPress em https://achadinhoshopp.com.br/loja/wp-admin/
2. Vá para Plugins > Adicionar Novo > Enviar Plugin
3. Faça upload e ative os seguintes plugins:
   - `pdv-vendas-css-injector.zip`
   - `pdv-vendas-image-handler.zip`

## Passo 2: Configurar o n8n

### Opção 1: Usar n8n Cloud

1. Crie uma conta em [n8n.io](https://n8n.io/)
2. Crie um novo fluxo de trabalho

### Opção 2: Instalar n8n em Servidor

1. Instale o Docker no servidor
2. Execute o comando:
   ```
   docker run -it --rm \
     --name n8n \
     -p 5678:5678 \
     -v ~/.n8n:/home/node/.n8n \
     n8nio/n8n
   ```
3. Acesse o n8n em `http://seu-servidor:5678`

## Passo 3: Configurar Credenciais no n8n

1. No n8n, vá para "Credentials"
2. Adicione credenciais para:
   - **WordPress REST API**:
     - Nome: WordPress
     - URL: https://achadinhoshopp.com.br/loja
     - Usuário: seu-usuario
     - Senha: sua-senha-de-aplicativo
   - **WooCommerce REST API**:
     - Nome: WooCommerce
     - URL: https://achadinhoshopp.com.br/loja
     - Consumer Key: sua-consumer-key
     - Consumer Secret: seu-consumer-secret
   - **HTTP Basic Auth**:
     - Nome: WordPress Basic Auth
     - Usuário: seu-usuario
     - Senha: sua-senha-de-aplicativo

## Passo 4: Criar Fluxo de Trabalho para Sincronização de Produtos

1. No n8n, crie um novo fluxo de trabalho
2. Adicione um nó "Webhook" para receber dados do PDV Vendas
3. Adicione um nó "Function" para processar imagens
4. Adicione um nó "WooCommerce" para criar/atualizar produtos
5. Adicione um nó "HTTP Request" para injetar CSS personalizado
6. Configure o fluxo conforme o exemplo fornecido no código

## Passo 5: Configurar Webhook no PDV Vendas

1. No PDV Vendas, vá para a seção de configuração de integração com WordPress
2. Configure o URL do webhook para apontar para o endpoint do n8n:
   ```
   https://seu-n8n.com/webhook/produtos
   ```
3. Teste a conexão para garantir que está funcionando corretamente

## Passo 6: Configurar CSS Personalizado

1. No WordPress, vá para Configurações > PDV Vendas CSS
2. Adicione o CSS personalizado para os produtos:
   ```css
   /* Custom CSS for PDV Vendas products */
   .woocommerce ul.products li.product {
     text-align: center;
     padding: 15px;
     border-radius: 8px;
     transition: all 0.3s ease;
     box-shadow: 0 2px 5px rgba(0,0,0,0.1);
   }

   .woocommerce ul.products li.product:hover {
     transform: translateY(-5px);
     box-shadow: 0 5px 15px rgba(0,0,0,0.1);
   }

   .woocommerce ul.products li.product img {
     border-radius: 5px;
     margin-bottom: 10px;
     width: 100%;
     height: auto;
     object-fit: contain;
   }

   .woocommerce ul.products li.product .price {
     color: #4CAF50;
     font-weight: bold;
     font-size: 1.2em;
   }

   .woocommerce ul.products li.product .button {
     background-color: #4CAF50;
     color: white;
     border-radius: 4px;
     margin-top: 10px;
   }

   .woocommerce ul.products li.product .button:hover {
     background-color: #45a049;
   }
   ```

## Passo 7: Configurar Tratamento de Imagens

1. No WordPress, vá para Configurações > PDV Vendas Imagens
2. Configure a qualidade e o tamanho das imagens
3. Teste o upload de imagens para garantir que está funcionando corretamente

## Passo 8: Testar a Integração

1. No PDV Vendas, selecione alguns produtos para sincronizar
2. Clique em "Sincronizar Produtos Selecionados"
3. Verifique se os produtos aparecem corretamente no WordPress com imagens e estilos

## Solução de Problemas

### Imagens não aparecem

1. Verifique se o plugin PDV Vendas Image Handler está ativo
2. Teste o upload de imagens na página de configuração do plugin
3. Verifique as permissões de diretório em wp-content/uploads
4. Verifique os logs do n8n para erros de processamento de imagens

### Estilos CSS não são aplicados

1. Verifique se o plugin PDV Vendas CSS Injector está ativo
2. Verifique se o CSS foi salvo corretamente na página de configuração
3. Inspecione o código-fonte da página para verificar se o CSS está sendo injetado
4. Limpe o cache do WordPress e do navegador

### Erros de Conexão com a API

1. Verifique se as credenciais da API WooCommerce estão corretas
2. Verifique se o usuário tem permissões adequadas
3. Verifique os logs do n8n para erros de conexão

## Recursos Adicionais

- [Documentação do n8n](https://docs.n8n.io/)
- [Documentação da API WooCommerce](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [Documentação da API WordPress](https://developer.wordpress.org/rest-api/)

## Suporte

Para obter suporte adicional, entre em contato com a equipe de desenvolvimento do PDV Vendas.
