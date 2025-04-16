@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo  Instalacao Completa da Integracao com WooCommerce
echo ===================================================
echo.
echo Este script vai instalar todos os componentes necessarios:
echo 1. PHP (se necessario)
echo 2. Composer (se necessario)
echo 3. Integracao PDV Vendas - WooCommerce
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause > nul

REM Verificar e instalar PHP se necessario
echo.
echo [1/3] Verificando PHP...
php -v > nul 2>&1
if %errorlevel% neq 0 (
    echo PHP nao encontrado. Iniciando instalacao automatica...
    call instalar-php.bat

    REM Verificar se a instalacao automatica funcionou
    php -v > nul 2>&1
    if %errorlevel% neq 0 (
        echo Instalacao automatica falhou. Tentando metodo manual...
        call baixar-php-manual.bat

        REM Verificar novamente
        php -v > nul 2>&1
        if %errorlevel% neq 0 (
            echo [ERRO] Falha na instalacao do PHP.
            echo Por favor, instale o PHP manualmente e execute este script novamente.
            pause
            exit /b 1
        )
    )
) else (
    echo PHP ja esta instalado.
)

REM Verificar e instalar Composer se necessario
echo.
echo [2/3] Verificando Composer...
composer -V > nul 2>&1
if %errorlevel% neq 0 (
    echo Composer nao encontrado. Iniciando instalacao...
    call instalar-composer.bat
) else (
    echo Composer ja esta instalado.
)

REM Instalar a integracao
echo.
echo [3/3] Instalando integracao PDV Vendas - WooCommerce...
call instalar-integracao-woocommerce.bat

echo.
echo ===================================================
echo      Instalacao Completa Finalizada
echo ===================================================
echo.
echo Todos os componentes foram instalados com sucesso!
echo.
echo Proximos passos:
echo 1. Execute o script 'export-pdv-products.bat' para exportar os produtos do PDV Vendas
echo 2. Execute o script 'sync-products.bat' para sincronizar os produtos com o WooCommerce
echo.
echo Pressione qualquer tecla para sair...
pause > nul
endlocal
