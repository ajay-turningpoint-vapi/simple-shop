import { useState } from 'react';
import { useProducts, CategoryItem } from '@/context/ProductContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';

const CategoryManager = () => {
  const { categories, addCategory, deleteCategory } = useProducts();
  const [newId, setNewId] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newImage, setNewImage] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newId || !newDisplayName) {
      toast.error('Please fill all fields');
      return;
    }
    const id = newId.toLowerCase().replace(/\s+/g, '-');
    const name = id;
    const image = newImage || 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=100&h=100&fit=crop';
    addCategory({ id, name, displayName: newDisplayName, image, isActive: true });
    toast.success('Category added!');
    setNewId('');
    setNewDisplayName('');
    setNewImage('');
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
            <Input
              id="catImage"
              value={newImage}
              onChange={(e) => setNewImage(e.target.value)}
              placeholder="Image URL (optional)"
            />
          </div>
          <Button type="submit">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </form>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg"
            >
              <div>
                <span className="font-medium">{cat.displayName}</span>
                <span className="text-xs text-muted-foreground ml-2">({cat.id})</span>
              </div>
              {cat.id !== 'all' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  onClick={() => handleDelete(cat.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryManager;
