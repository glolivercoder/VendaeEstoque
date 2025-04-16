@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo      Configuracao das Variaveis de Ambiente PHP
echo ===================================================
echo.

REM Verificar se o PHP está instalado
set "PHP_ENCONTRADO="
set "PHP_PATH="

echo Procurando instalacao do PHP...

REM Locais comuns onde o PHP pode estar instalado
set "LOCAIS_COMUNS=%USERPROFILE%\php C:\php C:\Program Files\PHP C:\Program Files (x86)\PHP C:\xampp\php C:\wamp\bin\php C:\wamp64\bin\php C:\laragon\bin\php"

for %%L in (%LOCAIS_COMUNS%) do (
    if exist "%%L\php.exe" (
        set "PHP_ENCONTRADO=1"
        set "PHP_PATH=%%L"
        echo PHP encontrado em: %%L
        goto :php_encontrado
    )
)

echo PHP nao encontrado nos locais comuns.
echo.
echo Por favor, informe o caminho completo para a pasta onde o PHP esta instalado:
echo (Exemplo: C:\php ou C:\xampp\php)
set /p "PHP_PATH="

if not exist "!PHP_PATH!\php.exe" (
    echo.
    echo [ERRO] PHP nao encontrado em !PHP_PATH!
    echo Verifique se o caminho esta correto e tente novamente.
    goto :fim
)

:php_encontrado
echo.
echo Verificando versao do PHP...
"!PHP_PATH!\php.exe" -v

if %errorlevel% neq 0 (
    echo [ERRO] Nao foi possivel executar o PHP.
    goto :fim
)

echo.
echo Adicionando PHP ao PATH do sistema...

REM Verificar se o PHP já está no PATH
set "PATH_ATUAL=%PATH%"
echo %PATH_ATUAL% | findstr /C:"!PHP_PATH!" > nul
if %errorlevel% equ 0 (
    echo PHP ja esta no PATH do sistema.
) else (
    REM Adicionar PHP ao PATH do usuário
    setx PATH "%PATH%;!PHP_PATH!" /M
    echo PHP adicionado ao PATH do sistema.
    echo Voce precisara reiniciar o prompt de comando para que as alteracoes tenham efeito.
)

echo.
echo Configurando php.ini...

REM Verificar se o php.ini existe
if not exist "!PHP_PATH!\php.ini" (
    if exist "!PHP_PATH!\php.ini-development" (
        copy "!PHP_PATH!\php.ini-development" "!PHP_PATH!\php.ini"
        echo Arquivo php.ini criado a partir do php.ini-development.
    ) else if exist "!PHP_PATH!\php.ini-production" (
        copy "!PHP_PATH!\php.ini-production" "!PHP_PATH!\php.ini"
        echo Arquivo php.ini criado a partir do php.ini-production.
    ) else (
        echo [AVISO] Nao foi possivel encontrar um arquivo php.ini de exemplo.
        echo Criando um php.ini basico...

        echo ; Configuracao basica do PHP > "!PHP_PATH!\php.ini"
        echo extension_dir = "ext" >> "!PHP_PATH!\php.ini"
        echo extension=curl >> "!PHP_PATH!\php.ini"
        echo extension=fileinfo >> "!PHP_PATH!\php.ini"
        echo extension=gd >> "!PHP_PATH!\php.ini"
        echo extension=mbstring >> "!PHP_PATH!\php.ini"
        echo extension=openssl >> "!PHP_PATH!\php.ini"
        echo extension=pdo_sqlite >> "!PHP_PATH!\php.ini"
        echo extension=sqlite3 >> "!PHP_PATH!\php.ini"

        echo Arquivo php.ini basico criado.
    )
)

echo.
echo ===================================================
echo      Configuracao do PHP concluida com sucesso
echo ===================================================
echo.
echo O PHP esta configurado e pronto para uso.
echo.
echo Caminho do PHP: !PHP_PATH!
echo.
echo Para testar, abra um novo prompt de comando e digite:
echo   php -v
echo.

:fim
pause
endlocal
