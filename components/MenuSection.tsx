import { useMemo, useState } from "react";

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
  getItemQuantity: (itemId: string) => number;
}

export const MenuSection = ({
  categories,
  products,
  isLoading,
  storeConfig,
  onAddItem,
  getItemQuantity,
}: MenuSectionProps) => {
  const [activeCategory, setActiveCategory] = useState<MenuCategoryId>("");

  const currentCategory = activeCategory || categories[0]?.id || "";

  const activeCategoryInfo =
    categories.find((category) => category.id === currentCategory) ??
    categories[0];

  const filteredItems = useMemo(
    () => products.filter((item) => item.categoryId === currentCategory),
    [currentCategory, products]
  );

  return (
    <section className="section menu-section" id="cardapio">
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
          <strong>Pedidos pausados</strong>
          <span>
            O cardápio continua visível, mas a finalização fica bloqueada até o
            admin abrir a loja.
          </span>
        </div>
      )}

      {isLoading ? (
        <div className="menu-state">Carregando cardápio...</div>
      ) : categories.length === 0 ? (
        <div className="menu-state">Nenhuma categoria ativa encontrada.</div>
      ) : (
        <>
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
                disabled={!storeConfig.lojaAberta || item.inStock === false}
                onAddItem={onAddItem}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};