import { ShippingOption, formatCurrency } from "../lib/shippingApi";

// Ícones
const Clock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const DollarSign = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const TruckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 17h4V5H2v12h3"></path>
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"></path>
    <circle cx="7.5" cy="17.5" r="2.5"></circle>
    <circle cx="17.5" cy="17.5" r="2.5"></circle>
  </svg>
);

/**
 * Componente para exibir uma opção de frete
 * @param {Object} props - Propriedades do componente
 * @param {ShippingOption} props.option - Opção de frete
 * @param {boolean} props.isSelected - Indica se a opção está selecionada
 * @param {Function} props.onSelect - Função chamada quando a opção é selecionada
 */
const ShippingOptionCard = ({ option, isSelected, onSelect }) => {
  const {
    carrier,
    service,
    price,
    deliveryTime,
    isCheapest,
    isFastest,
    isExpedited,
  } = option;

  return (
    <div
      className={`shipping-option-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(option)}
    >
      <div className="shipping-option-content">
        <div className="shipping-option-info">
          <div className="shipping-option-header">
            <div className="shipping-carrier">
              <div className="carrier-icon-container" style={{ backgroundColor: carrier.color }}>
                <TruckIcon className="carrier-icon" />
              </div>
              <div className="carrier-details">
                <h3 className="carrier-name">{carrier.name}</h3>
                <p className="service-name">{service}</p>
              </div>
            </div>
          </div>

          <div className="shipping-badges">
            {isCheapest && (
              <div className="shipping-badge cheapest-badge">
                <DollarSign className="badge-icon" />
                <span>Mais barato</span>
              </div>
            )}
            {isFastest && (
              <div className="shipping-badge fastest-badge">
                <Clock className="badge-icon" />
                <span>Mais rápido</span>
              </div>
            )}
            {isExpedited && (
              <div className="shipping-badge express-badge">
                <span>Expresso</span>
              </div>
            )}
          </div>
        </div>

        <div className="shipping-option-details">
          <div className="delivery-time">
            <p className="delivery-label">Prazo de entrega</p>
            <p className="delivery-value">
              {deliveryTime.min === deliveryTime.max
                ? `${deliveryTime.min} ${deliveryTime.unit}`
                : `${deliveryTime.min}-${deliveryTime.max} ${deliveryTime.unit}`}
            </p>
          </div>

          <div className="price-container">
            <p className="price-value">{formatCurrency(price)}</p>
            <button
              className={`select-button ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(option)}
            >
              {isSelected ? "Selecionado" : "Selecionar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingOptionCard;
