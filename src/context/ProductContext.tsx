import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, ProductVariant, CategoryItem } from '@/data/products';
import { productApi, categoryApi, ApiProduct, ApiCategory } from '@/services/api';

export type { Product, ProductVariant, CategoryItem };
export type Category = string;

interface ProductContextType {
  products: Product[];
  categories: CategoryItem[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (category: CategoryItem) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getActiveProducts: () => Product[];
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Transform API product to frontend Product
const transformApiProduct = (apiProduct: ApiProduct): Product => ({
  id: apiProduct._id,
  _id: apiProduct._id,
  name: apiProduct.name,
  description: apiProduct.description,
  mrp: apiProduct.mrp,
  price: apiProduct.price,
  discountPercent: apiProduct.discountPercent,
  category: typeof apiProduct.category === 'string' ? apiProduct.category : apiProduct.category._id,
  brand: apiProduct.brand,
  images: apiProduct.images,
  variants: apiProduct.variants,
  specifications: apiProduct.specifications || {},
  tags: apiProduct.tags || [],
  isActive: apiProduct.isActive,
  createdAt: apiProduct.createdAt,
  updatedAt: apiProduct.updatedAt,
});

// Transform API category to frontend CategoryItem
const transformApiCategory = (apiCategory: ApiCategory): CategoryItem => ({
  id: apiCategory._id,
  _id: apiCategory._id,
  name: apiCategory.name,
  displayName: apiCategory.displayName,
  slug: apiCategory.slug,
  description: apiCategory.description,
  image: apiCategory.image,
  icon: apiCategory.icon,
  parentCategory: apiCategory.parentCategory,
  level: apiCategory.level,
  order: apiCategory.order,
  isActive: apiCategory.isActive,
  productCount: apiCategory.productCount,
});

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: 'all', name: 'all', displayName: 'All', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop', isActive: true },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products from API
  const refreshProducts = async () => {
    try {
      const response = await productApi.getAll();
      if (response.success) {
        setProducts(response.data.map(transformApiProduct));
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    }
  };

  // Fetch categories from API
  const refreshCategories = async () => {
    try {
      const response = await categoryApi.getAll();
      if (response.success) {
        const apiCategories = response.data.map(transformApiCategory);
        // Always include "All" category at the start
        setCategories([
          { id: 'all', name: 'all', displayName: 'All', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop', isActive: true },
          ...apiCategories,
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Keep default categories on error
    }
  };

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([refreshProducts(), refreshCategories()]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await productApi.create({
        name: product.name,
        description: product.description,
        mrp: product.mrp,
        price: product.price,
        discountPercent: product.discountPercent,
        category: product.category,
        brand: product.brand,
        images: product.images,
        variants: product.variants,
        specifications: product.specifications,
        tags: product.tags,
        isActive: product.isActive,
      });
      if (response.success) {
        setProducts((prev) => [...prev, transformApiProduct(response.data)]);
      }
    } catch (err) {
      console.error('Failed to add product:', err);
      throw err;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const response = await productApi.update(id, {
        name: updates.name,
        description: updates.description,
        mrp: updates.mrp,
        price: updates.price,
        discountPercent: updates.discountPercent,
        category: updates.category,
        brand: updates.brand,
        images: updates.images,
        variants: updates.variants,
        specifications: updates.specifications,
        tags: updates.tags,
        isActive: updates.isActive,
      });
      if (response.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? transformApiProduct(response.data) : p))
        );
      }
    } catch (err) {
      console.error('Failed to update product:', err);
      throw err;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await productApi.delete(id);
      if (response.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      throw err;
    }
  };

  const addCategory = async (category: CategoryItem) => {
    try {
      const response = await categoryApi.create({
        name: category.name,
        displayName: category.displayName,
        description: category.description,
        image: category.image,
        icon: category.icon,
        parentCategory: category.parentCategory,
        level: category.level,
        order: category.order,
        isActive: category.isActive,
      });
      if (response.success) {
        setCategories((prev) => [...prev, transformApiCategory(response.data)]);
      }
    } catch (err) {
      console.error('Failed to add category:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    if (id === 'all') return;
    try {
      const response = await categoryApi.delete(id);
      if (response.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete category:', err);
      throw err;
    }
  };

  const getActiveProducts = () => products.filter((p) => p.isActive);

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        deleteCategory,
        getActiveProducts,
        refreshProducts,
        refreshCategories,
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
