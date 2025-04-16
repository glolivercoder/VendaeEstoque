/**
 * Script para configurar o banco de dados do Chevereto
 * Este script usa as credenciais do arquivo .env
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function configureCheveretoDatabase() {
  console.log('Iniciando configuração do banco de dados do Chevereto...');
  
  // Obter credenciais do arquivo .env
  const dbHost = process.env.VITE_DB_HOST || 'localhost';
  const dbUser = process.env.VITE_DB_USER || 'gloliverx';
  const dbPassword = process.env.VITE_DB_PASSWORD || 'Fml/N?|ZP*r9';
  const dbName = process.env.VITE_DB_NAME || 'chevereto';
  
  try {
    // Conectar ao MySQL (sem especificar banco de dados)
    console.log('Conectando ao servidor MySQL...');
    const connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword
    });
    
    // Verificar se o banco de dados já existe
    console.log(`Verificando se o banco de dados ${dbName} existe...`);
    const [rows] = await connection.execute(`SHOW DATABASES LIKE '${dbName}'`);
    
    if (rows.length === 0) {
      // Criar o banco de dados
      console.log(`Criando banco de dados ${dbName}...`);
      await connection.execute(`CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`Banco de dados ${dbName} criado com sucesso!`);
    } else {
      console.log(`Banco de dados ${dbName} já existe.`);
    }
    
    // Conceder privilégios ao usuário
    console.log(`Concedendo privilégios ao usuário ${dbUser}...`);
    await connection.execute(`GRANT ALL PRIVILEGES ON ${dbName}.* TO '${dbUser}'@'${dbHost === 'localhost' ? 'localhost' : '%'}'`);
    await connection.execute('FLUSH PRIVILEGES');
    
    console.log('Privilégios concedidos com sucesso!');
    
    // Conectar ao banco de dados criado
    console.log(`Conectando ao banco de dados ${dbName}...`);
    await connection.changeUser({ database: dbName });
    
    // Verificar a conexão
    const [version] = await connection.execute('SELECT VERSION() as version');
    console.log(`Conectado ao MySQL versão: ${version[0].version}`);
    
    // Fechar a conexão
    await connection.end();
    
    console.log('\nConfiguração do banco de dados concluída com sucesso!');
    console.log(`\nCredenciais do banco de dados para o Chevereto:`);
    console.log(`Host: ${dbHost}`);
    console.log(`Nome do banco: ${dbName}`);
    console.log(`Usuário: ${dbUser}`);
    console.log(`Senha: ${dbPassword}`);
    
    console.log('\nAgora você pode prosseguir com a instalação do Chevereto usando estas credenciais.');
    
  } catch (error) {
    console.error('Erro durante a configuração do banco de dados:', error);
  }
}

// Executar a função principal
configureCheveretoDatabase().catch(console.error);
