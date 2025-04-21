import React, { useState, useMemo, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import '../styles/SalesHistory.css';

const SalesHistory = ({
  salesData,
  onClose,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState('client'); // 'client' ou 'id'

  useEffect(() => {
    console.log('SalesHistory renderizado com dados:', salesData?.length || 0, 'vendas');
  }, [salesData]);

  // Agrupar vendas por cliente ou ID
  const groupedSales = useMemo(() => {
    if (!salesData || salesData.length === 0) return {};

    const grouped = {};

    salesData.forEach(sale => {
      const key = groupBy === 'client'
        ? (sale.client || 'Cliente não especificado')
        : `Venda #${sale.id}`;

      if (!grouped[key]) {
        grouped[key] = [];
      }

      grouped[key].push(sale);
    });

    return grouped;
  }, [salesData, groupBy]);

  // Filtrar vendas com base na pesquisa
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupedSales;

    const filtered = {};
    const query = searchQuery.toLowerCase().trim();

    Object.entries(groupedSales).forEach(([key, sales]) => {
      // Filtrar vendas dentro do grupo
      const filteredSales = sales.filter(sale =>
        (sale.client && sale.client.toLowerCase().includes(query)) ||
        (sale.product && sale.product.toLowerCase().includes(query)) ||
        (sale.clientDoc && sale.clientDoc.toLowerCase().includes(query)) ||
        (sale.clientCpf && sale.clientCpf.toLowerCase().includes(query)) ||
        (sale.id && sale.id.toString().includes(query)) ||
        (sale.paymentMethod && sale.paymentMethod.toLowerCase().includes(query))
      );

      // Se houver vendas filtradas, adicionar ao resultado
      if (filteredSales.length > 0) {
        filtered[key] = filteredSales;
      }
    });

    return filtered;
  }, [groupedSales, searchQuery]);

  // Gerar recibo para uma venda
  const generateReceipt = async (sale) => {
    try {
      // Criar um elemento temporário para o recibo
      const receiptElement = document.createElement('div');
      receiptElement.style.width = '300px';
      receiptElement.style.padding = '20px';
      receiptElement.style.backgroundColor = 'white';
      receiptElement.style.fontFamily = 'Arial, sans-serif';

      // Adicionar conteúdo do recibo
      receiptElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #4CAF50;">Recibo de Venda</h2>
          <p style="margin: 5px 0; font-size: 12px; color: #666;">VendaEstoque App</p>
        </div>

        <div style="border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 10px 0; margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div>
              <div style="font-size: 12px; color: #666;">Data</div>
              <div style="font-weight: 500;">${sale.date} ${sale.time || ''}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: #666;">Pagamento</div>
              <div style="font-weight: 500;">
                ${sale.paymentMethod === 'dinheiro' ? 'Dinheiro' :
                  sale.paymentMethod === 'cartao' ? 'Cartão' :
                  sale.paymentMethod === 'pix' ? 'PIX' : sale.paymentMethod}
              </div>
            </div>
          </div>

          <div style="margin-bottom: 10px;">
            <div style="font-size: 12px; color: #666;">Cliente</div>
            <div style="font-weight: 500;">${sale.client}</div>
          </div>

          <div>
            <div style="font-size: 12px; color: #666;">Produtos</div>
            <div style="margin-top: 5px;">
              ${sale.product.split(', ').map(product =>
                `<div style="padding: 5px 0; border-bottom: 1px solid #f5f5f5;">${product}</div>`
              ).join('')}
            </div>
            <div style="margin-top: 10px; text-align: right;">
              <span style="font-size: 12px; color: #666;">Total:</span>
              <span style="font-size: 16px; font-weight: bold; margin-left: 5px;">R$ ${sale.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div style="font-size: 12px; color: #666; text-align: center;">
          Obrigado pela preferência!
        </div>
      `;

      // Adicionar ao DOM temporariamente
      document.body.appendChild(receiptElement);

      // Converter para imagem
      const canvas = await html2canvas(receiptElement);

      // Remover do DOM
      document.body.removeChild(receiptElement);

      // Criar PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200]
      });

      // Adicionar a imagem ao PDF
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 80, 0);

      // Salvar o PDF
      pdf.save(`recibo_venda_${sale.id}.pdf`);

    } catch (error) {
      console.error('Erro ao gerar recibo:', error);
      alert('Erro ao gerar recibo. Por favor, tente novamente.');
    }
  };

  // Exportar como imagem
  const exportAsImage = async (sale) => {
    try {
      // Criar um elemento temporário para o recibo
      const receiptElement = document.createElement('div');
      receiptElement.style.width = '300px';
      receiptElement.style.padding = '20px';
      receiptElement.style.backgroundColor = 'white';
      receiptElement.style.fontFamily = 'Arial, sans-serif';

      // Adicionar conteúdo do recibo (mesmo do generateReceipt)
      receiptElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0; color: #4CAF50;">Recibo de Venda</h2>
          <p style="margin: 5px 0; font-size: 12px; color: #666;">VendaEstoque App</p>
        </div>

        <div style="border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 10px 0; margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <div>
              <div style="font-size: 12px; color: #666;">Data</div>
              <div style="font-weight: 500;">${sale.date} ${sale.time || ''}</div>
            </div>
            <div>
              <div style="font-size: 12px; color: #666;">Pagamento</div>
              <div style="font-weight: 500;">
                ${sale.paymentMethod === 'dinheiro' ? 'Dinheiro' :
                  sale.paymentMethod === 'cartao' ? 'Cartão' :
                  sale.paymentMethod === 'pix' ? 'PIX' : sale.paymentMethod}
              </div>
            </div>
          </div>

          <div style="margin-bottom: 10px;">
            <div style="font-size: 12px; color: #666;">Cliente</div>
            <div style="font-weight: 500;">${sale.client}</div>
          </div>

          <div>
            <div style="font-size: 12px; color: #666;">Produtos</div>
            <div style="margin-top: 5px;">
              ${sale.product.split(', ').map(product =>
                `<div style="padding: 5px 0; border-bottom: 1px solid #f5f5f5;">${product}</div>`
              ).join('')}
            </div>
            <div style="margin-top: 10px; text-align: right;">
              <span style="font-size: 12px; color: #666;">Total:</span>
              <span style="font-size: 16px; font-weight: bold; margin-left: 5px;">R$ ${sale.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div style="font-size: 12px; color: #666; text-align: center;">
          Obrigado pela preferência!
        </div>
      `;

      // Adicionar ao DOM temporariamente
      document.body.appendChild(receiptElement);

      // Converter para imagem
      const canvas = await html2canvas(receiptElement);

      // Remover do DOM
      document.body.removeChild(receiptElement);

      // Download da imagem
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `recibo_venda_${sale.id}.png`;
      link.click();

    } catch (error) {
      console.error('Erro ao exportar como imagem:', error);
      alert('Erro ao exportar como imagem. Por favor, tente novamente.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="sales-history-container">
        <div className="sales-history-header">
          <h2>Histórico de Vendas</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div className="sales-history-filters">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Buscar por cliente, produto, documento ou ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="group-buttons">
            <button
              className={`group-btn ${groupBy === 'client' ? 'active' : ''}`}
              onClick={() => setGroupBy('client')}
            >
              Agrupar por Cliente
            </button>
            <button
              className={`group-btn ${groupBy === 'id' ? 'active' : ''}`}
              onClick={() => setGroupBy('id')}
            >
              Agrupar por Venda
            </button>
          </div>
        </div>

        <div className="sales-history-content">
          {Object.keys(filteredGroups).length > 0 ? (
            <div>
              {Object.entries(filteredGroups).map(([key, sales]) => (
                <div key={key} className="sales-group">
                  <div className="sales-group-header">
                    {key}
                  </div>
                  <table className="sales-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Data</th>
                        <th>Hora</th>
                        <th>Produtos</th>
                        <th>Pagamento</th>
                        <th>Total</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((sale) => (
                        <tr key={sale.id}>
                          <td>#{sale.id}</td>
                          <td>{sale.date}</td>
                          <td>{sale.time || 'N/A'}</td>
                          <td>{sale.product}</td>
                          <td>
                            {sale.paymentMethod === 'dinheiro' ? 'Dinheiro' :
                             sale.paymentMethod === 'cartao' ? 'Cartão' :
                             sale.paymentMethod === 'pix' ? 'PIX' : sale.paymentMethod}
                          </td>
                          <td>R$ {sale.total.toFixed(2)}</td>
                          <td>
                            <div className="action-buttons">
                              <button
                                onClick={() => generateReceipt(sale)}
                                className="action-btn receipt-btn"
                                title="Gerar recibo"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => exportAsImage(sale)}
                                className="action-btn export-btn"
                                title="Exportar como imagem"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-sales">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3>Nenhuma venda encontrada</h3>
              <p>Não há vendas registradas ou nenhuma corresponde à sua pesquisa.</p>
            </div>
          )}
        </div>

        <div className="sales-history-footer">
          <button onClick={onClose} className="close-history-btn">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesHistory;
