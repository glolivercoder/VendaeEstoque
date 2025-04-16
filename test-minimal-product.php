<?php
/**
 * Script para testar a criação de um produto mínimo no WooCommerce
 */

// Carregar o autoloader do Composer
require __DIR__ . '/vendor/autoload.php';

use Automattic\WooCommerce\Client;
use Automattic\WooCommerce\HttpClient\HttpClientException;

// Carregar variáveis de ambiente do arquivo .env
$env = parse_ini_file('.env');

// Verificar se as credenciais estão disponíveis
if (!isset($env['VITE_WORDPRESS_URL']) || 
    !isset($env['VITE_WOOCOMMERCE_CONSUMER_KEY']) || 
    !isset($env['VITE_WOOCOMMERCE_CONSUMER_SECRET'])) {
    die("Erro: Credenciais não encontradas no arquivo .env\n");
}

// Configurações
$wpUrl = $env['VITE_WORDPRESS_URL'];
$consumerKey = $env['VITE_WOOCOMMERCE_CONSUMER_KEY'];
$consumerSecret = $env['VITE_WOOCOMMERCE_CONSUMER_SECRET'];

echo "Usando URL: $wpUrl\n";
echo "Consumer Key: " . substr($consumerKey, 0, 5) . "...\n";
echo "Consumer Secret: " . substr($consumerSecret, 0, 5) . "...\n";

// Configurar a conexão com a API do WooCommerce
$woocommerce = new Client(
    $wpUrl,
    $consumerKey,
    $consumerSecret,
    [
        'version' => 'wc/v3',
        'timeout' => 120,
        'verify_ssl' => false,
        'query_string_auth' => true,
    ]
);

// Produto de teste com apenas os campos obrigatórios
$product = [
    'name' => 'Produto Mínimo de Teste - ' . date('Y-m-d H:i:s'),
    'type' => 'simple',
    'regular_price' => '9.99',
    'status' => 'draft'
];

try {
    echo "Tentando criar um produto mínimo...\n";
    echo "Dados do produto:\n";
    print_r($product);
    
    $response = $woocommerce->post('products', $product);
    
    echo "Produto criado com sucesso!\n";
    echo "- ID: " . $response->id . "\n";
    echo "- Nome: " . $response->name . "\n";
    
    // Excluir o produto de teste
    echo "\nExcluindo produto de teste...\n";
    $woocommerce->delete('products/' . $response->id, ['force' => true]);
    echo "Produto excluído com sucesso!\n";
} catch (HttpClientException $e) {
    echo "Erro ao criar produto: " . $e->getMessage() . "\n";
    echo "Resposta: " . $e->getResponse()->getBody() . "\n";
    
    // Analisar o erro
    $errorBody = json_decode($e->getResponse()->getBody(), true);
    if (isset($errorBody['message'])) {
        echo "Mensagem de erro: " . $errorBody['message'] . "\n";
    }
    
    if (isset($errorBody['data']['params'])) {
        echo "Parâmetros com problema:\n";
        print_r($errorBody['data']['params']);
    }
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage() . "\n";
}

echo "\nTeste concluído!\n";
