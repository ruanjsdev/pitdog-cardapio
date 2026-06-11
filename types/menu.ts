export type MenuCategoryId = string;

export interface MenuCategory {
  id: MenuCategoryId;
  name: string;
  description: string;
  image: string;
  headline: string;
  highlight: string;
  ordem?: number;
  ativo?: boolean;
}

export interface MenuItem {
  id: string;
  categoryId: MenuCategoryId;
  type?: "PRODUCT" | "COMBO" | "ADDITIONAL";
  name: string;
  description: string;
  price: number;
  promotionalPrice?: number | null;
  tag?: string;
  image: string;
  active?: boolean;
  featured?: boolean;
  inStock?: boolean;
  order?: number;
  allowsAdditionals?: boolean;
  additionals?: MenuAdditional[];
  options?: string[];
}

export interface MenuAdditional {
  id: string;
  name: string;
  price: number;
}
