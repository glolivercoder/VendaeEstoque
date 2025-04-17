@echo off
echo ===================================================
echo  Backup do WordPress e WooCommerce
echo ===================================================
echo.
echo Este script vai criar um backup do site WordPress
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause > nul

echo.
echo Criando diretorio de backup...
mkdir woocommerce-backup

echo.
echo Baixando plugin de backup...
curl -L "https://downloads.wordpress.org/plugin/updraftplus.latest-stable.zip" -o woocommerce-backup\updraftplus.zip

echo.
echo Backup concluido! Agora voce precisa:
echo 1. Fazer login no WordPress
echo 2. Instalar o plugin UpdraftPlus do arquivo baixado
echo 3. Usar o plugin para criar um backup completo
echo.
echo Pressione qualquer tecla para abrir o painel do WordPress...
pause > nul

start https://achadinhoshopp.com.br/loja/wp-admin/

echo.
echo Pressione qualquer tecla para sair...
pause > nul
