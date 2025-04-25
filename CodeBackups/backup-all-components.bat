@echo off
echo Criando backups completos do sistema PDV Vendas...
echo.

REM Criar pasta de backup com data atual
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YYYY=%dt:~0,4%"
set "MM=%dt:~4,2%"
set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%"
set "Min=%dt:~10,2%"
set "Sec=%dt:~12,2%"

set "datestamp=%YYYY%%MM%%DD%"
set "timestamp=%HH%%Min%%Sec%"
set "fullstamp=%YYYY%-%MM%-%DD%_%HH%-%Min%-%Sec%"

set "BACKUP_DIR=CodeBackups\FullBackup_%fullstamp%"
mkdir "%BACKUP_DIR%"

echo Backup será salvo em: %BACKUP_DIR%
echo.

REM Backup dos componentes principais
echo Copiando componentes principais...
mkdir "%BACKUP_DIR%\src\components"
copy /Y src\App.jsx "%BACKUP_DIR%\src\"
copy /Y src\components\ShippingCalculator.jsx "%BACKUP_DIR%\src\components\"
copy /Y src\components\SaleConfirmationPopup.jsx "%BACKUP_DIR%\src\components\"
copy /Y src\components\TrackingPanel.jsx "%BACKUP_DIR%\src\components\" 2>nul
copy /Y src\components\ShippingLabelGenerator.jsx "%BACKUP_DIR%\src\components\" 2>nul
copy /Y src\components\ShippingOptionCard.jsx "%BACKUP_DIR%\src\components\" 2>nul
copy /Y src\components\ProductSelector.jsx "%BACKUP_DIR%\src\components\" 2>nul
copy /Y src\components\SalesHistory.jsx "%BACKUP_DIR%\src\components\" 2>nul
copy /Y src\components\ClientManagement.jsx "%BACKUP_DIR%\src\components\" 2>nul
echo Componentes principais copiados.
echo.

REM Backup das páginas
echo Copiando páginas...
mkdir "%BACKUP_DIR%\src\pages"
copy /Y src\pages\Vendors.jsx "%BACKUP_DIR%\src\pages\" 2>nul
copy /Y src\pages\Inventory.jsx "%BACKUP_DIR%\src\pages\" 2>nul
echo Páginas copiadas.
echo.

REM Backup dos serviços
echo Copiando serviços...
mkdir "%BACKUP_DIR%\src\services"
copy /Y src\services\database.js "%BACKUP_DIR%\src\services\"
copy /Y src\services\enhancedBackupService.js "%BACKUP_DIR%\src\services\" 2>nul
copy /Y src\services\wordpress.js "%BACKUP_DIR%\src\services\" 2>nul
echo Serviços copiados.
echo.

REM Backup das bibliotecas
echo Copiando bibliotecas...
mkdir "%BACKUP_DIR%\src\lib"
mkdir "%BACKUP_DIR%\src\lib\carriers"
copy /Y src\lib\shippingApi.js "%BACKUP_DIR%\src\lib\" 2>nul
copy /Y src\lib\productApi.js "%BACKUP_DIR%\src\lib\" 2>nul
copy /Y src\lib\trackingApi.js "%BACKUP_DIR%\src\lib\" 2>nul
copy /Y src\lib\shippingConfig.js "%BACKUP_DIR%\src\lib\" 2>nul
copy /Y src\lib\carriers\*.js "%BACKUP_DIR%\src\lib\carriers\" 2>nul
echo Bibliotecas copiadas.
echo.

REM Backup dos estilos
echo Copiando estilos...
mkdir "%BACKUP_DIR%\src\styles"
copy /Y src\styles\ShippingCalculator.css "%BACKUP_DIR%\src\styles\" 2>nul
copy /Y src\styles\SaleConfirmationPopup.css "%BACKUP_DIR%\src\styles\" 2>nul
copy /Y src\styles\SalesHistory.css "%BACKUP_DIR%\src\styles\" 2>nul
copy /Y src\styles\global.css "%BACKUP_DIR%\src\styles\" 2>nul
copy /Y src\styles\shipping.css "%BACKUP_DIR%\src\styles\" 2>nul
echo Estilos copiados.
echo.

REM Criar arquivo README
echo Criando arquivo README...
echo # Backup Completo do Sistema PDV Vendas > "%BACKUP_DIR%\README.md"
echo. >> "%BACKUP_DIR%\README.md"
echo Data do backup: %YYYY%-%MM%-%DD% %HH%:%Min%:%Sec% >> "%BACKUP_DIR%\README.md"
echo. >> "%BACKUP_DIR%\README.md"
echo ## Conteúdo do Backup >> "%BACKUP_DIR%\README.md"
echo. >> "%BACKUP_DIR%\README.md"
echo Este backup contém os seguintes componentes: >> "%BACKUP_DIR%\README.md"
echo. >> "%BACKUP_DIR%\README.md"
echo - App.jsx: Arquivo principal da aplicação >> "%BACKUP_DIR%\README.md"
echo - Componentes: ShippingCalculator, SaleConfirmationPopup, etc. >> "%BACKUP_DIR%\README.md"
echo - Páginas: Vendors, Inventory >> "%BACKUP_DIR%\README.md"
echo - Serviços: database.js, enhancedBackupService.js, etc. >> "%BACKUP_DIR%\README.md"
echo - Bibliotecas: shippingApi.js, productApi.js, etc. >> "%BACKUP_DIR%\README.md"
echo - Estilos: CSS relacionados aos componentes >> "%BACKUP_DIR%\README.md"
echo. >> "%BACKUP_DIR%\README.md"
echo ## Como Restaurar >> "%BACKUP_DIR%\README.md"
echo. >> "%BACKUP_DIR%\README.md"
echo Para restaurar este backup, copie os arquivos para os diretórios correspondentes no projeto. >> "%BACKUP_DIR%\README.md"
echo Arquivo README criado.
echo.

echo Backup completo criado com sucesso em: %BACKUP_DIR%
echo.
echo Pressione qualquer tecla para sair...
pause > nul
