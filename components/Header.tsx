import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  cartCount: number;
  onCartOpen: () => void;
}

const navItems = [
  { label: "Sobre", href: "#sobre" },
  { label: "Contato", href: "#contato" },
  { label: "Atendimento", href: "#cardapio" }
];

export const Header = ({ cartCount, onCartOpen }: HeaderProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Pit’s Dog inicio">
        <img src="/assets/LogoPitis.png" alt="Pit’s Dog" />
        <span>Pits Dog</span>
      </a>

      <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Navegacao principal">
        {navItems.map((item) => (
          <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
            {item.label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <button className="icon-button mobile-only" type="button" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <button className="cart-button" type="button" onClick={onCartOpen}>
          <ShoppingBag size={20} />
          <span>Carrinho</span>
          {cartCount > 0 && <strong>{cartCount}</strong>}
        </button>
      </div>
    </header>
  );
};
