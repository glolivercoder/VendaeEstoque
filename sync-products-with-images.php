<?php
/**
 * Script para sincronizar produtos do PDV Vendas para o WooCommerce
 * com suporte aprimorado para upload de imagens
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
        'query_string_auth' => true,               // Usar autenticação via query string em vez de OAuth
    ]
);

// Configurar diretório para armazenar imagens temporárias
$tempImageDir = __DIR__ . '/temp_images';
if (!is_dir($tempImageDir)) {
    mkdir($tempImageDir, 0755, true);
}

/**
 * Função para obter produtos do PDV Vendas
 */
function getPdvProducts() {
    // Diretório de dados
    $dataDir = __DIR__ . '/data';

    // Criar diretório de dados se não existir
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }

    // Procurar por qualquer arquivo JSON na pasta data
    $jsonFiles = glob($dataDir . '/*.json');

    if (empty($jsonFiles)) {
        echo "\nNenhum arquivo de produtos encontrado!\n";
        echo "Por favor, execute o script export-pdv-products.bat para exportar os produtos do PDV Vendas.\n";
        echo "Ou copie um arquivo JSON válido para a pasta 'data'.\n\n";
        exit;
    }

    // Usar o primeiro arquivo JSON encontrado
    $filePath = $jsonFiles[0];
    $fileName = basename($filePath);

    echo "Usando arquivo de produtos: {$fileName}\n";

    // Ler o arquivo de dados
    $productsJson = file_get_contents($filePath);
    $products = json_decode($productsJson, true);

    // Verificar se o arquivo contém dados válidos
    if (!is_array($products) || empty($products)) {
        echo "Arquivo {$fileName} não contém dados válidos.\n";
        return [];
    }

    echo "Encontrados " . count($products) . " produtos no arquivo.\n";

    return $products;
}

/**
 * Função para verificar se uma string é uma imagem base64
 */
function isBase64Image($string) {
    return preg_match('/^data:image\/(\w+);base64,/', $string);
}

/**
 * Função para salvar uma imagem base64 como arquivo
 */
function saveBase64Image($base64String, $tempImageDir) {
    // Extrair tipo e dados da imagem
    if (preg_match('/^data:image\/(\w+);base64,(.+)$/', $base64String, $matches)) {
        $imageType = $matches[1];
        $imageData = base64_decode($matches[2]);

        // Gerar nome de arquivo único
        $fileName = 'product_' . uniqid() . '.' . $imageType;
        $filePath = $tempImageDir . '/' . $fileName;

        // Salvar arquivo
        if (file_put_contents($filePath, $imageData)) {
            return $filePath;
        }
    }

    return false;
}

/**
 * Função para fazer upload de uma imagem para o WordPress via API REST
 */
function uploadImageToWordPress($imagePath, $woocommerce) {
    // Verificar se o arquivo existe
    if (!file_exists($imagePath)) {
        echo "Arquivo de imagem não encontrado: {$imagePath}\n";
        return false;
    }

    try {
        // Preparar dados para upload
        $fileType = mime_content_type($imagePath);
        $fileName = basename($imagePath);

        // Criar cliente cURL para upload de mídia
        $curl = curl_init();

        // Configurar a requisição
        curl_setopt_array($curl, [
            CURLOPT_URL => $woocommerce->getUrl() . 'wp/v2/media',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => file_get_contents($imagePath),
            CURLOPT_HTTPHEADER => [
                'Content-Type: ' . $fileType,
                'Content-Disposition: attachment; filename=' . $fileName,
                'Authorization: Basic ' . base64_encode($woocommerce->getHttpClient()->getAuth()->getUsername() . ':' . $woocommerce->getHttpClient()->getAuth()->getPassword())
            ],
            // Desativar verificação SSL
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => false,
        ]);

        // Executar a requisição
        $response = curl_exec($curl);
        $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);

        // Fechar a conexão
        curl_close($curl);

        // Verificar resposta
        if ($httpCode >= 200 && $httpCode < 300) {
            $mediaData = json_decode($response, true);
            echo "Imagem enviada com sucesso: {$fileName}\n";
            return $mediaData['id'];
        } else {
            echo "Erro ao enviar imagem: {$fileName} (HTTP {$httpCode})\n";
            echo "Resposta: " . $response . "\n";
            return false;
        }
    } catch (Exception $e) {
        echo "Exceção ao enviar imagem: " . $e->getMessage() . "\n";
        return false;
    }
}

/**
 * Função para processar imagens do produto
 */
function processProductImages($product, $tempImageDir, $woocommerce) {
    $processedImages = [];

    // Processar imagem principal
    if (!empty($product['image'])) {
        $imageUrl = $product['image'];

        // Verificar se é uma imagem base64
        if (isBase64Image($imageUrl)) {
            echo "Processando imagem base64 para o produto: {$product['description']}\n";

            // Salvar imagem base64 como arquivo
            $imagePath = saveBase64Image($imageUrl, $tempImageDir);

            if ($imagePath) {
                // Fazer upload da imagem para o WordPress
                $imageId = uploadImageToWordPress($imagePath, $woocommerce);

                if ($imageId) {
                    $processedImages[] = ['id' => $imageId];
                }
            }
        } else if (isImageUrl($imageUrl)) {
            // É uma URL de imagem válida
            $processedImages[] = ['src' => $imageUrl];
        }
    }

    // Processar imagens adicionais dos links
    if (!empty($product['links']) && is_array($product['links'])) {
        foreach ($product['links'] as $link) {
            if (!empty($link['url'])) {
                $imageUrl = $link['url'];

                // Verificar se é uma imagem base64
                if (isBase64Image($imageUrl)) {
                    echo "Processando imagem base64 adicional para o produto: {$product['description']}\n";

                    // Salvar imagem base64 como arquivo
                    $imagePath = saveBase64Image($imageUrl, $tempImageDir);

                    if ($imagePath) {
                        // Fazer upload da imagem para o WordPress
                        $imageId = uploadImageToWordPress($imagePath, $woocommerce);

                        if ($imageId) {
                            $processedImages[] = ['id' => $imageId];
                        }
                    }
                } else if (isImageUrl($imageUrl)) {
                    // É uma URL de imagem válida
                    $processedImages[] = ['src' => $imageUrl];
                }
            }
        }
    }

    return $processedImages;
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
function formatProductForWooCommerce($pdvProduct, $processedImages) {
    // Preparar categorias no formato esperado pela API WooCommerce
    $categories = [];
    if (!empty($pdvProduct['category']) && $pdvProduct['category'] !== 'Todos') {
        $categories[] = ['name' => $pdvProduct['category']];
    } else {
        $categories[] = ['name' => 'Diversos'];
    }

    // Retornar produto formatado para a API WooCommerce
    return [
        'name' => $pdvProduct['description'],
        'description' => !empty($pdvProduct['itemDescription']) ? $pdvProduct['itemDescription'] : $pdvProduct['description'],
        'short_description' => $pdvProduct['description'],
        'sku' => 'PDV' . str_pad($pdvProduct['id'], 4, '0', STR_PAD_LEFT),
        'regular_price' => (string)$pdvProduct['price'],
        'stock_quantity' => (int)$pdvProduct['quantity'],
        'manage_stock' => true,
        'images' => $processedImages,
        'categories' => $categories,
        'status' => 'publish'
    ];
}

/**
 * Função principal para sincronizar produtos
 */
function syncProductsToWooCommerce($woocommerce, $tempImageDir) {
    try {
        // Obter produtos do PDV Vendas
        $pdvProducts = getPdvProducts();

        echo "Iniciando sincronização de " . count($pdvProducts) . " produtos...\n";

        // Para cada produto do PDV Vendas
        foreach ($pdvProducts as $product) {
            $sku = 'PDV' . str_pad($product['id'], 4, '0', STR_PAD_LEFT);

            // Verificar se o produto já existe no WooCommerce (por SKU)
            $existingProducts = $woocommerce->get('products', ['sku' => $sku]);

            // Processar imagens do produto
            $processedImages = processProductImages($product, $tempImageDir, $woocommerce);

            // Formatar o produto para o formato da API WooCommerce
            $wooProduct = formatProductForWooCommerce($product, $processedImages);

            if (count($existingProducts) > 0) {
                // Produto já existe, atualizar
                $productId = $existingProducts[0]->id;
                echo "Atualizando produto: " . $product['description'] . " (ID: $productId)\n";
                $woocommerce->put("products/$productId", $wooProduct);
            } else {
                // Produto não existe, criar novo
                echo "Criando novo produto: " . $product['description'] . "\n";
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
syncProductsToWooCommerce($woocommerce, $tempImageDir);
echo "Processo finalizado.\n";

// Limpar arquivos temporários
echo "Limpando arquivos temporários...\n";
$tempFiles = glob($tempImageDir . '/*');
foreach ($tempFiles as $file) {
    if (is_file($file)) {
        unlink($file);
    }
}
echo "Limpeza concluída.\n";
