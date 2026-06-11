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

const hiddenMarkerChars = /[\u2063\u200b\u200c\u200d\ufeff]/g;
const subtitleMarkerPatterns = [
  /@@pits[_-]subtitle:([^@]+)@@/i,
  /[\u2063\u200b\u200c\u200d\ufeff]*pits[_-]subtitle:([^\s<>&\u2063\u200b\u200c\u200d\ufeff.]+)[\u2063\u200b\u200c\u200d\ufeff]*/i
];

const decodeSubtitle = (value = "") => {
  try {
    return decodeURIComponent(value.trim());
  } catch {
    return value.trim();
  }
};

const cleanDescriptionAfterMarkerRemoval = (value = "") =>
  value
    .replace(hiddenMarkerChars, "")
    .replace(/\s*(?:\.{3}|…)\s*$/u, "")
    .trim();

const parseCardDescription = (rawDescription = "") => {
  for (const pattern of subtitleMarkerPatterns) {
    const match = rawDescription.match(pattern);

    if (match?.[0]) {
      return {
        description: cleanDescriptionAfterMarkerRemoval(rawDescription.replace(match[0], "")),
        subtitle: decodeSubtitle(match[1])
      };
    }
  }

  return {
    description: cleanDescriptionAfterMarkerRemoval(rawDescription),
    subtitle: ""
  };
};

export const ProductCard = ({
  item,
  quantity,
  disabled = false,
  displayTag,
  storeClosed = false,
  onAddItem,
  onClosedAttempt,
}: ProductCardProps) => {
  const parsedDescription = parseCardDescription(item.description);
  const resolvedDisplayTag = displayTag || parsedDescription.subtitle;

  return (
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

        {item.inStock === false && (
          <span>Indisponível</span>
        )}
      </div>

      <div className="product-body">
        <div>
          <h3>{item.name}</h3>
          <p>{parsedDescription.description}</p>
          {resolvedDisplayTag && item.inStock !== false && (
            <span className="product-card__tag-line">{resolvedDisplayTag.toUpperCase()}</span>
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
};
