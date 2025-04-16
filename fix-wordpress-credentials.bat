@echo off
echo ===================================================
echo  Verificacao e Correcao de Credenciais do WordPress
echo ===================================================
echo.
echo Este script verifica e corrige as credenciais do WordPress
echo e testa a criacao de produtos no WooCommerce.
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause > nul

php fix-wordpress-credentials.php

echo.
echo Processo concluido!
echo.
pause
