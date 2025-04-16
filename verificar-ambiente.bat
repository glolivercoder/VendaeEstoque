@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo        Verificacao do Ambiente de Integracao
echo ===================================================
echo.

echo [1/3] Verificando PHP...
where php >nul 2>&1
if %errorlevel% neq 0 (
    echo [AVISO] PHP nao encontrado no PATH do sistema.
    echo Execute o script 'configurar-php-path.bat' para configurar o PHP.
) else (
    echo [OK] PHP encontrado. Versao:
    php -v
)

echo.
echo [2/3] Verificando Composer...
where composer >nul 2>&1
if %errorlevel% neq 0 (
    echo [AVISO] Composer nao encontrado no PATH do sistema.
    echo Execute o script 'configurar-composer.bat' para configurar o Composer.
) else (
    echo [OK] Composer encontrado. Versao:
    composer --version
)

echo.
echo [3/3] Verificando arquivo .env...
if not exist ".env" (
    echo [AVISO] Arquivo .env nao encontrado.
    echo Este arquivo e necessario para a integracao com o WooCommerce.
    
    echo.
    echo Deseja criar um arquivo .env basico agora? (S/N)
    set /p "CRIAR_ENV="
    
    if /i "!CRIAR_ENV!"=="S" (
        echo.
        echo Criando arquivo .env...
        
        echo # Configuracoes do WooCommerce > .env
        echo VITE_WORDPRESS_URL=https://achadinhoshopp.com.br/loja >> .env
        echo VITE_WOOCOMMERCE_CONSUMER_KEY=ck_40b4a1a674084d504579a2ba2d51530c260d3645 >> .env
        echo VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_8fa4b36ab57ddb02415e4fc346451791ab1782f9 >> .env
        
        echo Arquivo .env criado com sucesso.
    )
) else (
    echo [OK] Arquivo .env encontrado.
)

echo.
echo ===================================================
echo        Resumo da Verificacao do Ambiente
echo ===================================================
echo.

echo PHP:
where php >nul 2>&1
if %errorlevel% neq 0 (
    echo [NAO INSTALADO] Execute 'configurar-php-path.bat'
) else (
    echo [INSTALADO] 
    php -v | findstr /B "PHP"
)

echo.
echo Composer:
where composer >nul 2>&1
if %errorlevel% neq 0 (
    echo [NAO INSTALADO] Execute 'configurar-composer.bat'
) else (
    echo [INSTALADO]
    composer --version | findstr /B "Composer"
)

echo.
echo Arquivo .env:
if not exist ".env" (
    echo [NAO ENCONTRADO] Crie o arquivo .env com as credenciais do WooCommerce
) else (
    echo [ENCONTRADO]
)

echo.
echo ===================================================
echo.
echo Proximos passos:
echo.
echo 1. Se algum componente estiver faltando, execute o script de configuracao correspondente.
echo 2. Apos configurar todos os componentes, execute 'export-pdv-products.bat' para exportar os produtos.
echo 3. Em seguida, execute 'sync-products.bat' para sincronizar os produtos com o WooCommerce.
echo.

pause
endlocal
