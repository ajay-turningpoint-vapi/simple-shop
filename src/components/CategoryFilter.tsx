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
    <div id="categories" className="-mx-4 px-4 md:mx-0 md:px-0">
      {/* Mobile: 4-column grid with image cards */}
      <div className="grid grid-cols-4 gap-2 md:hidden">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onChange(category.id)}
            className={cn(
              'flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all duration-200',
              selected === category.id
                ? 'bg-primary/10 ring-2 ring-primary'
                : 'bg-secondary/50 hover:bg-secondary'
            )}
          >
            <div className={cn(
              'w-12 h-12 rounded-lg overflow-hidden ring-2 transition-all',
              selected === category.id ? 'ring-primary' : 'ring-transparent'
            )}>
              <img
                src={category.image}
                alt={category.label}
                className="w-full h-full object-cover"
              />
            </div>
            <span className={cn(
              'text-[9px] font-medium text-center leading-tight line-clamp-1',
              selected === category.id ? 'text-primary' : 'text-foreground'
            )}>
              {category.label}
            </span>
          </button>
        ))}
      </div>

      {/* Desktop: Horizontal scroll with pills */}
      <ScrollArea className="hidden md:block w-full whitespace-normal">
        <div className="flex gap-2 pb-2 flex-wrap">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onChange(category.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200',
                selected === category.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              <img
                src={category.image}
                alt={category.label}
                className="w-6 h-6 rounded-full object-cover"
              />
              {category.label}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default CategoryFilter;
