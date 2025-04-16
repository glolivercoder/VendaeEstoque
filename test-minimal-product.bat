@echo off
echo ===================================================
echo  Teste de Criacao de Produto Minimo no WooCommerce
echo ===================================================
echo.
echo Este script tenta criar um produto minimo no WooCommerce
echo para identificar o problema com a API.
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause > nul

php test-minimal-product.php

echo.
echo Teste concluido!
echo.
pause
