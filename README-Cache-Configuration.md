# Configuração de Cache do WordPress para PDV Vendas

Este documento contém instruções para configurar o cache do WordPress para 1024MB (1GB) e otimizar o desempenho da integração com o PDV Vendas.

## Arquivos Incluídos

1. **wp-memory-config.php** - Configurações de memória para adicionar ao wp-config.php
2. **pdv-vendas-cache-optimizer.php** - Plugin para otimizar o cache do WordPress
3. **object-cache.php** - Implementação avançada de cache de objetos
4. **README-Cache-Configuration.md** - Este arquivo de instruções

## Instruções de Implementação

### 1. Configurar o Limite de Memória no wp-config.php

1. Abra o arquivo `wp-config.php` do seu WordPress (localizado na raiz do site)
2. Adicione as seguintes linhas antes da linha que diz "/* É isso, pare de editar! Divirta-se. */":

```php
// Aumentar o limite de memória do WordPress para 1024MB (1GB)
define('WP_MEMORY_LIMIT', '1024M');

// Aumentar o limite de memória para o painel administrativo
define('WP_MAX_MEMORY_LIMIT', '1024M');
```

3. Salve o arquivo

### 2. Instalar o Plugin de Otimização de Cache

1. Crie uma pasta chamada `pdv-vendas-cache-optimizer` no diretório `wp-content/plugins/` do seu WordPress
2. Copie o arquivo `pdv-vendas-cache-optimizer.php` para essa pasta
3. Acesse o painel administrativo do WordPress
4. Vá para Plugins > Plugins Instalados
5. Ative o plugin "PDV Vendas Cache Optimizer"
6. Vá para Configurações > Otimizador de Cache
7. Configure as opções conforme necessário (o padrão já é 1024MB)

### 3. Implementar o Cache de Objetos Avançado (Opcional)

**Nota**: Esta etapa é opcional, mas recomendada para melhor desempenho.

1. Copie o arquivo `object-cache.php` para o diretório `wp-content/` do seu WordPress
2. Isso ativará automaticamente o cache de objetos avançado

### 4. Configurar o PHP (se tiver acesso ao servidor)

Se você tiver acesso ao arquivo php.ini do servidor, adicione ou modifique as seguintes configurações:

```ini
; Aumentar o limite de memória para 1024MB
memory_limit = 1024M

; Aumentar o tempo máximo de execução para 300 segundos (5 minutos)
max_execution_time = 300

; Aumentar o tamanho máximo de upload para 64MB
upload_max_filesize = 64M
post_max_size = 64M
```

Se você não tiver acesso ao php.ini, pode tentar adicionar estas configurações a um arquivo `.htaccess` na raiz do seu WordPress:

```
php_value memory_limit 1024M
php_value max_execution_time 300
php_value upload_max_filesize 64M
php_value post_max_size 64M
```

## Verificação da Configuração

Após implementar as configurações, você pode verificar se elas foram aplicadas corretamente:

1. Acesse o painel administrativo do WordPress
2. Vá para Configurações > Otimizador de Cache
3. Verifique a seção "Status do Sistema"
4. Confirme que o "Limite de Memória PHP" e o "Limite de Memória WordPress" mostram 1024M

Alternativamente, você pode criar um arquivo PHP temporário com o seguinte conteúdo:

```php
<?php
phpinfo();
```

Acesse este arquivo pelo navegador e procure por "memory_limit" para verificar se a configuração foi aplicada.

## Solução de Problemas

### O limite de memória não está sendo aplicado

Se o limite de memória não estiver sendo aplicado, pode ser devido a:

1. **Restrições do Servidor**: Alguns servidores compartilhados têm limites rígidos que não podem ser alterados
2. **Configurações de PHP**: O PHP pode estar configurado para ignorar configurações locais
3. **Cache de Opcode**: Se o servidor usa cache de opcode (como APC ou OPcache), pode ser necessário reiniciá-lo

Nestes casos, entre em contato com seu provedor de hospedagem para solicitar um aumento no limite de memória.

### Erros após instalar o cache de objetos

Se você encontrar erros após instalar o arquivo `object-cache.php`, pode ser devido a:

1. **Incompatibilidade com outros plugins**: Alguns plugins podem ter sua própria implementação de cache
2. **Versão do PHP**: A implementação pode não ser compatível com sua versão do PHP

Nestes casos, remova o arquivo `object-cache.php` do diretório `wp-content/` e use apenas as configurações de memória no wp-config.php.

## Suporte

Para obter suporte adicional, entre em contato com a equipe de desenvolvimento do PDV Vendas.
