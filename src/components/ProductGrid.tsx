import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProducts } from '@/context/ProductContext';
import { Category } from '@/data/products';
import ProductCard from './ProductCard';
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import { Package, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { extractArrayFromResponse } from '@/lib/utils';

const ProductGrid = () => {
  const { products, refreshProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [filtersOpen, setFiltersOpen] = useState(false);

  // Build params for server query
  const params = useMemo(() => {
    const p: any = {};
    if (searchQuery) p.search = searchQuery;
    if (selectedCategory && selectedCategory !== 'all') p.category = selectedCategory;
    if (minPrice !== undefined) p.minPrice = minPrice;
    if (maxPrice !== undefined) p.maxPrice = maxPrice;
    if (sortBy) p.sortBy = sortBy;
    if (sortOrder) p.sortOrder = sortOrder;
    return p;
  }, [searchQuery, selectedCategory, minPrice, maxPrice, sortBy, sortOrder]);

  const productsQuery = useQuery({
    queryKey: ['products', params],
    queryFn: async () => (await import('@/services/api')).productApi.getAll(params),
  });

  // Transform ApiProduct to Product shape (lightweight inline mapping)
  const transformApiProductInline = (apiProduct: any) => ({
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

  const filteredProducts = useMemo(() => {
    if (!productsQuery.data || !(productsQuery.data as any).success) return [];
    const items = extractArrayFromResponse(productsQuery.data as any);
    if (items.length === 0) return [];
    return items.map(transformApiProductInline);
  }, [productsQuery.data]);

  return (
    <section id="products" className="py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full">
              <div className="flex items-center gap-2 w-full">
                <SearchBar value={searchQuery} onChange={setSearchQuery} />

                {/* Mobile Filters button (opens drawer) */}
                <div className="sm:hidden">
                  <Button size="sm" onClick={() => setFiltersOpen(true)} className="ml-2">
                    <Filter className="h-4 w-4 mr-2" />
                  </Button>
                </div>
              </div>

              <div className="hidden sm:flex gap-2 items-center mt-2 sm:mt-0 w-full sm:w-auto flex-wrap">
                <Input
                  type="number"
                  placeholder="Min price"
                  value={minPrice ?? ''}
                  onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-24"
                />
                <Input
                  type="number"
                  placeholder="Max price"
                  value={maxPrice ?? ''}
                  onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-24"
                />

                <div className="w-36">
                  <Select onValueChange={(v) => setSortBy(v)} defaultValue={sortBy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Newest</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="mrp">MRP</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-28">
                  <Select onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')} defaultValue={sortOrder}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Order" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Desc</SelectItem>
                      <SelectItem value="asc">Asc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Mobile Drawer for filters */}
            <Drawer open={filtersOpen} onOpenChange={setFiltersOpen}>
              <DrawerContent>
                <DrawerHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <DrawerTitle>Filters</DrawerTitle>
                      <p className="text-sm text-muted-foreground">Refine products by price, sort and category</p>
                    </div>
                    <div>
                      <Button size="icon" variant="ghost" onClick={() => setFiltersOpen(false)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </DrawerHeader>

                <div className="p-4 space-y-4">
                  <div>
                    <Label htmlFor="mobile-search">Search</Label>
                    <Input id="mobile-search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search products..." />
                  </div>

                  <div>
                    <Label>Category</Label>
                    <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
                  </div>

                  <div className="flex gap-2">
                    <Input type="number" placeholder="Min price" value={minPrice ?? ''} onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)} />
                    <Input type="number" placeholder="Max price" value={maxPrice ?? ''} onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)} />
                  </div>

                  <div className="flex gap-2">
                    <div className="w-1/2">
                      <Select onValueChange={(v) => setSortBy(v)} defaultValue={sortBy}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="createdAt">Newest</SelectItem>
                          <SelectItem value="price">Price</SelectItem>
                          <SelectItem value="mrp">MRP</SelectItem>
                          <SelectItem value="name">Name</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="w-1/2">
                      <Select onValueChange={(v) => setSortOrder(v as 'asc' | 'desc')} defaultValue={sortOrder}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Order" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="desc">Desc</SelectItem>
                          <SelectItem value="asc">Asc</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <DrawerFooter>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                        setMinPrice(undefined);
                        setMaxPrice(undefined);
                        setSortBy('createdAt');
                        setSortOrder('desc');
                        refreshProducts({});
                        setFiltersOpen(false);
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={() => {
                        if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
                          toast.error('Min price cannot be greater than max price');
                          return;
                        }
                        const params: any = {};
                        if (searchQuery) params.search = searchQuery;
                        if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
                        if (minPrice !== undefined) params.minPrice = minPrice;
                        if (maxPrice !== undefined) params.maxPrice = maxPrice;
                        if (sortBy) params.sortBy = sortBy;
                        if (sortOrder) params.sortOrder = sortOrder;
                        refreshProducts(params);
                        setFiltersOpen(false);
                      }}
                    >
                      Apply
                    </Button>
                  </div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>

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
