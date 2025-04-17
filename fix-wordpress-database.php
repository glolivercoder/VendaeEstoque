<?php
/**
 * Script para verificar e corrigir problemas no banco de dados do WordPress
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

// Extrair informações do banco de dados
if (!preg_match("/define\(\s*'DB_NAME',\s*'([^']*)'\s*\)/", $config_content, $matches)) {
    echo "ERRO: Não foi possível encontrar a definição de DB_NAME no arquivo wp-config.php.\n";
    exit(1);
}
$db_name = $matches[1];

if (!preg_match("/define\(\s*'DB_USER',\s*'([^']*)'\s*\)/", $config_content, $matches)) {
    echo "ERRO: Não foi possível encontrar a definição de DB_USER no arquivo wp-config.php.\n";
    exit(1);
}
$db_user = $matches[1];

if (!preg_match("/define\(\s*'DB_PASSWORD',\s*'([^']*)'\s*\)/", $config_content, $matches)) {
    echo "ERRO: Não foi possível encontrar a definição de DB_PASSWORD no arquivo wp-config.php.\n";
    exit(1);
}
$db_password = $matches[1];

if (!preg_match("/define\(\s*'DB_HOST',\s*'([^']*)'\s*\)/", $config_content, $matches)) {
    echo "ERRO: Não foi possível encontrar a definição de DB_HOST no arquivo wp-config.php.\n";
    exit(1);
}
$db_host = $matches[1];

if (!preg_match("/\\\$table_prefix\s*=\s*'([^']*)'/", $config_content, $matches)) {
    echo "ERRO: Não foi possível encontrar a definição de table_prefix no arquivo wp-config.php.\n";
    exit(1);
}
$table_prefix = $matches[1];

echo "Informações do banco de dados:\n";
echo "- Nome do banco de dados: $db_name\n";
echo "- Usuário: $db_user\n";
echo "- Host: $db_host\n";
echo "- Prefixo das tabelas: $table_prefix\n";

// Conectar ao banco de dados
echo "\nConectando ao banco de dados...\n";
try {
    $mysqli = new mysqli($db_host, $db_user, $db_password, $db_name);
    
    if ($mysqli->connect_error) {
        echo "ERRO: Falha na conexão com o banco de dados: " . $mysqli->connect_error . "\n";
        echo "Verifique as credenciais do banco de dados no arquivo wp-config.php.\n";
        exit(1);
    }
    
    echo "Conexão com o banco de dados estabelecida com sucesso!\n";
    
    // Verificar tabelas do WordPress
    echo "\nVerificando tabelas do WordPress...\n";
    $tables = [
        $table_prefix . 'commentmeta',
        $table_prefix . 'comments',
        $table_prefix . 'links',
        $table_prefix . 'options',
        $table_prefix . 'postmeta',
        $table_prefix . 'posts',
        $table_prefix . 'terms',
        $table_prefix . 'term_relationships',
        $table_prefix . 'term_taxonomy',
        $table_prefix . 'usermeta',
        $table_prefix . 'users'
    ];
    
    $missing_tables = [];
    foreach ($tables as $table) {
        $result = $mysqli->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows == 0) {
            $missing_tables[] = $table;
        }
    }
    
    if (!empty($missing_tables)) {
        echo "AVISO: As seguintes tabelas estão ausentes no banco de dados:\n";
        foreach ($missing_tables as $table) {
            echo "- $table\n";
        }
        echo "Isso indica que a instalação do WordPress não foi concluída corretamente.\n";
        
        echo "\nVocê tem as seguintes opções:\n";
        echo "1. Reinstalar o WordPress\n";
        echo "2. Restaurar o banco de dados a partir de um backup\n";
        echo "3. Criar manualmente as tabelas ausentes\n";
    } else {
        echo "Todas as tabelas principais do WordPress foram encontradas.\n";
        
        // Verificar se há dados nas tabelas
        $empty_tables = [];
        foreach ($tables as $table) {
            $result = $mysqli->query("SELECT COUNT(*) as count FROM $table");
            $row = $result->fetch_assoc();
            if ($row['count'] == 0) {
                $empty_tables[] = $table;
            }
        }
        
        if (!empty($empty_tables)) {
            echo "\nAVISO: As seguintes tabelas estão vazias:\n";
            foreach ($empty_tables as $table) {
                echo "- $table\n";
            }
            echo "Isso pode indicar um problema com a instalação do WordPress.\n";
        }
        
        // Verificar opções essenciais
        echo "\nVerificando opções essenciais...\n";
        $options_table = $table_prefix . 'options';
        $essential_options = [
            'siteurl',
            'home',
            'blogname',
            'blogdescription',
            'admin_email',
            'template',
            'stylesheet'
        ];
        
        $missing_options = [];
        foreach ($essential_options as $option) {
            $result = $mysqli->query("SELECT option_value FROM $options_table WHERE option_name = '$option'");
            if ($result->num_rows == 0) {
                $missing_options[] = $option;
            } else {
                $row = $result->fetch_assoc();
                echo "- $option: " . $row['option_value'] . "\n";
            }
        }
        
        if (!empty($missing_options)) {
            echo "\nAVISO: As seguintes opções essenciais estão ausentes:\n";
            foreach ($missing_options as $option) {
                echo "- $option\n";
            }
            echo "Isso pode causar problemas no funcionamento do WordPress.\n";
        }
        
        // Verificar tema ativo
        $result = $mysqli->query("SELECT option_value FROM $options_table WHERE option_name = 'template'");
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $active_theme = $row['option_value'];
            
            echo "\nTema ativo: $active_theme\n";
            
            if ($active_theme == 'vendaestoque-theme') {
                echo "O tema vendaestoque-theme está ativo.\n";
                echo "Se estiver enfrentando problemas, considere mudar temporariamente para um tema padrão do WordPress.\n";
                
                // Mudar para um tema padrão
                echo "\nDeseja mudar para o tema Twenty Twenty-Three? (s/n): ";
                $handle = fopen("php://stdin", "r");
                $line = fgets($handle);
                if (trim($line) == 's') {
                    $mysqli->query("UPDATE $options_table SET option_value = 'twentytwentythree' WHERE option_name = 'template'");
                    $mysqli->query("UPDATE $options_table SET option_value = 'twentytwentythree' WHERE option_name = 'stylesheet'");
                    echo "Tema alterado para Twenty Twenty-Three.\n";
                }
            }
        }
        
        // Verificar plugins ativos
        echo "\nVerificando plugins ativos...\n";
        $result = $mysqli->query("SELECT option_value FROM $options_table WHERE option_name = 'active_plugins'");
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $active_plugins = unserialize($row['option_value']);
            
            if (!empty($active_plugins)) {
                echo "Plugins ativos:\n";
                foreach ($active_plugins as $plugin) {
                    echo "- $plugin\n";
                }
                
                // Desativar todos os plugins
                echo "\nDeseja desativar todos os plugins? (s/n): ";
                $handle = fopen("php://stdin", "r");
                $line = fgets($handle);
                if (trim($line) == 's') {
                    $mysqli->query("UPDATE $options_table SET option_value = 'a:0:{}' WHERE option_name = 'active_plugins'");
                    echo "Todos os plugins foram desativados.\n";
                }
            } else {
                echo "Nenhum plugin ativo encontrado.\n";
            }
        }
    }
    
    $mysqli->close();
} catch (Exception $e) {
    echo "ERRO: " . $e->getMessage() . "\n";
    exit(1);
}

echo "\nDiagnóstico do banco de dados concluído!\n";
echo "Se os problemas persistirem, considere reinstalar o WordPress ou consultar o fórum de suporte: https://br.wordpress.org/support/\n";
