import { ChevronUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MobileCartBar = () => {
  const { items, getTotalItems, setIsCartOpen } = useCart();

  const totalItems = getTotalItems();

  if (totalItems === 0) return null;

  // Get unique products (max 4 for display)
  const displayItems = items.slice(0, 4);
  const remainingCount = items.length - 4;

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "animate-slide-up"
      )}
    >
      <div className="mx-3 mb-3">
        <Button
          onClick={() => setIsCartOpen(true)}
          className={cn(
            "w-full h-14 rounded-2xl shadow-lg",
            "bg-primary hover:bg-primary/90",
            "flex items-center justify-between px-4",
            "transition-all duration-300 ease-out",
            "btn-glow"
          )}
        >
          <div className="flex items-center gap-2">
            {/* Stacked Product Images */}
            <div className="flex items-center -space-x-3">
              {displayItems.map((item, index) => (
                <div
                  key={item.product.id}
                  className={cn(
                    "w-9 h-9 rounded-full border-2 border-primary bg-background overflow-hidden",
                    "animate-pop-in shadow-md",
                    "transition-all duration-300"
                  )}
                  style={{
                    zIndex: displayItems.length - index,
                    animationDelay: `${index * 50}ms`
                  }}
                >
                  <img
                    src={item.product.images[0] || '/placeholder.svg'}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {remainingCount > 0 && (
                <div
                  className={cn(
                    "w-9 h-9 rounded-full border-2 border-primary bg-muted",
                    "flex items-center justify-center text-xs font-bold text-muted-foreground",
                    "animate-pop-in shadow-md"
                  )}
                  style={{ zIndex: 0 }}
                >
                  +{remainingCount}
                </div>
              )}
            </div>
            
            {/* Item Count */}
            <span className="font-semibold ml-1">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-display font-bold">View Cart</span>
            <ChevronUp className="h-5 w-5 animate-bounce" />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default MobileCartBar;
