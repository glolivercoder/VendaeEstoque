# Script para corrigir o php.ini
Write-Host "====================================================="
Write-Host "          Correcao do arquivo php.ini"
Write-Host "====================================================="
Write-Host ""

$phpPath = "C:\php"
$phpIni = "$phpPath\php.ini"

# Verificar se o php.ini existe
if (-not (Test-Path $phpIni)) {
    if (Test-Path "$phpPath\php.ini-development") {
        Copy-Item "$phpPath\php.ini-development" $phpIni
        Write-Host "Arquivo php.ini criado a partir do php.ini-development."
    } else {
        Write-Host "[ERRO] Nao foi possivel encontrar um arquivo php.ini de exemplo."
        exit
    }
}

Write-Host "Corrigindo configuracoes de extensoes no php.ini..."

# Verificar se a pasta ext existe
if (-not (Test-Path "$phpPath\ext")) {
    Write-Host "[ERRO] Pasta de extensoes nao encontrada em $phpPath\ext"
    Write-Host "Sua instalacao do PHP pode estar incompleta."
    exit
}

# Listar arquivos DLL na pasta ext
Write-Host ""
Write-Host "Extensoes disponiveis:"
Get-ChildItem "$phpPath\ext\*.dll" | ForEach-Object { $_.Name }
Write-Host ""

# Ler o conteúdo atual do php.ini
$phpIniContent = Get-Content $phpIni -Raw

# Descomentando extension_dir
$phpIniContent = $phpIniContent -replace ';extension_dir = "ext"', 'extension_dir = "ext"'

# Extensões comuns para habilitar
$extensions = @(
    "curl",
    "fileinfo",
    "gd",
    "mbstring",
    "openssl",
    "pdo_sqlite",
    "sqlite3"
)

# Habilitar extensões
foreach ($ext in $extensions) {
    $dllPath = "$phpPath\ext\php_$ext.dll"
    if (Test-Path $dllPath) {
        # Verificar se a extensão já está habilitada
        if ($phpIniContent -match "extension=$ext") {
            Write-Host "Extensao ja habilitada: $ext"
        } else {
            # Verificar se a extensão está comentada
            if ($phpIniContent -match ";extension=$ext") {
                $phpIniContent = $phpIniContent -replace ";extension=$ext", "extension=$ext"
                Write-Host "Descomentada extensao: $ext"
            } else {
                # Adicionar a extensão ao final do arquivo
                $phpIniContent += "`nextension=$ext"
                Write-Host "Habilitada extensao: $ext"
            }
        }
    } else {
        Write-Host "Extensao nao encontrada: $ext"
    }
}

# Salvar as alterações no php.ini
$phpIniContent | Set-Content $phpIni

Write-Host ""
Write-Host "Verificando configuracao..."
& "$phpPath\php.exe" -m

Write-Host ""
Write-Host "====================================================="
Write-Host "      Configuracao do php.ini concluida"
Write-Host "====================================================="
Write-Host ""
Write-Host "Reinicie qualquer aplicativo PHP em execucao para que as alteracoes tenham efeito."
Write-Host ""

# Adicionar PHP ao PATH do sistema
Write-Host "Deseja adicionar o PHP ao PATH do sistema? (S/N)"
$resposta = Read-Host

if ($resposta -eq "S" -or $resposta -eq "s") {
    try {
        # Obter o PATH atual
        $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
        
        # Verificar se o PHP já está no PATH
        if ($currentPath -notlike "*$phpPath*") {
            # Adicionar PHP ao PATH
            [Environment]::SetEnvironmentVariable("Path", "$currentPath;$phpPath", "Machine")
            Write-Host "PHP adicionado ao PATH do sistema com sucesso!"
        } else {
            Write-Host "PHP ja esta no PATH do sistema."
        }
    } catch {
        Write-Host "[ERRO] Falha ao adicionar PHP ao PATH do sistema: $_"
        Write-Host "Certifique-se de executar este script como Administrador."
        
        Write-Host ""
        Write-Host "Alternativa: Adicionar manualmente o PHP ao PATH"
        Write-Host "1. Abra o Painel de Controle"
        Write-Host "2. Sistema e Seguranca -> Sistema"
        Write-Host "3. Configuracoes avancadas do sistema"
        Write-Host "4. Variaveis de Ambiente"
        Write-Host "5. Na secao 'Variaveis do sistema', selecione 'Path' e clique em 'Editar'"
        Write-Host "6. Clique em 'Novo' e adicione: $phpPath"
        Write-Host "7. Clique em 'OK' em todas as janelas"
    }
}

Write-Host ""
Write-Host "Para testar, abra um novo PowerShell ou prompt de comando e digite:"
Write-Host "  php -v"
Write-Host ""

Read-Host "Pressione Enter para sair"
