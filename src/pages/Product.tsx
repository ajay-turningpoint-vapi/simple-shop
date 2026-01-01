import { Link, useParams, useNavigate } from "react-router-dom";
import { products } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";
import { ArrowLeft } from "lucide-react";

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const product = products.find((p) => p.id === id);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6">
          <h2 className="text-xl font-bold">Product not found</h2>
          <p className="text-muted-foreground mt-2">
            The product you are looking for does not exist.
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

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-start gap-6">
          <div className="w-1/2 bg-muted rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-bold">
                  {product.name}
                </h1>
                <p className="text-sm text-primary font-medium">
                  {product.flavor} •{" "}
                  <span className="text-muted-foreground">
                    {product.weight}
                  </span>
                </p>
              </div>
              {product.badge && (
                <Badge className="bg-primary text-primary-foreground">
                  {product.badge}
                </Badge>
              )}
            </div>

            <div>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            <div className="space-y-2">
              <div className="text-xl font-bold">
                {formatPrice(product.price)}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.benefits.map((b, i) => (
                  <span
                    key={i}
                    className="text-sm bg-secondary/50 px-3 py-1 rounded"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

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
