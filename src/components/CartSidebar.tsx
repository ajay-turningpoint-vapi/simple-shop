import { X, Plus, Minus, Trash2, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { getPrimaryImage } from '@/lib/utils';
import { useState } from 'react';
import AddressDialog, { Address } from '@/components/AddressDialog';

const WHATSAPP_NUMBER = '918975944936';

const CartSidebar = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    getTotalPrice,
    clearCart,
  } = useCart();

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const sendOrderViaWhatsApp = (address: Address) => {
    const orderDetails = items
      .map(
        (item) =>
          `• ${item.product.name} (${item.product.variants[0]?.color || 'Default'}) x${item.quantity} - ${formatPrice(item.product.price * item.quantity)}`
      )
      .join('\n');

    const totalPrice = formatPrice(getTotalPrice());

    const addressText = `${address.name} (${address.phone})\n${address.line1}${address.line2 ? `, ${address.line2}` : ''}\n${address.city}, ${address.state} - ${address.pincode}`;

    const message = encodeURIComponent(
      `🛒 *New Order from ShapeShift Store*\n\n` +
      `*Order Details:*\n${orderDetails}\n\n` +
      `*Total Amount:* ${totalPrice}\n\n` +
      `*Delivery Address:*\n${addressText}\n\n` +
      `Please confirm my order. Thank you!`
    );

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(whatsappUrl, '_blank');

    toast.success('Opening WhatsApp to complete your order!');
    clearCart();
    setIsCartOpen(false);
  };

  const handlePlaceOrder = () => {
    if (items.length === 0) {
      toast.error('Your cart is empty!');
      return;
    }

    // Always open address dialog so user can choose/update each time
    setAddressDialogOpen(true);
    toast.info('Please confirm your delivery address to continue.');
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-display text-xl">
            Your Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">
              Your cart is empty
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Add some products to get started!
            </p>
            <Button onClick={() => setIsCartOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-4 p-3 bg-secondary/30 rounded-lg animate-fade-in"
                >
                  <div className="relative">
                    <img
                      src={getPrimaryImage(item.product.images)}
                      alt={item.product.name}
                      loading="lazy"
                      decoding="async"
                      className="w-20 h-20 object-contain rounded-lg bg-white"
                    />
                    {item.product.images.length > 1 && (
                      <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                        +{item.product.images.length - 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">{item.product.variants[0]?.color || item.product.brand}</p>
                    <p className="text-sm font-semibold text-primary mt-1">
                      {formatPrice(item.product.price)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1 bg-muted rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-primary">Free</span>
                </div>
                <Separator />
                <div className="flex justify-between font-display text-lg font-bold">
                  <span>Total</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
              </div>

              <Button
                className="w-full btn-glow gap-2"
                size="lg"
                onClick={handlePlaceOrder}
              >
                <MessageCircle className="h-5 w-5" />
                Order via WhatsApp
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Your order will be sent to WhatsApp for confirmation
              </p>
            </div>
          </>
        )}
      </SheetContent>
      <AddressDialog
        open={addressDialogOpen}
        onClose={() => setAddressDialogOpen(false)}
        onConfirm={(address) => {
          setAddressDialogOpen(false);
          sendOrderViaWhatsApp(address);
        }}
      />
    </Sheet>
  );
};

export default CartSidebar;
