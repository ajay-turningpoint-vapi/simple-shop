import { useProducts } from '@/context/ProductContext';
import { Category } from '@/data/products';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CategoryFilterProps {
  selected: Category;
  onChange: (category: Category) => void;
}

const CategoryFilter = ({ selected, onChange }: CategoryFilterProps) => {
  const { categories } = useProducts();

  return (
    <div id="categories" className="-mx-3 px-3 md:mx-0 md:px-0">
      {/* ================= MOBILE ================= */}
      {/* Small cards | Exactly 4 visible */}
     <ScrollArea className="md:hidden w-full">
  <div className="flex gap-2 py-2 pl-1">
    {categories.map((category) => (
      <button
        key={category.id}
        onClick={() => onChange(category.id)}
        className={cn(
          'flex-shrink-0 w-[calc(20%-8px)] rounded-md overflow-hidden transition-all',
          selected === category.id
            ? 'ring-1 ring-primary'
            : 'bg-secondary/50'
        )}
      >
        {/* IMAGE – FULL WIDTH */}
        <div className="w-full h-14 overflow-hidden">
          <img
            src={category.image || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop'}
            alt={category.displayName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* TEXT */}
        <div
          className={cn(
            'px-1 py-0.5 text-[8px] font-medium text-center truncate',
            selected === category.id
              ? 'text-primary'
              : 'text-foreground'
          )}
        >
          {category.displayName}
        </div>
      </button>
    ))}
  </div>

  <ScrollBar orientation="horizontal" />
</ScrollArea>


      {/* ================= DESKTOP ================= */}
      {/* 7 visible | scroll rest */}
      <ScrollArea className="hidden md:block w-full">
        <div
          className="flex gap-2 pb-2"
          style={{ maxWidth: 'calc(7 * 140px)' }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onChange(category.id)}
              className={cn(
                'flex-shrink-0 w-[140px] flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                selected === category.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary hover:bg-secondary/80'
              )}
            >
            <img
              src={category.image || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop'}
              alt={category.displayName}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="truncate">{category.displayName}</span>
          </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default CategoryFilter;
