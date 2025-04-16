<?php
/**
 * Script para depurar a resposta da API do WooCommerce
 * e identificar o motivo do erro 400 (Bad Request)
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
        'wp_api' => true,
        'debug' => true
    ]
);

// Função para criar um produto de teste muito simples
function createMinimalProduct($woocommerce) {
    // Produto de teste com apenas os campos obrigatórios
    $product = [
        'name' => 'Produto Mínimo de Teste',
        'type' => 'simple',
        'regular_price' => '9.99'
    ];
    
    try {
        echo "Tentando criar um produto mínimo...\n";
        $response = $woocommerce->post('products', $product);
        
        echo "Produto criado com sucesso!\n";
        echo "- ID: " . $response->id . "\n";
        echo "- Nome: " . $response->name . "\n";
        
        return $response->id;
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
        
        return false;
    } catch (Exception $e) {
        echo "Erro: " . $e->getMessage() . "\n";
        return false;
    }
}

// Função para verificar a estrutura do produto do PDV Vendas
function checkPdvProductStructure() {
    // Verificar se há arquivos JSON de produtos
    $dataDir = __DIR__ . '/data';
    $jsonFiles = glob($dataDir . '/*.json');
    
    if (empty($jsonFiles)) {
        echo "Nenhum arquivo de produtos encontrado na pasta 'data'.\n";
        return false;
    }
    
    // Usar o primeiro arquivo encontrado
    $filePath = $jsonFiles[0];
    $fileName = basename($filePath);
    
    echo "Analisando arquivo de produtos: $fileName\n";
    
    // Ler o arquivo
    $productsJson = file_get_contents($filePath);
    $products = json_decode($productsJson, true);
    
    if (!is_array($products) || empty($products)) {
        echo "Arquivo não contém produtos válidos.\n";
        return false;
    }
    
    echo "Encontrados " . count($products) . " produtos no arquivo.\n";
    
    // Analisar o primeiro produto
    $product = $products[0];
    
    echo "Estrutura do primeiro produto:\n";
    foreach ($product as $key => $value) {
        $type = gettype($value);
        $preview = $type === 'string' ? (strlen($value) > 50 ? substr($value, 0, 47) . '...' : $value) : 
                  ($type === 'array' ? 'Array(' . count($value) . ')' : $value);
        
        echo "- $key: $type = $preview\n";
    }
    
    return $product;
}

// Função para testar a criação de um produto do PDV Vendas
function testPdvProductCreation($woocommerce, $pdvProduct) {
    // Formatar o produto para o WooCommerce
    $wooProduct = [
        'name' => $pdvProduct['description'] ?? 'Produto sem nome',
        'type' => 'simple',
        'regular_price' => (string)$pdvProduct['price'],
        'description' => $pdvProduct['itemDescription'] ?? $pdvProduct['description'] ?? 'Sem descrição',
        'short_description' => $pdvProduct['description'] ?? 'Sem descrição curta',
        'sku' => 'PDV-' . $pdvProduct['id'],
        'manage_stock' => true,
        'stock_quantity' => (int)($pdvProduct['quantity'] ?? 0),
        'status' => 'draft' // Usar draft para não aparecer na loja
    ];
    
    // Adicionar imagem se existir
    if (isset($pdvProduct['image']) && !empty($pdvProduct['image']) && !str_starts_with($pdvProduct['image'], 'data:')) {
        $wooProduct['images'] = [
            [
                'src' => $pdvProduct['image'],
                'alt' => $pdvProduct['description'] ?? 'Imagem do produto'
            ]
        ];
    }
    
    try {
        echo "Tentando criar um produto do PDV Vendas...\n";
        echo "Dados do produto:\n";
        print_r($wooProduct);
        
        $response = $woocommerce->post('products', $wooProduct);
        
        echo "Produto do PDV Vendas criado com sucesso!\n";
        echo "- ID: " . $response->id . "\n";
        echo "- Nome: " . $response->name . "\n";
        
        return $response->id;
    } catch (HttpClientException $e) {
        echo "Erro ao criar produto do PDV Vendas: " . $e->getMessage() . "\n";
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
        
        return false;
    } catch (Exception $e) {
        echo "Erro: " . $e->getMessage() . "\n";
        return false;
    }
}

// Função para excluir um produto
function deleteProduct($woocommerce, $productId) {
    try {
        echo "Excluindo produto de teste (ID: $productId)...\n";
        $woocommerce->delete("products/$productId", ['force' => true]);
        echo "Produto excluído com sucesso!\n";
        return true;
    } catch (Exception $e) {
        echo "Erro ao excluir produto: " . $e->getMessage() . "\n";
        return false;
    }
}

// Executar diagnóstico
echo "=================================================\n";
echo "Depuração da Resposta da API do WooCommerce\n";
echo "=================================================\n\n";

// Verificar a estrutura do produto do PDV Vendas
echo "Verificando a estrutura dos produtos do PDV Vendas...\n";
$pdvProduct = checkPdvProductStructure();

// Testar criação de produto mínimo
echo "\nTestando a criação de um produto mínimo...\n";
$minimalProductId = createMinimalProduct($woocommerce);

// Testar produto do PDV Vendas
if ($pdvProduct) {
    echo "\nTestando a criação de um produto do PDV Vendas...\n";
    $pdvProductId = testPdvProductCreation($woocommerce, $pdvProduct);
}

// Limpar produtos de teste
echo "\nLimpando produtos de teste...\n";
if (isset($minimalProductId) && $minimalProductId) {
    deleteProduct($woocommerce, $minimalProductId);
}
if (isset($pdvProductId) && $pdvProductId) {
    deleteProduct($woocommerce, $pdvProductId);
}

echo "\nDepuração concluída!\n";
echo "Verifique as mensagens acima para identificar o motivo do erro 400.\n";
