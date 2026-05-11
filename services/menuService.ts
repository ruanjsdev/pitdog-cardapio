import { categories as localCategories, menuItems as localMenuItems } from "../data/menu";
import { MenuCategory, MenuItem } from "../types/menu";
import { apiRequest, hasApiUrl } from "./apiClient";

type ApiCategory = {
  id: string | number;
  nome: string;
  descricao?: string;
  imagem?: string | null;
  image?: string;
  headline?: string;
  highlight?: string;
  ordem?: number;
  ativo?: boolean;
};

type ApiProduct = {
  id: string | number;
  nome: string;
  descricao?: string;
  preco: number;
  precoPromocional?: number | null;
  imagem?: string | null;
  categoriaId: string | number;
  ativo?: boolean;
  destaque?: boolean;
  ordem?: number;
  estoqueDisponivel?: boolean;
};

const mapCategory = (category: ApiCategory): MenuCategory => ({
  id: String(category.id),
  name: category.nome,
  description: category.descricao ?? "",
  image: category.imagem ?? category.image ?? "/assets/pits-logo.svg",
  headline: category.headline ?? category.nome,
  highlight: category.highlight ?? category.descricao ?? "",
  ordem: category.ordem,
  ativo: category.ativo
});

const mapProduct = (product: ApiProduct): MenuItem => ({
  id: String(product.id),
  categoryId: String(product.categoriaId),
  name: product.nome,
  description: product.descricao ?? "",
  price: product.precoPromocional ?? product.preco,
  promotionalPrice: product.precoPromocional,
  image: product.imagem ?? "/assets/pits-logo.svg",
  active: product.ativo,
  featured: product.destaque,
  inStock: product.estoqueDisponivel,
  order: product.ordem,
  tag: product.destaque ? "Destaque" : undefined
});

const categoryFallbackMap: Record<string, string> = {
  "1": "burgers",
  "2": "drinks",
  "3": "combos"
};

const remapLocalProductsToApiCategories = (categories: MenuCategory[]) =>
  localMenuItems.map((item) => {
    const apiCategory = categories.find(
      (category) => categoryFallbackMap[category.id] === item.categoryId
    );

    return apiCategory
      ? {
          ...item,
          categoryId: apiCategory.id
        }
      : item;
  });

export const getPublicMenu = async () => {
  if (!hasApiUrl) {
    return {
      categories: localCategories,
      products: localMenuItems
    };
  }

  const [apiCategoriesResult, apiProductsResult] = await Promise.allSettled([
    apiRequest<ApiCategory[]>("/categorias"),
    apiRequest<ApiProduct[]>("/produtos")
  ]);

  const categories =
    apiCategoriesResult.status === "fulfilled"
      ? apiCategoriesResult.value
          .map(mapCategory)
          .filter((category) => category.ativo !== false)
          .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
      : localCategories;

  if (apiCategoriesResult.status === "fulfilled") {
    console.info("Categorias carregadas da API:", categories.map((category) => category.name));
  }

  if (apiCategoriesResult.status === "rejected") {
    console.warn("Usando categorias locais porque /categorias nao respondeu.", apiCategoriesResult.reason);
  }

  const products =
    apiProductsResult.status === "fulfilled"
      ? apiProductsResult.value
          .map(mapProduct)
          .filter((item) => item.active !== false && item.inStock !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : remapLocalProductsToApiCategories(categories);

  if (apiProductsResult.status === "rejected") {
    console.warn("Usando produtos locais porque /produtos nao respondeu.", apiProductsResult.reason);
  }

  return { categories, products };
};
