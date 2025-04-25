@echo off
echo Restaurando backups do sistema PDV Vendas...
echo.

echo Restaurando App.jsx...
copy /Y CodeBackups\App.jsx.backup src\App.jsx
if %errorlevel% equ 0 (
    echo App.jsx restaurado com sucesso.
) else (
    echo Erro ao restaurar App.jsx.
)
echo.

echo Restaurando ShippingCalculator.jsx...
copy /Y CodeBackups\ShippingCalculator.jsx.backup src\components\ShippingCalculator.jsx
if %errorlevel% equ 0 (
    echo ShippingCalculator.jsx restaurado com sucesso.
) else (
    echo Erro ao restaurar ShippingCalculator.jsx.
)
echo.

echo Restaurando SaleConfirmationPopup.jsx...
copy /Y CodeBackups\SaleConfirmationPopup.jsx.backup src\components\SaleConfirmationPopup.jsx
if %errorlevel% equ 0 (
    echo SaleConfirmationPopup.jsx restaurado com sucesso.
) else (
    echo Erro ao restaurar SaleConfirmationPopup.jsx.
)
echo.

echo Restaurando Vendors.jsx...
copy /Y CodeBackups\Vendors.jsx.backup src\pages\Vendors.jsx
if %errorlevel% equ 0 (
    echo Vendors.jsx restaurado com sucesso.
) else (
    echo Erro ao restaurar Vendors.jsx.
)
echo.

echo Restaurando ClientManagement.jsx...
copy /Y CodeBackups\ClientManagement.jsx.backup src\components\ClientManagement.jsx
if %errorlevel% equ 0 (
    echo ClientManagement.jsx restaurado com sucesso.
) else (
    echo Erro ao restaurar ClientManagement.jsx.
)
echo.

echo Restaurando database.js...
copy /Y CodeBackups\database.js.backup src\services\database.js
if %errorlevel% equ 0 (
    echo database.js restaurado com sucesso.
) else (
    echo Erro ao restaurar database.js.
)
echo.

echo Restauração concluída.
echo Pressione qualquer tecla para sair...
pause > nul
