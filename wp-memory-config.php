<?php
/**
 * Configuração de Memória para WordPress
 * 
 * Este arquivo contém as configurações de memória para o WordPress.
 * Adicione estas linhas ao seu arquivo wp-config.php antes da linha
 * "/* É isso, pare de editar! Divirta-se. */"
 */

// Aumentar o limite de memória do WordPress para 1024MB (1GB)
define('WP_MEMORY_LIMIT', '1024M');

// Aumentar o limite de memória para o painel administrativo
define('WP_MAX_MEMORY_LIMIT', '1024M');

// Configurar o tempo máximo de execução (opcional, em segundos)
// Nota: Isso só funciona se o WordPress estiver rodando como um módulo PHP
// @ini_set('max_execution_time', '300');

// Configurar o tamanho máximo de upload (opcional)
// @ini_set('upload_max_filesize', '64M');
// @ini_set('post_max_size', '64M');

// Configurar o cache de objetos (se disponível)
// define('WP_CACHE', true);
