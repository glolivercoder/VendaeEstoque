@echo off
setlocal enabledelayedexpansion

echo ===================================================
echo           Download Manual do PHP
echo ===================================================
echo.
echo Este script vai abrir o navegador para baixar o PHP 8.2.28
echo e depois ajudar a instala-lo manualmente.
echo.
echo Pressione qualquer tecla para continuar ou CTRL+C para cancelar...
pause > nul

REM Definir diretorio de instalacao
set "PHP_DIR=%USERPROFILE%\php"
set "PHP_VERSION=8.2.28"

echo.
echo [1/4] Abrindo pagina de download do PHP...
echo.
echo Por favor, baixe o arquivo "php-8.2.28-Win32-vs16-x64.zip" (Thread Safe)
echo ou "php-8.2.28-nts-Win32-vs16-x64.zip" (Non-Thread Safe)
echo.
echo Apos o download, pressione qualquer tecla para continuar...

start https://windows.php.net/download/
pause > nul

echo.
echo [2/4] Criando diretorio de instalacao...
if not exist "%PHP_DIR%" mkdir "%PHP_DIR%"
echo Diretorio criado: %PHP_DIR%

echo.
echo [3/4] Extraindo arquivos...
echo.
echo Por favor, extraia o conteudo do arquivo ZIP baixado para:
echo %PHP_DIR%
echo.
echo Apos extrair os arquivos, pressione qualquer tecla para continuar...
pause > nul

echo.
echo [4/4] Configurando PHP...

REM Verificar se o PHP foi extraido corretamente
if not exist "%PHP_DIR%\php.exe" (
    echo [ERRO] PHP nao encontrado em %PHP_DIR%\php.exe
    echo Por favor, certifique-se de extrair os arquivos corretamente.
    goto :error
)

REM Criar arquivo php.ini a partir do php.ini-development
if exist "%PHP_DIR%\php.ini-development" (
    copy "%PHP_DIR%\php.ini-development" "%PHP_DIR%\php.ini"
    echo Arquivo php.ini criado.
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
"%PHP_DIR%\php.exe" -v

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

:end
pause > nul
endlocal
