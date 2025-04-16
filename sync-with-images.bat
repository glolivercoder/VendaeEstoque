@echo off
echo ===================================================
echo  Sincronizacao de Produtos com Suporte a Imagens
echo ===================================================
echo.
echo Este script sincroniza produtos do PDV Vendas para o WooCommerce
echo com suporte aprimorado para upload de imagens.
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause > nul

php sync-products-with-images.php

echo.
echo Sincronizacao concluida!
echo.
pause
