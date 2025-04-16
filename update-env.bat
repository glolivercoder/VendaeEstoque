@echo off
echo ===================================================
echo      Atualizacao do Arquivo .env
echo ===================================================
echo.
echo Este script atualiza o arquivo .env com as credenciais
echo corretas para o WordPress e WooCommerce.
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause > nul

php update-env.php

echo.
echo Atualizacao concluida!
echo.
pause
