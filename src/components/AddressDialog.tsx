import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

const STORAGE_KEY = 'customer_addresses_v1';

interface AddressDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called when an address is confirmed (either newly added or selected) */
  onConfirm: (address: Address) => void;
}

const AddressDialog = ({ open, onClose, onConfirm }: AddressDialogProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<Address, 'id'>>({
    name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Load addresses from localStorage when dialog opens
  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: Address[] = JSON.parse(raw);
        setAddresses(parsed);
        if (parsed.length > 0) {
          setSelectedId(parsed[0].id);
        }
      } else {
        setAddresses([]);
        setSelectedId(null);
      }
    } catch {
      setAddresses([]);
      setSelectedId(null);
    }
    // reset form state when opening
    setEditingId(null);
    setForm({
      name: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
    });
  }, [open]);

  const persist = (list: Address[]) => {
    setAddresses(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore storage errors
    }
  };

  const startAddNew = () => {
    setEditingId(null);
    setForm({
      name: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
    });
  };

  const startEdit = (id: string) => {
    const addr = addresses.find((a) => a.id === id);
    if (!addr) return;
    setEditingId(id);
    setForm({
      name: addr.name,
      phone: addr.phone,
      line1: addr.line1,
      line2: addr.line2 || '',
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed: Omit<Address, 'id'> = {
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
      line1: form.line1.trim(),
      line2: form.line2?.trim() || '',
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
    };

    if (!trimmed.name || !trimmed.phone || !trimmed.line1 || !trimmed.city || !trimmed.state || !trimmed.pincode) {
      return;
    }

    let updated: Address[];
    let finalAddress: Address;

    if (editingId) {
      updated = addresses.map((a) => (a.id === editingId ? { ...a, ...trimmed } : a));
      finalAddress = updated.find((a) => a.id === editingId)!;
    } else {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      finalAddress = { id, ...trimmed };
      updated = [...addresses, finalAddress];
    }

    persist(updated);
    setSelectedId(finalAddress.id);
    onConfirm(finalAddress);
    onClose();
  };

  const handleUseSelected = () => {
    if (!selectedId) return;
    const addr = addresses.find((a) => a.id === selectedId);
    if (!addr) return;
    onConfirm(addr);
    onClose();
  };

  const hasExisting = addresses.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Delivery Address</DialogTitle>
        </DialogHeader>

        {hasExisting && (
          <div className="space-y-2 mb-4">
            <p className="text-sm font-medium">Select an existing address</p>
            <div className="space-y-2">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => setSelectedId(addr.id)}
                  className={cn(
                    'w-full text-left border rounded-lg p-3 text-sm hover:border-primary transition-colors',
                    selectedId === addr.id && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="flex justify-between items-center gap-2">
                    <div>
                      <div className="font-semibold">{addr.name}</div>
                      <div className="text-xs text-muted-foreground">{addr.phone}</div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        startEdit(addr.id);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {addr.line1}
                    {addr.line2 && <>, {addr.line2}</>}
                    <br />
                    {addr.city}, {addr.state} - {addr.pincode}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              <Button
                type="button"
                className="flex-1"
                disabled={!selectedId}
                onClick={handleUseSelected}
              >
                Use Selected Address
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={startAddNew}
              >
                Add New
              </Button>
            </div>

            <div className="border-t my-4" />
          </div>
        )}

        {/* Address form (for new or edit) */}
        <form onSubmit={handleSave} className="space-y-3">
          <p className="text-sm font-medium">
            {editingId ? 'Edit address' : hasExisting ? 'Or add a new address' : 'Add your address to continue'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="addr-name">Full Name *</Label>
              <Input
                id="addr-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="addr-phone">Phone *</Label>
              <Input
                id="addr-phone"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="addr-line1">Address Line 1 *</Label>
            <Textarea
              id="addr-line1"
              rows={2}
              value={form.line1}
              onChange={(e) => setForm((prev) => ({ ...prev, line1: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="addr-line2">Address Line 2 (optional)</Label>
            <Input
              id="addr-line2"
              value={form.line2}
              onChange={(e) => setForm((prev) => ({ ...prev, line2: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="addr-city">City *</Label>
              <Input
                id="addr-city"
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="addr-state">State *</Label>
              <Input
                id="addr-state"
                value={form.state}
                onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="addr-pincode">Pincode *</Label>
              <Input
                id="addr-pincode"
                value={form.pincode}
                onChange={(e) => setForm((prev) => ({ ...prev, pincode: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save & Continue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressDialog;


