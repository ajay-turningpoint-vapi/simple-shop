import { useMemo, useState } from 'react';
import { useProducts } from '@/context/ProductContext';
import { Category } from '@/data/products';
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import { Package } from 'lucide-react';

const ProductGrid = () => {
  const { getActiveProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  const products = getActiveProducts();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory =
        selectedCategory === 'all' || product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <section id="products" className="py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Our Products</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {filteredProducts.length} products available
              </p>
            </div> */}
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <Package className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-3 sm:mb-4" />
            <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">No products found</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductGrid;
