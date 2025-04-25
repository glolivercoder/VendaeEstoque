@echo off
echo Atualizando backups do sistema PDV Vendas...
echo.

echo Atualizando backup do App.jsx...
copy /Y src\App.jsx CodeBackups\App.jsx.backup
if %errorlevel% equ 0 (
    echo Backup do App.jsx atualizado com sucesso.
) else (
    echo Erro ao atualizar backup do App.jsx.
)
echo.

echo Atualizando backup do ShippingCalculator.jsx...
copy /Y src\components\ShippingCalculator.jsx CodeBackups\ShippingCalculator.jsx.backup
if %errorlevel% equ 0 (
    echo Backup do ShippingCalculator.jsx atualizado com sucesso.
) else (
    echo Erro ao atualizar backup do ShippingCalculator.jsx.
)
echo.

echo Atualizando backup do SaleConfirmationPopup.jsx...
copy /Y src\components\SaleConfirmationPopup.jsx CodeBackups\SaleConfirmationPopup.jsx.backup
if %errorlevel% equ 0 (
    echo Backup do SaleConfirmationPopup.jsx atualizado com sucesso.
) else (
    echo Erro ao atualizar backup do SaleConfirmationPopup.jsx.
)
echo.

echo Atualizando backup do Vendors.jsx...
copy /Y src\pages\Vendors.jsx CodeBackups\Vendors.jsx.backup
if %errorlevel% equ 0 (
    echo Backup do Vendors.jsx atualizado com sucesso.
) else (
    echo Erro ao atualizar backup do Vendors.jsx.
)
echo.

echo Atualizando backup do ClientManagement.jsx...
copy /Y src\components\ClientManagement.jsx CodeBackups\ClientManagement.jsx.backup
if %errorlevel% equ 0 (
    echo Backup do ClientManagement.jsx atualizado com sucesso.
) else (
    echo Erro ao atualizar backup do ClientManagement.jsx.
)
echo.

echo Atualizando backup do database.js...
copy /Y src\services\database.js CodeBackups\database.js.backup
if %errorlevel% equ 0 (
    echo Backup do database.js atualizado com sucesso.
) else (
    echo Erro ao atualizar backup do database.js.
)
echo.

echo Atualização de backups concluída.
echo Pressione qualquer tecla para sair...
pause > nul
