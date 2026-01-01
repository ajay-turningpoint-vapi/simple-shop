export type Category = 'all' | 'electronics' | 'clothing' | 'food' | 'books' | 'toys' | 'sports' | 'home' | 'beauty' | 'automotive' | 'other';

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
  image: string;
}

export const categories: CategoryItem[] = [
  { id: 'all', label: 'All', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop' },
  { id: 'electronics', label: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=100&h=100&fit=crop' },
  { id: 'clothing', label: 'Clothing', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop' },
  { id: 'food', label: 'Food', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop' },
  { id: 'books', label: 'Books', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=100&h=100&fit=crop' },
  { id: 'toys', label: 'Toys', image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=100&h=100&fit=crop' },
  { id: 'sports', label: 'Sports', image: 'https://images.unsplash.com/photo-1461896836934- voices-icon?w=100&h=100&fit=crop' },
  { id: 'home', label: 'Home', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=100&h=100&fit=crop' },
  { id: 'beauty', label: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop' },
  { id: 'automotive', label: 'Auto', image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=100&h=100&fit=crop' },
  { id: 'other', label: 'Other', image: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop' },
];

export const products: Product[] = [
  {
    id: 'clean-whey-mango',
    name: 'Clean Whey Protein',
    description: 'Crafted with premium protein from grass-fed cows. 24g protein, 4.6g BCAAs, 9g EAAs per serving.',
    mrp: 7499,
    price: 6229,
    discountPercent: 17,
    category: 'food',
    brand: 'ShapeShift',
    images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop'],
    variants: [
      { color: 'Mango Twist', colorCode: '#FFB347', stock: 50, images: [], sku: 'CW-MNG-001', isAvailable: true },
      { color: 'Chocolate', colorCode: '#7B3F00', stock: 30, images: [], sku: 'CW-CHO-001', isAvailable: true }
    ],
    specifications: { weight: '900g', servings: '30', protein: '24g' },
    tags: ['bestseller', 'protein', 'muscle'],
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
    category: 'beauty',
    brand: 'Urban Color',
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop'],
    variants: [
      { color: 'Universal', colorCode: '#F5F5DC', stock: 100, images: [], sku: 'UC-HVP-001', isAvailable: true }
    ],
    specifications: { weight: '30ml', type: 'Primer' },
    tags: ['new', 'skincare', 'primer'],
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
    category: 'beauty',
    brand: 'Urban Color',
    images: ['https://images.unsplash.com/photo-1631214540553-ff44137c6168?w=400&h=400&fit=crop'],
    variants: [
      { color: 'Rose', colorCode: '#FFB6C1', stock: 75, images: [], sku: 'UC-CC-001', isAvailable: true },
      { color: 'Natural', colorCode: '#FFDAB9', stock: 60, images: [], sku: 'UC-CC-002', isAvailable: true }
    ],
    specifications: { weight: '30g', spf: '20' },
    tags: ['makeup', 'spf', 'bestseller'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'wireless-earbuds',
    name: 'Pro Wireless Earbuds',
    description: 'Premium wireless earbuds with active noise cancellation and 24-hour battery life.',
    mrp: 4999,
    price: 3499,
    discountPercent: 30,
    category: 'electronics',
    brand: 'TechPro',
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop'],
    variants: [
      { color: 'Black', colorCode: '#000000', stock: 200, images: [], sku: 'WE-BLK-001', isAvailable: true },
      { color: 'White', colorCode: '#FFFFFF', stock: 150, images: [], sku: 'WE-WHT-001', isAvailable: true }
    ],
    specifications: { battery: '24hrs', bluetooth: '5.3', driver: '10mm' },
    tags: ['electronics', 'audio', 'wireless'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'cotton-tshirt',
    name: 'Premium Cotton T-Shirt',
    description: 'Ultra-soft 100% organic cotton t-shirt. Comfortable fit for everyday wear.',
    mrp: 1299,
    price: 799,
    discountPercent: 38,
    category: 'clothing',
    brand: 'ComfortWear',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'],
    variants: [
      { color: 'Navy Blue', colorCode: '#000080', stock: 100, images: [], sku: 'CT-NVY-M', isAvailable: true },
      { color: 'White', colorCode: '#FFFFFF', stock: 80, images: [], sku: 'CT-WHT-M', isAvailable: true },
      { color: 'Black', colorCode: '#000000', stock: 120, images: [], sku: 'CT-BLK-M', isAvailable: true }
    ],
    specifications: { material: '100% Cotton', fit: 'Regular', care: 'Machine Wash' },
    tags: ['clothing', 'casual', 'cotton'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
