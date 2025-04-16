@echo off
echo ===================================================
echo     Configuracao Temporaria do PHP (Esta Sessao)
echo ===================================================
echo.
echo Este script configura o PHP para a sessao atual do prompt de comando.
echo Nao requer privilegios de administrador.
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

echo.
echo Configurando PATH temporario para incluir PHP...
set PATH=%PATH%;%PHP_PATH%

echo.
echo Verificando versao do PHP...
php -v

echo.
echo ===================================================
echo     PHP configurado para esta sessao do prompt
echo ===================================================
echo.
echo O PHP esta configurado e pronto para uso APENAS nesta janela do prompt de comando.
echo.
echo Para usar o PHP em qualquer lugar, execute o script 'adicionar-php-ao-path-admin.bat'
echo como administrador.
echo.
echo Para continuar usando esta sessao, digite 'exit' para sair deste script
echo e retornar ao prompt de comando com o PHP configurado.
echo.

cmd /k
