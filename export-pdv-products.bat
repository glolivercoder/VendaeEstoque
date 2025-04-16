@echo off
echo Exportando produtos do PDV Vendas para sincronização com WooCommerce...
echo.
echo Este script irá criar um arquivo JavaScript que você deve executar no console do navegador
echo enquanto o PDV Vendas estiver aberto.
echo.
echo Instruções:
echo 1. Abra o PDV Vendas no navegador Chrome
echo 2. Pressione F12 para abrir as ferramentas de desenvolvedor
echo 3. Vá para a aba "Console"
echo 4. Copie e cole o conteúdo de um dos scripts abaixo no console:
echo.
echo    - export-products-browser.js (script padrão)
echo    - export-products-flexible.js (script avançado - use se o padrão falhar)
echo    - diagnostico-indexeddb.js (para diagnosticar problemas)
echo.
echo 5. Pressione Enter para executar
echo 6. Após a mensagem de sucesso, execute o script sync-products.bat
echo.
echo Pressione qualquer tecla para continuar...
pause > nul

php -r "if (!is_dir('data')) { mkdir('data', 0755, true); } echo 'Diretório de dados criado com sucesso!\n';"

echo Qual script você deseja abrir?
echo 1 - export-products-browser.js (script padrão)
echo 2 - export-products-flexible.js (script avançado)
echo 3 - diagnostico-indexeddb.js (diagnóstico)
echo.

set /p opcao="Digite o número da opção desejada (1-3): "

if "%opcao%"=="1" (
    echo Abrindo o script padrão...
    start notepad export-products-browser.js
) else if "%opcao%"=="2" (
    echo Abrindo o script avançado...
    start notepad export-products-flexible.js
) else if "%opcao%"=="3" (
    echo Abrindo o script de diagnóstico...
    start notepad diagnostico-indexeddb.js
) else (
    echo Opção inválida! Abrindo o script padrão...
    start notepad export-products-browser.js
)

echo.
echo Após executar o script no console do navegador, execute sync-products.bat para sincronizar os produtos com o WooCommerce.
echo.
echo IMPORTANTE: Se você receber a mensagem "Object store 'products' não encontrado",
echo use o script de diagnóstico para identificar o banco de dados correto e depois
echo use o script avançado para exportar os produtos.
echo.
pause
