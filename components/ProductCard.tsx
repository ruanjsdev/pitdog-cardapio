import { Plus } from "lucide-react";
import { MenuItem } from "../types/menu";
import { formatCurrency } from "../utils/currency";

interface ProductCardProps {
  item: MenuItem;
  quantity: number;
  disabled?: boolean;
  onAddItem: (item: MenuItem) => void;
}

export const ProductCard = ({
  item,
  quantity,
  disabled = false,
  onAddItem,
}: ProductCardProps) => (
  <article className={`product-card ${disabled ? "is-disabled" : ""}`}>
    {quantity > 0 && (
      <span className="product-card__quantity-badge">
        {quantity}
      </span>
    )}

    <div className="product-media">
      <img src={item.image} alt={item.name} loading="lazy" decoding="async" />

      {item.inStock === false ? (
        <span>Indisponível</span>
      ) : (
        item.tag && <span>{item.tag}</span>
      )}
    </div>

    <div className="product-body">
      <div>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
      </div>

      <div className="product-footer">
        <strong>{formatCurrency(item.price)}</strong>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onAddItem(item)}
          aria-label={`Adicionar ${item.name}`}
        >
          <Plus size={18} />
          {disabled ? "Pausado" : "Adicionar"}
        </button>
      </div>
    </div>
  </article>
);