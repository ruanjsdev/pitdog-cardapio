import { Plus } from "lucide-react";
import { MenuItem } from "../types/menu";
import { formatCurrency } from "../utils/currency";

interface ProductCardProps {
  item: MenuItem;
  disabled?: boolean;
  onAddItem: (item: MenuItem) => void;
}

export const ProductCard = ({ item, disabled = false, onAddItem }: ProductCardProps) => (
  <article className={`product-card ${disabled ? "is-disabled" : ""}`}>
    <div className="product-media">
      <img src={item.image} alt="" loading="lazy" decoding="async" />
      {item.inStock === false ? <span>Indisponivel</span> : item.tag && <span>{item.tag}</span>}
    </div>
    <div className="product-body">
      <div>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
      </div>
      <div className="product-footer">
        <strong>{formatCurrency(item.price)}</strong>
        <button type="button" disabled={disabled} onClick={() => onAddItem(item)} aria-label={`Adicionar ${item.name}`}>
          <Plus size={18} />
          {disabled ? "Pausado" : "Adicionar"}
        </button>
      </div>
    </div>
  </article>
);
