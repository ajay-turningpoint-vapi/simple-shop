import React, { useState, memo } from 'react';
import { getImageUrl } from '@/lib/utils';
import { Plus, Minus } from 'lucide-react';
import { Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProductQuickView from './ProductQuickView';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, getItemQuantity, incrementQuantity, decrementQuantity } = useCart();
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const quantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleImageClick = () => {
    // Open quick view on all screen sizes when image is clicked
    setQuickViewOpen(true);
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
    <>
      <div className="group relative bg-card rounded-lg sm:rounded-xl overflow-hidden border border-border card-hover animate-fade-in">
        {product.tags.includes('bestseller') && (
          <Badge className="absolute top-1 left-1 sm:top-3 sm:left-3 z-10 bg-primary text-primary-foreground text-[8px] sm:text-xs px-1 sm:px-2 py-0">
            Best
          </Badge>
        )}
        {product.tags.includes('new') && (
          <Badge className="absolute top-1 left-1 sm:top-3 sm:left-3 z-10 bg-green-600 text-white text-[8px] sm:text-xs px-1 sm:px-2 py-0">
            New
          </Badge>
        )}
        {hasDiscount && (
          <Badge className="absolute top-1 right-1 sm:top-3 sm:right-3 z-10 bg-destructive text-destructive-foreground text-[8px] sm:text-xs px-1 sm:px-2 py-0">
            {product.discountPercent}%
          </Badge>
        )}

        <div className="overflow-hidden bg-muted">
          <Carousel>
            <CarouselContent>
              {product.images && product.images.length > 0 ? (
                product.images.map((img: any, idx: number) => (
                  <CarouselItem key={idx}>
                    <div
                      className="h-full w-full cursor-pointer"
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImageClick();
                      }}
                      onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => {
                        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar' || e.key === 'Space') {
                          e.preventDefault();
                          handleImageClick();
                        }
                      }}
                    >
                      <div className="h-full w-full">
                        <img
                          src={getImageUrl(img)}
                          alt={`${product.name} - ${idx + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="aspect-square h-full w-full object-contain transition-transform duration-300 group-hover:scale-105 bg-white"
                        />
                      </div>
                    </div>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem>
                  <div className="h-full w-full flex items-center justify-center">
                    <img src={'/placeholder.svg'} alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-contain bg-white" />
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>

            {product.images && product.images.length > 1 && (
              <>
                <CarouselPrevious onClick={(e) => e.stopPropagation()} />
                <CarouselNext onClick={(e) => e.stopPropagation()} />
              </>
            )}
          </Carousel>
        </div>

        <div className="p-1.5 sm:p-4 space-y-1 sm:space-y-3">
          <div className="space-y-0.5 sm:space-y-1">
            <h3 className="font-display font-semibold text-[10px] sm:text-lg leading-tight line-clamp-1">
              {product.name}
            </h3>
            {product.brand && (
              <span className="hidden sm:inline-block text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                {product.brand}
              </span>
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

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 sm:pt-2 sm:border-t sm:border-border">
            <div className="flex items-center sm:flex-col sm:items-start gap-1 sm:gap-0">
              <span className="font-display text-[11px] sm:text-xl font-bold">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-[9px] sm:text-xs text-muted-foreground line-through">
                  {formatPrice(product.mrp)}
                </span>
              )}
            </div>

            {quantity === 0 ? (
              <Button
                size="sm"
                onClick={handleAddToCart}
                className="h-6 sm:h-9 px-2 sm:px-3 text-[10px] sm:text-sm w-full sm:w-auto"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                <span className="sm:inline">Add</span>
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => decrementQuantity(product.id)}
                  className="h-5 w-5 sm:h-8 sm:w-8"
                >
                  <Minus className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
                </Button>
                <span className="w-4 sm:w-8 text-center font-semibold text-[10px] sm:text-base">
                  {quantity}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => incrementQuantity(product)}
                  className="h-5 w-5 sm:h-8 sm:w-8"
                >
                  <Plus className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductQuickView
        product={product}
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
};

export default memo(ProductCard);
