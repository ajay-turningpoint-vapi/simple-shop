import { useState, useRef, useEffect } from "react";
import { useProducts, CategoryItem } from "@/context/ProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Trash2,
  Plus,
  Pencil,
  ChevronRight,
  ChevronDown,
  GripVertical,
  Folder,
  FolderOpen,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { uploadApi } from "@/services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const CategoryManager = () => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    refreshCategories,
  } = useProducts();

  // Form visibility state
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [newId, setNewId] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newParentCategory, setNewParentCategory] = useState<string>("null");
  const [newLevel, setNewLevel] = useState<number>(0);
  const [newOrder, setNewOrder] = useState<number>(0);
  const [newIsActive, setNewIsActive] = useState<boolean>(true);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const tmpUrlsRef = useRef<string[]>([]);

  // Expand/collapse state for parent categories
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    new Set()
  );

  // Get all categories (including subcategories) for parent selection
  const allCategories = categories.flatMap((cat) => {
    const result: CategoryItem[] = [cat];
    if (cat.subcategories && cat.subcategories.length > 0) {
      result.push(...cat.subcategories);
    }
    return result;
  });

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

  // Create a preview when a file is chosen or when URL is entered
  useEffect(() => {
    let obj: string | null = null;
    if (newFile) {
      obj = URL.createObjectURL(newFile);
      tmpUrlsRef.current.push(obj);
      setPreviewUrl(obj);
      return () => {
        if (obj) {
          try {
            URL.revokeObjectURL(obj);
          } catch (e) {
            /* ignore */
          }
          tmpUrlsRef.current = tmpUrlsRef.current.filter((u) => u !== obj);
        }
      };
    }

    if (newImage) {
      setPreviewUrl(newImage);
      return;
    }

    setPreviewUrl(null);
  }, [newFile, newImage]);

  // Auto-calculate level when parent changes
  useEffect(() => {
    if (newParentCategory === "null" || newParentCategory === "") {
      setNewLevel(0);
    } else {
      const parentCat = allCategories.find((c) => c.id === newParentCategory);
      if (parentCat) {
        setNewLevel((parentCat.level || 0) + 1);
      }
    }
  }, [newParentCategory, allCategories]);

  // Toggle expanded state for a parent category
  const toggleExpand = (categoryId: string) => {
    setExpandedParents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // Open form for adding new category
  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  // Open form for editing a category
  const openEditForm = (category: CategoryItem) => {
    startEdit(category);
    setShowForm(true);
  };

  // Close the form
  const closeForm = () => {
    setShowForm(false);
    cancelEdit();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDisplayName) {
      toast.error("Please enter a display name");
      return;
    }

    const id =
      newId ||
      newDisplayName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    const name = id;
    const image =
      newImage ||
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop";
    const parentCategory =
      newParentCategory === "null" ? null : newParentCategory || null;

    const input = fileRef.current;

    try {
      if (editingId) {
        // Update existing category
        await updateCategory(editingId, {
          displayName: newDisplayName,
          description: newDescription || undefined,
          image,
          parentCategory,
          level: newLevel,
          order: newOrder,
          isActive: newIsActive,
        });
        toast.success("Category updated!");
      } else {
        await addCategory({
          id: `${id}-${Date.now()}`, // Temporary ID, API will generate proper ID
          name,
          displayName: newDisplayName,
          description: newDescription || undefined,
          image,
          parentCategory,
          level: newLevel,
          order: newOrder,
          isActive: newIsActive,
        });
        toast.success("Category added!");
      }
      closeForm();
      refreshCategories();
    } catch (err) {
      toast.error("Failed to save category");
    } finally {
      cleanupPreview(input);
    }
  };

  const cleanupPreview = (input: HTMLInputElement | null) => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(previewUrl);
      } catch (e) {
        /* ignore */
      }
      tmpUrlsRef.current = tmpUrlsRef.current.filter((u) => u !== previewUrl);
    }
    setPreviewUrl(null);
    if (input) {
      input.value = "";
    }
  };

  const resetForm = () => {
    setNewId("");
    setNewDisplayName("");
    setNewDescription("");
    setNewImage("");
    setNewParentCategory("null");
    setNewLevel(0);
    setNewOrder(0);
    setNewIsActive(true);
    setNewFile(null);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (id === "all") {
      toast.error('Cannot delete "All Products" category');
      return;
    }
    deleteCategory(id);
    toast.success("Category deleted!");
    refreshCategories();
  };

  const startEdit = (category: CategoryItem) => {
    setEditingId(category.id);
    setNewId(category.id);
    setNewDisplayName(category.displayName);
    setNewDescription(category.description || "");
    setNewImage(category.image || "");
    setNewParentCategory(category.parentCategory || "null");
    setNewLevel(category.level || 0);
    setNewOrder(category.order || 0);
    setNewIsActive(category.isActive);
    setPreviewUrl(category.image || null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
    if (fileRef.current) fileRef.current.value = "";
  };

  // Render category item with proper indentation for hierarchy
  const renderCategoryItem = (
    category: CategoryItem,
    depth: number = 0,
    isSubcategory: boolean = false
  ) => {
    const hasSubcategories =
      category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedParents.has(category.id);
    const indentClass = isSubcategory ? "ml-6" : "";

    return (
      <div key={category.id} className="contents">
        <div
          className={cn(
            "flex items-center justify-between p-3 bg-secondary/30 rounded-lg mb-1",
            indentClass,
            !category.isActive && "opacity-60"
          )}
        >
          <div className="flex items-center gap-3">
            {/* Drag handle and expand/collapse for parents */}
            <div className="flex items-center gap-1">
              {hasSubcategories ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleExpand(category.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              ) : (
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Category icon/image */}
            {category.image ? (
              <img
                src={category.image}
                alt={category.displayName}
                className="h-8 w-8 object-contain rounded bg-white"
              />
            ) : (
              <div className="h-8 w-8 bg-secondary/20 rounded flex items-center justify-center">
                {hasSubcategories ? (
                  isExpanded ? (
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Folder className="h-4 w-4 text-muted-foreground" />
                  )
                ) : (
                  <Folder className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            )}

            {/* Category info */}
            <div>
              <span className="font-medium">{category.displayName}</span>
              {category.description && (
                <span className="text-xs text-muted-foreground ml-2 hidden lg:inline">
                  ({category.description.slice(0, 30)}
                  {category.description.length > 30 ? "..." : ""})
                </span>
              )}
              <span className="text-xs text-muted-foreground ml-2">
                {isSubcategory && `(Level ${category.level})`}
              </span>
            </div>

            {/* Badge for inactive */}
            {!category.isActive && (
              <span className="text-xs bg-muted px-2 py-0.5 rounded">
                Inactive
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {category.id !== "all" && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openEditForm(category)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Render subcategories if expanded */}
        {hasSubcategories && isExpanded && (
          <div className="ml-2">
            {category.subcategories!.map((subcat) =>
              renderCategoryItem(subcat, depth + 1, true)
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-display text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Manage Categories
          </span>
          {!showForm && (
            <Button size="sm" onClick={openAddForm}>
              <Plus className="h-4 w-4 mr-1" />
              Add Category
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add/Edit Form - Only visible when showForm is true */}
        {showForm && (
          <form
            onSubmit={handleAdd}
            className="p-4 bg-secondary/20 rounded-lg space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">
                {editingId ? "Edit Category" : "Add New Category"}
              </h3>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeForm}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Display Name */}
              <div className="space-y-2">
                <Label htmlFor="catDisplayName">Display Name *</Label>
                <Input
                  id="catDisplayName"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  placeholder="e.g., Sports Nutrition"
                />
              </div>

              {/* Category ID (for editing only) */}
              {editingId && (
                <div className="space-y-2">
                  <Label htmlFor="catId">Category ID</Label>
                  <Input
                    id="catId"
                    value={newId}
                    disabled
                    className="bg-muted"
                  />
                </div>
              )}

              {/* Parent Category */}
              <div className="space-y-2">
                <Label htmlFor="catParent">Parent Category</Label>
                <Select
                  value={newParentCategory}
                  onValueChange={setNewParentCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent (none for top-level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">
                      None (Top-level Category)
                    </SelectItem>
                    {allCategories
                      .filter((c) => c.id !== "all" && c.id !== editingId)
                      .map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.displayName}{" "}
                          {cat.level !== undefined
                            ? `(Level ${cat.level})`
                            : ""}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level */}
              <div className="space-y-2">
                <Label htmlFor="catLevel">Level</Label>
                <Input
                  id="catLevel"
                  type="number"
                  value={newLevel}
                  onChange={(e) => setNewLevel(parseInt(e.target.value) || 0)}
                  min={0}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  {newParentCategory === "null" || newParentCategory === ""
                    ? "Level 0 = Top-level category"
                    : `Level ${newLevel} = Subcategory of selected parent`}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="catDescription">Description</Label>
                <Textarea
                  id="catDescription"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Optional description for this category"
                  rows={2}
                />
              </div>

              {/* Image URL / Upload */}
              <div className="space-y-2 md:col-span-2">
                <Label>Category Image</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    value={newImage}
                    onChange={(e) => setNewImage(e.target.value)}
                    placeholder="Image URL (or leave empty to use default)"
                    className="flex-1"
                  />

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const input = e.currentTarget;
                      setNewFile(input.files?.[0] || null);
                    }}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                  >
                    Choose
                  </Button>

                  <Button
                    type="button"
                    onClick={async () => {
                      const input = fileRef.current;
                      if (!newFile) {
                        toast.error("Please choose a file first");
                        return;
                      }
                      const currentPreview = previewUrl;
                      try {
                        const results = await uploadApi.uploadFiles([newFile]);
                        const first =
                          results && results.length ? results[0] : null;
                        if (first && first.thumbUrl) {
                          setNewImage(first.thumbUrl);
                          setPreviewUrl(first.thumbUrl);
                          toast.success("Image uploaded");
                          setNewFile(null);
                        } else {
                          throw new Error("No thumb URL returned from upload");
                        }
                      } catch (err) {
                        console.error(err);
                        toast.error("Upload failed");
                      } finally {
                        if (
                          currentPreview &&
                          currentPreview.startsWith("blob:")
                        ) {
                          try {
                            URL.revokeObjectURL(currentPreview);
                          } catch (e) {
                            /* ignore */
                          }
                          tmpUrlsRef.current = tmpUrlsRef.current.filter(
                            (u) => u !== currentPreview
                          );
                        }
                        if (input) input.value = "";
                      }
                    }}
                  >
                    Upload
                  </Button>

                  {/* Preview */}
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="preview"
                      className="h-12 w-12 object-contain rounded ml-2 bg-white border"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-secondary/20 rounded ml-2 flex items-center justify-center text-xs text-muted-foreground border">
                      No image
                    </div>
                  )}
                </div>
              </div>

              {/* Order */}
              <div className="space-y-2">
                <Label htmlFor="catOrder">Display Order</Label>
                <Input
                  id="catOrder"
                  type="number"
                  value={newOrder}
                  onChange={(e) => setNewOrder(parseInt(e.target.value) || 0)}
                  min={0}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Higher numbers appear first
                </p>
              </div>

              {/* Active status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={newIsActive}
                    onCheckedChange={setNewIsActive}
                  />
                  <span className="text-sm">
                    {newIsActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button type="submit">
                {editingId ? (
                  <>
                    <Pencil className="h-4 w-4 mr-1" /> Update Category
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" /> Add Category
                  </>
                )}
              </Button>

              <Button type="button" variant="ghost" onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        <Separator />

        {/* Categories List - Hierarchical View */}
        <div>
          <h3 className="font-medium mb-3 flex items-center gap-2">
            <Folder className="h-4 w-4" />
            All Categories ({categories.length} top-level)
          </h3>

          {categories.length > 1 ? (
            <div className="space-y-1 max-h-[500px] overflow-y-auto pr-2">
              {categories
                .filter((cat) => cat.id !== "all")
                .map((category) => renderCategoryItem(category, 0, false))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Folder className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No categories yet</p>
              <p className="text-sm">
                Add your first category using the form above
              </p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1">
            <Folder className="h-3 w-3" />
            <span>Parent Category</span>
          </div>
          <div className="flex items-center gap-1">
            <Folder className="h-3 w-3 ml-4" />
            <span>Subcategory</span>
          </div>
          <div className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 ml-4" />
            <span>Click to expand</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryManager;
