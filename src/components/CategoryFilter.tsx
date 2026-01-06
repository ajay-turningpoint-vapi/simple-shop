import React, { memo, useState } from "react";
import { useProducts } from "@/context/ProductContext";
import { Category } from "@/data/products";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CategoryFilterProps {
  selected: Category;
  onChange: (category: Category) => void;
}

const CategoryFilter = ({ selected, onChange }: CategoryFilterProps) => {
  const { categories } = useProducts();
  // Only one parent can be expanded at a time
  const [expandedParent, setExpandedParent] = useState<string | null>(null);

  // Filter to only show parent categories (has subcategories, or level 0, or parentCategory === null)
  const parentCategories = categories.filter(
    (cat) =>
      cat.id !== "all" &&
      ((cat.subcategories && cat.subcategories.length > 0) ||
        cat.level === 0 ||
        cat.parentCategory === null)
  );

  const toggleExpand = (categoryId: string) => {
    setExpandedParent((prev) => {
      // If clicking the same parent, collapse it
      if (prev === categoryId) {
        return null;
      }
      // Otherwise, expand the new one (collapses the previous)
      return categoryId;
    });
  };

  return (
    <div id="categories" className="-mx-3 px-3 md:mx-0 md:px-0">
      {/* ================= MOBILE ================= */}
      {/* Small cards | Horizontal scroll for parents */}
      <div className="md:hidden w-full">
        {/* Parent categories row */}
        <ScrollArea className="w-full">
          <div className="flex gap-2 py-2 pl-1">
            {categories.map((category) => {
              // Only show parent categories and "all" in the main row
              const isParent =
                category.id === "all" ||
                (category.subcategories && category.subcategories.length > 0) ||
                category.level === 0 ||
                category.parentCategory === null;

              if (!isParent) return null;

              const hasChildren =
                category.subcategories && category.subcategories.length > 0;
              const isExpanded = expandedParent === category.id;

              return (
                <button
                  key={category.id}
                  onClick={() => {
                    if (hasChildren) {
                      toggleExpand(category.id);
                    } else {
                      onChange(category.id);
                    }
                  }}
                  className={cn(
                    "flex-shrink-0 w-[calc(20%-8px)] rounded-md overflow-hidden transition-all relative",
                    selected === category.id
                      ? "ring-1 ring-primary"
                      : "bg-secondary/50"
                  )}
                >
                  {/* IMAGE – FULL WIDTH */}
                  <div className="w-full h-14 overflow-hidden">
                    <img
                      src={
                        category.image ||
                        "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop"
                      }
                      alt={category.displayName}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain bg-white"
                    />
                  </div>

                  {/* TEXT */}
                  <div
                    className={cn(
                      "px-1 py-0.5 text-[8px] font-medium text-center truncate relative",
                      selected === category.id
                        ? "text-primary"
                        : "text-foreground"
                    )}
                  >
                    {category.displayName}
                    {hasChildren && (
                      <span className="absolute top-0 right-0 text-[6px]">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Children categories row (shown when parent is expanded) - Pills style */}
        {parentCategories.map((parentCategory) => {
          const isExpanded = expandedParent === parentCategory.id;
          const hasChildren =
            parentCategory.subcategories &&
            parentCategory.subcategories.length > 0;

          if (!isExpanded || !hasChildren) return null;

          return (
            <div key={`children-${parentCategory.id}`} className="mt-2">
              <ScrollArea className="w-full">
                <div className="flex gap-2 py-2 pl-1">
                  {parentCategory.subcategories?.map((childCategory) => (
                    <button
                      key={childCategory.id}
                      onClick={() => onChange(childCategory.id)}
                      className={cn(
                        "flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                        selected === childCategory.id
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-secondary hover:bg-secondary/80"
                      )}
                    >
                      <img
                        src={
                          childCategory.image ||
                          "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop"
                        }
                        alt={childCategory.displayName}
                        loading="lazy"
                        decoding="async"
                        className="w-5 h-5 rounded-full object-contain bg-white flex-shrink-0"
                      />
                      <span className="truncate whitespace-nowrap">
                        {childCategory.displayName}
                      </span>
                    </button>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          );
        })}
      </div>

      {/* ================= DESKTOP ================= */}
      {/* 7 visible | scroll rest */}
      <ScrollArea className="hidden md:block w-full">
        <div
          className="flex gap-2 pb-2"
          style={{ maxWidth: "calc(7 * 140px)" }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onChange(category.id)}
              className={cn(
                "flex-shrink-0 w-[140px] flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                selected === category.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              <img
                src={
                  category.image ||
                  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop"
                }
                alt={category.displayName}
                loading="lazy"
                decoding="async"
                className="w-6 h-6 rounded-full object-contain bg-white"
              />
              <span className="truncate">{category.displayName}</span>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default memo(CategoryFilter);
