import { Dumbbell, MessageCircle, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Dumbbell className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              ShapeShift
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a 
              href="https://wa.me/918975944936" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp Support
            </a>
            <a 
              href="tel:+918975944936"
              className="flex items-center gap-2 hover:text-foreground transition-colors"
            >
              <Phone className="h-4 w-4" />
              +91 89759 44936
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 ShapeShift. Clean Nutrition for a Stronger You.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
