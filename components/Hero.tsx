import { ArrowRight, MapPin, Star } from "lucide-react";
import { businessInfo } from "../data/business";
import { MenuItem } from "../types/menu";
import { formatCurrency } from "../utils/currency";

interface HeroProps {
  featuredItems: MenuItem[];
  onOrderClick: () => void;
}

export const Hero = ({ featuredItems, onOrderClick }: HeroProps) => (
  <section className="hero" id="top">
    <div className="brand-board">
      <div className="brand-logo-card">
        <img src="/assets/LogoPitis.png" alt="Pit’s Dog" decoding="async" />
      </div>

      <div className="hero-content">
        <div className="hero-kicker">
          <Star size={18} />
          Lanche expresso e delivery
        </div>
        <h1>Pits Dog</h1>
        <p>
          Burgers, Cachorro quente, porções e combos preparados com personalidade, sabor marcante e entrega rápida.
        </p>
      </div>

      <div className="hero-actions">
        <button className="primary-button" type="button" onClick={onOrderClick}>
          Pedir Agora
          <ArrowRight size={20} />
        </button>
        <a className="secondary-button" href="#cardapio">
          Ver Cardapio  
        </a>
      </div>

      <div className="hero-metrics" aria-label="Diferenciais">
        <span>
          <MapPin size={18} />
          {businessInfo.address.display}
        </span>
      </div>
    </div>

    <div className="hero-menu-preview" aria-label="Destaques do cardapio">
      <div className="preview-header">
        <span>Mais pedidos</span>
        <strong>Cardápio Pits</strong>
      </div>
      {featuredItems.map((item, index) => (
        <article key={`${item.type ?? "item"}-${item.id}`}>
          <img src={item.image} alt="" loading={index === 0 ? "eager" : "lazy"} decoding="async" />
          <div>
            <strong>{item.name}</strong>
            <span>{item.tag || item.description || "Destaque da casa"}</span>
          </div>
          <b>{formatCurrency(item.price)}</b>
        </article>
      ))}
    </div>
  </section>
);
