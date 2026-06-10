import { useEffect, useMemo, useState } from "react";

import { MenuCategory, MenuCategoryId, MenuItem } from "../types/menu";
import { StoreConfig } from "../types/store";

import { CategoryTabs } from "./CategoryTabs";
import { ProductCard } from "./ProductCard";

interface MenuSectionProps {
  categories: MenuCategory[];
  products: MenuItem[];
  isLoading: boolean;
  storeConfig: StoreConfig;
  onAddItem: (item: MenuItem) => void;
  onClosedAttempt: () => void;
  getItemQuantity: (itemId: string) => number;
}

export const MenuSection = ({
  categories,
  products,
  isLoading,
  storeConfig,
  onAddItem,
  onClosedAttempt,
  getItemQuantity,
}: MenuSectionProps) => {
  const [activeCategory, setActiveCategory] = useState<MenuCategoryId>("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!activeCategory) return;
    if (categories.some((category) => category.id === activeCategory)) return;

    setActiveCategory("");
  }, [activeCategory, categories]);

  const currentCategory = activeCategory || categories[0]?.id || "";
  const normalizedSearch = searchTerm
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

  const activeCategoryInfo =
    categories.find((category) => category.id === currentCategory) ??
    categories[0];

  const filteredItems = useMemo(
    () => products.filter((item) => {
      if (normalizedSearch) {
        const searchable = `${item.name} ${item.description} ${item.tag ?? ""}`
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

        return searchable.includes(normalizedSearch);
      }

      return item.categoryId === currentCategory;
    }),
    [currentCategory, normalizedSearch, products]
  );

  const getLocalProductTag = (item: MenuItem) => {
    const normalizedName = item.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    if (item.tag) return item.tag;
    if (item.type === "COMBO" || normalizedName.includes("combo")) return "combo recomendado";
    if (["1", "3", "7", "14"].includes(String(item.id)) || normalizedName.includes("x-tudo")) return "mais pedido";
    if (normalizedName.includes("aloprado") || normalizedName.includes("barca")) return "novo";

    return undefined;
  };

  return (
    <section className={`section menu-section ${storeConfig.lojaAberta ? "" : "is-store-closed"}`} id="cardapio">
      <div className="section-heading">
        <span>{storeConfig.lojaAberta ? "Loja aberta" : "Loja fechada"}</span>

        <h2>Escolha uma categoria</h2>

        <p>
          {storeConfig.lojaAberta
            ? `Tempo estimado: ${
                storeConfig.tempoEstimadoEntrega
              }. Atualmente você está em: ${
                activeCategoryInfo?.name ?? "cardápio"
              }.`
            : storeConfig.mensagemLojaFechada}
        </p>
      </div>

      {!storeConfig.lojaAberta && (
        <div className="store-status-banner">
          <strong>Loja fechada no momento</strong>
          <span>
            {storeConfig.mensagemLojaFechada || "O cardápio continua visível, mas os pedidos estão pausados."}
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="menu-state">Carregando cardápio...</div>
      ) : categories.length === 0 ? (
        <div className="menu-state">Nenhuma categoria ativa encontrada.</div>
      ) : (
        <>
          <div className="menu-search">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar hambúrguer, hot dog, combo, refrigerante..."
              type="search"
            />
          </div>

          <CategoryTabs
            categories={categories}
            activeCategory={currentCategory}
            onChange={setActiveCategory}
          />

          <div className="product-grid">
            {filteredItems.map((item) => (
              <ProductCard
                key={item.id}
                item={item}
                quantity={getItemQuantity(item.id)}
                disabled={item.inStock === false}
                displayTag={getLocalProductTag(item)}
                storeClosed={!storeConfig.lojaAberta}
                onAddItem={onAddItem}
                onClosedAttempt={onClosedAttempt}
              />
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="menu-state">Nenhum produto ativo encontrado nessa categoria.</div>
          )}
        </>
      )}
    </section>
  );
};
