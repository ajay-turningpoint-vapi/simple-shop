import { ShoppingCart, ChevronUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const MobileCartBar = () => {
  const { items, getTotalPrice, getTotalItems, setIsCartOpen } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const totalItems = getTotalItems();

  if (totalItems === 0) return null;

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
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 bg-background text-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-bounce-subtle">
                {totalItems}
              </span>
            </div>
            <span className="font-semibold">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg">
              {formatPrice(getTotalPrice())}
            </span>
            <ChevronUp className="h-5 w-5 animate-bounce" />
          </div>
        </Button>
      </div>
    </div>
  );
};

export default MobileCartBar;
