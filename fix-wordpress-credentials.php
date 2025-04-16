<?php
/**
 * Script para verificar e corrigir as credenciais do WordPress
 * e testar a criação de produtos no WooCommerce
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

// Verificar e solicitar credenciais de usuário do WordPress
$username = isset($env['VITE_WORDPRESS_USERNAME']) ? $env['VITE_WORDPRESS_USERNAME'] : '';
$appPassword = isset($env['VITE_WORDPRESS_APP_PASSWORD']) ? $env['VITE_WORDPRESS_APP_PASSWORD'] : '';

if (empty($username) || empty($appPassword)) {
    echo "Credenciais de usuário do WordPress não encontradas no arquivo .env\n";
    echo "Por favor, forneça as credenciais corretas:\n";
    
    echo "Nome de usuário do WordPress: ";
    $username = trim(fgets(STDIN));
    
    echo "Senha de aplicativo do WordPress: ";
    $appPassword = trim(fgets(STDIN));
    
    // Atualizar o arquivo .env com as novas credenciais
    $envContent = file_get_contents('.env');
    $envContent .= "\nVITE_WORDPRESS_USERNAME=$username\n";
    $envContent .= "VITE_WORDPRESS_APP_PASSWORD=$appPassword\n";
    file_put_contents('.env', $envContent);
    
    echo "Credenciais atualizadas no arquivo .env\n";
}

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
        $error = curl_error($curl);
        
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
            if ($error) {
                echo "Erro cURL: " . $error . "\n";
            }
            return false;
        }
    } catch (Exception $e) {
        echo "Exceção ao enviar imagem: " . $e->getMessage() . "\n";
        return false;
    }
}

// Testar conexão com a API do WordPress
echo "Testando conexão com a API do WordPress...\n";

// Função para fazer requisições à API do WordPress
function callWordPressAPI($endpoint, $wpUrl, $username, $password, $method = 'GET', $data = null) {
    $url = rtrim($wpUrl, '/') . '/wp-json/' . ltrim($endpoint, '/');
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    
    // Desativar verificação SSL
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    
    if ($method === 'POST' || $method === 'PUT') {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
    }
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "Erro na requisição: $error\n";
        return null;
    }
    
    return [
        'code' => $httpCode,
        'body' => json_decode($response, true),
        'raw' => $response
    ];
}

// Testar autenticação com a API do WordPress
$response = callWordPressAPI('wp/v2/users/me', $wpUrl, $username, $appPassword);

if (!$response || $response['code'] >= 400) {
    echo "Erro ao autenticar com a API do WordPress. Código: " . ($response ? $response['code'] : 'N/A') . "\n";
    echo "Resposta: " . ($response ? $response['raw'] : 'N/A') . "\n";
    
    echo "\nAs credenciais fornecidas parecem estar incorretas.\n";
    echo "Por favor, verifique se o nome de usuário e a senha de aplicativo estão corretos.\n";
    
    echo "\nPara gerar uma nova senha de aplicativo no WordPress:\n";
    echo "1. Acesse o painel administrativo do WordPress\n";
    echo "2. Vá para Usuários > Seu Perfil\n";
    echo "3. Role até a seção 'Senhas de aplicativo'\n";
    echo "4. Digite um nome para a senha (ex: 'PDV Vendas')\n";
    echo "5. Clique em 'Adicionar nova senha de aplicativo'\n";
    echo "6. Copie a senha gerada e forneça-a quando solicitado por este script\n";
    
    echo "\nDeseja tentar novamente com novas credenciais? (S/N): ";
    $retry = trim(fgets(STDIN));
    
    if (strtoupper($retry) === 'S') {
        echo "Nome de usuário do WordPress: ";
        $username = trim(fgets(STDIN));
        
        echo "Senha de aplicativo do WordPress: ";
        $appPassword = trim(fgets(STDIN));
        
        // Atualizar o arquivo .env com as novas credenciais
        $envContent = file_get_contents('.env');
        $envContent = preg_replace('/VITE_WORDPRESS_USERNAME=.*/', "VITE_WORDPRESS_USERNAME=$username", $envContent);
        $envContent = preg_replace('/VITE_WORDPRESS_APP_PASSWORD=.*/', "VITE_WORDPRESS_APP_PASSWORD=$appPassword", $envContent);
        file_put_contents('.env', $envContent);
        
        echo "Credenciais atualizadas no arquivo .env\n";
        
        // Testar novamente
        $response = callWordPressAPI('wp/v2/users/me', $wpUrl, $username, $appPassword);
        
        if (!$response || $response['code'] >= 400) {
            echo "Erro ao autenticar com a API do WordPress. Código: " . ($response ? $response['code'] : 'N/A') . "\n";
            echo "Resposta: " . ($response ? $response['raw'] : 'N/A') . "\n";
            die("Não foi possível autenticar com a API do WordPress. Verifique as credenciais e tente novamente.\n");
        }
    } else {
        die("Operação cancelada pelo usuário.\n");
    }
}

echo "Autenticação com a API do WordPress bem-sucedida!\n";
echo "Usuário autenticado: " . $response['body']['name'] . " (" . $response['body']['slug'] . ")\n";

// Testar conexão com a API do WooCommerce
echo "\nTestando conexão com a API do WooCommerce...\n";

try {
    // Obter informações da loja
    $store = $woocommerce->get('');
    
    echo "Conexão com a API do WooCommerce estabelecida com sucesso!\n";
    echo "Informações da loja:\n";
    echo "- Nome: " . (isset($store->store_name) ? $store->store_name : 'N/A') . "\n";
    echo "- Descrição: " . (isset($store->store_description) ? $store->store_description : 'N/A') . "\n";
    echo "- URL: " . (isset($store->URL) ? $store->URL : 'N/A') . "\n";
    
    // Testar obtenção de produtos
    echo "\nObtendo produtos existentes...\n";
    $products = $woocommerce->get('products', ['per_page' => 5]);
    
    if (empty($products)) {
        echo "Nenhum produto encontrado.\n";
    } else {
        echo "Produtos encontrados: " . count($products) . "\n";
        foreach ($products as $product) {
            echo "- " . $product->name . " (ID: " . $product->id . ")\n";
        }
    }
} catch (HttpClientException $e) {
    echo "Erro na API do WooCommerce: " . $e->getMessage() . "\n";
    echo "Resposta: " . $e->getResponse()->getBody() . "\n";
    die("Não foi possível conectar à API do WooCommerce. Verifique as credenciais e tente novamente.\n");
} catch (Exception $e) {
    echo "Erro: " . $e->getMessage() . "\n";
    die("Ocorreu um erro ao conectar à API do WooCommerce.\n");
}

// Testar upload de imagem
echo "\nTestando upload de imagem para o WordPress...\n";

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
$uploadResult = uploadImageToWordPress($testImagePath, $wpUrl, $username, $appPassword);

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
        
        // Excluir o produto de teste
        echo "\nExcluindo produto de teste...\n";
        $woocommerce->delete('products/' . $product->id, ['force' => true]);
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
    }
} else {
    echo "Falha no upload da imagem. Verifique as credenciais e permissões.\n";
}

// Limpar arquivo de teste
if (file_exists($testImagePath)) {
    unlink($testImagePath);
    echo "\nArquivo de teste removido.\n";
}

echo "\nTeste concluído!\n";
echo "Se todos os testes foram bem-sucedidos, você pode usar o script sync-with-images.bat para sincronizar seus produtos.\n";
echo "Caso contrário, verifique os erros reportados e corrija as configurações conforme necessário.\n";
