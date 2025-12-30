import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Category = 'all' | 'protein' | 'energy' | 'recovery' | 'weight-management' | 'skincare' | 'makeup' | 'electronics' | 'clothing' | 'food' | 'books' | 'toys' | 'sports' | 'home' | 'beauty' | 'automotive' | 'other';

export interface ProductVariant {
  color: string;
  colorCode?: string;
  stock: number;
  images: string[];
  sku?: string;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  mrp: number;
  price: number;
  discountPercent: number;
  category: Category;
  brand?: string;
  images: string[];
  variants: ProductVariant[];
  specifications: Record<string, string>;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: Category;
  label: string;
}

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

const defaultCategories: CategoryItem[] = [
  { id: 'all', label: 'All Products' },
  { id: 'protein', label: 'Protein' },
  { id: 'energy', label: 'Energy' },
  { id: 'recovery', label: 'Recovery' },
  { id: 'weight-management', label: 'Weight Management' },
  { id: 'skincare', label: 'Skincare' },
  { id: 'makeup', label: 'Makeup' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'clothing', label: 'Clothing' },
  { id: 'food', label: 'Food' },
  { id: 'books', label: 'Books' },
  { id: 'toys', label: 'Toys' },
  { id: 'sports', label: 'Sports' },
  { id: 'home', label: 'Home' },
  { id: 'beauty', label: 'Beauty' },
  { id: 'automotive', label: 'Automotive' },
  { id: 'other', label: 'Other' },
];

const defaultProducts: Product[] = [
  {
    id: 'clean-whey-mango',
    name: 'Clean Whey',
    description: 'Crafted with premium protein from grass-fed cows. 24g protein, 4.6g BCAAs, 9g EAAs per serving.',
    mrp: 7499,
    price: 6229,
    discountPercent: 17,
    category: 'protein',
    brand: 'ShapeShift',
    images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop'],
    variants: [{ color: 'Mango Twist', colorCode: '#FFB347', stock: 50, images: [], sku: 'CW-MNG-001', isAvailable: true }],
    specifications: { weight: '900g', servings: '30' },
    tags: ['bestseller', 'protein'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'uc-hydra-veil-primer',
    name: 'Hydra Veil Matte Primer',
    description: 'The best base for a flawless, airbrushed look. Smooths skin texture, blurs pores and fine lines.',
    mrp: 850,
    price: 650,
    discountPercent: 24,
    category: 'skincare',
    brand: 'Urban Color',
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop'],
    variants: [{ color: 'Universal', colorCode: '#F5F5DC', stock: 100, images: [], sku: 'UC-HVP-001', isAvailable: true }],
    specifications: { weight: '30ml' },
    tags: ['new', 'skincare'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'uc-cc-cream',
    name: 'All-In-One CC Cream SPF 20',
    description: 'Color-correcting pigments that balance and brighten your complexion with SPF 20 protection.',
    mrp: 999,
    price: 799,
    discountPercent: 20,
    category: 'makeup',
    brand: 'Urban Color',
    images: ['https://images.unsplash.com/photo-1631214540553-ff44137c6168?w=400&h=400&fit=crop'],
    variants: [{ color: 'Rose', colorCode: '#FFB6C1', stock: 75, images: [], sku: 'UC-CC-001', isAvailable: true }],
    specifications: { weight: '30g', spf: '20' },
    tags: ['makeup', 'spf'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = localStorage.getItem('admin_products');
    return stored ? JSON.parse(stored) : defaultProducts;
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    const stored = localStorage.getItem('admin_categories');
    return stored ? JSON.parse(stored) : defaultCategories;
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
