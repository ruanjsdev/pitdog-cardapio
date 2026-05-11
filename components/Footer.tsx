import { Instagram, MapPin, Phone } from "lucide-react";
import { businessInfo } from "../data/business";

export const Footer = () => (
  <footer className="site-footer">
    <div className="footer-brand">
      <img src="/assets/LogoPitis.png" alt="" />
      <div>
        <strong>Pits Dog</strong>
        <span>Delivery premium urbano</span>
      </div>
    </div>
    <div className="footer-links">
      <a href={`tel:${businessInfo.phone.tel}`}>
        <Phone size={17} />
        {businessInfo.phone.display}
      </a>
      <a href={businessInfo.instagram.url} target="_blank" rel="noreferrer">
        <Instagram size={17} />
        {businessInfo.instagram.handle}
      </a>
      <a href={businessInfo.address.mapsUrl} target="_blank" rel="noreferrer">
        <MapPin size={17} />
        {businessInfo.address.display}
      </a>
    </div>
    <small>© 2026 Pits Dog. Todos os direitos reservados.</small>
  </footer>
);
