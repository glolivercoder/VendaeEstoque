<?php
/**
 * Script para testar a conexão com a API do WooCommerce
 * e verificar se é possível fazer upload de imagens
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
        'query_string_auth' => true, // Usar autenticação via query string em vez de OAuth
        'timeout' => 120
    ]
);

// Função para fazer upload de uma imagem para o WordPress via API REST
function uploadImageToWordPress($imagePath, $wpUrl, $username, $password) {
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
            CURLOPT_URL => rtrim($wpUrl, '/') . '/wp-json/wp/v2/media',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => file_get_contents($imagePath),
            CURLOPT_HTTPHEADER => [
                'Content-Type: ' . $fileType,
                'Content-Disposition: attachment; filename=' . $fileName,
                'Authorization: Basic ' . base64_encode($username . ':' . $password)
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
            return $mediaData;
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

// Testar conexão com a API do WooCommerce
echo "Testando conexão com a API do WooCommerce...\n";

try {
    // Obter informações da loja
    $store = $woocommerce->get('');

    echo "Conexão estabelecida com sucesso!\n";
    echo "Informações da loja:\n";
    echo "- Nome: " . (isset($store->store_name) ? $store->store_name : 'N/A') . "\n";
    echo "- Descrição: " . (isset($store->store_description) ? $store->store_description : 'N/A') . "\n";
    echo "- URL: " . (isset($store->URL) ? $store->URL : 'N/A') . "\n";

    // Testar obtenção de produtos
    echo "\nObtendo produtos...\n";
    $products = $woocommerce->get('products', ['per_page' => 5]);

    if (empty($products)) {
        echo "Nenhum produto encontrado.\n";
    } else {
        echo "Produtos encontrados: " . count($products) . "\n";
        foreach ($products as $product) {
            echo "- " . $product->name . " (ID: " . $product->id . ")\n";
        }
    }

    // Testar upload de imagem
    echo "\nTestando upload de imagem...\n";

    // Verificar se há credenciais para upload de imagem
    if (isset($env['VITE_WORDPRESS_USERNAME']) && isset($env['VITE_WORDPRESS_APP_PASSWORD'])) {
        $username = $env['VITE_WORDPRESS_USERNAME'];
        $password = $env['VITE_WORDPRESS_APP_PASSWORD'];

        // Criar uma imagem de teste
        $testImagePath = __DIR__ . '/test-image.png';

        // Criar uma imagem simples
        $image = imagecreatetruecolor(200, 200);
        $textColor = imagecolorallocate($image, 255, 255, 255);
        $bgColor = imagecolorallocate($image, 0, 102, 204);
        imagefilledrectangle($image, 0, 0, 200, 200, $bgColor);
        imagestring($image, 5, 50, 90, 'Test Image', $textColor);
        imagepng($image, $testImagePath);
        imagedestroy($image);

        echo "Imagem de teste criada: $testImagePath\n";

        // Fazer upload da imagem
        $uploadResult = uploadImageToWordPress($testImagePath, $wpUrl, $username, $password);

        if ($uploadResult) {
            echo "Upload de imagem bem-sucedido!\n";
            echo "ID da mídia: " . $uploadResult['id'] . "\n";
            echo "URL da imagem: " . $uploadResult['source_url'] . "\n";

            // Testar criação de produto com a imagem
            echo "\nTestando criação de produto com a imagem...\n";

            $newProduct = [
                'name' => 'Produto de Teste - ' . date('Y-m-d H:i:s'),
                'type' => 'simple',
                'regular_price' => '9.99',
                'description' => 'Este é um produto de teste criado via API.',
                'short_description' => 'Produto de teste.',
                'categories' => [
                    [
                        'name' => 'Teste'
                    ]
                ],
                'images' => [
                    [
                        'id' => $uploadResult['id']
                    ]
                ]
            ];

            try {
                $product = $woocommerce->post('products', $newProduct);
                echo "Produto criado com sucesso!\n";
                echo "- ID: " . $product->id . "\n";
                echo "- Nome: " . $product->name . "\n";
                echo "- Imagem: " . (isset($product->images[0]->src) ? $product->images[0]->src : 'N/A') . "\n";
            } catch (HttpClientException $e) {
                echo "Erro ao criar produto: " . $e->getMessage() . "\n";
                echo "Resposta: " . $e->getResponse()->getBody() . "\n";
            }
        }

        // Limpar arquivo de teste
        if (file_exists($testImagePath)) {
            unlink($testImagePath);
            echo "\nArquivo de teste removido.\n";
        }
    } else {
        echo "Credenciais para upload de imagem não encontradas no arquivo .env.\n";
        echo "Adicione VITE_WORDPRESS_USERNAME e VITE_WORDPRESS_APP_PASSWORD ao arquivo .env.\n";
    }

} catch (HttpClientException $e) {
    echo "Erro na API do WooCommerce: " . $e->getMessage() . "\n";
    echo "Resposta: " . $e->getResponse()->getBody() . "\n";
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage() . "\n";
}

echo "\nTeste concluído!\n";
