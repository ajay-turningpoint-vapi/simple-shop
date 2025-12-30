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
      <ScrollArea className="w-full whitespace-nowrap md:whitespace-normal">
        <div className="flex gap-2 pb-2 md:flex-wrap">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onChange(category.id)}
              className={cn(
                'px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 shrink-0',
                selected === category.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="md:hidden" />
      </ScrollArea>
    </div>
  );
};

export default CategoryFilter;
