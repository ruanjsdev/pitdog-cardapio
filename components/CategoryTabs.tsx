import { MenuCategory, MenuCategoryId } from "../types/menu";

interface CategoryTabsProps {
  categories: MenuCategory[];
  activeCategory: MenuCategoryId;
  onChange: (categoryId: MenuCategoryId) => void;
}

export const CategoryTabs = ({ categories, activeCategory, onChange }: CategoryTabsProps) => (
  <div className="category-tabs" role="tablist" aria-label="Categorias do cardapio">
    {categories.map((category) => (
      <button
        key={category.id}
        className={activeCategory === category.id ? "is-active" : ""}
        type="button"
        role="tab"
        aria-selected={activeCategory === category.id}
        onClick={() => onChange(category.id)}
      >
        <img src={category.image} alt="" loading="lazy" decoding="async" />
        {category.name}
      </button>
    ))}
  </div>
);
