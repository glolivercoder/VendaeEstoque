import { ensureDB } from '../services/database';

/**
 * Initialize the database and ensure it's ready for use
 * @returns {Promise<boolean>} - True if database was initialized successfully
 */
export const initializeDatabase = async () => {
  try {
    console.log('Inicializando banco de dados...');
    await ensureDB();
    console.log('Banco de dados inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return false;
  }
};
