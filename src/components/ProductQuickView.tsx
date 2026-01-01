import { X, Plus, Minus } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProductQuickViewProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const ProductQuickView = ({ product, open, onClose }: ProductQuickViewProps) => {
  const { addToCart, getItemQuantity, incrementQuantity, decrementQuantity } = useCart();
  
  if (!product) return null;
  
  const quantity = getItemQuantity(product.id);
  const hasDiscount = product.discountPercent > 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    addToCart(product);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-lg p-0 gap-0 rounded-xl overflow-hidden">
        <div className="relative aspect-square bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          {product.tags.includes('bestseller') && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
              Bestseller
            </Badge>
          )}
          {product.tags.includes('new') && (
            <Badge className="absolute top-3 left-3 bg-green-600 text-white">
              New
            </Badge>
          )}
          {hasDiscount && (
            <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
              {product.discountPercent}% OFF
            </Badge>
          )}
        </div>
        
        <div className="p-4 space-y-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="font-display text-xl font-bold leading-tight">
              {product.name}
            </DialogTitle>
            {product.brand && (
              <span className="text-sm text-muted-foreground bg-secondary px-2 py-1 rounded inline-block w-fit">
                {product.brand}
              </span>
            )}
          </DialogHeader>
          
          <p className="text-sm text-muted-foreground">
            {product.description}
          </p>
          
          {product.variants.length > 1 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Available Variants:</span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1.5 px-2 py-1 bg-secondary rounded text-xs"
                  >
                    {variant.colorCode && (
                      <span
                        className="w-3 h-3 rounded-full border border-border"
                        style={{ backgroundColor: variant.colorCode }}
                      />
                    )}
                    <span>{variant.color}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {Object.keys(product.specifications).length > 0 && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Specifications:</span>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="text-xs">
                    <span className="text-muted-foreground capitalize">{key}: </span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(product.mrp)}
                </span>
              )}
            </div>
            
            {quantity === 0 ? (
              <Button onClick={handleAddToCart} className="px-6">
                <Plus className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => decrementQuantity(product.id)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-semibold text-lg">
                  {quantity}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => incrementQuantity(product)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;
