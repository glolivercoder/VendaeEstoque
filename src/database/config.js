// Configuração do banco de dados
const config = {
  development: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  },
  production: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
  }
};

module.exports = config;
