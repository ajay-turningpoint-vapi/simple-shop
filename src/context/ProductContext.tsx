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

const transformApiProduct = (apiProduct: ApiProduct | null): Product | null => {
  if (!apiProduct || !apiProduct._id) {
    return null;
  }

  // Handle category - can be string, object with _id, or null
  let categoryId: string = 'other';
  if (typeof apiProduct.category === 'string') {
    categoryId = apiProduct.category;
  } else if (apiProduct.category && typeof apiProduct.category === 'object' && apiProduct.category._id) {
    categoryId = apiProduct.category._id;
  }

  return {
    id: apiProduct._id,
    _id: apiProduct._id,
    name: apiProduct.name,
    description: apiProduct.description,
    mrp: apiProduct.mrp,
    price: apiProduct.price,
    discountPercent: apiProduct.discountPercent,
    category: categoryId,
    brand: apiProduct.brand,
    images: Array.isArray(apiProduct.images) ? apiProduct.images.map(toImageItem) : [],
    variants: Array.isArray(apiProduct.variants) ? apiProduct.variants.map(v => ({ ...v, images: Array.isArray(v.images) ? v.images.map(toImageItem) : [] })) : [],
    specifications: apiProduct.specifications || {},
    tags: apiProduct.tags || [],
    isActive: apiProduct.isActive,
    createdAt: apiProduct.createdAt,
    updatedAt: apiProduct.updatedAt,
  };
};

// Transform API category to frontend CategoryItem
const transformApiCategory = (apiCategory: ApiCategory): CategoryItem => {
  // Extract thumb URL from image object if it's an object, otherwise use as string
  let imageUrl: string | undefined;
  if (typeof apiCategory.image === 'string') {
    imageUrl = apiCategory.image;
  } else if (apiCategory.image && typeof apiCategory.image === 'object') {
    imageUrl = apiCategory.image.thumb?.url || apiCategory.image.detail?.url;
  }

  // Extract parentCategory ID (can be string, object, or null)
  let parentCategoryId: string | null | undefined;
  if (typeof apiCategory.parentCategory === 'string') {
    parentCategoryId = apiCategory.parentCategory;
  } else if (apiCategory.parentCategory && typeof apiCategory.parentCategory === 'object') {
    parentCategoryId = apiCategory.parentCategory._id;
  } else {
    parentCategoryId = apiCategory.parentCategory;
  }

  // Transform subcategories recursively if they exist
  const subcategories = apiCategory.subcategories?.map(transformApiCategory);

  return {
    id: apiCategory._id,
    _id: apiCategory._id,
    name: apiCategory.name,
    displayName: apiCategory.displayName,
    slug: apiCategory.slug,
    description: apiCategory.description,
    image: imageUrl,
    icon: apiCategory.icon,
    parentCategory: parentCategoryId,
    level: apiCategory.level,
    order: apiCategory.order,
    isActive: apiCategory.isActive,
    productCount: apiCategory.productCount,
    subcategories,
  };
};

// Convert frontend image string to API image format
// API expects object format, not plain strings
const convertImageForApi = (image: string | undefined): string | { thumb: { url: string } } | undefined => {
  if (!image) return undefined;
  // If it's already an object, return as is (shouldn't happen from frontend, but be safe)
  if (typeof image !== 'string') return image as any;
  // Convert string URL to object format that API expects
  return { thumb: { url: image } };
};

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
        const transformed = items.map(transformApiProduct).filter((p): p is Product => p !== null);
        setProducts(transformed);
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
        
        // Organize categories: prefer parent categories with subcategories
        const processedChildIds = new Set<string>();
        apiCategories.forEach((cat) => {
          if (cat.subcategories) {
            cat.subcategories.forEach((subcat) => {
              processedChildIds.add(subcat.id);
            });
          }
        });
        
        const finalCategories: CategoryItem[] = [
          { id: 'all', name: 'all', displayName: 'All', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop', isActive: true },
        ];
        
        apiCategories.forEach((cat) => {
          if (cat.id === 'all') return;
          if (cat.subcategories && cat.subcategories.length > 0) {
            finalCategories.push(cat);
          } else if (cat.level === 0 || cat.parentCategory === null) {
            finalCategories.push(cat);
          } else if (!processedChildIds.has(cat.id)) {
            finalCategories.push(cat);
          }
        });
        
        setCategories(finalCategories);
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
      const transformed = items.map(transformApiProduct).filter((p): p is Product => p !== null);
      setProducts(transformed);
    } else if (productsQuery.isError && productsQuery.error) {
      setError((productsQuery.error as Error).message);
    }
  }, [productsQuery.data, productsQuery.isError, productsQuery.error]);

  useEffect(() => {
    if (categoriesQuery.data && (categoriesQuery.data as any).success) {
      const items = extractArrayFromResponse(categoriesQuery.data as any);
      const apiCategories = items.map(transformApiCategory);
      
      // Organize categories: prefer parent categories with subcategories
      // Filter out child categories that are already in a parent's subcategories
      const processedChildIds = new Set<string>();
      
      // First pass: mark children that are in subcategories
      apiCategories.forEach((cat) => {
        if (cat.subcategories) {
          cat.subcategories.forEach((subcat) => {
            processedChildIds.add(subcat.id);
          });
        }
      });
      
      // Build final list: include "all", then parent categories (with their subcategories)
      // Skip standalone child categories that are already in a parent's subcategories
      const finalCategories: CategoryItem[] = [
        { id: 'all', name: 'all', displayName: 'All', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop', isActive: true },
      ];
      
      apiCategories.forEach((cat) => {
        // Include if it's a parent (has subcategories or level 0)
        // OR if it's a child that's not already in a parent's subcategories
        if (cat.id === 'all') return; // Skip if "all" is in API response
        if (cat.subcategories && cat.subcategories.length > 0) {
          finalCategories.push(cat);
        } else if (cat.level === 0 || cat.parentCategory === null) {
          finalCategories.push(cat);
        } else if (!processedChildIds.has(cat.id)) {
          // Standalone child not in any parent's subcategories
          finalCategories.push(cat);
        }
      });
      
      setCategories(finalCategories);
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
        image: convertImageForApi(category.image),
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
        image: updates.image !== undefined ? convertImageForApi(updates.image) : undefined,
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
