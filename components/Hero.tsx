import { ArrowRight, Clock, MapPin, MessageCircle, Star } from "lucide-react";
import { businessInfo } from "../data/business";

interface HeroProps {
  onOrderClick: () => void;
}

export const Hero = ({ onOrderClick }: HeroProps) => (
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
      <article>
        <img src="/Cachorro quente/Sem título1.jpeg" alt="" decoding="async" />
        <div>
          <strong>Pits Dog</strong>
          <span>Cachorro quente chodó</span>
        </div>
        <b>R$16</b>
      </article>
      <article>
        <img src="/Hambuerguer/Sem título5.jpeg" alt="" loading="lazy" decoding="async" />
        <div>
          <strong>Pits Burguer</strong>
          <span>Burger premium da casa</span>
        </div>
        <b>R$27</b>
      </article>
      <article>
        <img src="/Combos/ComboFamilia.jpeg" alt="" loading="lazy" decoding="async" />
        <div>
          <strong>Combo Família</strong>
          <span>Pedido completo para dividir</span>
        </div>
        <b>R$90</b>
      </article>
    </div>
  </section>
);
