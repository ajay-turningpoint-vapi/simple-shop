import { Plus, Check } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group relative bg-card rounded-xl overflow-hidden border border-border card-hover animate-fade-in">
      {product.badge && (
        <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-primary text-primary-foreground text-[10px] sm:text-xs">
          {product.badge}
        </Badge>
      )}
      
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-sm sm:text-lg leading-tight line-clamp-1">
              {product.name}
            </h3>
            <span className="shrink-0 text-[10px] sm:text-xs text-muted-foreground bg-secondary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
              {product.weight}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-primary font-medium">{product.flavor}</p>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        <div className="hidden sm:flex flex-wrap gap-1">
          {product.benefits.slice(0, 2).map((benefit, index) => (
            <span
              key={index}
              className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded"
            >
              {benefit}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="font-display text-base sm:text-xl font-bold">
            {formatPrice(product.price)}
          </span>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className={cn(
              "h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm",
              isAdded ? 'bg-green-600 hover:bg-green-600' : ''
            )}
          >
            {isAdded ? (
              <>
                <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                <span className="hidden xs:inline">Added</span>
              </>
            ) : (
              <>
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="hidden xs:inline">Add</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
