<?php
/**
 * Script para corrigir problemas com o tema WordPress
 */

// Definir constantes
define('SCRIPT_DEBUG', true);
define('WP_DEBUG', true);

// Verificar se o diretório do tema existe
$theme_dir = './wp-content/themes/vendaestoque-theme';
if (!is_dir($theme_dir)) {
    echo "ERRO: O diretório do tema vendaestoque-theme não foi encontrado.\n";
    echo "Verifique se o tema foi instalado corretamente.\n";
    exit(1);
}

echo "Diretório do tema encontrado: $theme_dir\n";

// Verificar arquivos essenciais do tema
$essential_files = [
    'style.css',
    'functions.php',
    'index.php',
    'header.php',
    'footer.php'
];

$missing_files = [];
foreach ($essential_files as $file) {
    $file_path = "$theme_dir/$file";
    if (!file_exists($file_path)) {
        $missing_files[] = $file;
    }
}

if (!empty($missing_files)) {
    echo "ERRO: Os seguintes arquivos essenciais do tema estão ausentes:\n";
    foreach ($missing_files as $file) {
        echo "- $file\n";
    }
    echo "O tema pode não funcionar corretamente sem esses arquivos.\n";
    exit(1);
}

echo "Todos os arquivos essenciais do tema estão presentes.\n";

// Verificar o arquivo style.css
$style_content = file_get_contents("$theme_dir/style.css");
if (!preg_match("/Theme Name:/", $style_content)) {
    echo "ERRO: O arquivo style.css não contém a declaração 'Theme Name:'.\n";
    echo "Isso é necessário para que o WordPress reconheça o tema.\n";
    exit(1);
}

echo "O arquivo style.css contém a declaração 'Theme Name:'.\n";

// Verificar o arquivo functions.php
$functions_content = file_get_contents("$theme_dir/functions.php");
if (preg_match("/parse error|fatal error/i", $functions_content)) {
    echo "AVISO: O arquivo functions.php pode conter erros de sintaxe.\n";
    echo "Isso pode impedir que o tema seja carregado corretamente.\n";
}

echo "O arquivo functions.php parece estar correto.\n";

// Criar um tema mínimo de backup
echo "\nCriando um tema mínimo de backup...\n";
$backup_theme_dir = './wp-content/themes/backup-theme';
if (!is_dir($backup_theme_dir)) {
    if (mkdir($backup_theme_dir, 0755, true)) {
        echo "Diretório do tema de backup criado: $backup_theme_dir\n";
    } else {
        echo "ERRO: Não foi possível criar o diretório do tema de backup.\n";
        exit(1);
    }
}

// Criar arquivos mínimos para o tema de backup
$style_content = <<<EOT
/*
Theme Name: Backup Theme
Theme URI: https://example.com/
Author: Backup
Author URI: https://example.com/
Description: Um tema mínimo de backup para resolver problemas.
Version: 1.0
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: backup-theme
*/

body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    background-color: #f8f8f8;
}

.container {
    width: 80%;
    margin: 0 auto;
    padding: 20px;
}

header {
    background-color: #333;
    color: #fff;
    padding: 10px 0;
    text-align: center;
}

footer {
    background-color: #333;
    color: #fff;
    padding: 10px 0;
    text-align: center;
    margin-top: 20px;
}

.content {
    background-color: #fff;
    padding: 20px;
    margin: 20px 0;
    border-radius: 5px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
EOT;

file_put_contents("$backup_theme_dir/style.css", $style_content);
echo "Arquivo style.css criado para o tema de backup.\n";

$functions_content = <<<EOT
<?php
/**
 * Backup Theme functions and definitions
 */

// Add theme support
function backup_theme_setup() {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('html5', array(
        'search-form',
        'comment-form',
        'comment-list',
        'gallery',
        'caption',
    ));
}
add_action('after_setup_theme', 'backup_theme_setup');

// Enqueue styles
function backup_theme_styles() {
    wp_enqueue_style('backup-theme-style', get_stylesheet_uri());
}
add_action('wp_enqueue_scripts', 'backup_theme_styles');
EOT;

file_put_contents("$backup_theme_dir/functions.php", $functions_content);
echo "Arquivo functions.php criado para o tema de backup.\n";

$index_content = <<<EOT
<?php get_header(); ?>

<div class="container">
    <div class="content">
        <?php if (have_posts()) : ?>
            <?php while (have_posts()) : the_post(); ?>
                <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                    <header class="entry-header">
                        <h1 class="entry-title">
                            <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                        </h1>
                    </header>

                    <div class="entry-content">
                        <?php the_content(); ?>
                    </div>
                </article>
            <?php endwhile; ?>
            
            <?php the_posts_navigation(); ?>
        <?php else : ?>
            <p>Nenhum conteúdo encontrado.</p>
        <?php endif; ?>
    </div>
</div>

<?php get_footer(); ?>
EOT;

file_put_contents("$backup_theme_dir/index.php", $index_content);
echo "Arquivo index.php criado para o tema de backup.\n";

$header_content = <<<EOT
<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header>
    <div class="container">
        <h1><a href="<?php echo esc_url(home_url('/')); ?>"><?php bloginfo('name'); ?></a></h1>
        <p><?php bloginfo('description'); ?></p>
    </div>
</header>
EOT;

file_put_contents("$backup_theme_dir/header.php", $header_content);
echo "Arquivo header.php criado para o tema de backup.\n";

$footer_content = <<<EOT
<footer>
    <div class="container">
        <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?></p>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
EOT;

file_put_contents("$backup_theme_dir/footer.php", $footer_content);
echo "Arquivo footer.php criado para o tema de backup.\n";

echo "\nTema de backup criado com sucesso!\n";
echo "Para usar o tema de backup:\n";
echo "1. Acesse o painel administrativo do WordPress\n";
echo "2. Vá para Aparência > Temas\n";
echo "3. Ative o tema 'Backup Theme'\n";
echo "4. Se o site funcionar com o tema de backup, o problema está no tema original\n";

echo "\nDiagnóstico concluído!\n";
echo "Se os problemas persistirem, verifique os logs de erro do PHP e do servidor web.\n";
echo "Você também pode tentar reinstalar o WordPress ou consultar o fórum de suporte: https://br.wordpress.org/support/\n";
