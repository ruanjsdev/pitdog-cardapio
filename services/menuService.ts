import { categories as localCategories, menuItems as localMenuItems } from "../data/menu";
import { MenuCategory, MenuItem } from "../types/menu";
import { apiRequest, hasApiUrl } from "./apiClient";

type ApiCategory = {
  id: string | number;
  nome: string;
  descricao?: string;
  imagem?: string | null;
  imagemUrl?: string | null;
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
  imagemUrl?: string | null;
  categoriaId: string | number;
  categoriaNome?: string;
  ativo?: boolean;
  destaque?: boolean;
  ordem?: number;
  estoqueDisponivel?: boolean;
};

type ApiAdditional = {
  id: string | number;
  nomeAdicional?: string;
  nomedAicional?: string;
  preco: number;
  ativo?: boolean;
};

const mapCategory = (category: ApiCategory): MenuCategory => ({
  id: String(category.id),
  name: category.nome,
  description: category.descricao ?? "",
  image:
    category.imagem ?? category.imagemUrl ?? category.image ?? "/assets/pits-logo.svg",
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
  image: product.imagem ?? product.imagemUrl ?? "/assets/pits-logo.svg",
  active: product.ativo,
  featured: product.destaque,
  inStock: product.estoqueDisponivel,
  order: product.ordem,
  tag: product.destaque ? "Destaque" : undefined
});

const mapAdditional = (additional: ApiAdditional): MenuItem => ({
  id: String(additional.id),
  categoryId: "extras",
  name: additional.nomeAdicional ?? additional.nomedAicional ?? "Adicional",
  description: "Adicional do pedido",
  price: additional.preco,
  image: "/assets/pits-logo.svg",
  active: additional.ativo,
  inStock: additional.ativo
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

  const [apiCategoriesResult, apiProductsResult, apiAdditionalsResult] = await Promise.allSettled([
    apiRequest<ApiCategory[]>("/categorias/1"),
    apiRequest<ApiProduct[]>("/produtos"),
    apiRequest<ApiAdditional[]>("/adicionais")
  ]);

  const hasApiCategories =
    apiCategoriesResult.status === "fulfilled" &&
    apiCategoriesResult.value.length > 0;
  const hasApiProducts =
    apiProductsResult.status === "fulfilled" && apiProductsResult.value.length > 0;

  const categories = hasApiCategories
    ? apiCategoriesResult.value
        .map(mapCategory)
        .filter((category) => category.ativo !== false)
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
    : hasApiProducts
    ? Array.from(
        new Map(
          apiProductsResult.value.map((product) => [
            String(product.categoriaId),
            {
              id: String(product.categoriaId),
              name: product.categoriaNome ?? "Categoria",
              description: "",
              image: "/assets/pits-logo.svg",
              headline: product.categoriaNome ?? "Categoria",
              highlight: ""
            }
          ])
        ).values()
      )
    : apiCategoriesResult.status === "rejected" || apiProductsResult.status === "rejected"
    ? localCategories
    : [];

  if (hasApiCategories) {
    console.info("Categorias carregadas da API:", categories.map((category) => category.name));
  }

  if (apiCategoriesResult.status === "fulfilled" && !hasApiCategories) {
    console.info("A API de categorias respondeu, mas nao retornou categorias ativas.");
  }

  if (apiCategoriesResult.status === "rejected") {
    console.warn("Usando categorias locais porque /categorias nao respondeu.", apiCategoriesResult.reason);
  }

  const products =
    hasApiProducts
      ? apiProductsResult.value
          .map(mapProduct)
          .filter((item) => item.active !== false && item.inStock !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : apiProductsResult.status === "rejected"
      ? remapLocalProductsToApiCategories(categories)
      : [];

  if (apiProductsResult.status === "rejected") {
    console.warn("Usando produtos locais porque /produtos nao respondeu.", apiProductsResult.reason);
  }

  if (apiProductsResult.status === "fulfilled" && !hasApiProducts) {
    console.info("A API de produtos respondeu, mas nao retornou produtos ativos.");
  }

  const additionalProducts =
    apiAdditionalsResult.status === "fulfilled"
      ? apiAdditionalsResult.value
          .map(mapAdditional)
          .filter((item) => item.active !== false && item.inStock !== false)
      : localMenuItems.filter((item) => item.categoryId === "extras");

  if (apiAdditionalsResult.status === "rejected") {
    console.warn("Usando adicionais locais porque /adicionais nao respondeu.", apiAdditionalsResult.reason);
  }

  return { categories, products: [...products, ...additionalProducts] };
};
