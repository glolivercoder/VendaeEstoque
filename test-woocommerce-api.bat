@echo off
echo ===================================================
echo      Teste de Conexao com a API do WooCommerce
echo ===================================================
echo.
echo Este script testa a conexao com a API do WooCommerce
echo e verifica se e possivel fazer upload de imagens.
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause > nul

php test-woocommerce-api.php

echo.
echo Teste concluido!
echo.
pause
