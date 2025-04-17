# Script PowerShell para empacotar o tema WooCommerce VendaEstoque em um arquivo ZIP

# Nome do tema
$THEME_NAME = "vendaestoque-theme"

# Diretório atual
$CURRENT_DIR = Get-Location

# Criar diretório temporário
$TEMP_DIR = Join-Path -Path $CURRENT_DIR -ChildPath "temp-$THEME_NAME"
New-Item -ItemType Directory -Path $TEMP_DIR -Force | Out-Null

# Criar estrutura de diretórios
New-Item -ItemType Directory -Path (Join-Path -Path $TEMP_DIR -ChildPath "inc") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path -Path $TEMP_DIR -ChildPath "js") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path -Path $TEMP_DIR -ChildPath "template-parts") -Force | Out-Null

# Copiar arquivos principais
Copy-Item -Path "style.css" -Destination $TEMP_DIR
Copy-Item -Path "functions.php" -Destination $TEMP_DIR
Copy-Item -Path "index.php" -Destination $TEMP_DIR
Copy-Item -Path "header.php" -Destination $TEMP_DIR
Copy-Item -Path "footer.php" -Destination $TEMP_DIR
Copy-Item -Path "front-page.php" -Destination $TEMP_DIR
Copy-Item -Path "woocommerce.php" -Destination $TEMP_DIR
Copy-Item -Path "sidebar.php" -Destination $TEMP_DIR

# Copiar arquivos de diretórios
Copy-Item -Path "inc\template-tags.php" -Destination (Join-Path -Path $TEMP_DIR -ChildPath "inc")
Copy-Item -Path "inc\template-functions.php" -Destination (Join-Path -Path $TEMP_DIR -ChildPath "inc")
Copy-Item -Path "inc\customizer.php" -Destination (Join-Path -Path $TEMP_DIR -ChildPath "inc")

Copy-Item -Path "js\main.js" -Destination (Join-Path -Path $TEMP_DIR -ChildPath "js")
Copy-Item -Path "js\customizer.js" -Destination (Join-Path -Path $TEMP_DIR -ChildPath "js")

Copy-Item -Path "template-parts\content.php" -Destination (Join-Path -Path $TEMP_DIR -ChildPath "template-parts")
Copy-Item -Path "template-parts\content-none.php" -Destination (Join-Path -Path $TEMP_DIR -ChildPath "template-parts")

# Criar arquivo ZIP
$ZIP_PATH = Join-Path -Path $CURRENT_DIR -ChildPath "$THEME_NAME.zip"
if (Test-Path $ZIP_PATH) {
    Remove-Item $ZIP_PATH -Force
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($TEMP_DIR, $ZIP_PATH)

# Limpar diretório temporário
Remove-Item -Path $TEMP_DIR -Recurse -Force

Write-Host "Tema empacotado com sucesso: $THEME_NAME.zip"
