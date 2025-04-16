@echo off
echo ===================================================
echo  Correcao de Problemas de SSL no WordPress/WooCommerce
echo ===================================================
echo.
echo Este script corrige problemas de certificado SSL
echo ao conectar com a API do WordPress e WooCommerce.
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause > nul

php fix-wordpress-config.php

echo.
echo Processo concluido!
echo.
pause
