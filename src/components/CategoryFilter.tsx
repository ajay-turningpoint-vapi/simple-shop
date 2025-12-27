import { categories, Category } from '@/data/products';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selected: Category;
  onChange: (category: Category) => void;
}

const CategoryFilter = ({ selected, onChange }: CategoryFilterProps) => {
  return (
    <div id="categories" className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onChange(category.id)}
          className={cn(
            'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
            selected === category.id
              ? 'bg-primary text-primary-foreground shadow-md'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          {category.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
