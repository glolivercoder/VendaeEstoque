import { ShippingOption, formatCurrency } from "../lib/shippingApi";
import { Badge } from "../components/ui/badge";
import Button from "../components/ui/button";

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

type ShippingOptionCardProps = {
  option: ShippingOption;
  isSelected: boolean;
  onSelect: (option: ShippingOption) => void;
};

const ShippingOptionCard = ({ option, isSelected, onSelect }: ShippingOptionCardProps) => {
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
      className={`bg-white rounded-lg shadow-sm p-4 border-l-4 transition-all ${
        isSelected
          ? "ring-2 ring-primary ring-offset-1"
          : "hover:shadow-md"
      }`}
      style={{ borderLeftColor: carrier.color }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2" style={{ backgroundColor: carrier.color }}>
              <TruckIcon className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="font-medium">{carrier.name}</h3>
              <p className="text-sm text-gray-500">{service}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {isCheapest && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <DollarSign className="h-3 w-3 mr-1" />
                Mais barato
              </Badge>
            )}
            {isFastest && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Clock className="h-3 w-3 mr-1" />
                Mais rápido
              </Badge>
            )}
            {isExpedited && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Expresso
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end">
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Prazo de entrega</p>
            <p className="font-medium">
              {deliveryTime.min === deliveryTime.max
                ? `${deliveryTime.min} ${deliveryTime.unit}`
                : `${deliveryTime.min}-${deliveryTime.max} ${deliveryTime.unit}`}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <p className="text-lg font-bold">{formatCurrency(price)}</p>
          <Button
            size="sm"
            variant={isSelected ? "default" : "outline"}
            className="mt-2"
            onClick={() => onSelect(option)}
          >
            {isSelected ? "Selecionado" : "Selecionar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ShippingOptionCard;
