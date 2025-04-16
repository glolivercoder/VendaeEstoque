# Instruções para Integração com WordPress/WooCommerce

Este documento contém instruções para configurar a integração entre o PDV Vendas e o WordPress/WooCommerce.

## Arquivos Incluídos

1. `pdv-vendas-css.zip` - Plugin WordPress para manter o mesmo layout do app PDV Vendas
2. `corrigir-woocommerce.js` - Script para corrigir problemas de integração
3. `CORRECAO-MANUAL-WOOCOMMERCE.md` - Instruções para correção manual

## 1. Instalação do Plugin WordPress

Para manter o mesmo layout do app PDV Vendas no site WooCommerce:

1. Acesse o painel de administração do WordPress (https://achadinhoshopp.com.br/loja/wp-admin/)
2. Vá para **Plugins > Adicionar Novo > Enviar Plugin**
3. Selecione o arquivo `pdv-vendas-css.zip`
4. Clique em **Instalar Agora**
5. Após a instalação, clique em **Ativar Plugin**

O plugin aplicará automaticamente o estilo do PDV Vendas ao seu site WooCommerce.

## 2. Correção da Integração

### Opção 1: Usando o Script

Para corrigir problemas de integração entre o PDV Vendas e o WooCommerce, execute o script de correção:

1. Abra um terminal (Prompt de Comando ou PowerShell)
2. Navegue até a pasta do projeto PDV Vendas:
   ```
   cd G:\Cline\VendaEstoqueapp\estoque-app
   ```
3. Execute o script:
   ```
   node corrigir-woocommerce.js
   ```
4. Reinicie o aplicativo PDV Vendas para aplicar as alterações

### Opção 2: Correção Manual

Se preferir fazer as correções manualmente, siga as instruções detalhadas no arquivo `CORRECAO-MANUAL-WOOCOMMERCE.md`.

## 3. Configuração do WooCommerce

Certifique-se de que o WooCommerce está configurado corretamente:

1. Vá para **WooCommerce > Configurações > Avançado > REST API**
2. Verifique se as chaves de API estão configuradas corretamente:
   - Consumer Key: `ck_d106765e36b9a6af0d22bd22571388ec3ad67378`
   - Consumer Secret: `cs_0d5d0255c002e137d48be4da75d5d87363278bd6`

## 4. Uso da Integração

Para enviar produtos do PDV Vendas para o WooCommerce:

1. No PDV Vendas, selecione os produtos que deseja exportar
2. Clique no botão **Exportar para Site**
3. Escolha o método **WooCommerce**
4. Clique em **Sincronizar Produtos Selecionados**

Os produtos selecionados serão enviados para o WooCommerce e aparecerão no site https://achadinhoshopp.com.br/loja/ com o layout do PDV Vendas.

## 5. Solução de Problemas

Se encontrar problemas com a integração:

1. Verifique os logs do console para identificar erros específicos
2. Certifique-se de que as credenciais do WooCommerce estão corretas
3. Verifique se o plugin PDV Vendas CSS está ativado no WordPress
4. Tente exportar um produto de cada vez para identificar problemas específicos

## Suporte

Para obter suporte adicional, entre em contato com a equipe de suporte do PDV Vendas.
