// Código para ser copiado e colado diretamente no console do navegador

// Dados a serem preenchidos
const formData = {
  url: 'https://achadinhoshopp.com.br/loja',
  apiKey: 'OxCq4oUPrd5hqxPEq1zdjEd4',
  siteId: 'achadinhoshopp'
};

// Selecionar os campos de entrada
const urlField = document.querySelector('input[placeholder="URL do site"]');
const apiKeyField = document.querySelector('input[placeholder="Chave de API"]');
const siteIdField = document.querySelector('input[placeholder="ID do site"]');

// Preencher os campos se existirem
if (urlField) {
  urlField.value = formData.url;
  // Disparar evento de input para atualizar o estado
  urlField.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('Campo URL preenchido com:', formData.url);
} else {
  console.error('Campo URL não encontrado');
}

if (apiKeyField) {
  apiKeyField.value = formData.apiKey;
  apiKeyField.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('Campo Chave de API preenchido com:', formData.apiKey);
} else {
  console.error('Campo Chave de API não encontrado');
}

if (siteIdField) {
  siteIdField.value = formData.siteId;
  siteIdField.dispatchEvent(new Event('input', { bubbles: true }));
  console.log('Campo ID do site preenchido com:', formData.siteId);
} else {
  console.error('Campo ID do site não encontrado');
}

console.log('Preenchimento de formulário concluído!');
