@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo  Instalacao da Integracao PDV Vendas - WooCommerce
echo ===================================================
echo.
echo Este script vai instalar e configurar a integracao entre
echo o PDV Vendas e o WooCommerce usando a API oficial.
echo.
echo Requisitos:
echo - PHP 7.4 ou superior (sera instalado automaticamente se necessario)
echo - Composer (sera instalado automaticamente se necessario)
echo - Credenciais da API WooCommerce (ja configuradas no .env)
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause > nul

echo.
echo [1/4] Verificando requisitos...
echo.

REM Verificar PHP
php -v > nul 2>&1
if %errorlevel% neq 0 (
    echo [AVISO] PHP nao encontrado. Iniciando instalacao automatica...
    echo.

    REM Verificar se o script de instalacao do PHP existe
    if exist "instalar-php.bat" (
        call instalar-php.bat
    ) else (
        echo [ERRO] Script de instalacao do PHP nao encontrado.
        echo Por favor, execute este script no mesmo diretorio que instalar-php.bat
        echo ou instale o PHP manualmente.
        echo.
        echo Instalacao cancelada.
        pause
        exit /b 1
    )

    REM Verificar novamente se o PHP foi instalado
    php -v > nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERRO] Falha na instalacao automatica do PHP.
        echo Por favor, instale o PHP manualmente e tente novamente.
        echo.
        echo Instalacao cancelada.
        pause
        exit /b 1
    )
) else (
    echo [OK] PHP encontrado.
)

REM Verificar Composer
composer -V > nul 2>&1
if %errorlevel% neq 0 (
    echo [AVISO] Composer nao encontrado. Iniciando instalacao automatica...
    echo.

    REM Verificar se o script de instalacao do Composer existe
    if exist "instalar-composer.bat" (
        call instalar-composer.bat
    ) else (
        echo [ERRO] Script de instalacao do Composer nao encontrado.
        echo Por favor, execute este script no mesmo diretorio que instalar-composer.bat
        echo ou instale o Composer manualmente.
        echo.
        echo Instalacao cancelada.
        pause
        exit /b 1
    )

    REM Verificar novamente se o Composer foi instalado
    composer -V > nul 2>&1
    if %errorlevel% neq 0 (
        echo [ERRO] Falha na instalacao automatica do Composer.
        echo Por favor, instale o Composer manualmente e tente novamente.
        echo.
        echo Instalacao cancelada.
        pause
        exit /b 1
    )
) else (
    echo [OK] Composer encontrado.
)

REM Verificar arquivo .env
if not exist .env (
    echo [ERRO] Arquivo .env nao encontrado.
    echo Por favor, certifique-se de que o arquivo .env existe e contem as credenciais do WooCommerce.
    echo.
    echo Instalacao cancelada.
    pause
    exit /b 1
)
echo [OK] Arquivo .env encontrado.

echo.
echo [2/4] Instalando dependencias...
echo.
composer install
if %errorlevel% neq 0 (
    echo [ERRO] Falha ao instalar dependencias.
    echo.
    echo Instalacao cancelada.
    pause
    exit /b 1
)

echo.
echo [3/4] Criando estrutura de diretorios...
echo.
if not exist data mkdir data
echo [OK] Diretorio de dados criado.

echo.
echo [4/4] Configuracao concluida!
echo.
echo A integracao foi instalada com sucesso!
echo.
echo Proximos passos:
echo 1. Execute o script 'export-pdv-products.bat' para exportar os produtos do PDV Vendas
echo 2. Siga as instrucoes na tela para exportar os produtos
echo 3. Execute o script 'sync-products.bat' para sincronizar os produtos com o WooCommerce
echo.
echo Para mais informacoes, consulte o arquivo README-WOOCOMMERCE-API.md
echo.
echo Pressione qualquer tecla para sair...
pause > nul
