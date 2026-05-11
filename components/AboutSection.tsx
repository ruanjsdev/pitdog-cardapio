import { Bike, Flame, Utensils } from "lucide-react";

export const AboutSection = () => (
  <section className="about-strip" id="sobre">
    <div>
      <span>Sobre</span>
      <strong>Pits Dog: lanche rápido, forte e direto.</strong>
    </div>
    <div className="about-strip-tags" aria-label="Diferenciais">
      <span>
        <Flame size={16} />
        Sabor da casa
      </span>
      <span>
        <Bike size={16} />
        Delivery
      </span>
      <span>
        <Utensils size={16} />
        Retirada ou mesa
      </span>
    </div>
  </section>
);
