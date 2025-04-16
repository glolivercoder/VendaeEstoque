@echo off
echo ===================================================
echo     Adicionar PHP ao PATH do Sistema
echo ===================================================
echo.

echo Este script adiciona o PHP ao PATH do sistema.
echo.
echo Por favor, informe o caminho completo para a pasta onde o PHP esta instalado:
echo (Exemplo: C:\php ou C:\xampp\php)
set /p PHP_PATH=

if not exist "%PHP_PATH%\php.exe" (
    echo.
    echo [ERRO] PHP nao encontrado em %PHP_PATH%
    echo Verifique se o caminho esta correto e tente novamente.
    goto fim
)

echo.
echo Verificando versao do PHP...
"%PHP_PATH%\php.exe" -v

echo.
echo Adicionando PHP ao PATH do sistema...
setx PATH "%PATH%;%PHP_PATH%" /M

echo.
echo PHP adicionado ao PATH do sistema.
echo Voce precisara reiniciar o prompt de comando para que as alteracoes tenham efeito.
echo.
echo Para testar, abra um novo prompt de comando e digite:
echo   php -v
echo.

:fim
pause
