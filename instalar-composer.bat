@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo         Instalacao Automatica do Composer
echo ===================================================
echo.
echo Este script vai baixar e instalar o Composer em sua maquina.
echo.
echo Requisitos:
echo - PHP ja deve estar instalado e configurado
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause > nul

REM Verificar se o PHP esta instalado
php -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] PHP nao encontrado. Por favor, instale o PHP primeiro.
    echo Execute o script 'instalar-php.bat' antes de instalar o Composer.
    goto :error
)

REM Definir diretorio de instalacao
set "COMPOSER_DIR=%USERPROFILE%\composer"
set "COMPOSER_SETUP_URL=https://getcomposer.org/installer"
set "COMPOSER_SETUP_FILE=%TEMP%\composer-setup.php"

echo.
echo [1/4] Criando diretorio de instalacao...
if not exist "%COMPOSER_DIR%" mkdir "%COMPOSER_DIR%"
echo Diretorio criado: %COMPOSER_DIR%

echo.
echo [2/4] Baixando Composer...
echo URL: %COMPOSER_SETUP_URL%
echo.

REM Usar PowerShell para baixar o arquivo
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%COMPOSER_SETUP_URL%' -OutFile '%COMPOSER_SETUP_FILE%'}"

if not exist "%COMPOSER_SETUP_FILE%" (
    echo [ERRO] Falha ao baixar o Composer.
    echo Verifique sua conexao com a internet e tente novamente.
    goto :error
)

echo Download concluido: %COMPOSER_SETUP_FILE%

echo.
echo [3/4] Instalando Composer...
php "%COMPOSER_SETUP_FILE%" --install-dir="%COMPOSER_DIR%" --filename=composer

if not exist "%COMPOSER_DIR%\composer" (
    echo [ERRO] Falha ao instalar o Composer.
    goto :error
)

echo Composer instalado em: %COMPOSER_DIR%

REM Adicionar Composer ao PATH do sistema
echo Adicionando Composer ao PATH do sistema...
setx PATH "%PATH%;%COMPOSER_DIR%" /M

echo.
echo [4/4] Testando a instalacao...
echo.

REM Atualizar o PATH na sessao atual
set "PATH=%PATH%;%COMPOSER_DIR%"

REM Testar se o Composer esta funcionando
composer -V

if %errorlevel% neq 0 (
    echo [AVISO] O Composer foi instalado, mas nao esta disponivel no PATH atual.
    echo Voce precisara reiniciar o prompt de comando ou usar o caminho completo:
    echo %COMPOSER_DIR%\composer
) else (
    echo [SUCESSO] Composer foi instalado e configurado corretamente!
)

echo.
echo ===================================================
echo         Instalacao do Composer Concluida
echo ===================================================
echo.
echo O Composer foi instalado em: %COMPOSER_DIR%
echo.
echo Para usar o Composer, abra um novo prompt de comando e digite:
echo   composer -V
echo.
echo Apos reiniciar o computador, o Composer estara disponivel em qualquer diretorio.
echo.
echo Pressione qualquer tecla para sair...
goto :end

:error
echo.
echo [ERRO] A instalacao do Composer falhou.
echo Por favor, tente novamente ou faca a instalacao manual.
echo.
echo Voce pode baixar o Composer manualmente em:
echo https://getcomposer.org/download/
echo.

:end
pause > nul
del "%COMPOSER_SETUP_FILE%" 2>nul
endlocal
