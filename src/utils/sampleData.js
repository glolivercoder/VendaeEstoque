// Utilitário para gerar dados de exemplo para testes
import { addProduct, addClient } from '../services/database';

// Função para gerar produtos de exemplo
export const adicionarProdutosExemplo = async () => {
  try {
    console.log('Adicionando produtos de exemplo...');
    
    const produtos = [
      {
        description: 'Camisa Polo',
        price: 89.90,
        cost: 45.00,
        stock: 20,
        barcode: '7891234567890',
        vendorId: 1
      },
      {
        description: 'Calça Jeans',
        price: 129.90,
        cost: 65.00,
        stock: 15,
        barcode: '7891234567891',
        vendorId: 1
      },
      {
        description: 'Tênis Casual',
        price: 199.90,
        cost: 100.00,
        stock: 10,
        barcode: '7891234567892',
        vendorId: 1
      },
      {
        description: 'Meia Esportiva',
        price: 19.90,
        cost: 8.00,
        stock: 50,
        barcode: '7891234567893',
        vendorId: 1
      },
      {
        description: 'Boné Ajustável',
        price: 49.90,
        cost: 20.00,
        stock: 25,
        barcode: '7891234567894',
        vendorId: 1
      }
    ];
    
    // Adicionar cada produto ao banco de dados
    let count = 0;
    for (const produto of produtos) {
      await addProduct(produto);
      count++;
    }
    
    console.log(`${count} produtos de exemplo adicionados com sucesso!`);
    return count;
  } catch (error) {
    console.error('Erro ao adicionar produtos de exemplo:', error);
    throw error;
  }
};

// Função para gerar clientes de exemplo
export const adicionarClientesExemplo = async () => {
  try {
    console.log('Adicionando clientes de exemplo...');
    
    const clientes = [
      {
        name: 'João Silva',
        document: '123.456.789-00',
        phone: '(11) 98765-4321',
        email: 'joao.silva@exemplo.com',
        address: 'Rua das Flores, 123'
      },
      {
        name: 'Maria Oliveira',
        document: '987.654.321-00',
        phone: '(11) 91234-5678',
        email: 'maria.oliveira@exemplo.com',
        address: 'Av. Paulista, 1000'
      },
      {
        name: 'Pedro Santos',
        document: '456.789.123-00',
        phone: '(11) 97890-1234',
        email: 'pedro.santos@exemplo.com',
        address: 'Rua Augusta, 500'
      },
      {
        name: 'Ana Costa',
        document: '789.123.456-00',
        phone: '(11) 95678-9012',
        email: 'ana.costa@exemplo.com',
        address: 'Av. Rebouças, 750'
      },
      {
        name: 'Carlos Ferreira',
        document: '321.654.987-00',
        phone: '(11) 93456-7890',
        email: 'carlos.ferreira@exemplo.com',
        address: 'Rua Oscar Freire, 300'
      }
    ];
    
    // Adicionar cada cliente ao banco de dados
    let count = 0;
    for (const cliente of clientes) {
      await addClient(cliente);
      count++;
    }
    
    console.log(`${count} clientes de exemplo adicionados com sucesso!`);
    return count;
  } catch (error) {
    console.error('Erro ao adicionar clientes de exemplo:', error);
    throw error;
  }
};
