# VERSAOCLEAN - Roadmap para Reescrita do LinkVendas Fast

Este documento apresenta um roadmap detalhado para reescrever o aplicativo LinkVendas Fast (anteriormente Controle de Estoque) com uma estrutura mais limpa e organizada, mantendo todas as funcionalidades atuais e integrando o carrinho de compras diretamente no sistema.

## Visão Geral

O objetivo é criar uma versão mais limpa e bem estruturada do aplicativo, resolvendo problemas de organização do código, melhorando a manutenibilidade e adicionando um sistema de monitoramento para detectar e corrigir problemas de lógica e estoque.

## Tecnologias e Bibliotecas

- **Framework Frontend**: React 18+
- **Gerenciador de Pacotes**: npm/yarn
- **Estilização**: TailwindCSS
- **Roteamento**: React Router v6
- **Gerenciamento de Estado**: Context API + Hooks
- **Banco de Dados**: IndexedDB (via idb)
- **Integração WordPress**: WooCommerce REST API
- **Processamento de Imagens**: Google Gemini API
- **Gráficos**: Chart.js
- **Exportação de Dados**: jsPDF, html2canvas
- **Requisições HTTP**: Axios
- **Validação de Formulários**: Zod
- **Componentes de UI**: Shadcn/UI
- **Monitoramento**: Sistema personalizado

## Estrutura de Diretórios

```
src/
├── assets/              # Imagens, ícones e outros recursos estáticos
├── components/          # Componentes reutilizáveis
│   ├── common/          # Componentes básicos (botões, inputs, etc.)
│   ├── layout/          # Componentes de layout (header, sidebar, etc.)
│   ├── inventory/       # Componentes relacionados ao estoque
│   ├── sales/           # Componentes relacionados às vendas
│   ├── clients/         # Componentes relacionados aos clientes
│   ├── vendors/         # Componentes relacionados aos fornecedores
│   ├── shipping/        # Componentes relacionados ao frete
│   ├── cart/            # Componentes do carrinho de compras
│   ├── reports/         # Componentes de relatórios
│   ├── settings/        # Componentes de configurações
│   ├── auth/            # Componentes de autenticação
│   ├── wordpress/       # Componentes de integração com WordPress
│   └── ui/              # Componentes de UI personalizados
├── context/             # Contextos React
├── hooks/               # Hooks personalizados
├── lib/                 # Bibliotecas e utilitários
│   ├── api/             # Funções de API
│   ├── carriers/        # Integrações com transportadoras
│   └── utils/           # Funções utilitárias
├── pages/               # Páginas da aplicação
├── services/            # Serviços (banco de dados, APIs externas, etc.)
│   ├── database/        # Serviços de banco de dados
│   ├── wordpress/       # Serviços de integração com WordPress
│   ├── gemini/          # Serviços de integração com Google Gemini
│   ├── shipping/        # Serviços de cálculo de frete
│   └── monitoring/      # Serviços de monitoramento
├── styles/              # Estilos globais
├── types/               # Definições de tipos (TypeScript)
└── monitor/             # Sistema de monitoramento
```

## Roadmap de Implementação

### Fase 1: Configuração Inicial e Estrutura Base

1. **Configuração do Projeto**
   - Inicializar projeto React com Vite
   - Configurar TailwindCSS
   - Configurar ESLint e Prettier
   - Configurar estrutura de diretórios

2. **Implementação da Estrutura Base**
   - Criar componentes de layout (Header, Sidebar)
   - Configurar React Router
   - Implementar tema claro/escuro
   - Configurar Context API para gerenciamento de estado

3. **Configuração do Banco de Dados**
   - Implementar serviço de banco de dados com IndexedDB
   - Criar modelos de dados para produtos, clientes, fornecedores e vendas
   - Implementar funções CRUD para cada modelo

### Fase 2: Autenticação e Gerenciamento de Usuários

1. **Sistema de Autenticação**
   - Implementar Context de autenticação
   - Criar componentes de login/logout
   - Implementar controle de acesso baseado em funções (RBAC)

2. **Gerenciamento de Usuários**
   - Criar página de gerenciamento de usuários
   - Implementar funções para adicionar, editar e remover usuários
   - Configurar permissões por tipo de usuário (Administrador, Vendedor)

### Fase 3: Módulo de Estoque

1. **Listagem de Produtos**
   - Implementar página de listagem de produtos
   - Adicionar filtros e pesquisa
   - Implementar paginação

2. **Gerenciamento de Produtos**
   - Criar formulário de adição/edição de produtos
   - Implementar upload de imagens
   - Adicionar suporte para múltiplas imagens e vídeos
   - Implementar campos para GTIN/NCM/SKU

3. **Magic Capture**
   - Integrar Google Gemini API
   - Implementar captura de imagem via câmera
   - Criar lógica para extração de dados de produtos a partir de imagens

### Fase 4: Módulo de Vendas e Carrinho

1. **Página de Vendas**
   - Implementar página de PDV
   - Criar componente de busca de produtos
   - Implementar seleção de cliente

2. **Carrinho de Compras**
   - Implementar componente de carrinho
   - Adicionar funcionalidade para adicionar/remover itens
   - Implementar cálculo de total
   - Adicionar botões de limpar e finalizar

3. **Finalização de Venda**
   - Criar modal de confirmação de venda
   - Implementar seleção de método de pagamento
   - Adicionar geração de recibo
   - Implementar atualização automática de estoque

4. **Histórico de Vendas**
   - Implementar página de histórico de vendas
   - Adicionar filtros por data, cliente e método de pagamento
   - Criar visualização detalhada de venda

### Fase 5: Módulo de Clientes e Fornecedores

1. **Gerenciamento de Clientes**
   - Implementar página de listagem de clientes
   - Criar formulário de adição/edição de clientes
   - Adicionar Magic Wand para extração de dados de documentos

2. **Gerenciamento de Fornecedores**
   - Implementar página de listagem de fornecedores
   - Criar formulário de adição/edição de fornecedores
   - Adicionar visualização de produtos por fornecedor
   - Implementar importação de catálogos

### Fase 6: Módulo de Frete e Rastreamento

1. **Calculadora de Frete**
   - Implementar interface da calculadora
   - Integrar APIs de transportadoras (Correios, Jadlog)
   - Criar visualização de resultados

2. **Rastreamento de Encomendas**
   - Implementar página de rastreamento
   - Criar busca por código de rastreamento, cliente ou documento
   - Integrar APIs de rastreamento

3. **Integração com Mapas**
   - Implementar seleção entre Google Maps e OpenStreetMap
   - Criar componente de visualização de agências
   - Adicionar cálculo de rotas

### Fase 7: Integração com WordPress/WooCommerce

1. **Configuração da Integração**
   - Implementar formulário de configuração
   - Criar teste de conexão
   - Armazenar credenciais de forma segura

2. **Sincronização de Produtos**
   - Implementar sincronização bidirecional de produtos
   - Adicionar suporte para imagens e categorias
   - Criar log de sincronização

3. **Sincronização de Estoque**
   - Implementar atualização automática de estoque
   - Criar webhook para receber atualizações do WooCommerce
   - Adicionar opção de sincronização manual

### Fase 8: Relatórios e Dashboard

1. **Dashboard**
   - Implementar visão geral de vendas, estoque e clientes
   - Criar gráficos de desempenho
   - Adicionar indicadores de alerta de estoque

2. **Relatórios**
   - Implementar relatórios de vendas
   - Criar relatórios de estoque
   - Adicionar exportação para PDF

### Fase 9: Configurações e Personalização

1. **Configurações Gerais**
   - Implementar página de configurações
   - Adicionar opções de personalização de tema
   - Criar controles para altura do cabeçalho e tamanho do logo

2. **Backup e Restauração**
   - Implementar sistema de backup
   - Criar funcionalidade de restauração
   - Adicionar exportação/importação de dados

### Fase 10: Sistema de Monitoramento

1. **Monitoramento de Estoque**
   - Implementar verificação de consistência de estoque
   - Criar alertas para problemas detectados
   - Adicionar correção automática de inconsistências

2. **Monitoramento de Integração**
   - Implementar verificação de sincronização com WordPress
   - Criar log de erros de integração
   - Adicionar notificações para problemas detectados

3. **Painel de Monitoramento**
   - Criar interface para visualização de logs
   - Implementar diagnóstico de problemas
   - Adicionar ferramentas de correção

## Exemplos de Implementação

### Sistema de Monitoramento - Verificação de Estoque

```javascript
// src/monitor/services/inventory.js
import { db } from '../../services/database';
import { notifyUser } from '../utils/notifier';

/**
 * Verifica a consistência do estoque
 * Compara a quantidade em estoque com o histórico de vendas
 */
export async function checkInventoryConsistency() {
  try {
    console.log('Verificando consistência de estoque...');

    // Obter todos os produtos
    const products = await db.products.getAll();
    const sales = await db.sales.getAll();
    const issues = [];

    // Verificar cada produto
    for (const product of products) {
      // Calcular quantidade vendida com base no histórico
      const soldQuantity = sales.reduce((total, sale) => {
        const saleItem = sale.items.find(item => item.productId === product.id);
        return total + (saleItem ? saleItem.quantity : 0);
      }, 0);

      // Calcular quantidade esperada
      const expectedQuantity = product.initialQuantity - soldQuantity;

      // Verificar se há discrepância
      if (product.quantity !== expectedQuantity) {
        const issue = {
          type: 'INVENTORY_INCONSISTENCY',
          severity: 'WARNING',
          productId: product.id,
          productName: product.description,
          currentQuantity: product.quantity,
          expectedQuantity,
          difference: product.quantity - expectedQuantity
        };

        issues.push(issue);

        // Notificar usuário
        notifyUser({
          title: 'Inconsistência de Estoque Detectada',
          message: `O produto "${product.description}" tem quantidade inconsistente. Atual: ${product.quantity}, Esperado: ${expectedQuantity}`,
          type: 'warning',
          action: {
            label: 'Corrigir Agora',
            handler: `fixInventory(${product.id}, ${expectedQuantity})`
          }
        });
      }
    }

    return issues;
  } catch (error) {
    console.error('Erro ao verificar consistência de estoque:', error);
    return [];
  }
}
```

### Sistema de Monitoramento - Correção de Estoque

```javascript
// src/monitor/services/inventory.js
import { db } from '../../services/database';
import { logFix } from '../utils/logger';

/**
 * Corrige estoque negativo
 * @param {number} productId - ID do produto
 * @param {number} newQuantity - Nova quantidade
 */
export async function fixNegativeInventory(productId, newQuantity = 0) {
  try {
    const product = await db.products.get(productId);
    if (!product) {
      throw new Error(`Produto não encontrado: ${productId}`);
    }

    const oldQuantity = product.quantity;
    product.quantity = Math.max(0, newQuantity);
    await db.products.put(product);

    // Registrar correção
    const fix = {
      type: 'NEGATIVE_INVENTORY_FIX',
      productId,
      productName: product.description,
      oldQuantity,
      newQuantity: product.quantity,
      timestamp: new Date()
    };

    await logFix(fix);

    return {
      success: true,
      productId,
      productName: product.description,
      oldQuantity,
      newQuantity: product.quantity
    };
  } catch (error) {
    console.error('Erro ao corrigir estoque negativo:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Corrige inconsistência de estoque
 * @param {number} productId - ID do produto
 * @param {number} newQuantity - Nova quantidade
 */
export async function fixInventoryInconsistency(productId, newQuantity) {
  try {
    const product = await db.products.get(productId);
    if (!product) {
      throw new Error(`Produto não encontrado: ${productId}`);
    }

    const oldQuantity = product.quantity;
    product.quantity = newQuantity;
    await db.products.put(product);

    // Registrar correção
    const fix = {
      type: 'INVENTORY_INCONSISTENCY_FIX',
      productId,
      productName: product.description,
      oldQuantity,
      newQuantity,
      timestamp: new Date()
    };

    await logFix(fix);

    return {
      success: true,
      productId,
      productName: product.description,
      oldQuantity,
      newQuantity
    };
  } catch (error) {
    console.error('Erro ao corrigir inconsistência de estoque:', error);
    return { success: false, error: error.message };
  }
}

### Sistema de Monitoramento - Interface de Usuário

```jsx
// src/components/monitor/MonitorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { monitorService } from '../../services/monitoring/monitorService';
import { Badge } from '../ui/badge';

export default function MonitorDashboard() {
  const [issues, setIssues] = useState([]);
  const [fixes, setFixes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalIssues: 0,
    criticalIssues: 0,
    warningIssues: 0,
    fixedIssues: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMonitorData() {
      setIsLoading(true);
      try {
        // Carregar problemas
        const issuesData = await monitorService.getIssues();
        setIssues(issuesData);

        // Carregar correções
        const fixesData = await monitorService.getFixes();
        setFixes(fixesData);

        // Carregar logs
        const logsData = await monitorService.getLogs({ limit: 100 });
        setLogs(logsData);

        // Calcular estatísticas
        setStats({
          totalIssues: issuesData.length,
          criticalIssues: issuesData.filter(issue => issue.severity === 'CRITICAL').length,
          warningIssues: issuesData.filter(issue => issue.severity === 'WARNING').length,
          fixedIssues: fixesData.length
        });
      } catch (error) {
        console.error('Erro ao carregar dados do monitor:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMonitorData();

    // Atualizar dados a cada 5 minutos
    const interval = setInterval(loadMonitorData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRunChecks = async () => {
    setIsLoading(true);
    try {
      await monitorService.runChecks();
      // Recarregar dados após verificações
      const issuesData = await monitorService.getIssues();
      setIssues(issuesData);

      const fixesData = await monitorService.getFixes();
      setFixes(fixesData);
    } catch (error) {
      console.error('Erro ao executar verificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixIssue = async (issue) => {
    try {
      const result = await monitorService.fixIssue(issue);
      if (result.success) {
        // Atualizar lista de problemas e correções
        const issuesData = await monitorService.getIssues();
        setIssues(issuesData);

        const fixesData = await monitorService.getFixes();
        setFixes(fixesData);
      }
    } catch (error) {
      console.error('Erro ao corrigir problema:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Painel de Monitoramento</h1>
        <Button onClick={handleRunChecks} disabled={isLoading}>
          {isLoading ? 'Verificando...' : 'Executar Verificações'}
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total de Problemas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalIssues}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Problemas Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">{stats.criticalIssues}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-500">{stats.warningIssues}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Correções Aplicadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{stats.fixedIssues}</p>
          </CardContent>
        </Card>
      </div>

      {/* Abas */}
      <Tabs defaultValue="issues">
        <TabsList>
          <TabsTrigger value="issues">Problemas</TabsTrigger>
          <TabsTrigger value="fixes">Correções</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Aba de Problemas */}
        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle>Problemas Detectados</CardTitle>
              <CardDescription>
                Lista de problemas detectados pelo sistema de monitoramento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {issues.length === 0 ? (
                <Alert>
                  <AlertTitle>Nenhum problema detectado</AlertTitle>
                  <AlertDescription>
                    O sistema não encontrou problemas no momento.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell>{issue.type}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              issue.severity === 'CRITICAL' ? 'destructive' :
                              issue.severity === 'WARNING' ? 'warning' : 'default'
                            }
                          >
                            {issue.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {issue.type === 'INVENTORY_INCONSISTENCY' ? (
                            <>
                              Inconsistência de estoque para {issue.productName}.
                              Atual: {issue.currentQuantity}, Esperado: {issue.expectedQuantity}
                            </>
                          ) : issue.type === 'NEGATIVE_INVENTORY' ? (
                            <>
                              Estoque negativo para {issue.productName}.
                              Quantidade: {issue.currentQuantity}
                            </>
                          ) : issue.message}
                        </TableCell>
                        <TableCell>
                          {new Date(issue.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFixIssue(issue)}
                          >
                            Corrigir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Sistema de Monitoramento - Serviço Principal

```javascript
// src/services/monitoring/monitorService.js
import { db } from '../../services/database';
import { checkInventoryConsistency, fixNegativeInventory, fixInventoryInconsistency } from '../../monitor/services/inventory';
import { checkWordPressSync, syncProductToWordPress, syncStockToWordPress } from '../../monitor/services/wordpress';
import { checkSalesIntegrity } from '../../monitor/services/sales';

class MonitorService {
  constructor() {
    this.isRunning = false;
    this.lastCheckTime = null;
    this.checkInterval = null;
  }

  // Inicializar o serviço de monitoramento
  async init() {
    try {
      console.log('Inicializando serviço de monitoramento...');

      // Verificar se o banco de dados está disponível
      if (!db) {
        throw new Error('Banco de dados não disponível');
      }

      // Iniciar verificações periódicas
      this.startPeriodicChecks();

      return true;
    } catch (error) {
      console.error('Erro ao inicializar serviço de monitoramento:', error);
      return false;
    }
  }

  // Iniciar verificações periódicas
  startPeriodicChecks() {
    if (this.isRunning) return;

    this.isRunning = true;
    console.log('Iniciando verificações periódicas');

    // Executar verificação inicial
    this.runChecks();

    // Configurar verificações periódicas (a cada 15 minutos)
    this.checkInterval = setInterval(() => {
      this.runChecks();
    }, 15 * 60 * 1000);
  }

  // Parar verificações periódicas
  stopPeriodicChecks() {
    if (!this.isRunning) return;

    clearInterval(this.checkInterval);
    this.isRunning = false;
    console.log('Verificações periódicas interrompidas');
  }

  // Executar todas as verificações
  async runChecks() {
    try {
      console.log('Iniciando verificações de sistema');
      this.lastCheckTime = new Date();

      // Verificar consistência de estoque
      await checkInventoryConsistency();

      // Verificar integridade de vendas
      await checkSalesIntegrity();

      // Verificar sincronização com WordPress
      await checkWordPressSync();

      console.log('Verificações de sistema concluídas');
      return true;
    } catch (error) {
      console.error('Erro durante verificações:', error);
      return false;
    }
  }

  // Obter problemas
  async getIssues(filter = {}) {
    try {
      const tx = db.transaction(['monitor_issues'], 'readonly');
      const store = tx.objectStore('monitor_issues');

      const issues = await store.getAll();

      // Aplicar filtros
      let filteredIssues = issues;

      if (filter.type) {
        filteredIssues = filteredIssues.filter(issue => issue.type === filter.type);
      }

      if (filter.severity) {
        filteredIssues = filteredIssues.filter(issue => issue.severity === filter.severity);
      }

      if (filter.startDate) {
        const startDate = new Date(filter.startDate);
        filteredIssues = filteredIssues.filter(issue => new Date(issue.timestamp) >= startDate);
      }

      if (filter.endDate) {
        const endDate = new Date(filter.endDate);
        filteredIssues = filteredIssues.filter(issue => new Date(issue.timestamp) <= endDate);
      }

      // Ordenar por data (mais recentes primeiro)
      filteredIssues.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Limitar resultados se necessário
      if (filter.limit) {
        filteredIssues = filteredIssues.slice(0, filter.limit);
      }

      return filteredIssues;
    } catch (error) {
      console.error('Erro ao obter problemas:', error);
      return [];
    }
  }

  // Obter correções
  async getFixes(filter = {}) {
    try {
      const tx = db.transaction(['monitor_fixes'], 'readonly');
      const store = tx.objectStore('monitor_fixes');

      const fixes = await store.getAll();

      // Aplicar filtros
      let filteredFixes = fixes;

      if (filter.type) {
        filteredFixes = filteredFixes.filter(fix => fix.type === filter.type);
      }

      if (filter.productId) {
        filteredFixes = filteredFixes.filter(fix => fix.productId === filter.productId);
      }

      // Ordenar por data (mais recentes primeiro)
      filteredFixes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Limitar resultados se necessário
      if (filter.limit) {
        filteredFixes = filteredFixes.slice(0, filter.limit);
      }

      return filteredFixes;
    } catch (error) {
      console.error('Erro ao obter correções:', error);
      return [];
    }
  }

  // Obter logs
  async getLogs(filter = {}) {
    try {
      const tx = db.transaction(['monitor_logs'], 'readonly');
      const store = tx.objectStore('monitor_logs');

      const logs = await store.getAll();

      // Aplicar filtros
      let filteredLogs = logs;

      if (filter.level) {
        filteredLogs = filteredLogs.filter(log => log.level === filter.level);
      }

      // Ordenar por data (mais recentes primeiro)
      filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Limitar resultados se necessário
      if (filter.limit) {
        filteredLogs = filteredLogs.slice(0, filter.limit);
      }

      return filteredLogs;
    } catch (error) {
      console.error('Erro ao obter logs:', error);
      return [];
    }
  }

  // Corrigir problema
  async fixIssue(issue) {
    try {
      if (!issue || !issue.type) {
        throw new Error('Problema inválido');
      }

      let result;

      // Aplicar correção com base no tipo de problema
      switch (issue.type) {
        case 'NEGATIVE_INVENTORY':
          result = await fixNegativeInventory(issue.productId, 0);
          break;

        case 'INVENTORY_INCONSISTENCY':
          result = await fixInventoryInconsistency(issue.productId, issue.expectedQuantity);
          break;

        case 'PRODUCT_NOT_SYNCED_TO_WORDPRESS':
          result = await syncProductToWordPress(issue.productId);
          break;

        case 'STOCK_SYNC_MISMATCH':
          result = await syncStockToWordPress(issue.productId, issue.wordpressId);
          break;

        default:
          throw new Error(`Tipo de problema não suportado: ${issue.type}`);
      }

      // Se a correção foi bem-sucedida, remover o problema
      if (result.success) {
        const tx = db.transaction(['monitor_issues'], 'readwrite');
        const store = tx.objectStore('monitor_issues');

        await store.delete(issue.id);
        await tx.done;
      }

      return result;
    } catch (error) {
      console.error('Erro ao corrigir problema:', error);
      return { success: false, error: error.message };
    }
  }
}

// Exportar instância única do serviço
export const monitorService = new MonitorService();
```

## Implementação do Carrinho de Compras

Abaixo está um exemplo de implementação do componente de carrinho de compras que será integrado diretamente ao sistema:

```jsx
// src/components/cart/CartButton.jsx
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../context/AppContext';
import { ShoppingCart } from 'lucide-react';
import { Badge } from '../ui/badge';
import CartPopup from './CartPopup';

export default function CartButton() {
  const [showCartPopup, setShowCartPopup] = useState(false);
  const { items, selectedItems, setSelectedItems, handleMultipleSales } = useAppContext();

  // Obter itens do carrinho
  const cartItems = selectedItems.map(itemId => {
    const item = items.find(i => i.id === itemId);
    return item ? { ...item, quantity: item.soldQuantity || 1 } : null;
  }).filter(Boolean);

  // Calcular total do carrinho
  const cartTotal = cartItems.reduce((total, item) => {
    return total + (parseFloat(item.price) * (item.quantity || 1));
  }, 0);

  // Fechar popup ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (showCartPopup && !event.target.closest('.cart-container')) {
        setShowCartPopup(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCartPopup]);

  // Finalizar compra
  const handleFinalizeSale = () => {
    if (cartItems.length === 0) {
      alert('Adicione produtos ao carrinho antes de finalizar a compra.');
      return;
    }

    // Abrir modal de confirmação de venda
    handleMultipleSales(selectedItems);

    // Fechar popup do carrinho
    setShowCartPopup(false);
  };

  // Limpar carrinho
  const handleClearCart = () => {
    setSelectedItems([]);
    setShowCartPopup(false);
  };

  return (
    <div className="cart-container relative">
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white"
        onClick={() => setShowCartPopup(!showCartPopup)}
        aria-label="Carrinho de compras"
      >
        <ShoppingCart size={20} />
        {cartItems.length > 0 && (
          <Badge className="absolute -top-2 -right-2 bg-red-500">
            {cartItems.length}
          </Badge>
        )}
      </button>

      {showCartPopup && (
        <CartPopup
          items={cartItems}
          total={cartTotal}
          onRemoveItem={(itemId) => {
            setSelectedItems(selectedItems.filter(id => id !== itemId));
          }}
          onUpdateQuantity={(itemId, quantity) => {
            const itemIndex = items.findIndex(item => item.id === itemId);
            if (itemIndex !== -1) {
              const newItems = [...items];
              newItems[itemIndex] = {
                ...newItems[itemIndex],
                soldQuantity: parseInt(quantity)
              };
              // Atualizar itens no contexto
              // setItems(newItems);
            }
          }}
          onClear={handleClearCart}
          onFinalize={handleFinalizeSale}
        />
      )}
    </div>
  );
}

```

```jsx
// src/components/cart/CartPopup.jsx
import React from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

export default function CartPopup({
  items,
  total,
  onRemoveItem,
  onUpdateQuantity,
  onClear,
  onFinalize
}) {
  return (
    <div className="absolute top-12 right-0 w-80 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Carrinho de Compras</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClear}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto p-2">
        {items.length === 0 ? (
          <div className="py-4 text-center text-gray-500">
            Seu carrinho está vazio
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map(item => (
              <li key={item.id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.description}</p>
                  <div className="flex items-center mt-1">
                    <input
                      type="number"
                      min="1"
                      max={item.quantity || 99}
                      value={item.soldQuantity || 1}
                      onChange={(e) => onUpdateQuantity(item.id, e.target.value)}
                      className="w-12 h-6 text-xs border border-gray-300 rounded text-center"
                    />
                    <span className="text-xs text-gray-500 ml-2">
                      x {formatCurrency(item.price)}
                    </span>
                    <span className="text-xs font-semibold ml-auto">
                      {formatCurrency(item.price * (item.soldQuantity || 1))}
                    </span>
                  </div>
                </div>
                <button
                  className="ml-2 text-red-500 hover:text-red-700"
                  onClick={() => onRemoveItem(item.id)}
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold">Total:</span>
          <span className="font-bold text-lg">{formatCurrency(total)}</span>
        </div>

        <button
          className="w-full py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center"
          onClick={onFinalize}
          disabled={items.length === 0}
        >
          <ShoppingBag size={16} className="mr-2" />
          Finalizar Compra
        </button>
      </div>
    </div>
  );
}
```

## Conclusão

Este roadmap fornece um guia detalhado para reescrever o aplicativo LinkVendas Fast com uma estrutura mais limpa e organizada, mantendo todas as funcionalidades atuais e adicionando um sistema de monitoramento para detectar e corrigir problemas. Seguindo este plano, será possível criar uma versão mais robusta, manutenível e escalável do aplicativo.

## Exemplos de Componentes

Abaixo estão exemplos de implementação dos principais componentes do sistema:

```jsx
// src/components/monitor/MonitorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { monitorService } from '../../services/monitoring/monitorService';
import { Badge } from '../ui/badge';

export default function MonitorDashboard() {
  const [issues, setIssues] = useState([]);
  const [fixes, setFixes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalIssues: 0,
    criticalIssues: 0,
    warningIssues: 0,
    fixedIssues: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMonitorData() {
      setIsLoading(true);
      try {
        // Carregar problemas
        const issuesData = await monitorService.getIssues();
        setIssues(issuesData);

        // Carregar correções
        const fixesData = await monitorService.getFixes();
        setFixes(fixesData);

        // Carregar logs
        const logsData = await monitorService.getLogs({ limit: 100 });
        setLogs(logsData);

        // Calcular estatísticas
        setStats({
          totalIssues: issuesData.length,
          criticalIssues: issuesData.filter(issue => issue.severity === 'CRITICAL').length,
          warningIssues: issuesData.filter(issue => issue.severity === 'WARNING').length,
          fixedIssues: fixesData.length
        });
      } catch (error) {
        console.error('Erro ao carregar dados do monitor:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMonitorData();

    // Atualizar dados a cada 5 minutos
    const interval = setInterval(loadMonitorData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRunChecks = async () => {
    setIsLoading(true);
    try {
      await monitorService.runChecks();
      // Recarregar dados após verificações
      const issuesData = await monitorService.getIssues();
      setIssues(issuesData);

      const fixesData = await monitorService.getFixes();
      setFixes(fixesData);
    } catch (error) {
      console.error('Erro ao executar verificações:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixIssue = async (issue) => {
    try {
      const result = await monitorService.fixIssue(issue);
      if (result.success) {
        // Atualizar lista de problemas e correções
        const issuesData = await monitorService.getIssues();
        setIssues(issuesData);

        const fixesData = await monitorService.getFixes();
        setFixes(fixesData);
      }
    } catch (error) {
      console.error('Erro ao corrigir problema:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Painel de Monitoramento</h1>
        <Button onClick={handleRunChecks} disabled={isLoading}>
          {isLoading ? 'Verificando...' : 'Executar Verificações'}
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total de Problemas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalIssues}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Problemas Críticos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">{stats.criticalIssues}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-500">{stats.warningIssues}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Correções Aplicadas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{stats.fixedIssues}</p>
          </CardContent>
        </Card>
      </div>

      {/* Abas */}
      <Tabs defaultValue="issues">
        <TabsList>
          <TabsTrigger value="issues">Problemas</TabsTrigger>
          <TabsTrigger value="fixes">Correções</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Aba de Problemas */}
        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle>Problemas Detectados</CardTitle>
              <CardDescription>
                Lista de problemas detectados pelo sistema de monitoramento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {issues.length === 0 ? (
                <Alert>
                  <AlertTitle>Nenhum problema detectado</AlertTitle>
                  <AlertDescription>
                    O sistema não encontrou problemas no momento.
                  </AlertDescription>
                </Alert>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Severidade</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {issues.map((issue) => (
                      <TableRow key={issue.id}>
                        <TableCell>{issue.type}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              issue.severity === 'CRITICAL' ? 'destructive' :
                              issue.severity === 'WARNING' ? 'warning' : 'default'
                            }
                          >
                            {issue.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {issue.type === 'INVENTORY_INCONSISTENCY' ? (
                            <>
                              Inconsistência de estoque para {issue.productName}.
                              Atual: {issue.currentQuantity}, Esperado: {issue.expectedQuantity}
                            </>
                          ) : issue.type === 'NEGATIVE_INVENTORY' ? (
                            <>
                              Estoque negativo para {issue.productName}.
                              Quantidade: {issue.currentQuantity}
                            </>
                          ) : issue.message}
                        </TableCell>
                        <TableCell>
                          {new Date(issue.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFixIssue(issue)}
                          >
                            Corrigir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outras abas omitidas para brevidade */}
      </Tabs>
    </div>
  );
}
```

## Credenciais e Configurações

### WordPress/WooCommerce
- **URL**: https://achadinhoshopp.com.br/loja
- **Username**: gloliverx (glolivercoder@gmail.com)
- **Password**: Juli@3110
- **Application Password**: 0lr4 umHb 8pfx 5Cqf v7KW oq8S
- **Consumer Key**: ck_40b4a1a674084d504579a2ba2d51530c260d3645
- **Consumer Secret**: cs_8fa4b36ab57ddb02415e4fc346451791ab1782f2

### Google Gemini API
- Configurar via variáveis de ambiente no arquivo .env

### APIs de Frete
- **Correios**: Configurar via variáveis de ambiente
- **Jadlog**: Configurar via variáveis de ambiente
- **Melhor Envio**: Configurar via variáveis de ambiente

## Implementação do Carrinho de Compras

O carrinho de compras será integrado diretamente ao sistema, seguindo estas diretrizes:

1. **Componente de Carrinho**
   - Posicionado no canto superior direito da página de vendas
   - Ícone branco dentro de círculo azul
   - Contador de itens visível

2. **Popup do Carrinho**
   - Exibir lista de itens selecionados
   - Mostrar preço unitário, quantidade e subtotal por item
   - Incluir opção de remover item
   - Exibir valor total da compra
   - Botões para limpar carrinho e finalizar compra

3. **Integração com Vendas**
   - Ao finalizar compra, abrir modal de confirmação
   - Permitir seleção de método de pagamento
   - Atualizar estoque automaticamente
   - Limpar carrinho após finalização

4. **Persistência de Dados**
   - Salvar estado do carrinho no localStorage
   - Restaurar carrinho ao recarregar a página

## Considerações de Implementação

1. **Performance**
   - Utilizar React.memo para componentes que não mudam frequentemente
   - Implementar carregamento lazy para componentes pesados
   - Otimizar renderização de listas longas

2. **Responsividade**
   - Garantir que a interface funcione bem em dispositivos móveis
   - Adaptar layout para diferentes tamanhos de tela
   - Implementar sidebar colapsável em telas pequenas

3. **Acessibilidade**
   - Seguir diretrizes WCAG 2.1
   - Implementar navegação por teclado
   - Adicionar atributos ARIA quando necessário

4. **Segurança**
   - Armazenar credenciais de forma segura
   - Implementar validação de entrada em todos os formulários
   - Sanitizar dados antes de armazenar no banco de dados

5. **Offline First**
   - Garantir que o aplicativo funcione offline
   - Sincronizar dados quando a conexão for restaurada
   - Implementar fila de operações offline

## Conclusão

Este roadmap fornece um guia detalhado para reescrever o aplicativo LinkVendas Fast com uma estrutura mais limpa e organizada, mantendo todas as funcionalidades atuais e adicionando um sistema de monitoramento para detectar e corrigir problemas. Seguindo este plano, será possível criar uma versão mais robusta, manutenível e escalável do aplicativo.
