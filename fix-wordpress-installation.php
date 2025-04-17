<?php
/**
 * Script para diagnosticar e corrigir problemas de instalação do WordPress
 */

// Definir constantes
define('SCRIPT_DEBUG', true);
define('WP_DEBUG', true);

// Verificar se o arquivo wp-config.php existe
if (!file_exists('wp-config.php')) {
    echo "ERRO: O arquivo wp-config.php não foi encontrado.\n";
    echo "Verifique se você está executando este script no diretório raiz do WordPress.\n";
    exit(1);
}

// Ler o arquivo wp-config.php
$config_content = file_get_contents('wp-config.php');
echo "Arquivo wp-config.php encontrado.\n";

// Verificar definições de banco de dados
if (!preg_match("/define\(\s*'DB_NAME',\s*'([^']*)'\s*\)/", $config_content, $matches)) {
    echo "ERRO: Não foi possível encontrar a definição de DB_NAME no arquivo wp-config.php.\n";
    exit(1);
}
$db_name = $matches[1];
echo "Nome do banco de dados: $db_name\n";

if (!preg_match("/define\(\s*'DB_USER',\s*'([^']*)'\s*\)/", $config_content, $matches)) {
    echo "ERRO: Não foi possível encontrar a definição de DB_USER no arquivo wp-config.php.\n";
    exit(1);
}
$db_user = $matches[1];
echo "Usuário do banco de dados: $db_user\n";

if (!preg_match("/define\(\s*'DB_PASSWORD',\s*'([^']*)'\s*\)/", $config_content, $matches)) {
    echo "ERRO: Não foi possível encontrar a definição de DB_PASSWORD no arquivo wp-config.php.\n";
    exit(1);
}
$db_password = $matches[1];
echo "Senha do banco de dados: " . str_repeat('*', strlen($db_password)) . "\n";

if (!preg_match("/define\(\s*'DB_HOST',\s*'([^']*)'\s*\)/", $config_content, $matches)) {
    echo "ERRO: Não foi possível encontrar a definição de DB_HOST no arquivo wp-config.php.\n";
    exit(1);
}
$db_host = $matches[1];
echo "Host do banco de dados: $db_host\n";

// Testar conexão com o banco de dados
echo "\nTestando conexão com o banco de dados...\n";
try {
    $mysqli = new mysqli($db_host, $db_user, $db_password, $db_name);
    
    if ($mysqli->connect_error) {
        echo "ERRO: Falha na conexão com o banco de dados: " . $mysqli->connect_error . "\n";
        echo "Verifique as credenciais do banco de dados no arquivo wp-config.php.\n";
        exit(1);
    }
    
    echo "Conexão com o banco de dados estabelecida com sucesso!\n";
    
    // Verificar tabelas do WordPress
    $result = $mysqli->query("SHOW TABLES");
    if ($result) {
        $table_count = $result->num_rows;
        echo "Número de tabelas encontradas: $table_count\n";
        
        if ($table_count < 11) {
            echo "AVISO: O número de tabelas é menor que o esperado para uma instalação padrão do WordPress.\n";
            echo "Isso pode indicar que a instalação não foi concluída corretamente.\n";
        }
    } else {
        echo "ERRO: Não foi possível listar as tabelas do banco de dados.\n";
    }
    
    $mysqli->close();
} catch (Exception $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
    exit(1);
}

// Verificar chaves de autenticação
echo "\nVerificando chaves de autenticação...\n";
$auth_keys = [
    'AUTH_KEY',
    'SECURE_AUTH_KEY',
    'LOGGED_IN_KEY',
    'NONCE_KEY',
    'AUTH_SALT',
    'SECURE_AUTH_SALT',
    'LOGGED_IN_SALT',
    'NONCE_SALT'
];

$missing_keys = [];
foreach ($auth_keys as $key) {
    if (!preg_match("/define\(\s*'$key',\s*'([^']*)'\s*\)/", $config_content)) {
        $missing_keys[] = $key;
    }
}

if (!empty($missing_keys)) {
    echo "AVISO: As seguintes chaves de autenticação estão ausentes ou mal formatadas:\n";
    foreach ($missing_keys as $key) {
        echo "- $key\n";
    }
    echo "Isso pode causar problemas de segurança e autenticação.\n";
    
    // Gerar novas chaves
    echo "\nGerando novas chaves de autenticação...\n";
    $new_keys = [];
    foreach ($auth_keys as $key) {
        $new_keys[$key] = bin2hex(random_bytes(32));
    }
    
    // Criar backup do arquivo wp-config.php
    $backup_file = 'wp-config.php.bak.' . time();
    if (copy('wp-config.php', $backup_file)) {
        echo "Backup do arquivo wp-config.php criado: $backup_file\n";
    } else {
        echo "ERRO: Não foi possível criar backup do arquivo wp-config.php.\n";
        exit(1);
    }
    
    // Atualizar chaves no arquivo wp-config.php
    $updated_content = $config_content;
    foreach ($new_keys as $key => $value) {
        $pattern = "/define\(\s*'$key',\s*'[^']*'\s*\)/";
        $replacement = "define('$key', '$value')";
        
        if (preg_match($pattern, $updated_content)) {
            $updated_content = preg_replace($pattern, $replacement, $updated_content);
        } else {
            // Adicionar a chave se não existir
            $updated_content .= "\ndefine('$key', '$value');";
        }
    }
    
    if (file_put_contents('wp-config.php', $updated_content)) {
        echo "Chaves de autenticação atualizadas com sucesso!\n";
    } else {
        echo "ERRO: Não foi possível atualizar as chaves de autenticação.\n";
        exit(1);
    }
}

// Verificar permissões de diretórios
echo "\nVerificando permissões de diretórios...\n";
$directories = [
    '.' => 755,
    './wp-content' => 755,
    './wp-content/themes' => 755,
    './wp-content/plugins' => 755,
    './wp-content/uploads' => 755
];

foreach ($directories as $dir => $perm) {
    if (is_dir($dir)) {
        $current_perm = substr(sprintf('%o', fileperms($dir)), -3);
        echo "Diretório: $dir, Permissão atual: $current_perm, Permissão recomendada: $perm\n";
        
        if ($current_perm != $perm) {
            echo "AVISO: A permissão do diretório $dir não está conforme o recomendado.\n";
            
            // Tentar corrigir a permissão
            if (@chmod($dir, octdec($perm))) {
                echo "Permissão do diretório $dir corrigida para $perm.\n";
            } else {
                echo "ERRO: Não foi possível corrigir a permissão do diretório $dir.\n";
            }
        }
    } else {
        echo "AVISO: O diretório $dir não foi encontrado.\n";
    }
}

// Verificar tema ativo
echo "\nVerificando tema ativo...\n";
if (file_exists('./wp-content/themes/vendaestoque-theme')) {
    echo "O tema vendaestoque-theme foi encontrado.\n";
    
    // Verificar se o tema está causando problemas
    echo "Para descartar problemas com o tema, você pode temporariamente:\n";
    echo "1. Renomear a pasta ./wp-content/themes/vendaestoque-theme para ./wp-content/themes/vendaestoque-theme.bak\n";
    echo "2. O WordPress irá automaticamente usar um tema padrão\n";
    echo "3. Se o site funcionar, o problema está no tema\n";
}

// Verificar plugins ativos
echo "\nVerificando plugins...\n";
if (is_dir('./wp-content/plugins')) {
    echo "Para descartar problemas com plugins, você pode temporariamente:\n";
    echo "1. Renomear a pasta ./wp-content/plugins para ./wp-content/plugins.bak\n";
    echo "2. O WordPress irá desativar todos os plugins\n";
    echo "3. Se o site funcionar, o problema está em algum plugin\n";
}

echo "\nDiagnóstico concluído!\n";
echo "Se os problemas persistirem, verifique os logs de erro do PHP e do servidor web.\n";
echo "Você também pode tentar reinstalar o WordPress ou consultar o fórum de suporte: https://br.wordpress.org/support/\n";
