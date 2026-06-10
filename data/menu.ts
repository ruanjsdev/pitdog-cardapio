import { MenuCategory, MenuItem } from "../types/menu";

export const categories: MenuCategory[] = [
  {
    id: "hotdogs",
    name: "CACHORRO-QUENTE",
    description: "Dogões no estilo Pit's com maionese caseira.",
    image: "/Cachorro quente/Sem título1.jpeg",
    headline: "Dogões no estilo Pit's",
    highlight: "Maionese, ketchup, milho, batata palha e recheios fortes."
  },
  {
    id: "sides",
    name: "BATATAS FRITAS",
    description: "Batatas crocantes e porções caprichadas.",
    image: "/Batata frita/Sem título.jpeg",
    headline: "Porções crocantes",
    highlight: "Batata simples ou com cheddar e bacon para compartilhar."
  },
  {
    id: "burgers",
    name: "HAMBÚRGUERES",
    description: "Hambúrgueres artesanais feitos na chapa.",
    image: "/Hambuerguer/Sem título5.jpeg",
    headline: "Burgers com pegada de rua",
    highlight: "Carne artesanal, queijo derretido e molho da casa."
  },
  {
    id: "extras",
    name: "ADICIONAIS",
    description: "Monte seu pedido do seu jeito.",
    image: "/assets/extra-neon.svg",
    headline: "Turbine seu lanche",
    highlight: "Bacon, cheddar, ovo, calabresa, barbecue e mais."
  }
];

const images = {
  burger: "/Hambuerguer/Amburg1.jpeg",
  hotdog: "/Cachorro quente/Sem título.jpeg",
  combo: "/Combos/Comboamigos.jpeg",
  drink: "/Refrigerante/copo.jpg",
  side: "/Batata frita/Sem título.jpeg",
  extra: "/assets/extra-neon.svg"
};

export const menuItems: MenuItem[] = [

  // ── CACHORRO-QUENTE ───────────────────────────────────────────────────────
  {
    id: "hot-dog",
    categoryId: "hotdogs",
    name: "HOT DOG",
    price: 9,
    description: "Salsicha, ketchup, maionese caseira, milho e batata palha.",
    image: images.hotdog
  },
  {
    id: "misto",
    categoryId: "hotdogs",
    name: "MISTO",
    price: 9,
    description: "Presunto e queijo, ketchup, maionese caseira, milho e batata palha.",
    image: images.hotdog
  },
  {
    id: "dogao",
    categoryId: "hotdogs",
    name: "DOGÃO",
    price: 10,
    description: "2 salsichas, ketchup, maionese caseira, milho e batata palha.",
    image: images.hotdog
  },
  {
    id: "calabresa-dog",
    categoryId: "hotdogs",
    name: "CALABRESA",
    price: 10,
    description: "Calabresa, ketchup, maionese caseira, milho e batata palha.",
    image: images.hotdog
  },
  {
    id: "bacon-dog",
    categoryId: "hotdogs",
    name: "BACON",
    price: 10,
    description: "Bacon em cubos, ketchup, maionese caseira, milho e batata palha.",
    image: images.hotdog
  },
  {
    id: "carne-seca-dog",
    categoryId: "hotdogs",
    name: "CARNE SECA",
    price: 10,
    description: "Carne desfiada, ketchup, maionese caseira, milho e batata palha.",
    image: images.hotdog
  },
  {
    id: "calabresa-salsicha",
    categoryId: "hotdogs",
    name: "CALABRESA + SALSICHA",
    price: 12,
    description: "Calabresa + salsicha, ketchup, maionese caseira, milho e batata palha.",
    image: images.hotdog
  },
  {
    id: "carne-seca-calabresa",
    categoryId: "hotdogs",
    name: "CARNE SECA + CALABRESA",
    price: 13,
    description: "Carne desfiada + calabresa, ketchup, maionese caseira, milho e batata palha.",
    image: images.hotdog
  },
  {
    id: "pits-dog",
    categoryId: "hotdogs",
    name: "PITS DOG",
    price: 16,
    description: "Carne desfiada + calabresa + queijo, ketchup, maionese caseira e batata palha.",
    image: images.hotdog
  },
  {
    id: "tudao",
    categoryId: "hotdogs",
    name: "TUDÃO",
    price: 22,
    description: "Salsicha + calabresa + bacon + ovo + presunto + queijo + carne desfiada + milho + ketchup + maionese caseira + batata palha.",
    image: images.hotdog
  },

  // ── BATATAS FRITAS ────────────────────────────────────────────────────────
  {
    id: "batata-simples",
    categoryId: "sides",
    name: "BATATA SIMPLES",
    price: 18,
    description: "200g.",
    image: images.side
  },
  {
    id: "batata-cheddar-bacon",
    categoryId: "sides",
    name: "BATATA CHEDDAR E BACON",
    price: 25,
    description: "200g.",
    image: images.side
  },
  {
    id: "batata-costela",
    categoryId: "sides",
    name: "BATATA COSTELA DESFIADA",
    price: 32,
    description: "250g de batata com cheddar, bacon e costela desfiada.",
    image: images.side
  },
  {
    id: "batata-maluca",
    categoryId: "sides",
    name: "BATATA MALUCA",
    price: 40,
    description: "300g de batata + carne desfiada + calabresa + bacon + cheddar.",
    image: images.side
  },

  // ── HAMBÚRGUERES ──────────────────────────────────────────────────────────
  {
    id: "x-salada",
    categoryId: "burgers",
    name: "X-SALADA",
    price: 10,
    description: "Presunto, queijo, alface e tomate. Sem hambúrguer.",
    image: images.burger
  },
  {
    id: "simples",
    categoryId: "burgers",
    name: "SIMPLES",
    price: 18,
    description: "Hambúrguer artesanal 100g, queijo, alface e tomate.",
    image: images.burger
  },
  {
    id: "pits-mac",
    categoryId: "burgers",
    name: "PITS MAC",
    price: 20,
    description: "Hambúrguer artesanal 100g, queijo, ovo, cheddar, alface e tomate.",
    image: images.burger
  },
  {
    id: "x-bacon",
    categoryId: "burgers",
    name: "X-BACON",
    price: 20,
    description: "Hambúrguer artesanal 100g, bacon, queijo, alface e tomate.",
    image: images.burger
  },
  {
    id: "x-calabresa",
    categoryId: "burgers",
    name: "X-CALABRESA",
    price: 20,
    description: "Hambúrguer artesanal 100g, calabresa, queijo, alface e tomate.",
    image: images.burger
  },
  {
    id: "x-eggs",
    categoryId: "burgers",
    name: "X-EGGS",
    price: 20,
    description: "Hambúrguer artesanal 100g, ovo, queijo, alface e tomate.",
    image: images.burger
  },
  {
    id: "x-egg-calabresa",
    categoryId: "burgers",
    name: "X-EGG CALABRESA",
    price: 22,
    description: "Hambúrguer artesanal 100g, ovo, calabresa, alface e tomate.",
    image: images.burger
  },
  {
    id: "x-egg-bacon",
    categoryId: "burgers",
    name: "X EGG BACON",
    price: 22,
    description: "Hambúrguer artesanal 100g, ovo, bacon, queijo, alface, tomate e presunto.",
    image: images.burger
  },
  {
    id: "crispy",
    categoryId: "burgers",
    name: "CRISPY",
    price: 26,
    description: "Hambúrguer artesanal 100g, queijo, bacon, cebola caramelizada, alface e tomate.",
    image: images.burger
  },
  {
    id: "pits-burguer",
    categoryId: "burgers",
    name: "PITS BURGUER",
    price: 28,
    description: "2 hambúrgueres artesanais 100g, queijo, cheddar, bacon, alface e tomate.",
    image: images.burger
  },
  {
    id: "x-tudo",
    categoryId: "burgers",
    name: "X TUDO",
    price: 35,
    description: "2 hambúrgueres artesanais 100g, queijo, ovo, bacon, salsicha, calabresa, cebola caramelizada, alface, tomate e presunto.",
    image: images.burger
  },
  {
    id: "burguer-costela",
    categoryId: "burgers",
    name: "BURGUER DE COSTELA",
    price: 36,
    description: "Hambúrguer artesanal 100g, cream cheese, costela desfiada, barbecue, queijo, alface e tomate.",
    image: images.burger
  },
  {
    id: "burguer-abacaxi",
    categoryId: "burgers",
    name: "BURGUER DE ABACAXI",
    price: 36,
    description: "Hambúrguer artesanal 100g, queijo, abacaxi no mel, barbecue, alface e tomate.",
    image: images.burger
  },
  {
    id: "aloprado",
    categoryId: "burgers",
    name: "ALOPRADO",
    price: 40,
    description: "3 hambúrgueres artesanais 100g, queijo, bacon, calabresa, alface e tomate.",
    image: images.burger
  },

  // ── ADICIONAIS ────────────────────────────────────────────────────────────
  {
    id: "salsicha-extra",
    categoryId: "extras",
    name: "Salsicha",
    price: 2,
    description: "Adicional de salsicha.",
    image: images.extra
  },
  {
    id: "calabresa-extra",
    categoryId: "extras",
    name: "Calabresa",
    price: 4,
    description: "Adicional de calabresa.",
    image: images.extra
  },
  {
    id: "ovo-extra",
    categoryId: "extras",
    name: "Ovo",
    price: 2,
    description: "Adicional de ovo.",
    image: images.extra
  },
  {
    id: "bacon-extra",
    categoryId: "extras",
    name: "Bacon",
    price: 5,
    description: "Adicional de bacon.",
    image: images.extra
  },
  {
    id: "queijo-mussarela",
    categoryId: "extras",
    name: "Queijo Mussarela",
    price: 5,
    description: "Adicional de queijo mussarela.",
    image: images.extra
  },
  {
    id: "molho-barbecue",
    categoryId: "extras",
    name: "Molho Barbecue",
    price: 5,
    description: "Adicional de molho barbecue.",
    image: images.extra
  },
  {
    id: "cebola-caramelizada",
    categoryId: "extras",
    name: "Cebola Caramelizada",
    price: 5,
    description: "Adicional de cebola caramelizada.",
    image: images.extra
  },
  {
    id: "carne-seca-extra",
    categoryId: "extras",
    name: "Carne Seca",
    price: 3,
    description: "Adicional de carne seca.",
    image: images.extra
  },
  {
    id: "costela-desfiada-extra",
    categoryId: "extras",
    name: "Costela Desfiada 30g",
    price: 6,
    description: "Adicional de costela desfiada.",
    image: images.extra
  },
  {
    id: "cheddar-extra",
    categoryId: "extras",
    name: "Cheddar",
    price: 5,
    description: "Adicional de cheddar.",
    image: images.extra
  },
  {
    id: "carne-hamburguer-extra",
    categoryId: "extras",
    name: "Carne de Hambúrguer 100g",
    price: 8,
    description: "Adicional de carne de hambúrguer.",
    image: images.extra
  },
  {
    id: "abacaxi-caramelizado-extra",
    categoryId: "extras",
    name: "Abacaxi Caramelizado",
    price: 6,
    description: "Adicional de abacaxi caramelizado.",
    image: images.extra
  },
  {
    id: "cream-cheese-extra",
    categoryId: "extras",
    name: "Cream Cheese",
    price: 5,
    description: "Adicional de cream cheese.",
    image: images.extra
  },
  {
    id: "batata-frita-extra",
    categoryId: "extras",
    name: "Batata Frita 80g",
    price: 8,
    description: "Adicional de batata frita.",
    image: images.extra
  },
  {
    id: "presunto-extra",
    categoryId: "extras",
    name: "Presunto",
    price: 2,
    description: "Adicional de presunto.",
    image: images.extra
  },
  {
    id: "alface-extra",
    categoryId: "extras",
    name: "Alface",
    price: 3,
    description: "Adicional de alface.",
    image: images.extra
  }
];