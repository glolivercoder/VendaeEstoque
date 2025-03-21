import { initDB } from './database';

// Função para garantir que o banco de dados está inicializado
const ensureDatabase = async () => {
  try {
    console.log('Inicializando banco de dados...');
    const db = await initDB();
    console.log('Banco de dados inicializado com sucesso!');
    return db;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error;
  }
};

// Exporta a função de inicialização
export { ensureDatabase };
