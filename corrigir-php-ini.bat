@echo off
echo ===================================================
echo          Correcao do arquivo php.ini
echo ===================================================
echo.

set PHP_PATH=C:\php

if not exist "%PHP_PATH%\php.exe" (
    echo PHP nao encontrado em %PHP_PATH%
    echo Por favor, informe o caminho completo para a pasta onde o PHP esta instalado:
    set /p PHP_PATH=
    
    if not exist "%PHP_PATH%\php.exe" (
        echo [ERRO] PHP nao encontrado em %PHP_PATH%
        goto fim
    )
)

echo Verificando arquivos php.ini...

if not exist "%PHP_PATH%\php.ini" (
    if exist "%PHP_PATH%\php.ini-development" (
        copy "%PHP_PATH%\php.ini-development" "%PHP_PATH%\php.ini"
        echo Arquivo php.ini criado a partir do php.ini-development.
    ) else (
        echo [ERRO] Nao foi possivel encontrar um arquivo php.ini de exemplo.
        goto fim
    )
)

echo.
echo Corrigindo configuracoes de extensoes no php.ini...

REM Verificar se a pasta ext existe
if not exist "%PHP_PATH%\ext" (
    echo [ERRO] Pasta de extensoes nao encontrada em %PHP_PATH%\ext
    echo Sua instalacao do PHP pode estar incompleta.
    goto fim
)

REM Listar arquivos DLL na pasta ext
echo.
echo Extensoes disponiveis:
dir /b "%PHP_PATH%\ext\*.dll"
echo.

REM Verificar o conteúdo atual do php.ini
findstr /C:"extension_dir" "%PHP_PATH%\php.ini" > nul
if %errorlevel% neq 0 (
    echo extension_dir = "ext" >> "%PHP_PATH%\php.ini"
    echo Adicionado extension_dir = "ext" ao php.ini
)

REM Atualizar o php.ini para usar as extensões disponíveis
echo Atualizando php.ini para usar as extensoes disponiveis...

REM Verificar e habilitar extensões comuns
for %%E in (curl fileinfo gd mbstring openssl pdo_sqlite sqlite3) do (
    if exist "%PHP_PATH%\ext\php_%%E.dll" (
        findstr /C:"extension=%%E" "%PHP_PATH%\php.ini" > nul
        if %errorlevel% neq 0 (
            echo extension=%%E >> "%PHP_PATH%\php.ini"
            echo Habilitada extensao: %%E
        ) else (
            type "%PHP_PATH%\php.ini" | findstr /C:";extension=%%E" > nul
            if %errorlevel% equ 0 (
                powershell -Command "(Get-Content '%PHP_PATH%\php.ini') -replace ';extension=%%E', 'extension=%%E' | Set-Content '%PHP_PATH%\php.ini'"
                echo Descomentada extensao: %%E
            ) else (
                echo Extensao ja habilitada: %%E
            )
        )
    ) else (
        echo Extensao nao encontrada: %%E
    )
)

echo.
echo Verificando configuracao...
"%PHP_PATH%\php.exe" -m

echo.
echo ===================================================
echo      Configuracao do php.ini concluida
echo ===================================================
echo.
echo Reinicie qualquer aplicativo PHP em execucao para que as alteracoes tenham efeito.
echo.

:fim
pause
