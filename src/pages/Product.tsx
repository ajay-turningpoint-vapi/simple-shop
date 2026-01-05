import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Product } from "@/data/products";
import { productApi } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; import { getImageUrl } from '@/lib/utils'; import { useCart } from "@/context/CartContext";
import { ArrowLeft, Loader2 } from "lucide-react"; import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await productApi.getById(id);
        if (response.success && response.data) {
          const apiProduct = response.data;
          const toImageItem = (i: any) => (typeof i === 'string' ? { detail: { url: i } } : i);
          setProduct({
            id: apiProduct._id,
            _id: apiProduct._id,
            name: apiProduct.name,
            description: apiProduct.description,
            mrp: apiProduct.mrp,
            price: apiProduct.price,
            discountPercent: apiProduct.discountPercent,
            category: typeof apiProduct.category === 'string' ? apiProduct.category : apiProduct.category._id,
            brand: apiProduct.brand,
            images: Array.isArray(apiProduct.images) ? apiProduct.images.map(toImageItem) : [],
            variants: Array.isArray(apiProduct.variants) ? apiProduct.variants.map(v => ({ ...v, images: Array.isArray(v.images) ? v.images.map(toImageItem) : [] })) : [],
            specifications: apiProduct.specifications || {},
            tags: apiProduct.tags || [],
            isActive: apiProduct.isActive,
            createdAt: apiProduct.createdAt,
            updatedAt: apiProduct.updatedAt,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-xl font-bold">Product not found</h2>
          <p className="text-muted-foreground mt-2">
            {error || "The product you are looking for does not exist."}
          </p>
          <div className="mt-4">
            <Button variant="ghost" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasDiscount = product.discountPercent > 0;
  const primaryVariant = product.variants[0];

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-full md:w-1/2 bg-muted rounded-lg overflow-hidden">
            {/* Image carousel */}
            <div className="relative">
              <Carousel>
                <CarouselContent>
                  {product.images.map((img: any, idx) => (
                    <CarouselItem key={idx}>
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        <img
                          src={getImageUrl(img)}
                          alt={`${product.name} - ${idx + 1}`}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {product.images.length > 1 && (
                  <>
                    <CarouselPrevious />
                    <CarouselNext />
                  </>
                )}
              </Carousel>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img: any, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        // move to slide by re-initializing via anchor hash (simple) - better: use carousel api; for simplicity, use scrollIntoView
                        const parent = document.querySelector('[aria-roledescription="carousel"] .flex');
                        if (parent) {
                          const item = parent.children[idx] as HTMLElement | undefined;
                          item?.scrollIntoView({ behavior: 'smooth', inline: 'center' });
                        }
                      }}
                      className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-border"
                    >
                      <img src={getImageUrl(img)} alt={`thumb-${idx}`} loading="lazy" decoding="async" className="w-full h-full object-contain bg-white" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold">
                  {product.name}
                </h1>
                {product.brand && (
                  <p className="text-sm text-primary font-medium">
                    {product.brand}
                    {primaryVariant && (
                      <span className="text-muted-foreground">
                        {" "}• {primaryVariant.color}
                      </span>
                    )}
                  </p>
                )}
              </div>

            </div>

            <div>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-muted-foreground line-through">
                      {formatPrice(product.mrp)}
                    </span>
                    <Badge variant="destructive">
                      {product.discountPercent}% OFF
                    </Badge>
                  </>
                )}
              </div>

              {Object.keys(product.specifications).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <span
                      key={key}
                      className="text-sm bg-secondary/50 px-3 py-1 rounded"
                    >
                      {key}: {value}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {product.variants.length > 1 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Available Colors:</p>
                <div className="flex gap-2">
                  {product.variants.map((variant, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border-2 border-border"
                      style={{ backgroundColor: variant.colorCode || '#ccc' }}
                      title={variant.color}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button onClick={() => addToCart(product)}>Add to cart</Button>
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Link to="/" className="ml-auto text-sm text-muted-foreground">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
