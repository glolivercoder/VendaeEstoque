@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo           Instalacao Automatica do PHP
echo ===================================================
echo.
echo Este script vai baixar e instalar o PHP 8.2 (x64) em sua maquina.
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause > nul

REM Definir diretorio de instalacao
set "PHP_DIR=%USERPROFILE%\php"
set "PHP_VERSION=8.2.28"
set "PHP_ZIP_URL=https://windows.php.net/downloads/releases/php-8.2.28-Win32-vs16-x64.zip"
set "PHP_ZIP_FILE=%TEMP%\php.zip"

echo.
echo [1/5] Criando diretorio de instalacao...
if not exist "%PHP_DIR%" mkdir "%PHP_DIR%"
echo Diretorio criado: %PHP_DIR%

echo.
echo [2/5] Baixando PHP %PHP_VERSION%...
echo URL: %PHP_ZIP_URL%
echo.

REM Usar PowerShell para baixar o arquivo
powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%PHP_ZIP_URL%' -OutFile '%PHP_ZIP_FILE%'}"

if not exist "%PHP_ZIP_FILE%" (
    echo [ERRO] Falha ao baixar o PHP.
    echo Verifique sua conexao com a internet e tente novamente.
    goto :error
)

echo Download concluido: %PHP_ZIP_FILE%

echo.
echo [3/5] Extraindo arquivos...
powershell -Command "& {Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('%PHP_ZIP_FILE%', '%PHP_DIR%')}"

if not exist "%PHP_DIR%\php.exe" (
    echo [ERRO] Falha ao extrair os arquivos do PHP.
    goto :error
)

echo Arquivos extraidos para: %PHP_DIR%

echo.
echo [4/5] Configurando PHP...

REM Criar arquivo php.ini a partir do php.ini-development
if exist "%PHP_DIR%\php.ini-development" (
    copy "%PHP_DIR%\php.ini-development" "%PHP_DIR%\php.ini"
    echo Arquivo php.ini criado.
)

REM Habilitar extensoes comuns no php.ini
set "PHP_INI=%PHP_DIR%\php.ini"
if exist "%PHP_INI%" (
    powershell -Command "& {(Get-Content '%PHP_INI%') -replace ';extension=curl', 'extension=curl' | Set-Content '%PHP_INI%'}"
    powershell -Command "& {(Get-Content '%PHP_INI%') -replace ';extension=fileinfo', 'extension=fileinfo' | Set-Content '%PHP_INI%'}"
    powershell -Command "& {(Get-Content '%PHP_INI%') -replace ';extension=gd', 'extension=gd' | Set-Content '%PHP_INI%'}"
    powershell -Command "& {(Get-Content '%PHP_INI%') -replace ';extension=mbstring', 'extension=mbstring' | Set-Content '%PHP_INI%'}"
    powershell -Command "& {(Get-Content '%PHP_INI%') -replace ';extension=openssl', 'extension=openssl' | Set-Content '%PHP_INI%'}"
    powershell -Command "& {(Get-Content '%PHP_INI%') -replace ';extension=pdo_sqlite', 'extension=pdo_sqlite' | Set-Content '%PHP_INI%'}"
    powershell -Command "& {(Get-Content '%PHP_INI%') -replace ';extension=sqlite3', 'extension=sqlite3' | Set-Content '%PHP_INI%'}"
    echo Extensoes habilitadas no php.ini.
)

REM Adicionar PHP ao PATH do sistema
echo Adicionando PHP ao PATH do sistema...
setx PATH "%PATH%;%PHP_DIR%" /M

echo.
echo [5/5] Testando a instalacao...
echo.

REM Atualizar o PATH na sessao atual
set "PATH=%PATH%;%PHP_DIR%"

REM Testar se o PHP esta funcionando
php -v

if %errorlevel% neq 0 (
    echo [AVISO] O PHP foi instalado, mas nao esta disponivel no PATH atual.
    echo Voce precisara reiniciar o prompt de comando ou usar o caminho completo:
    echo %PHP_DIR%\php.exe
) else (
    echo [SUCESSO] PHP %PHP_VERSION% foi instalado e configurado corretamente!
)

echo.
echo ===================================================
echo           Instalacao do PHP Concluida
echo ===================================================
echo.
echo O PHP foi instalado em: %PHP_DIR%
echo.
echo Para usar o PHP, abra um novo prompt de comando e digite:
echo   php -v
echo.
echo Apos reiniciar o computador, o PHP estara disponivel em qualquer diretorio.
echo.
echo Pressione qualquer tecla para sair...
goto :end

:error
echo.
echo [ERRO] A instalacao do PHP falhou.
echo Por favor, tente novamente ou faca a instalacao manual.
echo.
echo Voce pode baixar o PHP manualmente em:
echo https://windows.php.net/download/
echo.

:end
pause > nul
del "%PHP_ZIP_FILE%" 2>nul
endlocal
