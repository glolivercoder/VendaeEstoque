import { formatDateToBrazilian as formatDate } from './dateUtils';

// Gerar dados de teste conforme especificado no plano de testes
export const generateTestData = (options = {}) => {
  // Opções padrão
  const {
    numClients = 20,
    numProducts = 50,
    numVendors = 10,
    numSales = 100,
    daysRange = 30
  } = options;

  // Gerar clientes de teste
  const generateClients = (count) => {
    const clientNames = [
      'João Silva', 'Maria Santos', 'Pedro Oliveira', 'Ana Costa', 'Carlos Ferreira',
      'Juliana Lima', 'Roberto Almeida', 'Fernanda Souza', 'Lucas Martins', 'Mariana Pereira',
      'Paulo Rodrigues', 'Camila Gomes', 'Ricardo Barbosa', 'Amanda Ribeiro', 'Felipe Carvalho',
      'Larissa Dias', 'Bruno Cardoso', 'Natália Mendes', 'Gustavo Rocha', 'Daniela Nascimento',
      'Marcelo Campos', 'Patrícia Oliveira', 'André Santos', 'Bianca Alves', 'Rodrigo Soares',
      'Vanessa Costa', 'Eduardo Lima', 'Aline Ferreira', 'Thiago Martins', 'Carla Rodrigues'
    ];

    const clients = [];
    for (let i = 0; i < count; i++) {
      const nameIndex = i % clientNames.length;
      const id = `CLI${String(i + 1).padStart(3, '0')}`;
      const cpfBase = Math.floor(100000000 + Math.random() * 900000000);
      const cpf = `${String(cpfBase).substring(0, 3)}.${String(cpfBase).substring(3, 6)}.${String(cpfBase).substring(6, 9)}-${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`;
      const rgBase = Math.floor(10000000 + Math.random() * 90000000);
      const rg = `${String(rgBase).substring(0, 2)}.${String(rgBase).substring(2, 5)}.${String(rgBase).substring(5, 8)}-${String(Math.floor(Math.random() * 10))}`;
      const phone = `(${Math.floor(Math.random() * 90) + 10}) ${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 9000) + 1000}`;
      const email = `${clientNames[nameIndex].toLowerCase().replace(' ', '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '')}@exemplo.com`;

      clients.push({
        id,
        name: clientNames[nameIndex],
        cpf,
        rg,
        phone,
        email
      });
    }
    return clients;
  };

  // Gerar produtos de teste
  const generateProducts = (count) => {
    const productCategories = ['Eletrônicos', 'Roupas', 'Acessórios', 'Casa', 'Esportes', 'Beleza', 'Alimentos', 'Brinquedos', 'Livros', 'Ferramentas'];
    const productNames = {
      'Eletrônicos': ['Smartphone', 'Notebook', 'Smart TV', 'Tablet', 'Fone de Ouvido', 'Câmera Digital', 'Console de Jogos', 'Smartwatch', 'Caixa de Som Bluetooth', 'Carregador Sem Fio'],
      'Roupas': ['Camiseta', 'Calça Jeans', 'Vestido', 'Casaco', 'Shorts', 'Pijama', 'Meias', 'Boné', 'Jaqueta', 'Saia'],
      'Acessórios': ['Relógio', 'Óculos de Sol', 'Bolsa', 'Carteira', 'Cinto', 'Chapéu', 'Pulseira', 'Colar', 'Anel', 'Mochila'],
      'Casa': ['Panela', 'Jogo de Copos', 'Toalha', 'Lençol', 'Travesseiro', 'Vaso', 'Tapete', 'Cortina', 'Luminária', 'Almofada'],
      'Esportes': ['Bola', 'Raquete', 'Tênis Esportivo', 'Luvas', 'Bicicleta', 'Skate', 'Prancha de Surf', 'Capacete', 'Mochila Esportiva', 'Garrafa Térmica'],
      'Beleza': ['Perfume', 'Shampoo', 'Condicionador', 'Hidratante', 'Protetor Solar', 'Maquiagem', 'Escova de Cabelo', 'Secador', 'Creme Facial', 'Sabonete'],
      'Alimentos': ['Chocolate', 'Biscoito', 'Café', 'Chá', 'Açúcar', 'Arroz', 'Feijão', 'Macarrão', 'Azeite', 'Tempero'],
      'Brinquedos': ['Boneca', 'Carrinho', 'Quebra-Cabeça', 'Jogo de Tabuleiro', 'Bola', 'Pelucia', 'Blocos de Montar', 'Pipa', 'Patins', 'Bicicleta Infantil'],
      'Livros': ['Romance', 'Ficção Científica', 'Biografia', 'Autoajuda', 'Infantil', 'História', 'Poesia', 'Negócios', 'Culinária', 'Religião'],
      'Ferramentas': ['Martelo', 'Chave de Fenda', 'Furadeira', 'Alicate', 'Serra', 'Parafuso', 'Prego', 'Trena', 'Nivel', 'Lixa']
    };

    const products = [];
    for (let i = 0; i < count; i++) {
      const categoryIndex = i % productCategories.length;
      const category = productCategories[categoryIndex];
      const nameIndex = i % productNames[category].length;
      const name = productNames[category][nameIndex];
      const brand = ['Samsung', 'Apple', 'Sony', 'LG', 'Nike', 'Adidas', 'Asus', 'Dell', 'HP', 'Philips'][i % 10];
      const id = `PROD${String(i + 1).padStart(3, '0')}`;
      const price = Math.floor(Math.random() * 990) + 10 + Math.random().toFixed(2);
      const cost = price * 0.6;
      const stock = Math.floor(Math.random() * 100) + 5;
      const image = `https://picsum.photos/id/${(i % 100) + 100}/200/200`;
      const vendorId = Math.floor(Math.random() * numVendors) + 1;

      products.push({
        id,
        description: `${brand} ${name}`,
        price: parseFloat(price),
        cost: parseFloat(cost.toFixed(2)),
        stock,
        image,
        category,
        vendorId,
        barcode: `789${String(Math.floor(Math.random() * 10000000000)).padStart(10, '0')}`
      });
    }
    return products;
  };

  // Gerar fornecedores de teste
  const generateVendors = (count) => {
    const vendorNames = [
      'Distribuidora Tecnológica', 'Importadora Global', 'Atacado Express', 'Fornecedora Nacional',
      'Distribuidora Eletrônicos', 'Importadora Acessórios', 'Atacado Roupas', 'Fornecedora Utilidades',
      'Distribuidora Alimentos', 'Importadora Ferramentas', 'Atacado Esportes', 'Fornecedora Beleza',
      'Distribuidora Brinquedos', 'Importadora Livros', 'Atacado Casa', 'Fornecedora Informática'
    ];

    const vendors = [];
    for (let i = 0; i < count; i++) {
      const nameIndex = i % vendorNames.length;
      const id = `FOR${String(i + 1).padStart(3, '0')}`;
      const cnpjBase = Math.floor(10000000000000 + Math.random() * 90000000000000);
      const cnpj = `${String(cnpjBase).substring(0, 2)}.${String(cnpjBase).substring(2, 5)}.${String(cnpjBase).substring(5, 8)}/${String(cnpjBase).substring(8, 12)}-${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`;
      const phone = `(${Math.floor(Math.random() * 90) + 10}) ${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 9000) + 1000}`;
      const email = `contato@${vendorNames[nameIndex].toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br`;
      const website = `https://www.${vendorNames[nameIndex].toLowerCase().replace(/[^a-z0-9]/g, '')}.com.br`;
      const whatsapp = phone;
      const telegram = `@${vendorNames[nameIndex].toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      const instagram = vendorNames[nameIndex].toLowerCase().replace(/[^a-z0-9]/g, '');

      vendors.push({
        id,
        name: vendorNames[nameIndex],
        cnpj,
        phone,
        email,
        website,
        whatsapp,
        telegram,
        instagram,
        description: `Fornecedor especializado em produtos de qualidade para sua loja.`
      });
    }
    return vendors;
  };

  // Gerar vendas com datas distribuídas nos últimos X dias
  const generateSales = (clients, products, vendors, count, days) => {
    const sales = [];
    const today = new Date();
    const paymentMethods = ['dinheiro', 'cartão', 'pix'];

    for (let i = 0; i < count; i++) {
      // Gerar data aleatória nos últimos X dias
      const saleDate = new Date(today);
      saleDate.setDate(today.getDate() - Math.floor(Math.random() * days));
      const isoDate = saleDate.toISOString().split('T')[0];

      // Selecionar cliente, vendedor e produtos aleatórios
      const client = clients[Math.floor(Math.random() * clients.length)];
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];

      // Selecionar 1 a 3 produtos aleatórios
      const numProducts = Math.floor(Math.random() * 3) + 1;
      const saleProducts = [];

      for (let j = 0; j < numProducts; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 5) + 1;

        saleProducts.push({
          ...product,
          quantity
        });
      }

      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

      const sale = {
        id: `SALE${String(i + 1).padStart(3, '0')}`,
        date: formatDate(isoDate),
        timestamp: saleDate.getTime(),
        client: client.name,
        clientDoc: client.rg,
        clientCpf: client.cpf,
        clientId: client.id,
        vendor: vendor.name,
        vendorId: vendor.id,
        vendorDoc: vendor.cnpj,
        products: saleProducts,
        paymentMethod
      };

      // Calcular total
      sale.total = sale.products.reduce((sum, prod) => sum + (prod.price * prod.quantity), 0);
      sales.push(sale);
    }

    return sales;
  };

  // Gerar todos os dados
  const clients = generateClients(numClients);
  const products = generateProducts(numProducts);
  const vendors = generateVendors(numVendors);
  const sales = generateSales(clients, products, vendors, numSales, daysRange);

  return {
    clients,
    products,
    vendors,
    sales
  };
};