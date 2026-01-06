import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProducts, Product } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LogOut, Plus, Pencil, Trash2, Search, Package, Tags, Home } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { getPrimaryImage, getImageUrl } from '@/lib/utils';
import ProductForm from './ProductForm';
import CategoryManager from './CategoryManager';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const { products, deleteProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [editProduct, setEditProduct] = useState<Product | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete "${name}"?`)) {
      deleteProduct(id);
      toast.success('Product deleted!');
    }
  };

  const handleEdit = (product: Product) => {
    console.log("edit product", product);

    setEditProduct(product);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditProduct(undefined);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-display text-xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 mr-1" /> Store
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{products.length}</p>
                  <p className="text-xs text-muted-foreground">Total Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{products.filter(p => p.isActive).length}</p>
                  <p className="text-xs text-muted-foreground">Active Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowCategories(!showCategories)}
              className="flex-1 sm:flex-none"
            >
              <Tags className="h-4 w-4 mr-1" /> Categories
            </Button>
            <Button onClick={() => setShowForm(true)} className="flex-1 sm:flex-none">
              <Plus className="h-4 w-4 mr-1" /> Add Product
            </Button>
          </div>
        </div>

        {/* Category Manager */}
        {showCategories && <CategoryManager />}

        {/* Products Table - Desktop */}
        <div className="hidden md:block">
          <Card>
            <CardHeader>
              <CardTitle className="font-display">Products ({filteredProducts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>


                  {filteredProducts.map((product) => {
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center -space-x-1">
                            {product.images && product.images.length > 0 ? (
                              product.images.slice(0, 3).map((src, i) => (
                                <img
                                  key={i}
                                  src={getImageUrl(src)}
                                  alt={`${product.name}-thumb-${i}`}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-8 h-8 object-contain rounded border border-border bg-white"
                                />
                              ))
                            ) : (
                              <img src="/placeholder.svg" alt="placeholder" className="w-8 h-8 object-contain rounded bg-white" />
                            )}

                            {product.images.length > 3 && (
                              <div className="ml-1 text-xs text-muted-foreground">+{product.images.length - 3}</div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="font-medium">{product.name}</TableCell>

                        <TableCell>
                          <Badge variant="secondary">{product.category}</Badge>
                        </TableCell>

                        <TableCell>
                          <div>
                            <span className="font-semibold">{formatPrice(product.price)}</span>
                            {product.discountPercent > 0 && (
                              <span className="text-xs text-muted-foreground line-through ml-1">
                                {formatPrice(product.mrp)}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant={product.isActive ? 'default' : 'secondary'}>
                            {product.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                console.log("Edit clicked:", product);
                                handleEdit(product);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => {
                                console.log("Delete clicked:", product.id, product.name);
                                handleDelete(product.id, product.name);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Products Cards - Mobile */}
        <div className="md:hidden space-y-3">
          {filteredProducts.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <img
                    src={getPrimaryImage(product.images)}
                    alt={product.name}
                    loading="lazy"
                    decoding="async"
                    className="w-16 h-16 object-contain rounded bg-white"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{product.category?.length > 10
                        ? product.category.slice(0, 15) + "…"
                        : product.category}</Badge>
                      <Badge variant={product.isActive ? 'default' : 'secondary'} className="text-xs">
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="mt-1">
                      <span className="font-semibold text-sm">{formatPrice(product.price)}</span>
                      {product.discountPercent > 0 && (
                        <span className="text-xs text-muted-foreground line-through ml-1">
                          {formatPrice(product.mrp)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(product)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(product.id, product.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}


        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-display text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Add your first product to get started.</p>
          </div>
        )}
      </main>

      <ProductForm product={editProduct} open={showForm} onClose={handleCloseForm} />
    </div>
  );
};

export default AdminDashboard;
