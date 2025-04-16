# Integração PDV Vendas com WooCommerce via n8n

Este projeto implementa uma integração completa entre o PDV Vendas e o WordPress/WooCommerce usando o n8n como plataforma de automação, com suporte de IA para gerenciamento e monitoramento.

## Pré-requisitos

- n8n instalado e rodando (via Docker ou outro método)
- WordPress com WooCommerce instalado
- Acesso administrativo ao WordPress
- Acesso ao PDV Vendas

## Arquivos Incluídos

1. **Fluxos de Trabalho n8n**:
   - `pdv-vendas-ai-manager.json` - Gerenciamento com IA
   - `pdv-vendas-product-sync.json` - Sincronização de produtos
   - `pdv-vendas-inventory-sync.json` - Sincronização de estoque
   - `pdv-vendas-monitoring.json` - Monitoramento com IA

2. **Plugins WordPress**:
   - `pdv-vendas-css-injector.zip` - Injeção de CSS personalizado
   - `pdv-vendas-image-handler.zip` - Tratamento de imagens

## Configuração

### 1. Configurar Credenciais no WordPress/WooCommerce

1. **Criar Chaves de API no WooCommerce**:
   - Acesse o painel WordPress: https://achadinhoshopp.com.br/loja/wp-admin/
   - Navegue para WooCommerce > Configurações > Avançado > API REST
   - Clique em "Adicionar chave"
   - Preencha:
     - **Descrição**: PDV Vendas Integration
     - **Usuário**: Selecione um usuário com privilégios de administrador
     - **Permissões**: Leitura/Escrita
   - Clique em "Gerar chave de API"
   - Anote: Consumer Key e Consumer Secret

2. **Criar Senha de Aplicativo no WordPress**:
   - Acesse o painel WordPress: https://achadinhoshopp.com.br/loja/wp-admin/
   - Navegue para Usuários > Seu Perfil
   - Role até "Senhas de aplicativo"
   - Nome do aplicativo: PDV Vendas Integration
   - Clique em "Adicionar nova senha de aplicativo"
   - Anote: A senha gerada

### 2. Configurar Credenciais no n8n

1. **Acessar Gerenciador de Credenciais**:
   - No painel do n8n, clique em "Credentials" no menu lateral
   - Clique em "+ Add Credential"

2. **Configurar Credencial WordPress**:
   - **Nome**: WordPress Achadinho
   - **Tipo de Credencial**: WordPress
   - **URL da API**: https://achadinhoshopp.com.br/loja/wp-json
   - **Autenticação**: Basic Auth
   - **Usuário**: seu-usuario-wordpress
   - **Senha**: senha-de-aplicativo-gerada-anteriormente
   - Clique em "Save"

3. **Configurar Credencial WooCommerce**:
   - **Nome**: WooCommerce Achadinho
   - **Tipo de Credencial**: WooCommerce
   - **URL**: https://achadinhoshopp.com.br/loja
   - **Consumer Key**: consumer-key-gerada-anteriormente
   - **Consumer Secret**: consumer-secret-gerada-anteriormente
   - Clique em "Save"

4. **Configurar Credencial HTTP**:
   - **Nome**: PDV Vendas API
   - **Tipo de Credencial**: HTTP
   - **Autenticação**: Basic Auth (se necessário)
   - **Usuário**: usuario-pdv-vendas (se necessário)
   - **Senha**: senha-pdv-vendas (se necessário)
   - Clique em "Save"

5. **Configurar Credencial Claude AI** (ou outra IA escolhida):
   - **Nome**: Claude AI
   - **Tipo de Credencial**: Anthropic Claude
   - **API Key**: sua-api-key-da-anthropic
   - Clique em "Save"

### 3. Importar Fluxos de Trabalho no n8n

1. Acesse o painel do n8n: http://localhost:5678
2. Clique em "Workflows" no menu lateral
3. Clique em "Import from File"
4. Importe cada um dos arquivos JSON de fluxo de trabalho
5. Ative cada fluxo de trabalho após a importação

### 4. Instalar Plugins no WordPress

1. Acesse o painel WordPress: https://achadinhoshopp.com.br/loja/wp-admin/
2. Navegue para Plugins > Adicionar Novo > Enviar Plugin
3. Faça upload e ative cada um dos plugins ZIP

### 5. Configurar PDV Vendas

1. No n8n, abra o fluxo de trabalho "PDV Vendas - Sincronização de Produtos"
2. Clique no nó Webhook
3. Copie o URL do webhook
4. Configure este URL no PDV Vendas na seção de integração com WordPress

## Uso

### Sincronização de Produtos

1. No PDV Vendas, selecione os produtos que deseja sincronizar
2. Clique em "Sincronizar Produtos Selecionados"
3. Os produtos serão enviados para o WooCommerce

### Sincronização de Estoque

A sincronização de estoque é bidirecional e automática:
- Quando o estoque é atualizado no PDV Vendas, ele é sincronizado com o WooCommerce
- Quando uma venda é realizada no WooCommerce, o estoque é atualizado no PDV Vendas

### Monitoramento

O sistema de monitoramento executa automaticamente a cada 6 horas e envia relatórios por email.

## Solução de Problemas

Se encontrar problemas com a integração:

1. Verifique os logs do n8n para identificar erros
2. Verifique se as credenciais estão configuradas corretamente
3. Verifique se os plugins WordPress estão ativos
4. Verifique se o URL do webhook está configurado corretamente no PDV Vendas

## Manutenção

- Faça backup regular dos fluxos de trabalho do n8n
- Mantenha os plugins WordPress atualizados
- Monitore os relatórios de IA para identificar problemas potenciais

## Suporte

Para suporte adicional, entre em contato com a equipe de suporte do PDV Vendas.
