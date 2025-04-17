@echo off
echo Corrigindo permissoes do WordPress...

REM Verificar se o diretorio wp-content existe
if not exist wp-content (
    echo ERRO: Diretorio wp-content nao encontrado.
    echo Verifique se voce esta executando este script no diretorio raiz do WordPress.
    exit /b 1
)

echo Diretorio wp-content encontrado.

REM Criar diretorios se nao existirem
if not exist wp-content\uploads (
    echo Criando diretorio wp-content\uploads...
    mkdir wp-content\uploads
)

if not exist wp-content\upgrade (
    echo Criando diretorio wp-content\upgrade...
    mkdir wp-content\upgrade
)

echo Definindo permissoes...

REM Definir permissoes para diretorios
echo Definindo permissoes para diretorios...
icacls wp-content /grant Everyone:(OI)(CI)RX /T
icacls wp-content\themes /grant Everyone:(OI)(CI)RX /T
icacls wp-content\plugins /grant Everyone:(OI)(CI)RX /T
icacls wp-content\uploads /grant Everyone:(OI)(CI)M /T
icacls wp-content\upgrade /grant Everyone:(OI)(CI)M /T

REM Definir permissoes para arquivos
echo Definindo permissoes para arquivos...
icacls wp-config.php /grant Everyone:R

echo Permissoes definidas com sucesso!
echo.
echo Se os problemas persistirem, tente:
echo 1. Verificar as credenciais do banco de dados no arquivo wp-config.php
echo 2. Desativar temporariamente todos os plugins
echo 3. Ativar um tema padrao do WordPress
echo 4. Consultar o forum de suporte: https://br.wordpress.org/support/
echo.
pause
