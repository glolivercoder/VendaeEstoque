@echo off
echo ===================================================
echo  Depuracao da Resposta da API do WooCommerce
echo ===================================================
echo.
echo Este script depura a resposta da API do WooCommerce
echo e identifica o motivo do erro 400 (Bad Request).
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause > nul

php debug-woocommerce-response.php

echo.
echo Depuracao concluida!
echo.
pause
