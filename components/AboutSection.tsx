import { Bike, Flame, Store } from "lucide-react";

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
        <Store size={16} />
        Retirada no balcão
      </span>
    </div>
  </section>
);
