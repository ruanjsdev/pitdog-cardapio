import { Plus } from "lucide-react";
import { MenuItem } from "../types/menu";
import { formatCurrency } from "../utils/currency";

interface ProductCardProps {
  item: MenuItem;
  quantity: number;
  disabled?: boolean;
  displayTag?: string;
  storeClosed?: boolean;
  onAddItem: (item: MenuItem) => void;
  onClosedAttempt?: () => void;
}

export const ProductCard = ({
  item,
  quantity,
  disabled = false,
  displayTag,
  storeClosed = false,
  onAddItem,
  onClosedAttempt,
}: ProductCardProps) => (
  <article className={`product-card ${disabled || storeClosed ? "is-disabled" : ""}`}>
    {quantity > 0 && (
      <span className="product-card__quantity-badge">
        {quantity}
      </span>
    )}

    <div className="product-media">
      <img
        src={item.image}
        alt={item.name}
        loading="lazy"
        decoding="async"
        onError={(event) => {
          event.currentTarget.src = "/assets/pits-logo.svg";
        }}
      />

      {item.inStock === false ? (
        <span>Indisponível</span>
      ) : (
        displayTag && <span>{displayTag}</span>
      )}
    </div>

    <div className="product-body">
      <div>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        {displayTag && item.inStock !== false && (
          <span className="product-card__tag-line">{displayTag}</span>
        )}
      </div>

      <div className="product-footer">
        <strong>{formatCurrency(item.price)}</strong>

        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (storeClosed) {
              onClosedAttempt?.();
              return;
            }

            onAddItem(item);
          }}
          aria-label={`Adicionar ${item.name}`}
        >
          <Plus size={18} />
          {disabled ? "Indisponível" : storeClosed ? "Loja fechada" : "Adicionar"}
        </button>
      </div>
    </div>
  </article>
);
