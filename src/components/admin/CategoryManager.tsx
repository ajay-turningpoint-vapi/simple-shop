import { useState, useRef, useEffect } from 'react';
import { useProducts, CategoryItem } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { uploadApi } from '@/services/api';

const CategoryManager = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useProducts();
  const [newId, setNewId] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newImage, setNewImage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const tmpUrlsRef = useRef<string[]>([]);

  // Cleanup any leftover object URLs on unmount
  useEffect(() => {
    return () => {
      tmpUrlsRef.current.forEach((u) => {
        try { URL.revokeObjectURL(u); } catch (e) { /* ignore */ }
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
          try { URL.revokeObjectURL(obj); } catch (e) { /* ignore */ }
          tmpUrlsRef.current = tmpUrlsRef.current.filter(u => u !== obj);
        }
      };
    }

    if (newImage) {
      setPreviewUrl(newImage);
      return;
    }

    setPreviewUrl(null);
  }, [newFile, newImage]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newDisplayName) {
      toast.error('Please fill all fields');
      return;
    }

    const id = newId.toLowerCase().replace(/\s+/g, '-');
    const name = id;
    const image = newImage || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop';
    const input = fileRef.current;

    try {
      if (editingId) {
        // Update existing category
        await updateCategory(editingId, { displayName: newDisplayName, image });
        toast.success('Category updated!');
        setEditingId(null);
      } else {
        await addCategory({ id, name, displayName: newDisplayName, image, isActive: true });
        toast.success('Category added!');
      }
      setNewId('');
      setNewDisplayName('');
      setNewImage('');
      setNewFile(null);
    } catch (err) {
      toast.error('Failed to save category');
    } finally {
      // Cleanup: revoke temporary preview URL if it's an object URL
      if (previewUrl && previewUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ }
        tmpUrlsRef.current = tmpUrlsRef.current.filter(u => u !== previewUrl);
      }
      setPreviewUrl(null);
      // Reset input value after async operations
      if (input) {
        input.value = '';
      }
    }
  };

  const handleDelete = (id: string) => {
    if (id === 'all') {
      toast.error('Cannot delete "All Products" category');
      return;
    }
    deleteCategory(id);
    toast.success('Category deleted!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">Manage Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <Label htmlFor="catId" className="sr-only">ID</Label>
            <Input
              id="catId"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              placeholder="Category ID (e.g. electronics)"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="catDisplayName" className="sr-only">Display Name</Label>
            <Input
              id="catDisplayName"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="Display Name"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="catImage" className="sr-only">Image URL</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="catImage"
                value={newImage}
                onChange={(e) => setNewImage(e.target.value)}
                placeholder="Image URL (optional)"
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
                    toast.error('Please choose a file first');
                    return;
                  }
                  // Store current preview URL for cleanup
                  const currentPreview = previewUrl;
                  try {
                    const results = await uploadApi.uploadFiles([newFile]);
                    const first = results && results.length ? results[0] : null;
                    if (first && first.thumbUrl) {
                      // Use only thumb URL for category images
                      setNewImage(first.thumbUrl);
                      setPreviewUrl(first.thumbUrl);
                      toast.success('Image uploaded');
                      setNewFile(null);
                    } else {
                      throw new Error('No thumb URL returned from upload');
                    }
                  } catch (err) {
                    console.error(err);
                    toast.error('Upload failed');
                  } finally {
                    // Cleanup: revoke temporary preview URL if it was an object URL
                    if (currentPreview && currentPreview.startsWith('blob:')) {
                      try { URL.revokeObjectURL(currentPreview); } catch (e) { /* ignore */ }
                      tmpUrlsRef.current = tmpUrlsRef.current.filter(u => u !== currentPreview);
                    }
                    // Reset input value after async operations
                    if (input) {
                      input.value = '';
                    }
                  }
                }}
              >
                Upload
              </Button>

              {/* Preview */}
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="h-12 w-12 object-contain rounded ml-2 bg-white" />
              ) : (
                <div className="h-12 w-12 bg-secondary/20 rounded ml-2 flex items-center justify-center text-xs text-muted-foreground">No image</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit">
              {editingId ? (
                'Update'
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" /> Add
                </>
              )}
            </Button>
            {editingId && (
              <Button type="button" variant="ghost" onClick={() => {
                // Cleanup temporary preview URL if it's an object URL
                if (previewUrl && previewUrl.startsWith('blob:')) {
                  try { URL.revokeObjectURL(previewUrl); } catch (e) { /* ignore */ }
                  tmpUrlsRef.current = tmpUrlsRef.current.filter(u => u !== previewUrl);
                }
                setEditingId(null);
                setNewId('');
                setNewDisplayName('');
                setNewImage('');
                setNewFile(null);
                setPreviewUrl(null);
                if (fileRef.current) fileRef.current.value = '';
              }}>
                Cancel
              </Button>
            )}
          </div>
        </form>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg"
            >
              <div className="flex items-center gap-3">
                {cat.image ? (
                  <img src={cat.image} alt={cat.displayName} className="h-8 w-8 object-contain rounded bg-white" />
                ) : (
                  <div className="h-8 w-8 bg-secondary/20 rounded flex items-center justify-center text-xs text-muted-foreground">No image</div>
                )}
                <div>
                  <span className="font-medium">{cat.displayName}</span>
                  <span className="text-xs text-muted-foreground ml-2">({cat.id})</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cat.id !== 'all' && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        // Prefill for edit
                        setEditingId(cat.id);
                        setNewId(cat.id);
                        setNewDisplayName(cat.displayName);
                        setNewImage(cat.image || '');
                        setPreviewUrl(cat.image || '');
                      }}
                    >
                      <Plus className="h-4 w-4 rotate-45" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(cat.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryManager;
