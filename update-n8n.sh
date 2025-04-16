#!/bin/bash

# Script para atualizar o container do n8n no Docker via WSL

# Verificar se o WSL está disponível
if ! command -v wsl &> /dev/null; then
    echo "WSL não está disponível. Por favor, instale o WSL para continuar."
    exit 1
fi

echo "Atualizando o container do n8n..."

# Executar comandos no WSL
wsl -e bash -c '
    # Verificar se o Docker está em execução
    if ! docker info &> /dev/null; then
        echo "Docker não está em execução no WSL. Iniciando o Docker..."
        sudo service docker start
    fi

    # Verificar se o container n8n existe
    if docker ps -a | grep -q n8n; then
        echo "Container n8n encontrado. Parando e removendo..."
        docker stop n8n
        docker rm n8n
    fi

    # Puxar a imagem específica do n8n com MCP integrado
    echo "Baixando a imagem do n8n versão 1.88.0 com MCP integrado..."
    docker pull n8nio/n8n:1.88.0

    # Criar e iniciar o novo container
    echo "Criando e iniciando o novo container n8n..."
    docker run -d \
        --name n8n \
        --restart unless-stopped \
        -p 5679:5678 \
        -v ~/.n8n:/home/node/.n8n \
        -e N8N_BASIC_AUTH_ACTIVE=true \
        -e N8N_BASIC_AUTH_USER=admin \
        -e N8N_BASIC_AUTH_PASSWORD=admin \
        -e N8N_JWT_AUTH_ACTIVE=true \
        -e N8N_JWT_AUTH_HEADER=Authorization \
        -e N8N_PUBLIC_API_DISABLED=false \
        -e N8N_PUBLIC_API_SAME_USER_ALLOWED=true \
        n8nio/n8n:1.88.0

    # Verificar se o container está em execução
    if docker ps | grep -q n8n; then
        echo "Container n8n atualizado e em execução!"
        echo "Acesse o n8n em: http://localhost:5679"
        echo "Usuário: admin"
        echo "Senha: admin"
    else
        echo "Falha ao iniciar o container n8n. Verifique os logs do Docker."
    fi
'

echo "Processo de atualização concluído!"
