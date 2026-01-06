import { ShoppingCart, Dumbbell, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const Header = () => {
  const { getTotalItems, setIsCartOpen } = useCart();
  const totalItems = getTotalItems();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary">
              <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg sm:text-xl font-bold tracking-tight">
              ShapeShift
            </span>
          </div>

      

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="hidden md:inline-flex relative h-9 w-9 md:h-10 md:w-10"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1.5 -top-1.5 md:-right-2 md:-top-2 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-primary text-[10px] md:text-xs font-semibold text-primary-foreground animate-scale-in">
                  {totalItems}
                </span>
              )}
            </Button>

      
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-3">
              <a
                href="#products"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </a>
              <a
                href="#categories"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Categories
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
