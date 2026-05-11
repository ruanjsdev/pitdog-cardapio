import { Instagram, MapPin, Phone } from "lucide-react";
import { businessInfo } from "../data/business";

export const ContactSection = () => (
  <section className="section contact-section" id="contato">
    <div className="section-heading compact">
      <span>Informações</span>
      <h2>Fale com o Pits Dog</h2>
    </div>

    <div className="contact-grid">
      <a
        href={`https://wa.me/${businessInfo.phone.whatsapp}?text=${encodeURIComponent("Boa noite 🌭😋")}`}
        target="_blank"
        rel="noreferrer"
      >
        <Phone size={24} />
        <span>Telefone e WhatsApp</span>
        <strong>{businessInfo.phone.display}</strong>
      </a>
      <a href={businessInfo.instagram.url} target="_blank" rel="noreferrer">
        <Instagram size={24} />
        <span>Instagram</span>
        <strong>{businessInfo.instagram.handle}</strong>
      </a>
      <a href={businessInfo.address.mapsUrl} target="_blank" rel="noreferrer">
        <MapPin size={24} />
        <span>Localização</span>
        <strong>{businessInfo.address.display}</strong>
      </a>
    </div>
  </section>
);
