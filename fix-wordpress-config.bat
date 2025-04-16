@echo off
echo ===================================================
echo  Correcao de Configuracoes do WordPress/WooCommerce
echo ===================================================
echo.
echo Este script corrige problemas de URL e configuracoes
echo do WordPress e WooCommerce usando as credenciais da API.
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause > nul

php fix-wordpress-config.php

echo.
echo Processo concluido!
echo.
pause
