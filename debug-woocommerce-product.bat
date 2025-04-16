@echo off
echo ===================================================
echo  Diagnostico de Criacao de Produtos no WooCommerce
echo ===================================================
echo.
echo Este script diagnostica problemas na criacao de produtos
echo no WooCommerce e sugere solucoes.
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause > nul

php debug-woocommerce-product.php

echo.
echo Diagnostico concluido!
echo.
pause
