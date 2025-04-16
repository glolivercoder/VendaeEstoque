@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo    Configuracao das Variaveis de Ambiente Composer
echo ===================================================
echo.

REM Verificar se o PHP está instalado
where php >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] PHP nao encontrado no PATH do sistema.
    echo Execute primeiro o script 'configurar-php-path.bat'.
    goto :fim
)

echo PHP encontrado. Verificando versao:
php -v
echo.

REM Verificar se o Composer está instalado
set "COMPOSER_ENCONTRADO="
set "COMPOSER_PATH="

echo Procurando instalacao do Composer...

REM Locais comuns onde o Composer pode estar instalado
set "LOCAIS_COMUNS=%USERPROFILE%\composer;C:\composer;C:\ProgramData\ComposerSetup\bin;%APPDATA%\Composer\vendor\bin"

for %%L in (%LOCAIS_COMUNS%) do (
    if exist "%%L\composer.bat" (
        set "COMPOSER_ENCONTRADO=1"
        set "COMPOSER_PATH=%%L"
        echo Composer encontrado em: %%L
        goto :composer_encontrado
    )
)

REM Verificar se o composer.phar está em algum lugar
for %%L in (%LOCAIS_COMUNS%) do (
    if exist "%%L\composer.phar" (
        set "COMPOSER_ENCONTRADO=1"
        set "COMPOSER_PATH=%%L"
        echo Composer (PHAR) encontrado em: %%L
        goto :composer_encontrado
    )
)

echo Composer nao encontrado nos locais comuns.
echo.
echo Deseja instalar o Composer agora? (S/N)
set /p "INSTALAR_COMPOSER="

if /i "%INSTALAR_COMPOSER%"=="S" (
    echo.
    echo Instalando o Composer...
    
    REM Criar diretório para o Composer
    set "COMPOSER_PATH=%USERPROFILE%\composer"
    if not exist "%COMPOSER_PATH%" mkdir "%COMPOSER_PATH%"
    
    REM Baixar o instalador do Composer
    echo Baixando o instalador do Composer...
    powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://getcomposer.org/installer' -OutFile '%TEMP%\composer-setup.php'}"
    
    if not exist "%TEMP%\composer-setup.php" (
        echo [ERRO] Falha ao baixar o instalador do Composer.
        goto :fim
    )
    
    REM Instalar o Composer
    echo Instalando o Composer em %COMPOSER_PATH%...
    php "%TEMP%\composer-setup.php" --install-dir="%COMPOSER_PATH%" --filename=composer
    
    if not exist "%COMPOSER_PATH%\composer" (
        echo [ERRO] Falha ao instalar o Composer.
        goto :fim
    )
    
    echo Composer instalado com sucesso.
) else (
    echo Instalacao do Composer cancelada.
    goto :fim
)

:composer_encontrado
echo.
echo Verificando versao do Composer...

if exist "!COMPOSER_PATH!\composer.bat" (
    "!COMPOSER_PATH!\composer.bat" --version
) else if exist "!COMPOSER_PATH!\composer" (
    php "!COMPOSER_PATH!\composer" --version
) else if exist "!COMPOSER_PATH!\composer.phar" (
    php "!COMPOSER_PATH!\composer.phar" --version
) else (
    echo [ERRO] Nao foi possivel encontrar o executavel do Composer.
    goto :fim
)

if %errorlevel% neq 0 (
    echo [ERRO] Nao foi possivel executar o Composer.
    goto :fim
)

echo.
echo Adicionando Composer ao PATH do sistema...

REM Verificar se o Composer já está no PATH
set "PATH_ATUAL=%PATH%"
echo %PATH_ATUAL% | findstr /C:"!COMPOSER_PATH!" > nul
if %errorlevel% equ 0 (
    echo Composer ja esta no PATH do sistema.
) else (
    REM Adicionar Composer ao PATH do usuário
    setx PATH "%PATH%;!COMPOSER_PATH!" /M
    echo Composer adicionado ao PATH do sistema.
    echo Voce precisara reiniciar o prompt de comando para que as alteracoes tenham efeito.
)

echo.
echo ===================================================
echo    Configuracao do Composer concluida com sucesso
echo ===================================================
echo.
echo O Composer esta configurado e pronto para uso.
echo.
echo Caminho do Composer: !COMPOSER_PATH!
echo.
echo Para testar, abra um novo prompt de comando e digite:
echo   composer --version
echo.

:fim
pause
endlocal
