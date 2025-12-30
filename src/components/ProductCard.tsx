import { Plus, Minus } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, getItemQuantity, incrementQuantity, decrementQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const hasDiscount = product.discountPercent > 0;

  return (
    <div className="group relative bg-card rounded-xl overflow-hidden border border-border card-hover animate-fade-in">
      {product.tags.includes('bestseller') && (
        <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-primary text-primary-foreground text-[10px] sm:text-xs">
          Bestseller
        </Badge>
      )}
      {product.tags.includes('new') && (
        <Badge className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-green-600 text-white text-[10px] sm:text-xs">
          New
        </Badge>
      )}
      {hasDiscount && (
        <Badge className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-destructive text-destructive-foreground text-[10px] sm:text-xs">
          {product.discountPercent}% OFF
        </Badge>
      )}
      
      <div className="aspect-square overflow-hidden bg-muted">
        <img
          src={product.images[0]}
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
            {product.brand && (
              <span className="shrink-0 text-[10px] sm:text-xs text-muted-foreground bg-secondary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                {product.brand}
              </span>
            )}
          </div>
          {product.variants[0] && (
            <p className="text-xs sm:text-sm text-primary font-medium">{product.variants[0].color}</p>
          )}
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        <div className="hidden sm:flex flex-wrap gap-1">
          {product.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex flex-col">
            <span className="font-display text-base sm:text-xl font-bold">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
          
          {quantity === 0 ? (
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden xs:inline">Add</span>
            </Button>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={() => decrementQuantity(product.id)}
                className="h-7 w-7 sm:h-8 sm:w-8"
              >
                <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <span className="w-6 sm:w-8 text-center font-semibold text-sm sm:text-base">
                {quantity}
              </span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => incrementQuantity(product)}
                className="h-7 w-7 sm:h-8 sm:w-8"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
