#!/bin/bash

# Script para empacotar o tema WooCommerce VendaEstoque em um arquivo ZIP

# Nome do tema
THEME_NAME="vendaestoque-theme"

# Diretório atual
CURRENT_DIR=$(pwd)

# Criar diretório temporário
TEMP_DIR="${CURRENT_DIR}/temp-${THEME_NAME}"
mkdir -p "${TEMP_DIR}"

# Criar estrutura de diretórios
mkdir -p "${TEMP_DIR}/inc"
mkdir -p "${TEMP_DIR}/js"
mkdir -p "${TEMP_DIR}/template-parts"

# Copiar arquivos principais
cp style.css "${TEMP_DIR}/"
cp functions.php "${TEMP_DIR}/"
cp index.php "${TEMP_DIR}/"
cp header.php "${TEMP_DIR}/"
cp footer.php "${TEMP_DIR}/"
cp front-page.php "${TEMP_DIR}/"
cp woocommerce.php "${TEMP_DIR}/"
cp sidebar.php "${TEMP_DIR}/"

# Copiar arquivos de diretórios
cp inc/template-tags.php "${TEMP_DIR}/inc/"
cp inc/template-functions.php "${TEMP_DIR}/inc/"
cp inc/customizer.php "${TEMP_DIR}/inc/"

cp js/main.js "${TEMP_DIR}/js/"
cp js/customizer.js "${TEMP_DIR}/js/"

cp template-parts/content.php "${TEMP_DIR}/template-parts/"
cp template-parts/content-none.php "${TEMP_DIR}/template-parts/"

# Criar arquivo ZIP
cd "${CURRENT_DIR}"
zip -r "${THEME_NAME}.zip" "temp-${THEME_NAME}"

# Limpar diretório temporário
rm -rf "${TEMP_DIR}"

echo "Tema empacotado com sucesso: ${THEME_NAME}.zip"
