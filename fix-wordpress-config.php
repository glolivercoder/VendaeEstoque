<?php
/**
 * Script para corrigir configurações do WordPress e WooCommerce via API REST
 *
 * Este script corrige problemas de URL e configurações do WooCommerce
 * usando as credenciais da API já configuradas no arquivo .env
 */

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

// Corrigir URL se necessário (remover repetições de "loja")
$correctedUrl = preg_replace('/\.com\.br(loja)+\//', '.com.br/loja/', $wpUrl);
if ($correctedUrl !== $wpUrl) {
    echo "URL corrigida: $correctedUrl (original: $wpUrl)\n";
    $wpUrl = $correctedUrl;

    // Atualizar o arquivo .env com a URL corrigida
    $envContent = file_get_contents('.env');
    $envContent = preg_replace('/VITE_WORDPRESS_URL=.*/', "VITE_WORDPRESS_URL=$wpUrl", $envContent);
    file_put_contents('.env', $envContent);
    echo "Arquivo .env atualizado com a URL corrigida.\n";
}

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
        'body' => json_decode($response, true)
    ];
}

// Função para fazer requisições à API do WooCommerce
function callWooCommerceAPI($endpoint, $wpUrl, $consumerKey, $consumerSecret, $method = 'GET', $data = null) {
    $url = rtrim($wpUrl, '/') . '/wp-json/wc/v3/' . ltrim($endpoint, '/');

    // Parâmetros de autenticação
    $params = [
        'consumer_key' => $consumerKey,
        'consumer_secret' => $consumerSecret
    ];

    // Adicionar parâmetros à URL
    $url = add_query_arg($params, $url);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
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
        'body' => json_decode($response, true)
    ];
}

// Função para adicionar parâmetros de consulta à URL
function add_query_arg($args, $url) {
    if (strpos($url, '?') !== false) {
        $url .= '&';
    } else {
        $url .= '?';
    }

    return $url . http_build_query($args);
}

// Verificar conexão com a API do WordPress
echo "Verificando conexão com a API do WordPress...\n";

// Definir credenciais para autenticação
$username = isset($env['VITE_WORDPRESS_USERNAME']) ? $env['VITE_WORDPRESS_USERNAME'] : 'admin';
$appPassword = isset($env['VITE_WORDPRESS_APP_PASSWORD']) ? $env['VITE_WORDPRESS_APP_PASSWORD'] : '';

// Tentar com autenticação básica
$response = callWordPressAPI('wp/v2/settings', $wpUrl, $username, $appPassword);

if (!$response || $response['code'] >= 400) {
    echo "Erro ao conectar à API do WordPress. Código: " . ($response ? $response['code'] : 'N/A') . "\n";
    echo "Tentando método alternativo de autenticação...\n";

    // Tentar com as credenciais do WooCommerce
    $response = callWordPressAPI('wp/v2/settings', $wpUrl, $consumerKey, $consumerSecret);

    if (!$response || $response['code'] >= 400) {
        echo "Erro ao conectar à API do WordPress com credenciais do WooCommerce. Código: " . ($response ? $response['code'] : 'N/A') . "\n";

        // Tentar com autenticação anônima (apenas para verificar conexão)
        $response = callWordPressAPI('', $wpUrl, '', '', 'GET');

        if (!$response || $response['code'] >= 400) {
            echo "Erro ao conectar à API do WordPress mesmo sem autenticação. Código: " . ($response ? $response['code'] : 'N/A') . "\n";
            echo "Erro: " . (isset($response['error']) ? $response['error'] : 'Desconhecido') . "\n";
            die("Não foi possível conectar à API do WordPress. Verifique a URL e a conexão com a internet.\n");
        } else {
            echo "Conexão básica com o WordPress estabelecida, mas sem acesso às configurações.\n";
            echo "Você precisa configurar credenciais válidas no arquivo .env.\n";
        }
    } else {
        echo "Conexão estabelecida com credenciais do WooCommerce!\n";
    }
} else {
    echo "Conexão com a API do WordPress estabelecida com sucesso!\n";
}

// Verificar e corrigir as configurações de URL do WordPress
echo "\nVerificando configurações de URL do WordPress...\n";

if (isset($response['body']) && is_array($response['body'])) {
    $settings = $response['body'];

    // Verificar se há problemas nas URLs
    $url = isset($settings['url']) ? $settings['url'] : '';

    if (strpos($url, 'lojaloja') !== false || strpos($url, 'lojalojaloja') !== false) {
        echo "Problema detectado na URL do site: $url\n";

        // Corrigir a URL
        $correctedUrl = preg_replace('/\.com\.br(loja)+\//', '.com.br/loja/', $url);
        echo "Corrigindo para: $correctedUrl\n";

        // Atualizar a configuração
        $updateData = [
            'url' => $correctedUrl
        ];

        $updateResponse = callWordPressAPI('wp/v2/settings', $wpUrl, $username, $appPassword, 'POST', $updateData);

        if (!$updateResponse || $updateResponse['code'] >= 400) {
            echo "Erro ao atualizar as configurações de URL. Código: " . ($updateResponse ? $updateResponse['code'] : 'N/A') . "\n";
        } else {
            echo "Configurações de URL atualizadas com sucesso!\n";
        }
    } else {
        echo "URLs do WordPress parecem estar corretas.\n";
    }
} else {
    echo "Não foi possível obter as configurações do WordPress.\n";
}

// Verificar conexão com a API do WooCommerce
echo "\nVerificando conexão com a API do WooCommerce...\n";
$wcResponse = callWooCommerceAPI('system_status', $wpUrl, $consumerKey, $consumerSecret);

if (!$wcResponse || $wcResponse['code'] >= 400) {
    echo "Erro ao conectar à API do WooCommerce. Código: " . ($wcResponse ? $wcResponse['code'] : 'N/A') . "\n";
    echo "Resposta: " . print_r($wcResponse, true) . "\n";
} else {
    echo "Conexão com a API do WooCommerce estabelecida com sucesso!\n";

    // Verificar status do WooCommerce
    if (isset($wcResponse['body']) && is_array($wcResponse['body'])) {
        $status = $wcResponse['body'];

        echo "\nInformações do WooCommerce:\n";
        echo "- Versão: " . (isset($status['environment']['version']) ? $status['environment']['version'] : 'N/A') . "\n";
        echo "- Tema: " . (isset($status['theme']['name']) ? $status['theme']['name'] : 'N/A') . "\n";
        echo "- Modo de depuração: " . (isset($status['environment']['wp_debug_mode']) && $status['environment']['wp_debug_mode'] ? 'Ativado' : 'Desativado') . "\n";

        // Verificar plugins ativos
        if (isset($status['active_plugins']) && is_array($status['active_plugins'])) {
            echo "\nPlugins ativos relacionados ao WooCommerce:\n";
            foreach ($status['active_plugins'] as $plugin) {
                if (isset($plugin['name']) && (strpos(strtolower($plugin['name']), 'woo') !== false || strpos(strtolower($plugin['name']), 'commerce') !== false)) {
                    echo "- " . $plugin['name'] . " (v" . $plugin['version'] . ")\n";
                }
            }
        }
    }
}

// Verificar configurações de permalinks
echo "\nVerificando configurações de permalinks...\n";
$permalinkResponse = callWordPressAPI('wp/v2/settings', $wpUrl, $username, $appPassword);

if (isset($permalinkResponse['body']) && is_array($permalinkResponse['body'])) {
    $permalinkStructure = isset($permalinkResponse['body']['permalink_structure']) ? $permalinkResponse['body']['permalink_structure'] : '';

    if (empty($permalinkStructure)) {
        echo "AVISO: A estrutura de permalinks está configurada como 'Simples'. Isso pode causar problemas com a API REST.\n";
        echo "Recomendação: Configure os permalinks para 'Nome do post' ou outra estrutura personalizada.\n";
    } else {
        echo "Estrutura de permalinks: $permalinkStructure (OK)\n";
    }
}

// Verificar configurações de imagens do WooCommerce
echo "\nVerificando configurações de imagens do WooCommerce...\n";
$wcSettingsResponse = callWooCommerceAPI('settings/products', $wpUrl, $consumerKey, $consumerSecret);

if (!$wcSettingsResponse || $wcSettingsResponse['code'] >= 400) {
    echo "Erro ao obter configurações de produtos do WooCommerce.\n";
} else {
    $imageSettings = [];

    foreach ($wcSettingsResponse['body'] as $setting) {
        if (isset($setting['id']) && (strpos($setting['id'], 'image') !== false || strpos($setting['id'], 'thumbnail') !== false)) {
            $imageSettings[$setting['id']] = $setting['value'];
        }
    }

    if (!empty($imageSettings)) {
        echo "Configurações de imagens do WooCommerce:\n";
        foreach ($imageSettings as $key => $value) {
            echo "- $key: $value\n";
        }
    }
}

// Verificar se o plugin de upload de imagens está ativo
echo "\nVerificando plugins de upload de imagens...\n";
$pluginsResponse = callWordPressAPI('wp/v2/plugins', $wpUrl, $username, $appPassword);

if (!$pluginsResponse || $pluginsResponse['code'] >= 400) {
    echo "Erro ao obter lista de plugins.\n";
} else {
    $imagePlugins = [];

    if (isset($pluginsResponse['body']) && is_array($pluginsResponse['body'])) {
        foreach ($pluginsResponse['body'] as $plugin) {
            $pluginName = isset($plugin['name']) ? strtolower($plugin['name']) : '';

            if (strpos($pluginName, 'image') !== false ||
                strpos($pluginName, 'media') !== false ||
                strpos($pluginName, 'upload') !== false) {

                $status = isset($plugin['status']) ? $plugin['status'] : 'unknown';
                $imagePlugins[] = [
                    'name' => isset($plugin['name']) ? $plugin['name'] : 'N/A',
                    'status' => $status
                ];
            }
        }
    }

    if (!empty($imagePlugins)) {
        echo "Plugins relacionados a imagens encontrados:\n";
        foreach ($imagePlugins as $plugin) {
            echo "- " . $plugin['name'] . " (Status: " . $plugin['status'] . ")\n";
        }
    } else {
        echo "Nenhum plugin específico para upload de imagens encontrado.\n";
    }
}

echo "\nVerificação e correção de configurações concluídas!\n";
echo "Agora você pode tentar sincronizar os produtos novamente usando o script sync-with-images.bat\n";
