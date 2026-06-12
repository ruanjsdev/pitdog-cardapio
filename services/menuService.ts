import { categories as localCategories, menuItems as localMenuItems } from "../data/menu";
import { ApiRequestError } from "../types/api";
import { MenuCategory, MenuItem } from "../types/menu";
import { apiRequest, hasApiUrl } from "./apiClient";

type ApiCategory = {
  id: string | number;
  nome: string;
  descricao?: string;
  imagem?: string | null;
  imagemUrl?: string | null;
  imageUrl?: string | null;
  image?: string;
  headline?: string;
  highlight?: string;
  ordem?: number;
  ativo?: boolean;
};

type ApiProduct = {
  adicionalIds?: Array<string | number>;
  adicionaisIds?: Array<string | number>;
  addonIds?: Array<string | number>;
  additionalIds?: Array<string | number>;
  addons?: Array<{ id?: string | number; addonId?: string | number } | string | number>;
  id: string | number;
  nome: string;
  descricao?: string;
  preco: number;
  precoPromocional?: number | null;
  imagem?: string | null;
  imagemUrl?: string | null;
  imageUrl?: string | null;
  categoriaId: string | number;
  categoria?: { id?: string | number; nome?: string };
  categoriaNome?: string;
  ativo?: boolean;
  destaque?: boolean;
  highlight?: string;
  subtitulo?: string;
  ordem?: number;
  estoqueDisponivel?: boolean;
  permiteAdicionais?: boolean;
  allowsAdditionals?: boolean;
};

type ApiAdditional = {
  id: string | number;
  imageUrl?: string | null;
  imagem?: string | null;
  imagemUrl?: string | null;
  nomeAdicional?: string;
  nomedAicional?: string;
  nome?: string;
  preco: number;
  ativo?: boolean;
};

type ApiCombo = {
  id: string | number;
  nome: string;
  descricao?: string;
  preco: number;
  imagem?: string | null;
  imagemUrl?: string | null;
  imageUrl?: string | null;
  ativo?: boolean;
  destaque?: boolean;
  ordem?: number;
};

type PublicMenu = {
  categories: MenuCategory[];
  products: MenuItem[];
};

const publicMenuCacheKey = "pitsdog:public-menu:v1";
let pendingPublicMenuRequest: Promise<PublicMenu> | null = null;

type PublicMenuCache = {
  value: PublicMenu;
};

const readPublicMenuCache = () => {
  try {
    const rawCache = window.sessionStorage.getItem(publicMenuCacheKey);
    if (!rawCache) return null;

    return (JSON.parse(rawCache) as PublicMenuCache).value;
  } catch {
    return null;
  }
};

const writePublicMenuCache = (value: PublicMenu) => {
  try {
    window.sessionStorage.setItem(publicMenuCacheKey, JSON.stringify({ value } satisfies PublicMenuCache));
  } catch {
    // Fallback local de API evita tela vazia quando o rate limit responde 429.
  }
};

const wait = (delayMs: number) =>
  new Promise((resolve) => window.setTimeout(resolve, delayMs));

const publicApiRequest = async <T>(path: string): Promise<T> => {
  try {
    return await apiRequest<T>(path);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 429) {
      await wait(1200);
      return apiRequest<T>(path);
    }

    throw error;
  }
};

const mapCategory = (category: ApiCategory): MenuCategory => ({
  id: String(category.id),
  name: category.nome,
  description: category.descricao ?? "",
  image:
    category.imageUrl ?? category.imagemUrl ?? category.imagem ?? category.image ?? "/assets/pits-logo.svg",
  headline: category.headline ?? category.nome,
  highlight: category.highlight ?? category.descricao ?? "",
  ordem: category.ordem,
  ativo: category.ativo
});

const directProductPhotosById: Record<string, string> = {
  "1": "/Hambuerguer/Sem título.jpeg",
  "3": "/Hambuerguer/x-salada.jpeg",
  "4": "/Hambuerguer/xcalabresa.png",
  "5": "/Hambuerguer/x-egg.jpg",
  "6": "/Hambuerguer/Sem título1.jpeg",
  "7": "/Hambuerguer/x-bacon.jpeg",
  "8": "/Hambuerguer/Amburg1.jpeg",
  "9": "/Hambuerguer/aloprado.jpeg",
  "10": "/Hambuerguer/Sem título2.jpeg",
  "11": "/Hambuerguer/Sem título3.jpeg",
  "12": "/Hambuerguer/Sem título4.jpeg",
  "13": "/Hambuerguer/Sem título5.jpeg",
  "14": "/Hambuerguer/x-tudo.jpeg",
  "15": "/Cachorro quente/Sem título.jpeg",
  "16": "/Cachorro quente/Sem título1.jpeg",
  "17": "/Cachorro quente/Sem título2.jpeg",
  "18": "/Cachorro quente/Sem título.jpeg",
  "19": "/Cachorro quente/Sem título1.jpeg",
  "21": "/Cachorro quente/Sem título2.jpeg",
  "22": "/Cachorro quente/Sem título.jpeg",
  "23": "/Cachorro quente/Sem título1.jpeg",
  "24": "/Cachorro quente/Sem título2.jpeg",
  "25": "/Cachorro quente/Sem título.jpeg"
};

const directComboPhotosById: Record<string, string> = {
  "1": "/Combos/ComboBarca.jpeg",
  "2": "/Combos/Comboamigos.jpeg",
  "3": "/Combos/ComboCasal.jpeg",
  "4": "/Combos/ComboFamilia.jpeg"
};

const isUsableImageUrl = (value?: string | null) => {
  const imageUrl = value?.trim();
  if (!imageUrl) return false;
  if (imageUrl.includes("istockphoto.com/br/foto")) return false;
  return true;
};

const fallbackBurgerPhotos = [
  "/Hambuerguer/Amburg1.jpeg",
  "/Hambuerguer/Sem título.jpeg",
  "/Hambuerguer/Sem título1.jpeg",
  "/Hambuerguer/Sem título2.jpeg",
  "/Hambuerguer/Sem título3.jpeg",
  "/Hambuerguer/Sem título4.jpeg",
  "/Hambuerguer/Sem título5.jpeg",
  "/Hambuerguer/x-bacon.jpeg",
  "/Hambuerguer/x-egg.jpg",
  "/Hambuerguer/x-salada.jpeg",
  "/Hambuerguer/x-tudo.jpeg",
  "/Hambuerguer/xcalabresa.png",
  "/Hambuerguer/aloprado.jpeg"
];

const fallbackHotdogPhotos = [
  "/Cachorro quente/Sem título.jpeg",
  "/Cachorro quente/Sem título1.jpeg",
  "/Cachorro quente/Sem título2.jpeg"
];

const fallbackComboPhotos = [
  "/Combos/ComboBarca.jpeg",
  "/Combos/Comboamigos.jpeg",
  "/Combos/ComboCasal.jpeg",
  "/Combos/ComboFamilia.jpeg",
  "/Hambuerguer/Amburg1.jpeg",
  "/Batata frita/Sem título.jpeg"
];

const pickLocalFoodPhoto = (seed: string, categoryName?: string) => {
  const category = normalizeText(categoryName);
  const photos = category.includes("cachorro") || category.includes("hot")
    ? fallbackHotdogPhotos
    : category.includes("combo")
    ? fallbackComboPhotos
    : fallbackBurgerPhotos;
  const lock = Array.from(seed).reduce((total, char) => total + char.charCodeAt(0), 0);

  return photos[lock % photos.length];
};

export const clearPublicMenuCache = () => {
  try {
    window.sessionStorage.removeItem(publicMenuCacheKey);
    console.log("Public menu cache cleared.");
  } catch (error) {
    console.error("Failed to clear public menu cache:", error);
  }
};

const resolveProductImage = (product: ApiProduct) => {
  const imageUrl = product.imageUrl ?? product.imagemUrl ?? product.imagem;

  if (isUsableImageUrl(imageUrl)) {
    return imageUrl as string;
  }

  return directProductPhotosById[String(product.id)] ??
    pickLocalFoodPhoto(`${product.id}-${product.nome}`, product.categoriaNome ?? product.categoria?.nome);
};

const resolveComboImage = (combo: ApiCombo) => {
  const imageUrl = combo.imageUrl ?? combo.imagemUrl ?? combo.imagem;

  if (isUsableImageUrl(imageUrl)) {
    return imageUrl as string;
  }

  return directComboPhotosById[String(combo.id)] ??
    pickLocalFoodPhoto(`combo-${combo.id}-${combo.nome}`, "combo");
};

function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

const isBeverage = (product: ApiProduct) => {
  const categoryName = normalizeText(product.categoriaNome ?? product.categoria?.nome ?? "");
  const productName = normalizeText(product.nome);

  return categoryName.includes("bebida") || productName.includes("refri") || productName.includes("suco");
};

const getBeverageOptions = (name: string, description: string) => {
  const searchable = normalizeText(`${name} ${description}`);

  if (searchable.includes("suco")) {
    const knownJuiceFlavors = ["Maracujá", "Acerola", "Abacaxi", "Cajá", "Cupuaçu", "Goiaba", "Graviola", "Manga", "Uva"];
    const flavors = knownJuiceFlavors.filter((flavor) => searchable.includes(normalizeText(flavor)));

    return flavors.length > 0 ? flavors : undefined;
  }

  if (!searchable.includes("refrigerante") && !searchable.includes("refri")) return undefined;

  const knownSodaFlavors = [
    "Coca-Cola",
    "Coca-Cola Zero",
    "Guaraná",
    "Guaraná Zero",
    "Fanta Laranja",
    "Fanta Uva",
    "Sprite",
    "Pepsi",
    "Soda",
    "Kuat",
    "Jesus"
  ];
  const flavors = knownSodaFlavors.filter((flavor) => searchable.includes(normalizeText(flavor)));

  return flavors.length > 0 ? flavors : undefined;
};

const normalizeAddonIds = (product: ApiProduct) => {
  const directIds =
    product.addonIds ??
    product.additionalIds ??
    product.adicionalIds ??
    product.adicionaisIds;

  if (Array.isArray(directIds)) {
    return directIds.map(String);
  }

  if (Array.isArray(product.addons)) {
    return product.addons
      .map((addon) => {
        if (typeof addon === "string" || typeof addon === "number") return addon;
        return addon.addonId ?? addon.id;
      })
      .filter((id): id is string | number => id !== undefined && id !== null)
      .map(String);
  }

  return undefined;
};

const hiddenMarkerChars = /[\u2063\u200b\u200c\u200d\ufeff]/g;
const subtitleMarkerPatterns = [
  /@@pits[_-]subtitle:([^@]+)@@/i,
  /[\u2063\u200b\u200c\u200d\ufeff]*pits[_-]subtitle:([^\s<>&\u2063\u200b\u200c\u200d\ufeff.]+)[\u2063\u200b\u200c\u200d\ufeff]*/i
];

const decodeSubtitle = (value = "") => {
  try {
    return decodeURIComponent(value.trim());
  } catch {
    return value.trim();
  }
};

const cleanDescriptionAfterMarkerRemoval = (value = "") =>
  value
    .replace(hiddenMarkerChars, "")
    .replace(/\s*(?:\.{3}|…)\s*$/u, "")
    .trim();

const readProductDescription = (rawDescription = "") => {
  for (const pattern of subtitleMarkerPatterns) {
    const match = rawDescription.match(pattern);

    if (match?.[0]) {
      return {
        description: cleanDescriptionAfterMarkerRemoval(rawDescription.replace(match[0], "")),
        subtitle: decodeSubtitle(match[1])
      };
    }
  }

  return {
    description: cleanDescriptionAfterMarkerRemoval(rawDescription),
    subtitle: ""
  };
};

const mapProduct = (product: ApiProduct): MenuItem => {
  const name = product.nome;
  const decodedDescription = readProductDescription(product.descricao ?? "");
  const description = decodedDescription.description;
  const tagText =
    product.highlight ||
    product.subtitulo ||
    decodedDescription.subtitle ||
    (product.destaque ? "Destaque" : undefined);

  return {
    id: String(product.id),
    categoryId: String(product.categoriaId ?? product.categoria?.id ?? "sem-categoria"),
    type: "PRODUCT",
    name: name,
    description: description,
    price: product.precoPromocional ?? product.preco,
    promotionalPrice: product.precoPromocional,
    image: resolveProductImage(product),
    active: product.ativo,
    featured: product.destaque || !!(product.highlight || product.subtitulo || decodedDescription.subtitle),
    inStock: product.estoqueDisponivel,
    order: product.ordem,
    allowsAdditionals: isBeverage(product) ? false : product.permiteAdicionais ?? product.allowsAdditionals ?? true,
    addonIds: normalizeAddonIds(product),
    tag: tagText,
    options: getBeverageOptions(name, description)
  };
};

const mapAdditional = (additional: ApiAdditional): MenuItem => ({
  id: String(additional.id),
  categoryId: "extras",
  type: "ADDITIONAL",
  name: additional.nomeAdicional ?? additional.nomedAicional ?? additional.nome ?? "Adicional",
  description: "Adicional do pedido",
  price: additional.preco,
  image: additional.imageUrl ?? additional.imagemUrl ?? additional.imagem ?? "/assets/pits-logo.svg",
  active: additional.ativo,
  inStock: additional.ativo
});

const mapCombo = (combo: ApiCombo, categoryId = "combos"): MenuItem => ({
  id: String(combo.id),
  categoryId,
  type: "COMBO",
  name: combo.nome,
  description: combo.descricao ?? "",
  price: combo.preco,
  image: resolveComboImage(combo),
  active: combo.ativo,
  featured: combo.destaque,
  inStock: combo.ativo,
  order: combo.ordem,
  allowsAdditionals: false,
  tag: "Combo"
});

const isComboProduct = (product: ApiProduct) =>
  normalizeText(product.categoriaNome ?? product.categoria?.nome ?? "").includes("combo");

const filterMenuByCategories = (menu: PublicMenu, categories: MenuCategory[]) => {
  const activeCategoryIds = new Set(categories.map((category) => category.id));

  return {
    categories,
    products: menu.products.filter((item) =>
      item.type === "ADDITIONAL" || activeCategoryIds.has(item.categoryId)
    )
  };
};

const filterItemsByActiveCategories = (items: MenuItem[], categories: MenuCategory[]) => {
  const activeCategoryIds = new Set(categories.map((category) => category.id));

  return items.filter((item) =>
    item.type === "ADDITIONAL" || activeCategoryIds.has(item.categoryId)
  );
};

const loadPublicMenuFromApi = async (): Promise<PublicMenu> => {
  if (!hasApiUrl) {
    return {
      categories: localCategories,
      products: localMenuItems
    };
  }

  const [apiCategoriesResult, apiProductsResult, apiAdditionalsResult, apiCombosResult] = await Promise.allSettled([
    publicApiRequest<ApiCategory[]>("/categorias"),
    publicApiRequest<ApiProduct[]>("/produtos"),
    publicApiRequest<ApiAdditional[]>("/adicionais"),
    publicApiRequest<ApiCombo[]>("/combos")
  ]);

  let anyApiCallFulfilled = false;
  const cachedMenu = readPublicMenuCache();

  // Processamento de Categorias
  let categories: MenuCategory[] = [];
  if (apiCategoriesResult.status === "fulfilled") {
    anyApiCallFulfilled = true;
    categories = apiCategoriesResult.value
        .map(mapCategory)
        .filter((category) => category.ativo !== false)
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
    console.info("Categorias carregadas da API:", categories.map((category) => category.name));
  } else {
    console.warn("Nao foi possivel carregar /categorias da API.", apiCategoriesResult.reason);
    categories = cachedMenu?.categories ?? [];
  }

  // Processamento de Adicionais
  let additionalProducts: MenuItem[] = [];
  if (apiAdditionalsResult.status === "fulfilled") {
    anyApiCallFulfilled = true;
    additionalProducts = apiAdditionalsResult.value
        .map(mapAdditional)
        .filter((item) => item.active !== false && item.inStock !== false);
  } else {
    console.warn("Nao foi possivel carregar /adicionais da API.", apiAdditionalsResult.reason);
    additionalProducts = cachedMenu?.products.filter((item) => item.type === "ADDITIONAL") ?? [];
  }

  // Processamento de Produtos e Combos
  let products: MenuItem[] = [];
  let combos: MenuItem[] = [];

  const combosCategory = categories.find((category) =>
    normalizeText(category.name).includes("combo")
  );
  const combosCategoryId = combosCategory?.id;

  if (apiProductsResult.status === "fulfilled") {
    anyApiCallFulfilled = true;
    products = apiProductsResult.value
      .filter((product) => !isComboProduct(product))
      .map(mapProduct)
      .filter((item) => item.active !== false && item.inStock !== false)
      .filter((item) => categories.some((category) => category.id === item.categoryId))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const comboProductsFromApi = combosCategoryId
      ? apiProductsResult.value
          .filter(isComboProduct)
          .map((product) => ({
            ...mapProduct(product),
            categoryId: combosCategoryId,
            tag: "Combo"
          }))
          .filter((item) => item.active !== false && item.inStock !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : [];

    if (apiCombosResult.status === "fulfilled") {
      anyApiCallFulfilled = true;
      if (combosCategoryId && apiCombosResult.value.length > 0) {
        combos = apiCombosResult.value
            .map((combo) => mapCombo(combo, combosCategoryId))
            .filter((item) => item.active !== false && item.inStock !== false);
      } else {
        combos = comboProductsFromApi;
      }
    } else {
      console.warn("Nao foi possivel carregar /combos da API.", apiCombosResult.reason);
      combos = comboProductsFromApi;
    }
  } else {
    console.warn("Nao foi possivel carregar /produtos da API.", apiProductsResult.reason);
    products = cachedMenu?.products.filter((item) => item.type !== "COMBO" && item.type !== "ADDITIONAL") ?? [];
    combos = cachedMenu?.products.filter((item) => item.type === "COMBO") ?? [];
  }

  if (!anyApiCallFulfilled || (categories.length === 0 && products.length === 0 && additionalProducts.length === 0 && combos.length === 0)) {
    clearPublicMenuCache();
    return { categories: [], products: [] };
  }

  const menu = {
    categories: categories,
    products: filterItemsByActiveCategories([...products, ...combos, ...additionalProducts], categories)
  };

  writePublicMenuCache(menu);
  return menu;
};

export const getPublicMenu = async () => {
  if (!hasApiUrl) return loadPublicMenuFromApi();

  if (pendingPublicMenuRequest) return pendingPublicMenuRequest;

  pendingPublicMenuRequest = loadPublicMenuFromApi()
    .finally(() => {
      pendingPublicMenuRequest = null;
    });

  return pendingPublicMenuRequest;
};
