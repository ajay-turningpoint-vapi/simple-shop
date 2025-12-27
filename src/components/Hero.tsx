import { ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Hero = () => {
  return (
    <section className="relative overflow-hidden py-12 sm:py-16 md:py-24 lg:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/20" />
      
      {/* Glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-primary/10 rounded-full blur-[80px] md:blur-[120px]" />

      <div className="container relative mx-auto px-4 text-center">
        <div className="animate-fade-in">
          <span className="inline-block mb-3 sm:mb-4 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full">
            Clean Nutrition & Beauty
          </span>
          
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight mb-4 sm:mb-6">
            Fuel Your Body
            <br />
            <span className="text-gradient">The Clean Way</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg lg:text-xl text-muted-foreground mb-6 sm:mb-8 px-2">
            Premium sports nutrition & beauty products crafted with pure ingredients. 
            No artificial additives – just clean performance.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Button 
              size="lg" 
              className="btn-glow text-sm sm:text-base px-6 sm:px-8 w-full sm:w-auto"
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Shop Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="text-sm sm:text-base px-6 sm:px-8 w-full sm:w-auto"
              onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Browse Categories
            </Button>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 md:mt-16 animate-bounce-subtle">
          <ArrowDown className="mx-auto h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
