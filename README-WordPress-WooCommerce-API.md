# Documentação de Referência: WordPress e WooCommerce REST API

## Introdução

Esta documentação serve como referência para a integração do PDV Vendas com WordPress e WooCommerce através de suas APIs REST. Ela contém informações essenciais sobre endpoints, autenticação, e exemplos de código para implementar uma integração robusta entre o aplicativo PDV Vendas e uma loja online WooCommerce.

## WordPress REST API

A WordPress REST API permite acessar e manipular dados do site (posts, páginas, categorias, usuários, etc.) por meio de endpoints RESTful, usando métodos HTTP como GET, POST, PUT e DELETE.

### Requisitos

- WordPress 4.4 ou superior
- Permalinks personalizados ativados em `Configurações > Links Permanentes`
- Recomendado o uso de HTTPS para segurança

### Endpoints Principais

| Endpoint | Descrição |
|----------|-----------|
| `/wp-json/wp/v2/posts` | Gerenciar posts |
| `/wp-json/wp/v2/pages` | Gerenciar páginas |
| `/wp-json/wp/v2/media` | Gerenciar arquivos de mídia |
| `/wp-json/wp/v2/users` | Gerenciar usuários |
| `/wp-json/wp/v2/categories` | Gerenciar categorias |
| `/wp-json/wp/v2/tags` | Gerenciar tags |

### Autenticação

A WordPress REST API suporta vários métodos de autenticação:

1. **Autenticação por Aplicação (Recomendada)**
   - Gera senhas específicas para aplicações
   - Não requer compartilhamento da senha principal
   - Pode ser revogada individualmente

2. **Autenticação OAuth 1.0a**
   - Mais segura para ambientes não-HTTPS
   - Requer implementação mais complexa

3. **Autenticação Básica (somente HTTPS)**
   - Simples de implementar
   - Requer HTTPS para segurança

### Exemplo de Código para Upload de Mídia

```php
// Exemplo de upload de imagem para o WordPress
function upload_image_to_wordpress($image_path, $title = '') {
    $api_url = 'https://achadinhoshopp.com.br/loja/wp-json/wp/v2/media';
    $username = 'gloliverx';
    $app_password = 'LoG4 lrgE 0VWR Oxwx bjBi 7Lu0';
    
    // Preparar os dados da imagem
    $file_name = basename($image_path);
    $file_type = mime_content_type($image_path);
    $file_content = file_get_contents($image_path);
    
    // Configurar a requisição
    $args = [
        'headers' => [
            'Authorization' => 'Basic ' . base64_encode($username . ':' . $app_password),
            'Content-Disposition' => 'attachment; filename=' . $file_name,
            'Content-Type' => $file_type,
        ],
        'body' => $file_content,
        'timeout' => 60,
    ];
    
    // Enviar a requisição
    $response = wp_remote_post($api_url, $args);
    
    // Verificar resposta
    if (is_wp_error($response)) {
        return ['success' => false, 'error' => $response->get_error_message()];
    }
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    return ['success' => true, 'media_id' => $body['id'], 'url' => $body['source_url']];
}
```

## WooCommerce REST API

A WooCommerce REST API permite gerenciar produtos, pedidos, clientes e outras funcionalidades da loja virtual.

### Requisitos

- WooCommerce 3.5 ou superior
- WordPress 4.4 ou superior
- Permalinks personalizados ativados
- Recomendado o uso de HTTPS

### Endpoints Principais

| Endpoint | Descrição |
|----------|-----------|
| `/wp-json/wc/v3/products` | Gerenciar produtos |
| `/wp-json/wc/v3/orders` | Gerenciar pedidos |
| `/wp-json/wc/v3/customers` | Gerenciar clientes |
| `/wp-json/wc/v3/coupons` | Gerenciar cupons |
| `/wp-json/wc/v3/reports` | Acessar relatórios |
| `/wp-json/wc/v3/webhooks` | Configurar webhooks |

### Autenticação

A WooCommerce REST API suporta dois métodos principais de autenticação:

1. **Autenticação com Chaves API (Recomendada)**
   - Gere chaves API no painel do WooCommerce em `WooCommerce > Configurações > Avançado > REST API`
   - Cada chave tem permissões específicas (leitura, escrita ou leitura/escrita)
   - Mais segura e específica para aplicações

2. **Autenticação OAuth 1.0a**
   - Usada para ambientes não-HTTPS
   - Mais complexa de implementar

### Configuração das Chaves API

Para o PDV Vendas, as seguintes chaves API foram configuradas:

```
Consumer key: ck_8306c2702634f7fe71fac60ab7b2536002985843
Consumer secret: cs_59bb663cbddad54dcbee98e3ba384a21f5991d20
```

### Exemplo de Código para Sincronização de Produtos

```php
// Exemplo de sincronização de produto com o WooCommerce
function sync_product_to_woocommerce($product_data, $image_ids = []) {
    $api_url = 'https://achadinhoshopp.com.br/loja/wp-json/wc/v3/products';
    $consumer_key = 'ck_8306c2702634f7fe71fac60ab7b2536002985843';
    $consumer_secret = 'cs_59bb663cbddad54dcbee98e3ba384a21f5991d20';
    
    // Preparar os dados do produto
    $data = [
        'name' => $product_data['name'],
        'type' => 'simple',
        'regular_price' => (string)$product_data['price'],
        'description' => $product_data['description'],
        'short_description' => $product_data['short_description'],
        'categories' => $product_data['categories'],
        'images' => array_map(function($id) {
            return ['id' => $id];
        }, $image_ids),
        'stock_quantity' => $product_data['stock'],
        'manage_stock' => true,
        'status' => 'publish',
    ];
    
    // Configurar a requisição
    $args = [
        'headers' => [
            'Authorization' => 'Basic ' . base64_encode($consumer_key . ':' . $consumer_secret),
            'Content-Type' => 'application/json',
        ],
        'body' => json_encode($data),
        'timeout' => 60,
    ];
    
    // Enviar a requisição
    $response = wp_remote_post($api_url, $args);
    
    // Verificar resposta
    if (is_wp_error($response)) {
        return ['success' => false, 'error' => $response->get_error_message()];
    }
    
    $body = json_decode(wp_remote_retrieve_body($response), true);
    return ['success' => true, 'product_id' => $body['id'], 'permalink' => $body['permalink']];
}
```

## Webhooks para Sincronização Bidirecional

Para manter o estoque sincronizado entre o PDV Vendas e o WooCommerce, é recomendado configurar webhooks.

### Configuração de Webhook no WooCommerce

1. Acesse `WooCommerce > Configurações > Avançado > Webhooks`
2. Adicione um novo webhook:
   - Nome: "Atualização de Estoque PDV Vendas"
   - Status: Ativo
   - Tópico: "Pedido atualizado"
   - URL de entrega: URL do endpoint no PDV Vendas
   - Chave secreta: Gere uma chave segura

### Exemplo de Código para Receber Webhook

```php
// Exemplo de endpoint para receber webhook do WooCommerce
function handle_woocommerce_webhook() {
    // Verificar a assinatura do webhook
    $signature = $_SERVER['HTTP_X_WC_WEBHOOK_SIGNATURE'];
    $payload = file_get_contents('php://input');
    $secret = 'sua_chave_secreta';
    
    $calculated_signature = base64_encode(hash_hmac('sha256', $payload, $secret, true));
    
    if ($signature !== $calculated_signature) {
        http_response_code(401);
        exit('Assinatura inválida');
    }
    
    // Processar os dados do pedido
    $data = json_decode($payload, true);
    
    // Atualizar o estoque no PDV Vendas
    if ($data['status'] === 'completed') {
        foreach ($data['line_items'] as $item) {
            update_pdv_vendas_stock($item['product_id'], $item['quantity']);
        }
    }
    
    http_response_code(200);
    echo json_encode(['success' => true]);
}
```

## Solução de Problemas Comuns

### Problemas de Upload de Imagens

1. **Erro 401 (Não Autorizado)**
   - Verifique as credenciais de autenticação
   - Confirme se as chaves API têm permissões de escrita

2. **Erro 413 (Entidade de Requisição Muito Grande)**
   - Reduza o tamanho da imagem
   - Aumente os limites de upload no servidor

3. **Erro 500 (Erro Interno do Servidor)**
   - Verifique os logs de erro do WordPress
   - Confirme se o diretório de uploads tem permissões corretas

### Problemas de Autenticação

1. **Erro "consumer_key is missing"**
   - Verifique se as chaves API estão corretas
   - Tente passar as chaves como parâmetros de consulta em vez de cabeçalho

2. **Erro "signature_invalid"**
   - Verifique a implementação da assinatura OAuth
   - Confirme se o timestamp está correto

## Recursos Adicionais

- [Documentação Oficial WordPress REST API](https://developer.wordpress.org/rest-api/)
- [Documentação Oficial WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [Biblioteca PHP para WooCommerce API](https://github.com/woocommerce/woocommerce-rest-api-docs)
- [Biblioteca JavaScript para WooCommerce API](https://www.npmjs.com/package/@woocommerce/woocommerce-rest-api)

---

*Esta documentação foi criada como referência para o projeto PDV Vendas e sua integração com WordPress/WooCommerce.*
