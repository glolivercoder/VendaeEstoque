import { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Clients from './pages/Clients';
import Vendors from './pages/Vendors';
import ConfigPopup from './components/modals/ConfigPopup';
import { useLocalStorage } from './hooks/useLocalStorage';
import { AppContextProvider } from './context/AppContext';

// Importar estilos
import './styles/global.css';

function App() {
  // Estado para controlar qual página está ativa
  const [activePage, setActivePage] = useState('inventory');

  // Estado para mostrar/esconder a sidebar em dispositivos móveis
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estado para mostrar/esconder o modal de configurações
  const [showConfigPopup, setShowConfigPopup] = useState(false);

  // Configurações persistentes
  const [backupLocation, setBackupLocation] = useLocalStorage('backupLocation', '');
  const [autoBackup, setAutoBackup] = useLocalStorage('autoBackup', false);

  // Estados de carregamento
  const [isLoading, setIsLoading] = useState(true);

  // Efeito para simular carregamento inicial
  useEffect(() => {
    // Simular tempo de carregamento
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Renderizar página baseada no estado ativo
  const renderActivePage = () => {
    switch (activePage) {
      case 'inventory':
        return <Inventory />;
      case 'sales':
        return <Sales />;
      case 'vendors':
        console.log('Renderizando a página de Fornecedores');
        return <Vendors />;
      case 'clients':
        return <Clients />;
      case 'settings':
        // Ao invés de renderizar a página de configurações, mostrar o popup
        setShowConfigPopup(true);
        return <Inventory />; // Mostrar estoque como padrão
      default:
        return <Inventory />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-light-background dark:bg-dark-background">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 mx-auto text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-light-text-primary dark:text-dark-text-primary">
            Carregando VendaEstoque...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AppContextProvider>
        <div className="flex h-screen bg-light-background dark:bg-dark-background">
          {/* Sidebar */}
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            isMobileOpen={sidebarOpen}
            closeMobileSidebar={() => setSidebarOpen(false)}
          />

          {/* Conteúdo principal */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header
              openSidebar={() => setSidebarOpen(true)}
              openSettings={() => setShowConfigPopup(true)}
              title={
                activePage === 'inventory' ? 'Estoque' :
                activePage === 'sales' ? 'Vendas' :
                activePage === 'clients' ? 'Clientes' :
                activePage === 'vendors' ? 'Fornecedores' :
                'VendaEstoque'
              }
            />

            <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-light-background dark:bg-dark-background">
              {renderActivePage()}
            </main>
          </div>

          {/* Modal de configurações */}
          <ConfigPopup
            showConfigPopup={showConfigPopup}
            setShowConfigPopup={setShowConfigPopup}
            backupLocation={backupLocation}
            setBackupLocation={setBackupLocation}
            autoBackup={autoBackup}
            setAutoBackup={setAutoBackup}
            reloadData={() => window.location.reload()}
          />
        </div>
      </AppContextProvider>
    </ThemeProvider>
  );
}

export default App;
