@echo off
echo ===================================================
echo  Criando Pacote de Configuracao do WooCommerce
echo ===================================================
echo.
echo Este script vai criar um arquivo ZIP com todos os recursos
echo para configurar o WooCommerce.
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause > nul

echo.
echo Criando diretorio temporario...
mkdir woocommerce-config-temp

echo.
echo Copiando arquivos...
copy backup-woocommerce.bat woocommerce-config-temp\
copy configure-woocommerce-homepage.js woocommerce-config-temp\
copy configure-woocommerce-theme.js woocommerce-config-temp\
copy pdv-vendas-style.css woocommerce-config-temp\
copy instrucoes-configuracao-woocommerce.md woocommerce-config-temp\
copy create-shop-homepage.php woocommerce-config-temp\

echo.
echo Criando arquivo ZIP...
powershell Compress-Archive -Path woocommerce-config-temp\* -DestinationPath woocommerce-config.zip -Force

echo.
echo Removendo diretorio temporario...
rmdir /s /q woocommerce-config-temp

echo.
echo Pacote criado com sucesso: woocommerce-config.zip
echo.
echo Pressione qualquer tecla para sair...
pause > nul
