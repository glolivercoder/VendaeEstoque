import { useState, useRef } from 'react';
import { createEnhancedBackup, saveBackupFile, restoreBackup } from '../services/enhancedBackupService';
import { useToast } from './ui/toast';

/**
 * Componente de configuração de backup aprimorado
 * Permite configurar, criar e restaurar backups em diferentes formatos
 */
const EnhancedBackupConfig = ({ onClose }) => {
  // Estado para controlar o formato do backup
  const [backupFormat, setBackupFormat] = useState('js');

  // Estado para controlar o progresso do backup
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOperation, setCurrentOperation] = useState('');

  // Estado para controlar as seções selecionadas para backup
  const [selectedSections, setSelectedSections] = useState({
    produtos: true,
    clientes: true,
    fornecedores: true,
    vendas: true,
    configuracoes: true,
    usuarios: true,
    rastreamento: true,
    fotos: true
  });

  // Referência para o input de arquivo
  const fileInputRef = useRef(null);

  // Toast para notificações
  const { toast } = useToast();

  // Lista de seções disponíveis para backup
  const availableSections = [
    { id: 'produtos', label: 'Produtos', description: 'Dados de produtos, incluindo estoque, preços e informações técnicas' },
    { id: 'clientes', label: 'Clientes', description: 'Dados de clientes, incluindo contatos e endereços' },
    { id: 'fornecedores', label: 'Fornecedores', description: 'Dados de fornecedores, incluindo contatos e catálogos' },
    { id: 'vendas', label: 'Vendas', description: 'Histórico de vendas, incluindo itens vendidos e valores' },
    { id: 'configuracoes', label: 'Configurações', description: 'Configurações do sistema, incluindo APIs e preferências' },
    { id: 'usuarios', label: 'Usuários', description: 'Dados de usuários e permissões' },
    { id: 'rastreamento', label: 'Rastreamento', description: 'Dados de rastreamento de encomendas' },
    { id: 'fotos', label: 'Fotos de Produtos', description: 'Imagens dos produtos cadastrados' }
  ];

  // Função para selecionar/deselecionar todas as seções
  const toggleAllSections = (selected) => {
    const newSelectedSections = {};
    availableSections.forEach(section => {
      newSelectedSections[section.id] = selected;
    });
    setSelectedSections(newSelectedSections);
  };

  // Função para criar um backup
  const handleCreateBackup = async () => {
    try {
      setIsProcessing(true);
      setCurrentOperation('Coletando dados para backup...');

      // Verificar se pelo menos uma seção foi selecionada
      const hasSelectedSections = Object.values(selectedSections).some(selected => selected);
      if (!hasSelectedSections) {
        toast({
          title: 'Erro',
          description: 'Selecione pelo menos uma seção para backup',
          variant: 'destructive'
        });
        setIsProcessing(false);
        return;
      }

      // Criar o backup
      setCurrentOperation('Criando arquivos de backup...');
      const backupContent = await createEnhancedBackup(backupFormat);

      // Salvar o backup
      setCurrentOperation('Salvando arquivo de backup...');
      const fileName = saveBackupFile(backupContent, backupFormat);

      // Notificar o usuário
      toast({
        title: 'Backup Criado',
        description: `Backup salvo como ${fileName}`,
        variant: 'success'
      });
    } catch (error) {
      console.error('Erro ao criar backup:', error);
      toast({
        title: 'Erro',
        description: `Erro ao criar backup: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      setCurrentOperation('');
    }
  };

  // Função para restaurar um backup
  const handleRestoreBackup = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;

      setIsProcessing(true);
      setCurrentOperation('Lendo arquivo de backup...');

      // Restaurar o backup
      await restoreBackup(file);

      // Notificar o usuário
      toast({
        title: 'Backup Restaurado',
        description: 'Os dados foram restaurados com sucesso. A página será recarregada.',
        variant: 'success'
      });

      // Recarregar a página após 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      toast({
        title: 'Erro',
        description: `Erro ao restaurar backup: ${error.message}`,
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
      setCurrentOperation('');

      // Limpar o input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="backup-config-container">
      <h2 className="text-2xl font-bold mb-4">Configurações de Backup</h2>

      {/* Formato do backup */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Formato do Backup</h3>
        <div className="flex space-x-4 flex-wrap">
          <label className="flex items-center mr-4 mb-2">
            <input
              type="radio"
              name="backupFormat"
              value="js"
              checked={backupFormat === 'js'}
              onChange={() => setBackupFormat('js')}
              className="mr-2"
              disabled={isProcessing}
            />
            <span>JavaScript (.js)</span>
          </label>
          <label className="flex items-center mr-4 mb-2">
            <input
              type="radio"
              name="backupFormat"
              value="md"
              checked={backupFormat === 'md'}
              onChange={() => setBackupFormat('md')}
              className="mr-2"
              disabled={isProcessing}
            />
            <span>Markdown (.md)</span>
          </label>
          <label className="flex items-center mb-2">
            <input
              type="radio"
              name="backupFormat"
              value="jsx"
              checked={backupFormat === 'jsx'}
              onChange={() => setBackupFormat('jsx')}
              className="mr-2"
              disabled={isProcessing}
            />
            <span>React JSX (.jsx)</span>
          </label>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {backupFormat === 'js'
            ? 'Formato JavaScript: Mais fácil de importar programaticamente, ideal para desenvolvedores.'
            : backupFormat === 'md'
              ? 'Formato Markdown: Mais legível para humanos, ideal para documentação e análise.'
              : 'Formato JSX: Inclui componentes React para visualização interativa dos dados.'}
        </p>
      </div>

      {/* Seções para backup */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Seções para Backup</h3>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => toggleAllSections(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
              disabled={isProcessing}
            >
              Selecionar Todos
            </button>
            <span className="text-gray-400">|</span>
            <button
              type="button"
              onClick={() => toggleAllSections(false)}
              className="text-sm text-blue-600 hover:text-blue-800"
              disabled={isProcessing}
            >
              Desmarcar Todos
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {availableSections.map(section => (
            <div key={section.id} className="border rounded p-3 hover:bg-gray-50">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSections[section.id]}
                  onChange={() => setSelectedSections({
                    ...selectedSections,
                    [section.id]: !selectedSections[section.id]
                  })}
                  className="mt-1 mr-2"
                  disabled={isProcessing}
                />
                <div>
                  <div className="font-medium">{section.label}</div>
                  <div className="text-sm text-gray-500">{section.description}</div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Ações de backup */}
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCreateBackup}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
            disabled={isProcessing}
          >
            {isProcessing && currentOperation.includes('Criando') ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Criando Backup...
              </>
            ) : (
              'Criar Backup'
            )}
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 flex items-center"
            disabled={isProcessing}
          >
            {isProcessing && currentOperation.includes('Restaurando') ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Restaurando Backup...
              </>
            ) : (
              'Restaurar Backup'
            )}
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRestoreBackup}
            accept=".zip"
            style={{ display: 'none' }}
            disabled={isProcessing}
          />
        </div>

        {isProcessing && (
          <div className="text-sm text-gray-600">
            {currentOperation}
          </div>
        )}
      </div>

      {/* Informações adicionais */}
      <div className="mt-6 p-4 bg-gray-50 rounded border text-sm">
        <h4 className="font-semibold mb-2">Informações sobre Backup</h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Os backups são salvos como arquivos ZIP contendo arquivos separados para cada seção.</li>
          <li>Cada arquivo inclui comentários explicativos sobre os dados.</li>
          <li>Para restaurar um backup, selecione o arquivo ZIP criado anteriormente.</li>
          <li>A restauração substituirá todos os dados atuais pelos dados do backup.</li>
          <li>Recomendamos fazer backups regulares para evitar perda de dados.</li>
        </ul>
      </div>

      {/* Botão de fechar */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          disabled={isProcessing}
        >
          Fechar
        </button>
      </div>
    </div>
  );
};

export default EnhancedBackupConfig;
