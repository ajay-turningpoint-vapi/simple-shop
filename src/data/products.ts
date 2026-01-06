// Category type - now supports dynamic categories from API
export type Category = string;

export interface ImageItem {
  filename?: string;
  detail?: {
    filename?: string;
    url?: string;
  };
  thumb?: {
    filename?: string;
    url?: string;
  };
  alt?: string;
  isPrimary?: boolean;
  uploadedAt?: string;
}

export interface ProductVariant {
  color: string;
  colorCode?: string;
  stock: number;
  images: ImageItem[];
  sku?: string;
  isAvailable: boolean;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  description: string;
  mrp: number;
  price: number;
  discountPercent: number;
  category: string; // Now stores category ID from API
  brand?: string;
  images: ImageItem[];
  variants: ProductVariant[];
  specifications: Record<string, string>;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryItem {
  id: string;
  _id?: string;
  name: string;
  displayName: string;
  slug?: string;
  description?: string;
  image?: string;
  icon?: string;
  parentCategory?: string | null;
  level?: number;
  order?: number;
  isActive: boolean;
  productCount?: number;
  subcategories?: CategoryItem[];
}

// Default categories for fallback when API is unavailable
export const categories: CategoryItem[] = [
  { id: 'all', name: 'all', displayName: 'All', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop', isActive: true },
];

// Default products for fallback when API is unavailable
export const products: Product[] = [];
