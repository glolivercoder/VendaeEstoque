import React, { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import { useToast } from '../hooks/useToast';
import '../styles/SaleConfirmationPopup.css';
import '../styles/ShareButtonFix.css'; // Importar estilos específicos para o botão de compartilhamento

const SaleConfirmationPopup = ({
  sale,
  onClose,
  generateReceipt
}) => {
  const popupRef = useRef(null);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [contactInfo, setContactInfo] = useState({ whatsapp: '', email: '' });
  const [showContactForm, setShowContactForm] = useState(false);
  const toast = useToast();

  useEffect(() => {
    console.log('SaleConfirmationPopup renderizado com venda:', sale);
    console.log('SaleConfirmationPopup props:', { sale, onClose, generateReceipt });

    // Carregar informações de contato do localStorage, se disponíveis
    const savedContactInfo = localStorage.getItem('contactInfo');
    if (savedContactInfo) {
      try {
        setContactInfo(JSON.parse(savedContactInfo));
      } catch (error) {
        console.error('Erro ao carregar informações de contato:', error);
      }
    }
  }, [sale, onClose, generateReceipt]);

  // Função para exportar o pop-up como imagem
  const exportAsImage = async (method = 'download') => {
    if (!popupRef.current) return;

    try {
      const canvas = await html2canvas(popupRef.current);
      const imageData = canvas.toDataURL('image/png');

      // Copiar a imagem para a área de transferência
      try {
        // Converter a imagem para blob
        const blobPromise = new Promise(resolve => {
          canvas.toBlob(resolve, 'image/png');
        });
        const blob = await blobPromise;

        // Criar um objeto ClipboardItem e copiar para a área de transferência
        if (navigator.clipboard && navigator.clipboard.write) {
          const clipboardItem = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([clipboardItem]);
          console.log('Imagem copiada para a área de transferência');
          toast({
            title: "Imagem copiada",
            description: "O comprovante foi copiado para a área de transferência.",
          });
        } else {
          console.warn('API de área de transferência não suportada neste navegador');
        }
      } catch (clipboardError) {
        console.error('Erro ao copiar para a área de transferência:', clipboardError);
        // Continuar com o método normal mesmo se falhar a cópia para a área de transferência
      }

      if (method === 'download') {
        // Download direto
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `venda_${sale.id}_${new Date().toISOString().slice(0, 10)}.png`;
        link.click();
        alert('A imagem também foi copiada para a área de transferência. Você pode colá-la diretamente no WhatsApp ou email.');
      } else if (method === 'whatsapp') {
        // Primeiro baixar a imagem
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `venda_${sale.id}_${new Date().toISOString().slice(0, 10)}.png`;
        link.click();

        // Depois abrir o WhatsApp
        if (contactInfo.whatsapp) {
          setTimeout(() => {
            const encodedMessage = encodeURIComponent('Comprovante de venda');
            window.open(`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}?text=${encodedMessage}`, '_blank');
            alert('A imagem foi copiada para a área de transferência. Você pode colá-la diretamente no WhatsApp que acabou de abrir.');
          }, 1000);
        } else {
          setShowContactForm(true);
        }
      } else if (method === 'email') {
        // Primeiro baixar a imagem
        const link = document.createElement('a');
        link.href = imageData;
        link.download = `venda_${sale.id}_${new Date().toISOString().slice(0, 10)}.png`;
        link.click();

        // Depois abrir o cliente de email
        if (contactInfo.email) {
          setTimeout(() => {
            const subject = encodeURIComponent('Comprovante de Venda');
            const body = encodeURIComponent('Segue em anexo o comprovante de venda.');
            window.open(`mailto:${contactInfo.email}?subject=${subject}&body=${body}`, '_blank');
            alert('A imagem foi copiada para a área de transferência. Você pode colá-la diretamente no email que acabou de abrir.');
          }, 1000);
        } else {
          setShowContactForm(true);
        }
      }
    } catch (error) {
      console.error('Erro ao exportar imagem:', error);
      alert('Erro ao exportar como imagem. Por favor, tente novamente.');
    }
  };

  // Função para salvar informações de contato
  const saveContactInfo = () => {
    localStorage.setItem('contactInfo', JSON.stringify(contactInfo));
    setShowContactForm(false);

    // Continuar com o compartilhamento após salvar as informações
    if (contactInfo.whatsapp) {
      exportAsImage('whatsapp');
    } else if (contactInfo.email) {
      exportAsImage('email');
    }
  };

  if (!sale) return null;

  return (
    <div className="sale-confirmation-overlay">
      <div className="sale-confirmation-container">
        <div className="sale-confirmation-header">
          <h2>Venda Finalizada com Sucesso!</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>

        <div ref={popupRef} className="sale-confirmation-content">
          <div className="sale-confirmation-title">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Comprovante de Venda</h3>
          </div>

          <div className="sale-details">
            <div className="sale-info-grid">
              <div className="sale-info-item">
                <div className="sale-info-label">Data</div>
                <div className="sale-info-value">{sale.date} {sale.time && <span>{sale.time}</span>}</div>
              </div>
              <div className="sale-info-item">
                <div className="sale-info-label">Pagamento</div>
                <div className="sale-info-value">
                  {sale.paymentMethod === 'dinheiro' ? 'Dinheiro' :
                   sale.paymentMethod === 'cartao' ? 'Cartão' :
                   sale.paymentMethod === 'pix' ? 'PIX' : sale.paymentMethod}
                </div>
              </div>
            </div>

            <div className="sale-info-section">
              <h4>Cliente</h4>
              <p>{sale.client}</p>
              {sale.clientDoc && <p className="sale-info-doc">{sale.clientDoc}</p>}
            </div>

            <div className="sale-info-section">
              <h4>Vendedor</h4>
              <p>{sale.vendor}</p>
              {sale.vendorDoc && <p className="sale-info-doc">{sale.vendorDoc}</p>}
            </div>

            <div className="sale-info-section">
              <h4>Produtos</h4>
              <div className="product-list">
                {sale.product.split(', ').map((product, index) => (
                  <div key={index} className="product-item">
                    {product}
                  </div>
                ))}
              </div>
              <div className="sale-total">
                <span>Total:</span>
                <span>R$ {sale.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sale-confirmation-actions">
          <div className="primary-actions">
            <button
              onClick={() => generateReceipt(sale)}
              className="action-btn receipt-btn"
            >
              <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Recibo de Venda</span>
            </button>

            <button
              onClick={() => {
                try {
                  console.log("Botão de frete clicado. Dados da venda:", sale);

                  // Obter o cliente da venda
                  const client = {
                    name: sale.client,
                    document: sale.clientDoc,
                    cep: sale.clientCep || ''
                  };

                  // Verificar se o CEP do cliente está disponível e logar
                  if (sale.clientCep) {
                    console.log(`CEP do cliente encontrado na venda: ${sale.clientCep}`);
                  } else {
                    console.log("CEP do cliente não encontrado na venda");
                    // Tentar buscar o CEP do cliente no localStorage
                    try {
                      const savedClients = localStorage.getItem('clients');
                      if (savedClients) {
                        console.log("Clientes encontrados no localStorage:", savedClients.substring(0, 100) + "...");
                        const clients = JSON.parse(savedClients);
                        console.log(`Buscando cliente com nome: ${sale.client} ou documento: ${sale.clientDoc}`);

                        const foundClient = clients.find(c =>
                          c.name === sale.client ||
                          (c.document && c.document === sale.clientDoc) ||
                          (c.cpf && c.cpf === sale.clientDoc)
                        );

                        if (foundClient) {
                          console.log("Cliente encontrado no localStorage:", foundClient);

                          if (foundClient.cep || (foundClient.address && foundClient.address.cep)) {
                            client.cep = foundClient.cep || foundClient.address.cep;
                            console.log(`CEP do cliente encontrado no localStorage: ${client.cep}`);
                          } else {
                            console.log("Cliente encontrado, mas não possui CEP");
                          }
                        } else {
                          console.log("Cliente não encontrado no localStorage");
                        }
                      } else {
                        console.log("Nenhum cliente encontrado no localStorage");
                      }
                    } catch (error) {
                      console.error("Erro ao buscar CEP do cliente no localStorage:", error);
                    }
                  }

                  // Obter o produto da venda
                  // Dividir a string de produtos se houver múltiplos
                  const productNames = sale.product.split(', ');
                  const firstProductName = productNames[0] || '';

                  // Buscar informações detalhadas do produto no banco de dados
                  // Aqui vamos usar os dados disponíveis na venda
                  const product = {
                    description: firstProductName,
                    price: sale.total,
                    // Adicionar dimensões e peso padrão se não estiverem disponíveis
                    dimensions: {
                      length: sale.productLength || "20",
                      width: sale.productWidth || "15",
                      height: sale.productHeight || "10"
                    },
                    weight: sale.productWeight || "0.5",
                    technicalSpecs: sale.productSpecs || ""
                  };

                  console.log("Dados do cliente para calculadora de frete:", client);
                  console.log("Dados do produto para calculadora de frete:", product);

                  // Abrir a calculadora de frete e passar os dados
                  if (typeof window.setShowShippingCalculator === 'function') {
                    window.setShowShippingCalculator(true);

                    if (typeof window.setShippingCalculatorData === 'function') {
                      console.log("Enviando dados para a calculadora de frete:", {
                        client: client,
                        product: product
                      });

                      // Pequeno atraso para garantir que a calculadora esteja aberta antes de enviar os dados
                      setTimeout(() => {
                        window.setShippingCalculatorData({
                          client: client,
                          product: product
                        });
                        console.log("Dados enviados para a calculadora de frete após delay");
                      }, 300);
                    } else {
                      console.error("Função setShippingCalculatorData não está disponível");
                    }
                  } else {
                    console.error("Função setShowShippingCalculator não está disponível");
                  }

                  // Fechar o popup de confirmação de venda
                  onClose();
                } catch (error) {
                  console.error("Erro ao processar dados para calculadora de frete:", error);
                  alert("Erro ao abrir calculadora de frete. Tente novamente.");
                }
              }}
              className="action-btn freight-btn"
              style={{ backgroundColor: '#4CAF50', color: 'white', fontWeight: 500 }}
            >
              <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span style={{ color: 'white', fontWeight: 500 }}>Frete</span>
            </button>

            <button
              onClick={() => setShowShareOptions(!showShareOptions)}
              className="action-btn share-btn"
              style={{ backgroundColor: '#2196F3', color: 'white', fontWeight: 500 }}
            >
              <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span style={{ color: 'white', fontWeight: 500 }}>Compartilhar</span>
            </button>
          </div>

          {showShareOptions && (
            <div className="share-options">
              <button onClick={() => exportAsImage('download')} className="share-option-btn">
                <svg className="share-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Baixar Imagem</span>
              </button>

              <button onClick={() => exportAsImage('whatsapp')} className="share-option-btn whatsapp-btn">
                <svg className="share-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>WhatsApp</span>
              </button>

              <button onClick={() => exportAsImage('email')} className="share-option-btn email-btn">
                <svg className="share-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Email</span>
              </button>
            </div>
          )}

          <button onClick={onClose} className="close-sale-btn">
            Fechar
          </button>
        </div>

        {/* Formulário de contato para compartilhamento */}
        {showContactForm && (
          <div className="contact-form-overlay">
            <div className="contact-form">
              <h3>Informações de Contato</h3>
              <p>Preencha as informações para compartilhar o comprovante:</p>

              <div className="form-group">
                <label>WhatsApp (com DDD)</label>
                <input
                  type="text"
                  value={contactInfo.whatsapp}
                  onChange={(e) => setContactInfo({...contactInfo, whatsapp: e.target.value})}
                  placeholder="Ex: 11999999999"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                  placeholder="Ex: cliente@email.com"
                />
              </div>

              <div className="form-actions">
                <button onClick={() => setShowContactForm(false)} className="cancel-btn">
                  Cancelar
                </button>
                <button onClick={saveContactInfo} className="save-btn">
                  Salvar e Continuar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaleConfirmationPopup;
