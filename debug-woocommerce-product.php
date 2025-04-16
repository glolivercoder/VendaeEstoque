<?php
/**
 * Script para diagnosticar e corrigir problemas na criação de produtos no WooCommerce
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
    ]
);

// Função para verificar permissões da API
function checkApiPermissions($woocommerce) {
    try {
        // Tentar obter informações da loja
        $response = $woocommerce->get('');
        
        echo "Conexão com a API do WooCommerce estabelecida com sucesso!\n";
        echo "Informações da loja:\n";
        echo "- Nome: " . (isset($response->store_name) ? $response->store_name : 'N/A') . "\n";
        echo "- URL: " . (isset($response->URL) ? $response->URL : 'N/A') . "\n";
        
        return true;
    } catch (HttpClientException $e) {
        echo "Erro na API do WooCommerce: " . $e->getMessage() . "\n";
        echo "Resposta: " . $e->getResponse()->getBody() . "\n";
        return false;
    } catch (Exception $e) {
        echo "Erro: " . $e->getMessage() . "\n";
        return false;
    }
}

// Função para criar um produto de teste simples
function createSimpleTestProduct($woocommerce) {
    // Produto de teste muito simples
    $product = [
        'name' => 'Produto de Teste - ' . date('Y-m-d H:i:s'),
        'type' => 'simple',
        'regular_price' => '9.99',
        'description' => 'Este é um produto de teste criado via API.',
        'short_description' => 'Produto de teste.',
        'status' => 'draft' // Usar draft para não aparecer na loja
    ];
    
    try {
        echo "Tentando criar um produto simples...\n";
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

// Função para criar um produto com imagem
function createProductWithImage($woocommerce, $imageUrl) {
    // Produto com imagem
    $product = [
        'name' => 'Produto com Imagem - ' . date('Y-m-d H:i:s'),
        'type' => 'simple',
        'regular_price' => '19.99',
        'description' => 'Este é um produto de teste com imagem criado via API.',
        'short_description' => 'Produto de teste com imagem.',
        'status' => 'draft', // Usar draft para não aparecer na loja
        'images' => [
            [
                'src' => $imageUrl,
                'alt' => 'Imagem de teste'
            ]
        ]
    ];
    
    try {
        echo "Tentando criar um produto com imagem...\n";
        $response = $woocommerce->post('products', $product);
        
        echo "Produto com imagem criado com sucesso!\n";
        echo "- ID: " . $response->id . "\n";
        echo "- Nome: " . $response->name . "\n";
        echo "- Imagem: " . (isset($response->images[0]->src) ? $response->images[0]->src : 'N/A') . "\n";
        
        return $response->id;
    } catch (HttpClientException $e) {
        echo "Erro ao criar produto com imagem: " . $e->getMessage() . "\n";
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

// Função para criar um produto com todos os campos
function createCompleteProduct($woocommerce, $imageUrl) {
    // Produto completo com todos os campos possíveis
    $product = [
        'name' => 'Produto Completo - ' . date('Y-m-d H:i:s'),
        'type' => 'simple',
        'regular_price' => '29.99',
        'description' => 'Este é um produto de teste completo criado via API.',
        'short_description' => 'Produto de teste completo.',
        'status' => 'draft', // Usar draft para não aparecer na loja
        'catalog_visibility' => 'visible',
        'sku' => 'TEST-' . rand(1000, 9999),
        'manage_stock' => true,
        'stock_quantity' => 10,
        'stock_status' => 'instock',
        'categories' => [
            [
                'name' => 'Teste'
            ]
        ],
        'images' => [
            [
                'src' => $imageUrl,
                'alt' => 'Imagem de teste'
            ]
        ],
        'attributes' => [
            [
                'name' => 'Cor',
                'position' => 0,
                'visible' => true,
                'variation' => false,
                'options' => ['Azul', 'Vermelho']
            ]
        ],
        'meta_data' => [
            [
                'key' => '_test_meta',
                'value' => 'test_value'
            ]
        ]
    ];
    
    try {
        echo "Tentando criar um produto completo...\n";
        $response = $woocommerce->post('products', $product);
        
        echo "Produto completo criado com sucesso!\n";
        echo "- ID: " . $response->id . "\n";
        echo "- Nome: " . $response->name . "\n";
        
        return $response->id;
    } catch (HttpClientException $e) {
        echo "Erro ao criar produto completo: " . $e->getMessage() . "\n";
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
    
    // Verificar campos obrigatórios
    $requiredFields = ['description', 'price'];
    $missingFields = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($product[$field]) || empty($product[$field])) {
            $missingFields[] = $field;
        }
    }
    
    if (!empty($missingFields)) {
        echo "AVISO: Campos obrigatórios ausentes: " . implode(', ', $missingFields) . "\n";
    } else {
        echo "Todos os campos obrigatórios estão presentes.\n";
    }
    
    // Verificar formato do preço
    if (isset($product['price'])) {
        $price = $product['price'];
        if (!is_numeric($price)) {
            echo "AVISO: O campo 'price' não é numérico: '$price'\n";
        } else {
            echo "Campo 'price' está no formato correto.\n";
        }
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

// Executar diagnóstico
echo "=================================================\n";
echo "Diagnóstico de Criação de Produtos no WooCommerce\n";
echo "=================================================\n\n";

// Verificar permissões da API
echo "Verificando permissões da API do WooCommerce...\n";
if (!checkApiPermissions($woocommerce)) {
    die("Não foi possível conectar à API do WooCommerce. Verifique as credenciais e tente novamente.\n");
}

// Verificar a estrutura do produto do PDV Vendas
echo "\nVerificando a estrutura dos produtos do PDV Vendas...\n";
$pdvProduct = checkPdvProductStructure();

// Testar criação de produtos
echo "\nTestando a criação de produtos no WooCommerce...\n";

// 1. Produto simples
$simpleProductId = createSimpleTestProduct($woocommerce);

// 2. Produto com imagem
if ($simpleProductId) {
    echo "\nTestando a criação de produto com imagem...\n";
    // Usar uma imagem de exemplo
    $imageUrl = "https://via.placeholder.com/800x600";
    $imageProductId = createProductWithImage($woocommerce, $imageUrl);
    
    // 3. Produto completo
    if ($imageProductId) {
        echo "\nTestando a criação de produto completo...\n";
        $completeProductId = createCompleteProduct($woocommerce, $imageUrl);
    }
}

// 4. Testar produto do PDV Vendas
if ($pdvProduct) {
    echo "\nTestando a criação de um produto do PDV Vendas...\n";
    $pdvProductId = testPdvProductCreation($woocommerce, $pdvProduct);
}

// Limpar produtos de teste
echo "\nLimpando produtos de teste...\n";
if (isset($simpleProductId) && $simpleProductId) {
    deleteProduct($woocommerce, $simpleProductId);
}
if (isset($imageProductId) && $imageProductId) {
    deleteProduct($woocommerce, $imageProductId);
}
if (isset($completeProductId) && $completeProductId) {
    deleteProduct($woocommerce, $completeProductId);
}
if (isset($pdvProductId) && $pdvProductId) {
    deleteProduct($woocommerce, $pdvProductId);
}

echo "\nDiagnóstico concluído!\n";
echo "Verifique as mensagens acima para identificar possíveis problemas na criação de produtos.\n";

// Sugestões com base nos resultados
echo "\nSugestões:\n";
echo "1. Verifique se o usuário associado às chaves de API tem permissões para criar produtos.\n";
echo "2. Certifique-se de que o formato do preço está correto (deve ser uma string numérica).\n";
echo "3. Verifique se há campos obrigatórios faltando nos produtos do PDV Vendas.\n";
echo "4. Tente criar produtos com menos campos para identificar qual campo está causando o problema.\n";
echo "5. Verifique se há plugins no WordPress que possam estar interferindo na criação de produtos.\n";
