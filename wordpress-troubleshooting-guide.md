# Guia de Solução de Problemas do WordPress

Este guia foi criado para ajudar a resolver o erro de instalação do WordPress que você está enfrentando.

## O Problema

Você está vendo a mensagem:

> "Ocorreu um erro ao instalar site. Verifique a caixa de entrada do e-mail do administrador do site para obter instruções. Se continuar a ter problemas, leia o [fórum de suporte](https://br.wordpress.org/support/)."

## Possíveis Causas e Soluções

### 1. Problemas com o Banco de Dados

#### Sintomas:
- Erro de conexão com o banco de dados
- Tabelas ausentes ou corrompidas
- Credenciais incorretas no arquivo wp-config.php

#### Soluções:
1. **Verificar as credenciais do banco de dados**:
   - Abra o arquivo `wp-config.php`
   - Verifique se as definições de `DB_NAME`, `DB_USER`, `DB_PASSWORD` e `DB_HOST` estão corretas
   - Tente conectar ao banco de dados usando essas credenciais através do phpMyAdmin ou outro cliente MySQL

2. **Executar o script de diagnóstico**:
   ```
   php fix-wordpress-database.php
   ```

3. **Reinstalar o WordPress**:
   - Faça backup dos seus arquivos e banco de dados
   - Baixe uma nova cópia do WordPress
   - Siga as instruções de instalação

### 2. Problemas com Permissões de Arquivos

#### Sintomas:
- Não é possível fazer upload de arquivos
- Não é possível instalar temas ou plugins
- Erros de escrita em arquivos

#### Soluções:
1. **Corrigir permissões de arquivos**:
   - No Windows, execute:
     ```
     fix-wordpress-permissions.bat
     ```
   - No Linux/Mac, execute:
     ```
     chmod -R 755 wp-content
     chmod -R 755 wp-admin
     chmod -R 755 wp-includes
     chmod 644 wp-config.php
     ```

2. **Verificar propriedade dos arquivos**:
   - Os arquivos devem pertencer ao usuário do servidor web (geralmente www-data, apache, ou nginx)

### 3. Problemas com o Tema

#### Sintomas:
- O site funciona com um tema padrão, mas não com o tema personalizado
- Tela branca após ativar o tema
- Erros de PHP no log do servidor

#### Soluções:
1. **Executar o script de diagnóstico do tema**:
   ```
   php fix-wordpress-theme.php
   ```

2. **Ativar um tema padrão**:
   - Acesse o painel administrativo do WordPress
   - Vá para Aparência > Temas
   - Ative um tema padrão como o Twenty Twenty-Three

3. **Verificar erros no tema**:
   - Verifique se todos os arquivos essenciais estão presentes
   - Verifique se não há erros de sintaxe no arquivo functions.php

### 4. Problemas com Plugins

#### Sintomas:
- O site funciona quando todos os plugins estão desativados
- Erros específicos relacionados a plugins
- Conflitos entre plugins

#### Soluções:
1. **Desativar todos os plugins**:
   - Renomeie a pasta `wp-content/plugins` para `wp-content/plugins.old`
   - O WordPress desativará automaticamente todos os plugins
   - Reative os plugins um por um para identificar o problema

2. **Verificar plugins problemáticos**:
   - Plugins desatualizados
   - Plugins incompatíveis com a versão atual do WordPress
   - Plugins com conflitos conhecidos

### 5. Problemas com o Servidor

#### Sintomas:
- Erros 500 (Internal Server Error)
- Tempo limite de execução excedido
- Memória insuficiente

#### Soluções:
1. **Verificar os requisitos do servidor**:
   - PHP 7.4 ou superior
   - MySQL 5.7 ou superior ou MariaDB 10.3 ou superior
   - Módulos PHP necessários (mysqli, xml, zip, etc.)

2. **Aumentar limites de recursos**:
   - Edite o arquivo php.ini ou crie um arquivo .htaccess com:
     ```
     php_value memory_limit 256M
     php_value max_execution_time 300
     php_value upload_max_filesize 64M
     php_value post_max_size 64M
     ```

## Scripts de Diagnóstico Incluídos

1. **fix-wordpress-installation.php**: Diagnóstico geral da instalação do WordPress
2. **fix-wordpress-theme.php**: Diagnóstico e correção de problemas com o tema
3. **fix-wordpress-permissions.bat**: Correção de permissões de arquivos (Windows)
4. **fix-wordpress-database.php**: Diagnóstico e correção de problemas no banco de dados

## Como Executar os Scripts

1. Faça upload dos scripts para o diretório raiz do WordPress
2. Execute os scripts através do navegador ou da linha de comando:
   - Navegador: `http://seu-site.com/fix-wordpress-installation.php`
   - Linha de comando: `php fix-wordpress-installation.php`

## Recursos Adicionais

- [Fórum de Suporte do WordPress](https://br.wordpress.org/support/)
- [Documentação do WordPress](https://br.wordpress.org/support/article/how-to-install-wordpress/)
- [Solução de Problemas Comuns](https://br.wordpress.org/support/article/common-wordpress-errors/)

## Contato para Suporte

Se você continuar enfrentando problemas após seguir este guia, entre em contato através do email: glolivercoder@gmail.com
