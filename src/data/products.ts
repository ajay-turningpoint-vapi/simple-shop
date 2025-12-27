export type Category = 'all' | 'protein' | 'energy' | 'recovery' | 'weight-management';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  image: string;
  flavor: string;
  weight: string;
  benefits: string[];
  badge?: string;
}

export const categories: { id: Category; label: string }[] = [
  { id: 'all', label: 'All Products' },
  { id: 'protein', label: 'Protein' },
  { id: 'energy', label: 'Energy' },
  { id: 'recovery', label: 'Recovery' },
  { id: 'weight-management', label: 'Weight Management' },
];

export const products: Product[] = [
  {
    id: 'clean-whey-mango',
    name: 'Clean Whey',
    description: 'Crafted with premium protein from grass-fed cows. 24g protein, 4.6g BCAAs, 9g EAAs per serving.',
    price: 6229,
    category: 'protein',
    image: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400&h=400&fit=crop',
    flavor: 'Mango Twist',
    weight: '900g',
    benefits: ['Supports recovery & muscle building', 'No artificial sweeteners', '4 clean ingredients'],
    badge: 'Bestseller',
  },
  {
    id: 'clean-whey-iso',
    name: 'Clean Whey ISO',
    description: '90% whey isolate for fast absorption. 25g protein, 5.7g BCAAs, 12g EAAs per serving.',
    price: 7297,
    category: 'protein',
    image: 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&h=400&fit=crop',
    flavor: 'Chocolate Fusion',
    weight: '900g',
    benefits: ['Faster recovery & lean muscle', 'Light on stomach', '90% protein content'],
    badge: 'Premium',
  },
  {
    id: 'clean-protein-her',
    name: 'Clean Protein For Her',
    description: 'Designed for women with collagen builder blend and biotin for strength & beauty.',
    price: 3115,
    category: 'protein',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&h=400&fit=crop',
    flavor: 'Vanilla',
    weight: '500g',
    benefits: ['Supports glowing skin', 'Strong hair & nails', 'Lean muscle support'],
  },
  {
    id: 'clean-mass',
    name: 'Clean Mass',
    description: 'Clean calories with creatine for powerful muscle growth. 12g protein per serving.',
    price: 5339,
    category: 'protein',
    image: 'https://images.unsplash.com/photo-1619771914272-e3c1f8e895c1?w=400&h=400&fit=crop',
    flavor: 'Banana Twist',
    weight: '3kg',
    benefits: ['Muscle building & weight gain', 'Clean calories', 'Creatine enhanced'],
    badge: 'Value Pack',
  },
  {
    id: 'clean-bcaa-tangy',
    name: 'Clean BCAA',
    description: '2:1:1 ratio of BCAAs with Glutamine and electrolytes for recovery.',
    price: 3115,
    category: 'recovery',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    flavor: 'Tangy Twist',
    weight: '450g',
    benefits: ['Muscle repair & endurance', 'Reduces cramps', 'Essential electrolytes'],
  },
  {
    id: 'clean-energy',
    name: 'Clean Energy Pre-Workout',
    description: 'Beta-Alanine, L-Citrulline & Caffeine for sustained energy and focus.',
    price: 3115,
    category: 'energy',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
    flavor: 'Rocket Candy',
    weight: '450g',
    benefits: ['Immediate energy boost', 'Mental focus', 'Train longer & harder'],
    badge: 'Popular',
  },
  {
    id: 'clean-creatine',
    name: 'Clean Creatine',
    description: 'Creatine Monohydrate with Protease Enzyme for better absorption.',
    price: 1780,
    category: 'recovery',
    image: 'https://images.unsplash.com/photo-1584116831289-e53912463c35?w=400&h=400&fit=crop',
    flavor: 'Unflavoured',
    weight: '250g',
    benefits: ['Boosts muscle strength', 'Better recovery', 'Enhanced absorption'],
  },
  {
    id: 'carniburn',
    name: 'Carniburn',
    description: 'L-Carnitine fat burner with Garcinia Cambogia for metabolism support.',
    price: 1780,
    category: 'weight-management',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop',
    flavor: 'Tropical Thunder',
    weight: '60g',
    benefits: ['Fat metabolism support', 'Controls cravings', 'Lean muscle maintenance'],
  },
  {
    id: 'clean-whey-chocolate',
    name: 'Clean Whey',
    description: 'Premium whey protein from grass-fed cows. Rich chocolate flavor.',
    price: 6229,
    category: 'protein',
    image: 'https://images.unsplash.com/photo-1606889464198-fcb18894cf50?w=400&h=400&fit=crop',
    flavor: 'Chocolate Delight',
    weight: '900g',
    benefits: ['Supports recovery & muscle building', 'No artificial sweeteners', '4 clean ingredients'],
  },
  {
    id: 'clean-bcaa-litchi',
    name: 'Clean BCAA',
    description: 'Refreshing Litchi flavor with 2:1:1 BCAA ratio for optimal recovery.',
    price: 3115,
    category: 'recovery',
    image: 'https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=400&h=400&fit=crop',
    flavor: 'Litchi Delight',
    weight: '450g',
    benefits: ['Muscle repair & endurance', 'Reduces cramps', 'Essential electrolytes'],
  },
];
