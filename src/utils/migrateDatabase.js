import { initializeDatabase, migrateFromIndexedDB } from '../services/databaseService';

// Função para migrar dados do IndexedDB para o banco de dados ORM
export const migrateDatabase = async () => {
  try {
    console.log('Iniciando migração de dados...');
    
    // Inicializar banco de dados
    const initialized = await initializeDatabase();
    if (!initialized) {
      throw new Error('Falha ao inicializar o banco de dados');
    }
    
    // Migrar dados
    const migrated = await migrateFromIndexedDB();
    if (!migrated) {
      throw new Error('Falha ao migrar dados');
    }
    
    console.log('Migração de dados concluída com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro durante a migração de dados:', error);
    return false;
  }
};

export default migrateDatabase;
