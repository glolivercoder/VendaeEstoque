<?php
/**
 * PDV Vendas - Instalador de Configuração de Cache do WordPress
 *
 * Este script instala automaticamente as configurações de cache do WordPress
 * para otimizar o desempenho da integração com o PDV Vendas.
 *
 * Instruções:
 * 1. Faça upload deste arquivo para a raiz do seu WordPress
 * 2. Acesse o arquivo pelo navegador: https://seu-site.com/install-wordpress-cache.php
 * 3. Siga as instruções na tela
 * 4. Remova o arquivo após a instalação
 */

// Verificar se o script está sendo executado pelo navegador
if (php_sapi_name() === 'cli') {
    die("Este script deve ser executado pelo navegador.\n");
}

// Definir o caminho para os arquivos de origem
$source_path = 'https://srv1663-files.hstgr.io/ed04152752e70e25/files/public_html/';

// Definir o caminho para o WordPress
$wordpress_path = dirname(__FILE__);

// Verificar se o WordPress está instalado
if (!file_exists($wordpress_path . '/wp-config.php')) {
    die("Não foi possível encontrar o arquivo wp-config.php. Este script deve ser executado na raiz do WordPress.\n");
}

// Função para exibir mensagens
function show_message($message, $type = 'info') {
    $color = 'black';

    switch ($type) {
        case 'success':
            $color = 'green';
            break;
        case 'error':
            $color = 'red';
            break;
        case 'warning':
            $color = 'orange';
            break;
    }

    echo "<p style='color: {$color};'>{$message}</p>";
}

// Função para verificar se uma string existe em um arquivo
function string_exists_in_file($file, $string) {
    $content = file_get_contents($file);
    return strpos($content, $string) !== false;
}

// Função para baixar arquivo remoto
function download_remote_file($url) {
    $content = @file_get_contents($url);
    if ($content === false) {
        // Tentar com cURL se file_get_contents falhar
        if (function_exists('curl_init')) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            $content = curl_exec($ch);
            curl_close($ch);
        }
    }
    return $content;
}

// Função para adicionar configurações ao wp-config.php
function add_to_wp_config($config) {
    global $wordpress_path;
    $wp_config_file = $wordpress_path . '/wp-config.php';
    $wp_config_content = file_get_contents($wp_config_file);

    // Encontrar a posição para inserir as configurações
    $marker = "/* É isso, pare de editar! Divirta-se. */";
    $pos = strpos($wp_config_content, $marker);

    if ($pos === false) {
        $marker = "/* That's all, stop editing! Happy publishing. */";
        $pos = strpos($wp_config_content, $marker);
    }

    if ($pos === false) {
        show_message("Não foi possível encontrar o marcador no arquivo wp-config.php.", 'error');
        return false;
    }

    // Inserir as configurações antes do marcador
    $new_content = substr($wp_config_content, 0, $pos);
    $new_content .= "\n\n// Configurações de cache adicionadas pelo PDV Vendas\n";
    $new_content .= $config . "\n\n";
    $new_content .= substr($wp_config_content, $pos);

    // Salvar o arquivo
    if (file_put_contents($wp_config_file, $new_content)) {
        show_message("Configurações adicionadas ao wp-config.php com sucesso.", 'success');
        return true;
    } else {
        show_message("Não foi possível escrever no arquivo wp-config.php.", 'error');
        return false;
    }
}

// Função para criar diretório se não existir
function create_directory_if_not_exists($dir) {
    global $wordpress_path;
    $full_path = $wordpress_path . '/' . $dir;

    if (!file_exists($full_path)) {
        if (mkdir($full_path, 0755, true)) {
            show_message("Diretório {$dir} criado com sucesso.", 'success');
            return true;
        } else {
            show_message("Não foi possível criar o diretório {$dir}.", 'error');
            return false;
        }
    }

    return true;
}

// Função para copiar arquivo remoto para local
function copy_remote_file($remote_url, $destination) {
    global $wordpress_path, $source_path;
    $full_destination = $wordpress_path . '/' . $destination;

    // Baixar o arquivo remoto
    $content = download_remote_file($remote_url);

    if ($content === false) {
        show_message("Não foi possível baixar o arquivo de {$remote_url}.", 'error');
        return false;
    }

    // Salvar o arquivo localmente
    if (file_put_contents($full_destination, $content)) {
        show_message("Arquivo copiado para {$destination} com sucesso.", 'success');
        return true;
    } else {
        show_message("Não foi possível salvar o arquivo em {$destination}.", 'error');
        return false;
    }
}

// Iniciar a saída HTML
?>
<!DOCTYPE html>
<html>
<head>
    <title>PDV Vendas - Instalador de Configuração de Cache do WordPress</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #2271b1;
            border-bottom: 1px solid #ccc;
            padding-bottom: 10px;
        }
        .step {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f9f9f9;
            border-left: 4px solid #2271b1;
        }
        .success {
            color: green;
        }
        .error {
            color: red;
        }
        .warning {
            color: orange;
        }
        .button {
            display: inline-block;
            background-color: #2271b1;
            color: white;
            padding: 10px 15px;
            text-decoration: none;
            border-radius: 3px;
            margin-top: 20px;
        }
        .button:hover {
            background-color: #135e96;
        }
        pre {
            background-color: #f0f0f1;
            padding: 10px;
            overflow: auto;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <h1>PDV Vendas - Instalador de Configuração de Cache do WordPress</h1>

    <div class="step">
        <h2>Verificando requisitos...</h2>
        <?php
        // Verificar permissões de escrita
        if (is_writable($wordpress_path . '/wp-config.php')) {
            show_message("O arquivo wp-config.php tem permissões de escrita.", 'success');
        } else {
            show_message("O arquivo wp-config.php não tem permissões de escrita. Por favor, ajuste as permissões.", 'error');
        }

        if (is_writable($wordpress_path . '/wp-content')) {
            show_message("O diretório wp-content tem permissões de escrita.", 'success');
        } else {
            show_message("O diretório wp-content não tem permissões de escrita. Por favor, ajuste as permissões.", 'error');
        }

        // Verificar se o WordPress está instalado
        if (file_exists($wordpress_path . '/wp-includes/version.php')) {
            show_message("WordPress encontrado.", 'success');
        } else {
            show_message("WordPress não encontrado. Este script deve ser executado na raiz do WordPress.", 'error');
        }

        // Verificar se os arquivos de origem estão acessíveis
        $test_file = $source_path . 'wp-memory-config.php';
        $test_content = @file_get_contents($test_file);
        if ($test_content !== false) {
            show_message("Arquivos de origem acessíveis.", 'success');
        } else {
            show_message("Não foi possível acessar os arquivos de origem em {$source_path}. Verifique o caminho.", 'error');
        }
        ?>
    </div>

    <?php
    // Verificar se o formulário foi enviado
    if (isset($_POST['install'])) {
        echo '<div class="step">';
        echo '<h2>Instalando configurações de cache...</h2>';

        // 1. Adicionar configurações ao wp-config.php
        $wp_config_settings = "// Aumentar o limite de memória do WordPress para 1024MB (1GB)
define('WP_MEMORY_LIMIT', '1024M');

// Aumentar o limite de memória para o painel administrativo
define('WP_MAX_MEMORY_LIMIT', '1024M');

// Ativar cache de objetos
define('WP_CACHE', true);";

        if (string_exists_in_file($wordpress_path . '/wp-config.php', "define('WP_MEMORY_LIMIT', '1024M')")) {
            show_message("As configurações de memória já existem no wp-config.php.", 'warning');
        } else {
            add_to_wp_config($wp_config_settings);
        }

        // 2. Criar diretório para o plugin
        $plugin_dir = 'wp-content/plugins/pdv-vendas-cache-optimizer';
        if (create_directory_if_not_exists($plugin_dir)) {
            // 3. Criar arquivo do plugin
            $plugin_file = $plugin_dir . '/pdv-vendas-cache-optimizer.php';
            $remote_plugin_url = $source_path . 'pdv-vendas-cache-optimizer.php';

            if (copy_remote_file($remote_plugin_url, $plugin_file)) {
                show_message("Plugin de otimização de cache criado com sucesso.", 'success');
            } else {
                show_message("Não foi possível criar o arquivo do plugin.", 'error');
            }
        }

        // 4. Copiar arquivo de cache de objetos
        $object_cache_file = 'wp-content/object-cache.php';
        $full_object_cache_file = $wordpress_path . '/' . $object_cache_file;

        if (file_exists($full_object_cache_file)) {
            show_message("O arquivo object-cache.php já existe. Fazendo backup...", 'warning');
            copy($full_object_cache_file, $full_object_cache_file . '.bak');
        }

        $remote_object_cache_url = $source_path . 'object-cache.php';
        if (copy_remote_file($remote_object_cache_url, $object_cache_file)) {
            show_message("Arquivo de cache de objetos instalado com sucesso.", 'success');
        }

        echo '<h3>Instalação concluída!</h3>';
        echo '<p>As configurações de cache foram instaladas com sucesso. Agora você precisa:</p>';
        echo '<ol>';
        echo '<li>Acesse o painel administrativo do WordPress</li>';
        echo '<li>Vá para Plugins > Plugins Instalados</li>';
        echo '<li>Ative o plugin "PDV Vendas Cache Optimizer"</li>';
        echo '<li>Vá para Configurações > Otimizador de Cache para verificar as configurações</li>';
        echo '</ol>';

        echo '<p><strong>IMPORTANTE:</strong> Por segurança, remova este arquivo de instalação após concluir a configuração.</p>';

        echo '<a href="wp-admin/plugins.php" class="button">Ir para Plugins</a>';
        echo '</div>';
    } else {
        // Exibir formulário de instalação
        ?>
        <div class="step">
            <h2>Pronto para instalar</h2>
            <p>Este instalador irá:</p>
            <ol>
                <li>Adicionar configurações de memória ao wp-config.php</li>
                <li>Instalar o plugin de otimização de cache</li>
                <li>Configurar o cache de objetos avançado</li>
            </ol>

            <p><strong>IMPORTANTE:</strong> Faça backup do seu site antes de continuar.</p>

            <form method="post" action="">
                <input type="hidden" name="install" value="1">
                <button type="submit" class="button">Instalar Configurações de Cache</button>
            </form>
        </div>

        <div class="step">
            <h2>Instalação Manual</h2>
            <p>Se preferir, você pode instalar manualmente seguindo estas etapas:</p>

            <h3>1. Adicionar ao wp-config.php</h3>
            <p>Adicione o seguinte código ao seu arquivo wp-config.php antes da linha "/* É isso, pare de editar! Divirta-se. */":</p>
            <pre>
// Aumentar o limite de memória do WordPress para 1024MB (1GB)
define('WP_MEMORY_LIMIT', '1024M');

// Aumentar o limite de memória para o painel administrativo
define('WP_MAX_MEMORY_LIMIT', '1024M');

// Ativar cache de objetos
define('WP_CACHE', true);
            </pre>

            <h3>2. Instalar o Plugin de Otimização de Cache</h3>
            <p>Crie uma pasta chamada 'pdv-vendas-cache-optimizer' no diretório wp-content/plugins/ e copie o arquivo pdv-vendas-cache-optimizer.php para essa pasta.</p>

            <h3>3. Instalar o Cache de Objetos Avançado</h3>
            <p>Copie o arquivo object-cache.php para o diretório wp-content/ do seu WordPress.</p>
        </div>
        <?php
    }
    ?>

    <div class="step">
        <h2>Verificar Configuração</h2>
        <p>Após a instalação, você pode verificar se as configurações foram aplicadas corretamente:</p>

        <h3>Limite de Memória Atual</h3>
        <p>PHP memory_limit: <strong><?php echo ini_get('memory_limit'); ?></strong></p>
        <?php
        // Tentar carregar as constantes do WordPress
        $wp_config_file = $wordpress_path . '/wp-config.php';
        if (file_exists($wp_config_file)) {
            $wp_config_content = file_get_contents($wp_config_file);

            // Verificar WP_MEMORY_LIMIT
            if (preg_match("/define\s*\(\s*['\"]WP_MEMORY_LIMIT['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)/", $wp_config_content, $matches)) {
                echo "<p>WordPress WP_MEMORY_LIMIT: <strong>{$matches[1]}</strong></p>";
            } else {
                echo "<p>WordPress WP_MEMORY_LIMIT: <strong>Não definido</strong></p>";
            }

            // Verificar WP_MAX_MEMORY_LIMIT
            if (preg_match("/define\s*\(\s*['\"]WP_MAX_MEMORY_LIMIT['\"]\s*,\s*['\"]([^'\"]+)['\"]\s*\)/", $wp_config_content, $matches)) {
                echo "<p>WordPress WP_MAX_MEMORY_LIMIT: <strong>{$matches[1]}</strong></p>";
            } else {
                echo "<p>WordPress WP_MAX_MEMORY_LIMIT: <strong>Não definido</strong></p>";
            }

            // Verificar WP_CACHE
            if (preg_match("/define\s*\(\s*['\"]WP_CACHE['\"]\s*,\s*(true|false|[01])\s*\)/", $wp_config_content, $matches)) {
                $wp_cache_value = ($matches[1] === 'true' || $matches[1] === '1') ? 'Ativado' : 'Desativado';
                echo "<p>WP_CACHE: <strong>{$wp_cache_value}</strong></p>";
            } else {
                echo "<p>WP_CACHE: <strong>Não definido</strong></p>";
            }
        } else {
            echo "<p>Não foi possível ler o arquivo wp-config.php</p>";
        }
        ?>

        <h3>Outras Configurações</h3>
        <p>upload_max_filesize: <strong><?php echo ini_get('upload_max_filesize'); ?></strong></p>
        <p>post_max_size: <strong><?php echo ini_get('post_max_size'); ?></strong></p>
        <p>max_execution_time: <strong><?php echo ini_get('max_execution_time'); ?> segundos</strong></p>

        <h3>Status dos Arquivos</h3>
        <?php
        $plugin_file = $wordpress_path . '/wp-content/plugins/pdv-vendas-cache-optimizer/pdv-vendas-cache-optimizer.php';
        $object_cache_file = $wordpress_path . '/wp-content/object-cache.php';

        echo "<p>Plugin de otimização de cache: <strong>" . (file_exists($plugin_file) ? 'Instalado' : 'Não instalado') . "</strong></p>";
        echo "<p>Cache de objetos avançado: <strong>" . (file_exists($object_cache_file) ? 'Instalado' : 'Não instalado') . "</strong></p>";
        ?>
    </div>
</body>
</html>
<?php
// Fim do script
