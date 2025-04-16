@echo off
echo ===================================================
echo     Configuracao das Variaveis de Ambiente PHP
echo ===================================================
echo.

echo Procurando instalacao do PHP...

set PHP_ENCONTRADO=0

if exist "%USERPROFILE%\php\php.exe" (
    set PHP_PATH=%USERPROFILE%\php
    set PHP_ENCONTRADO=1
    echo PHP encontrado em: %USERPROFILE%\php
    goto php_encontrado
)

if exist "C:\php\php.exe" (
    set PHP_PATH=C:\php
    set PHP_ENCONTRADO=1
    echo PHP encontrado em: C:\php
    goto php_encontrado
)

if exist "C:\xampp\php\php.exe" (
    set PHP_PATH=C:\xampp\php
    set PHP_ENCONTRADO=1
    echo PHP encontrado em: C:\xampp\php
    goto php_encontrado
)

if exist "C:\wamp64\bin\php\php8.2.28\php.exe" (
    set PHP_PATH=C:\wamp64\bin\php\php8.2.28
    set PHP_ENCONTRADO=1
    echo PHP encontrado em: C:\wamp64\bin\php\php8.2.28
    goto php_encontrado
)

echo PHP nao encontrado nos locais comuns.
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

:php_encontrado
echo.
echo Verificando versao do PHP...
"%PHP_PATH%\php.exe" -v

if %errorlevel% neq 0 (
    echo [ERRO] Nao foi possivel executar o PHP.
    goto fim
)

echo.
echo Adicionando PHP ao PATH do sistema...

setx PATH "%PATH%;%PHP_PATH%" /M
echo PHP adicionado ao PATH do sistema.
echo Voce precisara reiniciar o prompt de comando para que as alteracoes tenham efeito.

echo.
echo Configurando php.ini...

if not exist "%PHP_PATH%\php.ini" (
    if exist "%PHP_PATH%\php.ini-development" (
        copy "%PHP_PATH%\php.ini-development" "%PHP_PATH%\php.ini"
        echo Arquivo php.ini criado a partir do php.ini-development.
    ) else if exist "%PHP_PATH%\php.ini-production" (
        copy "%PHP_PATH%\php.ini-production" "%PHP_PATH%\php.ini"
        echo Arquivo php.ini criado a partir do php.ini-production.
    ) else (
        echo [AVISO] Nao foi possivel encontrar um arquivo php.ini de exemplo.
    )
)

echo.
echo ===================================================
echo     Configuracao do PHP concluida com sucesso
echo ===================================================
echo.
echo O PHP esta configurado e pronto para uso.
echo.
echo Caminho do PHP: %PHP_PATH%
echo.
echo Para testar, abra um novo prompt de comando e digite:
echo   php -v
echo.

:fim
pause
