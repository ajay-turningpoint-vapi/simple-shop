import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { products as defaultProductsData, categories as defaultCategoriesData, Product, Category, CategoryItem, ProductVariant } from '@/data/products';

export type { Product, Category, CategoryItem, ProductVariant };

interface ProductContextType {
  products: Product[];
  categories: CategoryItem[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: CategoryItem) => void;
  deleteCategory: (id: Category) => void;
  getActiveProducts: () => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem('admin_products');
    return stored ? JSON.parse(stored) : defaultProductsData;
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const stored = localStorage.getItem('admin_categories');
    return stored ? JSON.parse(stored) : defaultCategoriesData;
  });

  useEffect(() => {
    localStorage.setItem('admin_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('admin_categories', JSON.stringify(categories));
  }, [categories]);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const addCategory = (category: CategoryItem) => {
    setCategories((prev) => {
      if (prev.find((c) => c.id === category.id)) return prev;
      return [...prev, category];
    });
  };

  const deleteCategory = (id: Category) => {
    if (id === 'all') return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const getActiveProducts = () => products.filter((p) => p.isActive);

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        deleteCategory,
        getActiveProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
