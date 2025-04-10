// Teste do módulo crypto-js
const CryptoJS = require('crypto-js');

// Função de teste
function testCryptoJS() {
  const text = "Teste de criptografia";
  const key = "chave-secreta";
  
  // Criptografar
  const encrypted = CryptoJS.AES.encrypt(text, key).toString();
  console.log("Texto criptografado:", encrypted);
  
  // Descriptografar
  const decrypted = CryptoJS.AES.decrypt(encrypted, key).toString(CryptoJS.enc.Utf8);
  console.log("Texto descriptografado:", decrypted);
  
  return decrypted === text;
}

// Executar teste
const result = testCryptoJS();
console.log("Teste bem-sucedido:", result);

module.exports = testCryptoJS;
