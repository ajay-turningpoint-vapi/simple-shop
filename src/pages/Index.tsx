import { CartProvider } from '@/context/CartContext';
import { ProductProvider } from '@/context/ProductContext';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import CartSidebar from '@/components/CartSidebar';
import MobileCartBar from '@/components/MobileCartBar';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <ProductProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 pb-20 md:pb-0">
            {/* <Hero /> */}
            <ProductGrid />
          </main>
          <Footer />
          <CartSidebar />
          <MobileCartBar />
        </div>
      </CartProvider>
    </ProductProvider>
  );
};

export default Index;
