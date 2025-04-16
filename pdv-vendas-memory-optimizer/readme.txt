=== PDV Vendas Memory Optimizer ===
Contributors: pdvvendas
Tags: memory, cache, performance, optimization
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.2
Stable tag: 1.0.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Otimiza as configurações de memória do WordPress para 1024MB e melhora o desempenho do cache para a integração com PDV Vendas.

== Description ==

O plugin PDV Vendas Memory Optimizer configura automaticamente o WordPress para usar 1024MB de memória, otimizando o desempenho para a integração com o PDV Vendas.

**Principais Recursos:**

* Configura o limite de memória do WordPress para 1024MB
* Implementa um sistema avançado de cache de objetos
* Otimiza o banco de dados automaticamente
* Melhora o desempenho de carregamento de imagens
* Fornece uma interface administrativa para configuração

Este plugin é especialmente útil para sites que usam o WooCommerce e precisam sincronizar produtos com o PDV Vendas.

== Installation ==

1. Faça upload do plugin para o diretório `/wp-content/plugins/` ou instale diretamente pelo painel do WordPress
2. Ative o plugin através do menu 'Plugins' no WordPress
3. Acesse Configurações > Memory Optimizer para configurar as opções

== Frequently Asked Questions ==

= O plugin modifica o arquivo wp-config.php? =

Sim, o plugin adiciona as constantes WP_MEMORY_LIMIT e WP_MAX_MEMORY_LIMIT ao arquivo wp-config.php para configurar o limite de memória do WordPress.

= O plugin é compatível com o WooCommerce? =

Sim, o plugin é totalmente compatível com o WooCommerce e inclui otimizações específicas para melhorar o desempenho da loja.

= O plugin afeta o desempenho do site? =

O plugin melhora o desempenho do site ao otimizar o uso de memória e implementar um sistema avançado de cache.

= O que fazer se o plugin não conseguir modificar o wp-config.php? =

Se o plugin não conseguir modificar o wp-config.php automaticamente, você pode adicionar manualmente as seguintes linhas ao arquivo:

```php
// Aumentar o limite de memória do WordPress para 1024MB (1GB)
define('WP_MEMORY_LIMIT', '1024M');

// Aumentar o limite de memória para o painel administrativo
define('WP_MAX_MEMORY_LIMIT', '1024M');

// Ativar cache de objetos
define('WP_CACHE', true);
```

== Screenshots ==

1. Página de configurações do plugin
2. Status do sistema
3. Otimização de cache

== Changelog ==

= 1.0.0 =
* Versão inicial do plugin

== Upgrade Notice ==

= 1.0.0 =
Versão inicial do plugin. Recomendado para todos os usuários do PDV Vendas.
