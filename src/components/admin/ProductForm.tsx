import { useState, useEffect, useRef } from "react";
import {
  useProducts,
  Product,
  Category,
  ProductVariant,
} from "@/context/ProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadApi } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";

interface ProductFormProps {
  product?: Product;
  open: boolean;
  onClose: () => void;
}

const ProductForm = ({ product, open, onClose }: ProductFormProps) => {
  const { addProduct, updateProduct, categories, getAllCategoriesFlat } =
    useProducts();
  const isEdit = !!product;

  // Get all categories including subcategories for the dropdown
  const allCategories = getAllCategoriesFlat().filter((c) => c.id !== "all");

  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    mrp: product?.mrp || 0,
    price: product?.price || 0,
    discountPercent: product?.discountPercent || 0,
    category: product?.category || ("other" as Category),
    brand: product?.brand || "",
    images: product?.images || [{ detail: { url: "" } }],
    variants: product?.variants || [
      {
        color: "",
        colorCode: "",
        stock: 0,
        images: [],
        sku: "",
        isAvailable: true,
      },
    ],
    specifications: product?.specifications
      ? Object.entries(product.specifications).map(([k, v]) => ({
          key: k,
          value: String(v),
        }))
      : [],
    tags: product?.tags?.join(", ") || "",
    isActive: product?.isActive ?? true,
  });

  // When the product prop changes (open for edit), update form data to prefill fields
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        mrp: product.mrp || 0,
        price: product.price || 0,
        discountPercent: product.discountPercent || 0,
        category: product.category || ("other" as Category),
        brand: product.brand || "",
        images: product.images || [{ detail: { url: "" } }],
        variants: product.variants || [
          {
            color: "",
            colorCode: "",
            stock: 0,
            images: [],
            sku: "",
            isAvailable: true,
          },
        ],
        specifications: product.specifications
          ? Object.entries(product.specifications).map(([k, v]) => ({
              key: k,
              value: String(v),
            }))
          : [],
        tags: product.tags?.join(", ") || "",
        isActive: product.isActive ?? true,
      });
    } else if (!product) {
      // when adding a new product (no product passed), reset to blank when opening
      setFormData({
        name: "",
        description: "",
        mrp: 0,
        price: 0,
        discountPercent: 0,
        category: "other" as Category,
        brand: "",
        images: [{ detail: { url: "" } }],
        variants: [
          {
            color: "",
            colorCode: "",
            stock: 0,
            images: [],
            sku: "",
            isAvailable: true,
          },
        ],
        specifications: [],
        tags: "",
        isActive: true,
      });
    }
  }, [product, open]);

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
      images: formData.images.filter(
        (img: any) => !!(img?.detail?.url || img?.thumb?.url)
      ),
      variants: formData.variants.filter((v: any) => v.color),
      specifications: Object.fromEntries(
        formData.specifications
          .filter((s: any) => s.key)
          .map((s: any) => [s.key, s.value])
      ),

      tags: formData.tags
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean),
      isActive: formData.isActive,
    };

    if (isEdit && product) {
      updateProduct(product.id, productData);
      toast.success("Product updated!");
    } else {
      addProduct(productData);
      toast.success("Product added!");
    }
    onClose();
  };

  const addImage = () => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { detail: { url: "" } }],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const updateImage = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) =>
        i === index
          ? { ...(img || {}), detail: { ...(img?.detail || {}), url: value } }
          : img
      ),
    }));
  };

  // Temporary previews for files while uploading
  const [tempPreviews, setTempPreviews] = useState<Record<number, string>>({});
  const tmpUrlsRef = useRef<string[]>([]);

  // Cleanup any leftover object URLs on unmount
  useEffect(() => {
    return () => {
      tmpUrlsRef.current.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch (e) {
          /* ignore */
        }
      });
      tmpUrlsRef.current = [];
    };
  }, []);

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          color: "",
          colorCode: "",
          stock: 0,
          images: [],
          sku: "",
          isAvailable: true,
        },
      ],
    }));
  };

  const removeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v
      ),
    }));
  };

  // Specifications helpers
  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const updateSpecificationKey = (index: number, key: string) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.map((s, i) =>
        i === index ? { ...s, key } : s
      ),
    }));
  };

  const updateSpecificationValue = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.map((s, i) =>
        i === index ? { ...s, value } : s
      ),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEdit ? "Edit Product" : "Add Product"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, brand: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
              rows={3}
              minLength={50}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mrp">MRP (₹) *</Label>
              <Input
                id="mrp"
                type="number"
                value={formData.mrp}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mrp: Number(e.target.value),
                  }))
                }
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    discountPercent: Number(e.target.value),
                  }))
                }
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
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: value as Category,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, tags: e.target.value }))
                }
                placeholder="bestseller, new, sale"
              />
            </div>
          </div>

          {/* Images */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Images</Label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addImage}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
                <input
                  id="multiUpload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const input = e.currentTarget;
                    const files = input.files;
                    if (!files || files.length === 0) return;
                    try {
                      const results = await uploadApi.uploadFiles(files);
                      const urls = results
                        .map((r) => r.detailUrl || r.thumbUrl)
                        .filter(Boolean) as string[];
                      if (urls.length) {
                        const imgs = urls.map((u) => ({ detail: { url: u } }));
                        setFormData((prev) => ({
                          ...prev,
                          images: [...prev.images, ...imgs],
                        }));
                        toast.success("Uploaded images");
                      }
                    } catch (err) {
                      console.error(err);
                      toast.error("Upload failed");
                    } finally {
                      // reset input
                      if (input) {
                        input.value = "";
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById("multiUpload")?.click()
                  }
                >
                  Upload Files
                </Button>
              </div>
            </div>
            {formData.images.map((img: any, index: number) => (
              <div key={index} className="flex gap-2 items-center">
                {/* Preview */}
                {tempPreviews[index] || img?.detail?.url || img?.thumb?.url ? (
                  <img
                    src={
                      tempPreviews[index] || img?.detail?.url || img?.thumb?.url
                    }
                    alt={`preview-${index}`}
                    className="h-12 w-12 object-contain rounded bg-white"
                  />
                ) : (
                  <div className="h-12 w-12 bg-secondary/20 rounded flex items-center justify-center text-xs text-muted-foreground">
                    No image
                  </div>
                )}

                <Input
                  value={img?.detail?.url || ""}
                  onChange={(e) => updateImage(index, e.target.value)}
                  placeholder="Image URL"
                />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id={`imgfile-${index}`}
                  onChange={async (e) => {
                    const input = e.currentTarget;
                    const f = input.files?.[0];
                    if (!f) return;
                    const tmp = URL.createObjectURL(f);
                    tmpUrlsRef.current.push(tmp);
                    setTempPreviews((prev) => ({ ...prev, [index]: tmp }));
                    try {
                      const results = await uploadApi.uploadFiles([f]);
                      const res = results[0];
                      const url = res?.detailUrl || res?.thumbUrl;
                      if (url) {
                        // set the image object with detail/thumb
                        setFormData((prev) => ({
                          ...prev,
                          images: prev.images.map((im: any, i: number) =>
                            i === index
                              ? {
                                  ...(im || {}),
                                  detail: {
                                    ...(im?.detail || {}),
                                    url: res?.detailUrl,
                                  },
                                  thumb: res?.thumbUrl
                                    ? {
                                        filename: res.filename,
                                        url: res.thumbUrl,
                                      }
                                    : im?.thumb,
                                }
                              : im
                          ),
                        }));
                        toast.success("Image uploaded");
                      } else {
                        toast.error("No URL returned");
                      }
                    } catch (err) {
                      console.error(err);
                      toast.error("Upload failed");
                    } finally {
                      // cleanup temp preview
                      try {
                        URL.revokeObjectURL(tmp);
                      } catch (e) {
                        /* ignore */
                      }
                      tmpUrlsRef.current = tmpUrlsRef.current.filter(
                        (u) => u !== tmp
                      );
                      setTempPreviews((prev) => {
                        const copy = { ...prev };
                        delete copy[index];
                        return copy;
                      });
                      if (input) {
                        input.value = "";
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    document.getElementById(`imgfile-${index}`)?.click()
                  }
                >
                  Choose
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Variants */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Color Variants</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addVariant}
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {formData.variants.map((variant, index) => (
              <div
                key={index}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-secondary/30 rounded-lg"
              >
                <Input
                  value={variant.color}
                  onChange={(e) =>
                    updateVariant(index, "color", e.target.value)
                  }
                  placeholder="Color name"
                />
                <Input
                  value={variant.colorCode}
                  onChange={(e) =>
                    updateVariant(index, "colorCode", e.target.value)
                  }
                  placeholder="#HEX"
                />
                <Input
                  type="number"
                  value={variant.stock}
                  onChange={(e) =>
                    updateVariant(index, "stock", Number(e.target.value))
                  }
                  placeholder="Stock"
                  min={0}
                />
                <div className="flex items-center gap-2">
                  <Input
                    value={variant.sku}
                    onChange={(e) =>
                      updateVariant(index, "sku", e.target.value)
                    }
                    placeholder="SKU"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVariant(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Specifications */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Specifications</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSpecification}
              >
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            </div>
            {formData.specifications.map((spec, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={spec.key}
                  onChange={(e) =>
                    updateSpecificationKey(index, e.target.value)
                  }
                  placeholder="Key (e.g., Display)"
                />
                <Input
                  value={spec.value}
                  onChange={(e) =>
                    updateSpecificationValue(index, e.target.value)
                  }
                  placeholder="Value (e.g., 6.1-inch Super Retina XDR OLED)"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeSpecification(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {isEdit ? "Update" : "Add"} Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
