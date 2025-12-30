import { CartProvider } from '@/context/CartContext';
import { ProductProvider } from '@/context/ProductContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import CartSidebar from '@/components/CartSidebar';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <ProductProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Hero />
            <ProductGrid />
          </main>
          <Footer />
          <CartSidebar />
        </div>
      </CartProvider>
    </ProductProvider>
  );
};

export default Index;
