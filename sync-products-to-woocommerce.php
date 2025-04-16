<?php
/**
 * Script para sincronizar produtos do PDV Vendas para o WooCommerce
 * usando a biblioteca WC-API-PHP
 */

// Carregar o autoloader do Composer
require __DIR__ . '/vendor/autoload.php';

use Automattic\WooCommerce\Client;
use Automattic\WooCommerce\HttpClient\HttpClientException;

// Carregar variáveis de ambiente do arquivo .env
$env = parse_ini_file('.env');

// Configurar a conexão com a API do WooCommerce
$woocommerce = new Client(
    $env['VITE_WORDPRESS_URL'],                    // URL da loja WooCommerce
    $env['VITE_WOOCOMMERCE_CONSUMER_KEY'],         // Consumer Key
    $env['VITE_WOOCOMMERCE_CONSUMER_SECRET'],      // Consumer Secret
    [
        'version' => 'wc/v3',                      // Versão da API
        'timeout' => 120,                          // Timeout em segundos
        'verify_ssl' => false,                     // Desativar verificação SSL para desenvolvimento
    ]
);

/**
 * Função para obter produtos do PDV Vendas
 * Esta função acessa diretamente os dados do IndexedDB usado pelo PDV Vendas
 */
function getPdvProducts() {
    // Diretório de dados
    $dataDir = __DIR__ . '/data';

    // Criar diretório de dados se não existir
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }

    // Possíveis nomes de arquivos de produtos
    $possibleFiles = [
        'pdv-vendas-products.json',
        'pdv-vendas-db-products.json',
        'pdv-db-products.json',
        'estoque-app-db-products.json',
        'vendas-db-products.json',
        'pdv-estoque-db-products.json',
        'localforage-products.json',
        'pdv-vendas-db-items.json',
        'pdv-db-items.json'
    ];

    // Procurar por qualquer arquivo JSON na pasta data
    $jsonFiles = glob($dataDir . '/*.json');

    // Se encontrou arquivos JSON, adicionar à lista de possíveis arquivos
    if (!empty($jsonFiles)) {
        foreach ($jsonFiles as $jsonFile) {
            $fileName = basename($jsonFile);
            if (!in_array($fileName, $possibleFiles)) {
                $possibleFiles[] = $fileName;
            }
        }
    }

    // Verificar cada possível arquivo
    $pdvProducts = null;
    $usedFile = null;

    foreach ($possibleFiles as $fileName) {
        $filePath = $dataDir . '/' . $fileName;

        if (file_exists($filePath)) {
            echo "Encontrado arquivo de produtos: {$fileName}\n";

            // Ler o arquivo de dados
            $productsJson = file_get_contents($filePath);
            $products = json_decode($productsJson, true);

            // Verificar se o arquivo contém dados válidos
            if (is_array($products) && !empty($products)) {
                $pdvProducts = $products;
                $usedFile = $fileName;
                break;
            } else {
                echo "Arquivo {$fileName} não contém dados válidos.\n";
            }
        }
    }

    // Se não encontrou nenhum arquivo válido
    if ($pdvProducts === null) {
        echo "\nNenhum arquivo de produtos válido encontrado!\n";
        echo "Por favor, execute o script export-pdv-products.bat para exportar os produtos do PDV Vendas.\n";
        echo "Ou copie um arquivo JSON válido para a pasta 'data'.\n\n";
        exit;
    }

    echo "Usando arquivo: {$usedFile}\n";

    if (empty($pdvProducts)) {
        echo "Nenhum produto encontrado no arquivo de dados.\n";
        echo "Verifique se o arquivo {$usedFile} contém dados válidos.\n";
        return [];
    }

    echo "Encontrados " . count($pdvProducts) . " produtos no PDV Vendas.\n";

    // Converter os produtos para o formato esperado
    $formattedProducts = [];
    foreach ($pdvProducts as $product) {
        // Extrair URLs de imagens dos links ou do campo image
        $images = [];

        // Adicionar imagem principal se existir
        if (!empty($product['image'])) {
            $images[] = $product['image'];
        }

        // Adicionar imagens dos links
        if (!empty($product['links']) && is_array($product['links'])) {
            foreach ($product['links'] as $link) {
                if (!empty($link['url']) && isImageUrl($link['url'])) {
                    $images[] = $link['url'];
                }
            }
        }

        // Formatar categorias
        $categories = [];
        if (!empty($product['category']) && $product['category'] !== 'Todos') {
            $categories[] = $product['category'];
        } else {
            $categories[] = 'Diversos';
        }

        // Formatar o produto
        $formattedProducts[] = [
            'id' => $product['id'],
            'name' => $product['description'],
            'description' => !empty($product['itemDescription']) ? $product['itemDescription'] : $product['description'],
            'short_description' => $product['description'],
            'sku' => 'PDV' . str_pad($product['id'], 4, '0', STR_PAD_LEFT),
            'regular_price' => (string)$product['price'],
            'stock_quantity' => (int)$product['quantity'],
            'manage_stock' => true,
            'images' => $images,
            'categories' => $categories
        ];
    }

    return $formattedProducts;
}

/**
 * Função auxiliar para verificar se uma URL é de imagem
 */
function isImageUrl($url) {
    $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    $urlPath = parse_url($url, PHP_URL_PATH);
    $extension = pathinfo($urlPath, PATHINFO_EXTENSION);
    return in_array(strtolower($extension), $imageExtensions);
}

/**
 * Função para formatar produtos do PDV Vendas para o formato da API WooCommerce
 */
function formatProductForWooCommerce($pdvProduct) {
    // Preparar imagens no formato esperado pela API WooCommerce
    $images = [];
    foreach ($pdvProduct['images'] as $imageUrl) {
        $images[] = ['src' => $imageUrl];
    }

    // Preparar categorias no formato esperado pela API WooCommerce
    $categories = [];
    foreach ($pdvProduct['categories'] as $categoryName) {
        // Verificar se a categoria já existe ou criar uma nova
        $categories[] = ['name' => $categoryName];
    }

    // Retornar produto formatado para a API WooCommerce
    return [
        'name' => $pdvProduct['name'],
        'description' => $pdvProduct['description'],
        'short_description' => $pdvProduct['short_description'],
        'sku' => $pdvProduct['sku'],
        'regular_price' => $pdvProduct['regular_price'],
        'stock_quantity' => $pdvProduct['stock_quantity'],
        'manage_stock' => $pdvProduct['manage_stock'],
        'images' => $images,
        'categories' => $categories,
        'status' => 'publish'
    ];
}

/**
 * Função principal para sincronizar produtos
 */
function syncProductsToWooCommerce($woocommerce) {
    try {
        // Obter produtos do PDV Vendas
        $pdvProducts = getPdvProducts();

        echo "Iniciando sincronização de " . count($pdvProducts) . " produtos...\n";

        // Para cada produto do PDV Vendas
        foreach ($pdvProducts as $pdvProduct) {
            // Verificar se o produto já existe no WooCommerce (por SKU)
            $existingProducts = $woocommerce->get('products', ['sku' => $pdvProduct['sku']]);

            // Formatar o produto para o formato da API WooCommerce
            $wooProduct = formatProductForWooCommerce($pdvProduct);

            if (count($existingProducts) > 0) {
                // Produto já existe, atualizar
                $productId = $existingProducts[0]->id;
                echo "Atualizando produto: " . $pdvProduct['name'] . " (ID: $productId)\n";
                $woocommerce->put("products/$productId", $wooProduct);
            } else {
                // Produto não existe, criar novo
                echo "Criando novo produto: " . $pdvProduct['name'] . "\n";
                $woocommerce->post('products', $wooProduct);
            }
        }

        echo "Sincronização concluída com sucesso!\n";

    } catch (HttpClientException $e) {
        echo "Erro na sincronização: " . $e->getMessage() . "\n";
        echo "Resposta: " . $e->getResponse()->getBody() . "\n";
    } catch (Exception $e) {
        echo "Erro: " . $e->getMessage() . "\n";
    }
}

// Executar a sincronização
echo "Iniciando sincronização de produtos do PDV Vendas para o WooCommerce...\n";
syncProductsToWooCommerce($woocommerce);
echo "Processo finalizado.\n";
