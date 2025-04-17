@echo off
echo Criando pacote do tema VendaEstoque WooCommerce...

REM Verificar se o PowerShell está disponível
where powershell >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo PowerShell não encontrado. Usando método alternativo...
    goto :ZIP_MANUAL
) else (
    echo Usando PowerShell para criar o pacote...
    powershell -ExecutionPolicy Bypass -File package-theme.ps1
    goto :END
)

:ZIP_MANUAL
echo Criando diretórios temporários...
mkdir temp-vendaestoque-theme
mkdir temp-vendaestoque-theme\inc
mkdir temp-vendaestoque-theme\js
mkdir temp-vendaestoque-theme\template-parts

echo Copiando arquivos...
copy style.css temp-vendaestoque-theme\
copy functions.php temp-vendaestoque-theme\
copy index.php temp-vendaestoque-theme\
copy header.php temp-vendaestoque-theme\
copy footer.php temp-vendaestoque-theme\
copy front-page.php temp-vendaestoque-theme\
copy woocommerce.php temp-vendaestoque-theme\
copy sidebar.php temp-vendaestoque-theme\

copy inc\template-tags.php temp-vendaestoque-theme\inc\
copy inc\template-functions.php temp-vendaestoque-theme\inc\
copy inc\customizer.php temp-vendaestoque-theme\inc\

copy js\main.js temp-vendaestoque-theme\js\
copy js\customizer.js temp-vendaestoque-theme\js\

copy template-parts\content.php temp-vendaestoque-theme\template-parts\
copy template-parts\content-none.php temp-vendaestoque-theme\template-parts\

echo Compactando arquivos...
echo Por favor, compacte manualmente a pasta temp-vendaestoque-theme para criar o arquivo ZIP.
echo Após compactar, renomeie o arquivo para vendaestoque-theme.zip

:END
echo.
echo Processo concluído!
echo Consulte o arquivo THEME-README.md para instruções de instalação.
pause
