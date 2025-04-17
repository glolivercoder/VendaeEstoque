@echo off
echo ===================================================
echo Ferramenta de Solucao de Problemas do WordPress
echo ===================================================
echo.

REM Verificar se o PHP está instalado
where php >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERRO: PHP nao encontrado.
    echo Por favor, instale o PHP e adicione-o ao PATH do sistema.
    echo Voce pode baixar o PHP em: https://windows.php.net/download/
    pause
    exit /b 1
)

echo PHP encontrado. Verificando versao...
php -v

echo.
echo Escolha uma opcao:
echo 1. Diagnostico geral da instalacao
echo 2. Corrigir problemas com o tema
echo 3. Corrigir permissoes de arquivos
echo 4. Diagnostico do banco de dados
echo 5. Executar todos os diagnosticos
echo 6. Sair
echo.

set /p opcao=Digite o numero da opcao desejada: 

if "%opcao%"=="1" (
    echo.
    echo Executando diagnostico geral da instalacao...
    php fix-wordpress-installation.php
    pause
    goto inicio
)

if "%opcao%"=="2" (
    echo.
    echo Executando diagnostico do tema...
    php fix-wordpress-theme.php
    pause
    goto inicio
)

if "%opcao%"=="3" (
    echo.
    echo Corrigindo permissoes de arquivos...
    call fix-wordpress-permissions.bat
    pause
    goto inicio
)

if "%opcao%"=="4" (
    echo.
    echo Executando diagnostico do banco de dados...
    php fix-wordpress-database.php
    pause
    goto inicio
)

if "%opcao%"=="5" (
    echo.
    echo Executando todos os diagnosticos...
    
    echo.
    echo 1. Diagnostico geral da instalacao...
    php fix-wordpress-installation.php
    
    echo.
    echo 2. Diagnostico do tema...
    php fix-wordpress-theme.php
    
    echo.
    echo 3. Corrigindo permissoes de arquivos...
    call fix-wordpress-permissions.bat
    
    echo.
    echo 4. Diagnostico do banco de dados...
    php fix-wordpress-database.php
    
    echo.
    echo Todos os diagnosticos foram concluidos!
    pause
    goto inicio
)

if "%opcao%"=="6" (
    echo.
    echo Saindo...
    exit /b 0
)

echo.
echo Opcao invalida. Por favor, escolha uma opcao valida.
pause
goto inicio

:inicio
cls
echo ===================================================
echo Ferramenta de Solucao de Problemas do WordPress
echo ===================================================
echo.
goto :eof
