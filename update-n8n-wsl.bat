@echo off
echo Atualizando o n8n para a versao 1.88.0 com MCP integrado...
wsl -e bash -c "cd %CD:\=/%/ && ./update-n8n.sh"
echo Processo concluido!
pause
