import { MenuCategory, MenuItem } from "../types/menu";

export const categories: MenuCategory[] = [
  {
    id: "burgers",
    name: "Burgers",
    description: "Clássicos fortes, altos e feitos para matar a fome.",
    image: "/Hambuerguer/Sem título5.jpeg",
    headline: "Burgers com pegada de rua",
    highlight: "Carne artesanal, queijo derretido e molho da casa."
  },
  {
    id: "hotdogs",
    name: "Cachorro Quente",
    description: "O nome da casa em versões rápidas e caprichadas.",
    image: "/Cachorro quente/Sem título1.jpeg",
    headline: "Dogões no estilo Pit's",
    highlight: "Maionese, ketchup, milho, batata palha e recheios fortes."
  },
  {
    id: "combos",
    name: "Combos",
    description: "Pedidos prontos para casal, amigos e família.",
    image: "/Combos/Comboamigos.jpeg",
    headline: "Combos para pedir sem pensar",
    highlight: "Opções completas para dividir, economizar e chegar rápido."
  },
  {
    id: "drinks",
    name: "Bebidas",
    description: "Geladas para acompanhar o pedido.",
    image: "/Refrigerante/Sem título.jpeg",
    headline: "Bebidas geladas",
    highlight: "Refrigerante, suco, água e cervejas para fechar o pedido."
  },
  {
    id: "sides",
    name: "Porções",
    description: "Batata crocante e acompanhamentos.",
    image: "/Batata frita/Sem título.jpeg",
    headline: "Porções crocantes",
    highlight: "Batata simples ou com cheddar e bacon para compartilhar."
  },
  {
    id: "extras",
    name: "Adicionais",
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

  // ── BURGERS ──────────────────────────────────────────────────────────────
  {
    id: "x-salada",
    categoryId: "burgers",
    name: "X-Salada",
    price: 10,
    description: "Presunto, queijo, alface, tomate e cebola. Não acompanha carne de hambúrguer.",
    image: images.burger,
    tag: "Entrada"
  },
  {
    id: "simples",
    categoryId: "burgers",
    name: "Simples",
    price: 16,
    description: "1 carne de 100g artesanal, alface, tomate, cebola e queijo.",
    image: images.burger
  },
  {
    id: "x-calabresa",
    categoryId: "burgers",
    name: "X Calabresa",
    price: 20,
    description: "1 carne de 100g artesanal, alface, tomate, cebola, queijo e calabresa.",
    image: images.burger
  },
  {
    id: "x-bacon",
    categoryId: "burgers",
    name: "X Bacon",
    price: 20,
    description: "1 carne de 100g artesanal, alface, tomate, cebola, queijo e bacon.",
    image: images.burger,
    tag: "Mais pedido"
  },
  {
    id: "x-egg",
    categoryId: "burgers",
    name: "X Egg",
    price: 20,
    description: "1 carne de 100g artesanal, alface, tomate, cebola, queijo, presunto e ovo.",
    image: images.burger
  },
  {
    id: "pits-mac",
    categoryId: "burgers",
    name: "Pits Mac",
    price: 20,
    description: "1 carne de 100g artesanal, alface, tomate, cebola, queijo, ovo e cheddar.",
    image: images.burger,
    tag: "Da casa"
  },
  {
    id: "x-egg-bacon",
    categoryId: "burgers",
    name: "X Egg Bacon",
    price: 22,
    description: "1 carne de 100g artesanal, alface, tomate, cebola, queijo, presunto, ovo e bacon.",
    image: images.burger
  },
  {
    id: "crispy",
    categoryId: "burgers",
    name: "Crispy",
    price: 25,
    description: "1 carne de 100g, alface, tomate, cebola caramelizada, 2 fatias de queijo, cheddar e bacon.",
    image: images.burger
  },
  {
    id: "pits-burguer",
    categoryId: "burgers",
    name: "Pits Burguer",
    price: 27,
    description: "2 carnes de 100g artesanal, alface, tomate, cebola, 2 fatias de queijo cheddar e bacon.",
    image: images.burger,
    tag: "Premium"
  },
  {
    id: "x-tudo",
    categoryId: "burgers",
    name: "X-Tudo",
    price: 34,
    description: "2 carnes de 100g artesanal, queijo, alface, tomate, cebola caramelizada, ovo, bacon, calabresa, 2 salsichas e cheddar.",
    image: images.burger
  },
  {
    id: "aloprado",
    categoryId: "burgers",
    name: "Aloprado",
    price: 40,
    description: "3 carnes de 100g artesanal, alface, tomate, cebola, 2 fatias de queijo, bacon e calabresa.",
    image: images.burger,
    tag: "Gigante"
  },

  // ── CACHORRO QUENTE ───────────────────────────────────────────────────────
  {
    id: "hot-dog",
    categoryId: "hotdogs",
    name: "Hot Dog",
    price: 8,
    description: "1 salsicha, maionese, ketchup, milho e batata palha.",
    image: images.hotdog
  },
  {
    id: "dogao",
    categoryId: "hotdogs",
    name: "Dogão",
    price: 9,
    description: "2 salsichas, maionese, ketchup, milho e batata palha.",
    image: images.hotdog,
    tag: "Clássico"
  },
  {
    id: "misto",
    categoryId: "hotdogs",
    name: "Misto",
    price: 8,
    description: "Presunto, queijo, maionese, ketchup, milho e batata palha.",
    image: images.hotdog
  },
  {
    id: "calabresa-dog",
    categoryId: "hotdogs",
    name: "Calabresa",
    price: 10,
    description: "1 calabresa, ketchup, maionese caseira, milho e batata palha.",
    image: images.hotdog
  },
  {
    id: "bacon-dog",
    categoryId: "hotdogs",
    name: "Bacon",
    price: 10,
    description: "Bacon em cubos, ketchup, maionese caseira, milho e batata palha.",
    image: images.hotdog
  },
  {
    id: "carne-seca-dog",
    categoryId: "hotdogs",
    name: "Carne Seca",
    price: 10,
    description: "Carne desfiada, ketchup, maionese caseira, milho e batata palha.",
    image: images.hotdog
  },
  {
    id: "calabresa-salsicha",
    categoryId: "hotdogs",
    name: "Calabresa + Salsicha",
    price: 12,
    description: "1 calabresa, 1 salsicha, ketchup, maionese, milho e batata palha.",
    image: images.hotdog
  },
  {
    id: "carne-seca-calabresa",
    categoryId: "hotdogs",
    name: "Carne Seca + Calabresa",
    price: 13,
    description: "Carne desfiada, calabresa, maionese, ketchup, milho e batata palha.",
    image: images.hotdog
  },
  {
    id: "pits-dog",
    categoryId: "hotdogs",
    name: "Pits Dog",
    price: 16,
    description: "Carne desfiada, queijo, calabresa, maionese, ketchup, milho e batata palha.",
    image: images.hotdog,
    tag: "Assinatura"
  },
  {
    id: "tudao-cachorro-quente",
    categoryId: "hotdogs",
    name: "Tudão Cachorro Quente",
    price: 22,
    description: "1 salsicha, 1 calabresa, presunto, queijo, bacon, ovo, carne desfiada, maionese, ketchup, milho e batata palha.",
    image: images.hotdog
  },

  // ── COMBOS ────────────────────────────────────────────────────────────────
  {
    id: "combo-barca",
    categoryId: "combos",
    name: "Combo Barca",
    price: 32,
    description: "1 X-Egg Bacon + meia porção de batata com cheddar e bacon.",
    image: images.combo
  },
  {
    id: "combo-casal",
    categoryId: "combos",
    name: "Combo Casal",
    price: 50,
    description: "2 hambúrgueres simples + porção de batata com cheddar e calabresa + 1 Guaraná 1L.",
    image: images.combo,
    tag: "Casal"
  },
  {
    id: "combo-amigos",
    categoryId: "combos",
    name: "Combo Amigos",
    price: 70,
    description: "3 hambúrgueres simples + porção de batata com cheddar e calabresa + 1 Guaraná 1L.",
    image: images.combo
  },
  {
    id: "combo-familia",
    categoryId: "combos",
    name: "Combo Família",
    price: 90,
    description: "4 hambúrgueres simples + porção de batata com calabresa e cheddar + Guaraná 1L.",
    image: images.combo,
    tag: "Família"
  },

  // ── BEBIDAS ───────────────────────────────────────────────────────────────
  {
    id: "agua",
    categoryId: "drinks",
    name: "Água",
    price: 4,
    description: "Água gelada.",
    image: images.drink
  },
  {
    id: "suco-copo",
    categoryId: "drinks",
    name: "Suco no Copo (320ml)",
    price: 7,
    description: "Suco gelado. Sabores: Maracujá e Acerola.",
    image: images.drink
  },
  {
    id: "refrigerante-lata",
    categoryId: "drinks",
    name: "Refrigerante Lata",
    price: 6,
    description: "Refrigerante gelado em lata.",
    image: images.drink
  },
  {
    id: "refrigerante-1l",
    categoryId: "drinks",
    name: "Refrigerante 1L",
    price: 10,
    description: "Refrigerante gelado 1 litro.",
    image: images.drink
  },
  {
    id: "refrigerante-2l",
    categoryId: "drinks",
    name: "Refrigerante 2L",
    price: 14,
    description: "Refrigerante gelado 2 litros.",
    image: images.drink
  },
  {
    id: "corona",
    categoryId: "drinks",
    name: "Corona",
    price: 12,
    description: "Cerveja Corona gelada.",
    image: images.drink
  },
  {
    id: "heineken",
    categoryId: "drinks",
    name: "Heineken",
    price: 12,
    description: "Cerveja Heineken gelada.",
    image: images.drink
  },
  {
    id: "skol-600ml",
    categoryId: "drinks",
    name: "Skol 600ml",
    price: 10,
    description: "Cerveja Skol gelada 600ml.",
    image: images.drink
  },

  // ── PORÇÕES ───────────────────────────────────────────────────────────────
  {
    id: "batata-simples",
    categoryId: "sides",
    name: "Batata Simples",
    price: 15,
    description: "200g de batata frita crocante.",
    image: images.side
  },
  {
    id: "batata-cheddar-bacon",
    categoryId: "sides",
    name: "Batata com Cheddar e Bacon",
    price: 22,
    description: "200g de batata frita com cheddar derretido e bacon.",
    image: images.side,
    tag: "Crocante"
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
    price: 3,
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
    id: "cheddar-extra",
    categoryId: "extras",
    name: "Cheddar",
    price: 3,
    description: "Adicional de cheddar.",
    image: images.extra
  },
  {
    id: "carne-seca-extra",
    categoryId: "extras",
    name: "Carne Seca",
    price: 3,
    description: "Adicional de carne seca desfiada.",
    image: images.extra
  },
  {
    id: "queijo-mussarela",
    categoryId: "extras",
    name: "Queijo Mussarela",
    price: 4,
    description: "Adicional de queijo mussarela.",
    image: images.extra
  },
  {
    id: "molho-barbecue",
    categoryId: "extras",
    name: "Molho Barbecue",
    price: 3,
    description: "Adicional de molho barbecue.",
    image: images.extra
  },
  {
    id: "bacon-extra",
    categoryId: "extras",
    name: "Bacon",
    price: 4,
    description: "Adicional de bacon.",
    image: images.extra
  },
  {
    id: "carne-hamburguer",
    categoryId: "extras",
    name: "Carne de Hambúrguer",
    price: 6,
    description: "Adicional de carne de hambúrguer artesanal 100g.",
    image: images.extra
  },
  {
    id: "cebola-caramelizada",
    categoryId: "extras",
    name: "Cebola Caramelizada",
    price: 3,
    description: "Adicional de cebola caramelizada.",
    image: images.extra
  }
];