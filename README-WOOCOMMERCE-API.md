# Integração PDV Vendas com WooCommerce via API

Este projeto permite sincronizar produtos do PDV Vendas para o WooCommerce usando a API REST oficial do WooCommerce.

## Pré-requisitos

- PHP 7.4 ou superior
- Composer
- Credenciais de API do WooCommerce (Consumer Key e Consumer Secret)
- Acesso ao banco de dados do PDV Vendas

## Instalação

1. **Instalar Dependências**:
   - Execute o arquivo `install-wc-api.bat` ou use o comando:
     ```
     composer install
     ```

2. **Configurar Credenciais**:
   - As credenciais já estão configuradas no arquivo `.env`:
     ```
     VITE_WORDPRESS_URL=https://achadinhoshopp.com.br/loja
     VITE_WOOCOMMERCE_CONSUMER_KEY=ck_40b4a1a674084d504579a2ba2d51530c260d3645
     VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_8fa4b36ab57ddb02415e4fc346451791ab1782f9
     ```

## Uso

### Exportar Produtos do PDV Vendas

Antes de sincronizar, você precisa exportar os produtos do PDV Vendas:

1. Execute o arquivo `export-pdv-products.bat`
2. Siga as instruções na tela:
   - Abra o PDV Vendas no navegador Chrome
   - Pressione F12 para abrir as ferramentas de desenvolvedor
   - Vá para a aba "Console"
   - Copie e cole o conteúdo do arquivo `export-products-browser.js` no console
   - Pressione Enter para executar
   - Salve o arquivo JSON baixado na pasta `data` (crie a pasta se não existir)

### Sincronização Manual

Após exportar os produtos, sincronize-os com o WooCommerce:

1. Execute o arquivo `sync-products.bat` ou use o comando:
   ```
   php sync-products-to-woocommerce.php
   ```

2. O script irá:
   - Ler os produtos exportados do PDV Vendas
   - Verificar se cada produto já existe no WooCommerce (por SKU)
   - Criar novos produtos ou atualizar existentes
   - Sincronizar imagens dos produtos

### Sincronização Automática

Para configurar a sincronização automática:

1. Edite o arquivo `schedule-sync.xml`:
   - Substitua `DIRETORIO_DO_SCRIPT` pelo caminho completo para o diretório do script

2. Importe a tarefa no Agendador de Tarefas do Windows:
   ```
   schtasks /create /tn "PDV-WooCommerce-Sync" /xml schedule-sync.xml
   ```

3. A sincronização será executada diariamente no horário configurado

## Personalização

### Adaptação para o PDV Vendas

O script já está configurado para ler os produtos exportados do PDV Vendas. Se a estrutura dos seus dados for diferente, você pode modificar a função `getPdvProducts()` no arquivo `sync-products-to-woocommerce.php`.

A função atual espera que os produtos tenham a seguinte estrutura:

```json
{
  "id": 1,
  "description": "Nome do Produto",
  "price": 29.99,
  "quantity": 10,
  "image": "https://exemplo.com/imagem.jpg",
  "itemDescription": "Descrição detalhada do produto",
  "category": "Categoria do Produto",
  "links": [
    { "url": "https://exemplo.com/imagem2.jpg" }
  ]
}
```

### Mapeamento de Campos

O mapeamento entre os campos do PDV Vendas e do WooCommerce é feito na função `formatProductForWooCommerce()`. Personalize conforme necessário:

```php
function formatProductForWooCommerce($pdvProduct) {
    // Personalize o mapeamento de campos aqui
}
```

## Solução de Problemas

### Erros de Conexão

- Verifique se as credenciais da API estão corretas
- Confirme se a URL da loja WooCommerce está acessível
- Verifique se a API REST do WooCommerce está ativada

### Erros de Sincronização de Imagens

- Certifique-se de que as URLs das imagens são acessíveis publicamente
- Verifique se o formato das URLs está correto
- Confirme se o servidor WordPress tem permissão para baixar imagens externas

### Timeout na API

- Aumente o valor do parâmetro `timeout` na configuração do cliente WooCommerce
- Sincronize menos produtos por vez

## Recursos Adicionais

- [Documentação da API WooCommerce](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [Repositório da Biblioteca WC-API-PHP](https://github.com/woocommerce/wc-api-php)
- [Guia de Autenticação da API WooCommerce](https://woocommerce.github.io/woocommerce-rest-api-docs/#authentication)

---

*Esta integração foi desenvolvida para sincronizar produtos do PDV Vendas para o WooCommerce usando a API REST oficial.*
