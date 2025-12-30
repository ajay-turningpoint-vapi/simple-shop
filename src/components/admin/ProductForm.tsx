import { useState } from 'react';
import { useProducts, Product, Category, ProductVariant } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { X, Plus } from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  open: boolean;
  onClose: () => void;
}

const ProductForm = ({ product, open, onClose }: ProductFormProps) => {
  const { addProduct, updateProduct, categories } = useProducts();
  const isEdit = !!product;

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    mrp: product?.mrp || 0,
    price: product?.price || 0,
    discountPercent: product?.discountPercent || 0,
    category: product?.category || 'other' as Category,
    brand: product?.brand || '',
    images: product?.images || [''],
    variants: product?.variants || [{ color: '', colorCode: '', stock: 0, images: [], sku: '', isAvailable: true }],
    tags: product?.tags?.join(', ') || '',
    isActive: product?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      description: formData.description,
      mrp: Number(formData.mrp),
      price: Number(formData.price),
      discountPercent: Number(formData.discountPercent),
      category: formData.category,
      brand: formData.brand,
      images: formData.images.filter(Boolean),
      variants: formData.variants.filter(v => v.color),
      specifications: {},
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      isActive: formData.isActive,
    };

    if (isEdit && product) {
      updateProduct(product.id, productData);
      toast.success('Product updated!');
    } else {
      addProduct(productData);
      toast.success('Product added!');
    }
    onClose();
  };

  const addImage = () => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const updateImage = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((img, i) => (i === index ? value : img)),
    }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { color: '', colorCode: '', stock: 0, images: [], sku: '', isAvailable: true }],
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }));
  };

  const filteredCategories = categories.filter(c => c.id !== 'all');

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">{isEdit ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              required
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mrp">MRP (₹) *</Label>
              <Input
                id="mrp"
                type="number"
                value={formData.mrp}
                onChange={(e) => setFormData(prev => ({ ...prev, mrp: Number(e.target.value) }))}
                required
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Selling Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                required
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount %</Label>
              <Input
                id="discount"
                type="number"
                value={formData.discountPercent}
                onChange={(e) => setFormData(prev => ({ ...prev, discountPercent: Number(e.target.value) }))}
                min={0}
                max={100}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as Category }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="bestseller, new, sale"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Images</Label>
              <Button type="button" variant="outline" size="sm" onClick={addImage}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {formData.images.map((img, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={img}
                  onChange={(e) => updateImage(index, e.target.value)}
                  placeholder="Image URL"
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Variants */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Color Variants</Label>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {formData.variants.map((variant, index) => (
              <div key={index} className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-secondary/30 rounded-lg">
                <Input
                  value={variant.color}
                  onChange={(e) => updateVariant(index, 'color', e.target.value)}
                  placeholder="Color name"
                />
                <Input
                  value={variant.colorCode}
                  onChange={(e) => updateVariant(index, 'colorCode', e.target.value)}
                  placeholder="#HEX"
                />
                <Input
                  type="number"
                  value={variant.stock}
                  onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
                  placeholder="Stock"
                  min={0}
                />
                <div className="flex items-center gap-2">
                  <Input
                    value={variant.sku}
                    onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                    placeholder="SKU"
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(index)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {isEdit ? 'Update' : 'Add'} Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
