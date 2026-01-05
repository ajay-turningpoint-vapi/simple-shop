import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Product, ProductVariant, CategoryItem } from '@/data/products';
import { productApi, categoryApi, ApiProduct, ApiCategory } from '@/services/api';
import { extractArrayFromResponse } from '@/lib/utils';

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
  updateCategory: (id: string, category: Partial<CategoryItem>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getActiveProducts: () => Product[];
  refreshProducts: (params?: import('@/services/api').ProductQueryParams) => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Transform API product to frontend Product
const toImageItem = (i: any) => {
  if (!i) return { detail: { url: '' } };
  if (typeof i === 'string') return { detail: { url: i } };
  // already an object from API, keep fields
  return {
    filename: i?.filename,
    detail: i?.detail ? { filename: i.detail.filename, url: i.detail.url } : (i?.url ? { url: i.url } : undefined),
    thumb: i?.thumb ? { filename: i.thumb.filename, url: i.thumb.url } : undefined,
    alt: i?.alt || '',
    isPrimary: i?.isPrimary || false,
    uploadedAt: i?.uploadedAt,
  };
};

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
  images: Array.isArray(apiProduct.images) ? apiProduct.images.map(toImageItem) : [],
  variants: Array.isArray(apiProduct.variants) ? apiProduct.variants.map(v => ({ ...v, images: Array.isArray(v.images) ? v.images.map(toImageItem) : [] })) : [],
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
  const queryClient = useQueryClient();


  // Use shared extractor for API response arrays
  // (see src/lib/utils.ts)


  // Fetch products from API
  const refreshProducts = useCallback(async (params?: import('@/services/api').ProductQueryParams) => {
    try {
      const response = await queryClient.fetchQuery({ queryKey: ['products', params], queryFn: () => productApi.getAll(params) });
      if ((response as any).success) {
        const items = extractArrayFromResponse(response as any);
        setProducts(items.map(transformApiProduct));
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    }
  }, [queryClient]);

  // Fetch categories from API
  const refreshCategories = useCallback(async () => {
    try {
      const response = await queryClient.fetchQuery({ queryKey: ['categories'], queryFn: () => categoryApi.getAll() });
      if ((response as any).success) {
        const items = extractArrayFromResponse(response as any);
        if (items.length === 0) console.warn('No categories array found in response', response);
        const apiCategories = items.map(transformApiCategory);
        setCategories([
          { id: 'all', name: 'all', displayName: 'All', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop', isActive: true },
          ...apiCategories,
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Keep default categories on error
    }
  }, [queryClient]);

  // Use React Query to fetch products and categories and keep local state in sync
  const productsQuery = useQuery({
    queryKey: ['products', 'default'],
    queryFn: async () => productApi.getAll({ limit: 100 }),
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => categoryApi.getAll(),
  });

  // Keep local state in sync with React Query cache
  useEffect(() => {
    if (productsQuery.data && (productsQuery.data as any).success) {
      const items = extractArrayFromResponse(productsQuery.data as any);
      if (items.length === 0) {
        console.warn('No products array found in response', productsQuery.data);
      }
      setProducts(items.map(transformApiProduct));
    } else if (productsQuery.isError && productsQuery.error) {
      setError((productsQuery.error as Error).message);
    }
  }, [productsQuery.data, productsQuery.isError, productsQuery.error]);

  useEffect(() => {
    if (categoriesQuery.data && (categoriesQuery.data as any).success) {
      const items = extractArrayFromResponse(categoriesQuery.data as any);
      const apiCategories = items.map(transformApiCategory);
      setCategories([
        { id: 'all', name: 'all', displayName: 'All', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop', isActive: true },
        ...apiCategories,
      ]);
    }
  }, [categoriesQuery.data]);

  // Reflect loading state
  useEffect(() => {
    setLoading(productsQuery.isLoading || categoriesQuery.isLoading);
    if (productsQuery.isError && productsQuery.error) {
      setError((productsQuery.error as Error).message);
    }
  }, [productsQuery.isLoading, categoriesQuery.isLoading, productsQuery.isError, productsQuery.error]);

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
        // Invalidate products query so React Query will refetch and keep cache consistent
        queryClient.invalidateQueries({ queryKey: ['products'] });
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
        queryClient.invalidateQueries({ queryKey: ['products'] });
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
        queryClient.invalidateQueries({ queryKey: ['products'] });
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
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
    } catch (err) {
      console.error('Failed to add category:', err);
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<CategoryItem>) => {
    try {
      const response = await categoryApi.update(id, {
        displayName: updates.displayName,
        description: updates.description,
        image: updates.image,
        icon: updates.icon,
        parentCategory: updates.parentCategory,
        level: updates.level,
        order: updates.order,
        isActive: updates.isActive,
      });
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
    } catch (err) {
      console.error('Failed to update category:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    if (id === 'all') return;
    try {
      const response = await categoryApi.delete(id);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
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
        updateCategory,
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
