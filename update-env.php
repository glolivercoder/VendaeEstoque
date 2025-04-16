<?php
/**
 * Script para atualizar o arquivo .env com as credenciais corretas
 */

// Verificar se o arquivo .env existe
if (!file_exists('.env')) {
    die("Erro: Arquivo .env não encontrado!\n");
}

// Carregar o arquivo .env atual
$envContent = file_get_contents('.env');
$env = parse_ini_file('.env');

// Verificar se as credenciais básicas existem
if (!isset($env['VITE_WORDPRESS_URL']) || 
    !isset($env['VITE_WOOCOMMERCE_CONSUMER_KEY']) || 
    !isset($env['VITE_WOOCOMMERCE_CONSUMER_SECRET'])) {
    die("Erro: Credenciais básicas não encontradas no arquivo .env\n");
}

// Verificar e corrigir a URL do WordPress
$wpUrl = $env['VITE_WORDPRESS_URL'];
$correctedUrl = preg_replace('/\.com\.br(loja)+\//', '.com.br/loja/', $wpUrl);

if ($correctedUrl !== $wpUrl) {
    echo "URL corrigida: $correctedUrl (original: $wpUrl)\n";
    $envContent = preg_replace('/VITE_WORDPRESS_URL=.*/', "VITE_WORDPRESS_URL=$correctedUrl", $envContent);
    echo "Arquivo .env atualizado com a URL corrigida.\n";
}

// Adicionar credenciais para upload de imagens se não existirem
if (!isset($env['VITE_WORDPRESS_USERNAME'])) {
    echo "Adicionando VITE_WORDPRESS_USERNAME ao arquivo .env\n";
    echo "Digite o nome de usuário do WordPress: ";
    $username = trim(fgets(STDIN));
    $envContent .= "\nVITE_WORDPRESS_USERNAME=$username";
}

if (!isset($env['VITE_WORDPRESS_APP_PASSWORD'])) {
    echo "Adicionando VITE_WORDPRESS_APP_PASSWORD ao arquivo .env\n";
    echo "Digite a senha de aplicativo do WordPress: ";
    $appPassword = trim(fgets(STDIN));
    $envContent .= "\nVITE_WORDPRESS_APP_PASSWORD=$appPassword";
}

// Salvar o arquivo .env atualizado
file_put_contents('.env', $envContent);
echo "Arquivo .env atualizado com sucesso!\n";
