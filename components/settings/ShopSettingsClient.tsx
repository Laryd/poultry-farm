'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Save, Loader2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  minOrder: number;
  maxOrder: number;
  emoji: string;
  badges: string[];
  available: boolean;
  details: string[];
}

interface Settings {
  farmName: string;
  phone: string;
  deliveryFee: number;
  deliveryRegions: string;
  freeDeliveryThreshold: number;
  products: Product[];
}

const EMPTY_PRODUCT: Product = {
  id: '',
  name: '',
  description: '',
  price: 0,
  unit: '',
  category: 'other',
  minOrder: 1,
  maxOrder: 100,
  emoji: '📦',
  badges: [],
  available: true,
  details: [],
};

export default function ShopSettingsClient() {
  const [settings, setSettings] = useState<Settings>({
    farmName: '',
    phone: '',
    deliveryFee: 300,
    deliveryRegions: '',
    freeDeliveryThreshold: 5000,
    products: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSettings(d.data);
      })
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Settings saved successfully');
      } else {
        toast.error(data.error ?? 'Failed to save settings');
      }
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  function updateField<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  function updateProduct(idx: number, field: keyof Product, value: unknown) {
    setSettings((prev) => {
      const products = [...prev.products];
      products[idx] = { ...products[idx], [field]: value };
      return { ...prev, products };
    });
  }

  function addProduct() {
    const id = `product-${Date.now()}`;
    const newProduct = { ...EMPTY_PRODUCT, id };
    setSettings((prev) => ({ ...prev, products: [...prev.products, newProduct] }));
    setExpandedProduct(id);
  }

  function removeProduct(idx: number) {
    setSettings((prev) => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== idx),
    }));
  }

  function updateBadges(idx: number, raw: string) {
    const badges = raw.split(',').map((b) => b.trim()).filter(Boolean);
    updateProduct(idx, 'badges', badges);
  }

  function updateDetails(idx: number, raw: string) {
    const details = raw.split('\n').map((d) => d.trim()).filter(Boolean);
    updateProduct(idx, 'details', details);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Shown on the public shop page and all customer-facing content.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="farmName">Farm / Company Name</Label>
              <Input
                id="farmName"
                value={settings.farmName}
                onChange={(e) => updateField('farmName', e.target.value)}
                placeholder="FreshFarm Poultry"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Contact Phone</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+254 700 000 000"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="deliveryRegions">Delivery Region Description</Label>
              <Input
                id="deliveryRegions"
                value={settings.deliveryRegions}
                onChange={(e) => updateField('deliveryRegions', e.target.value)}
                placeholder="Nairobi & environs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery & Pricing</CardTitle>
          <CardDescription>Configure delivery fees and free delivery thresholds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="deliveryFee">Delivery Fee (KES)</Label>
              <Input
                id="deliveryFee"
                type="number"
                min={0}
                value={settings.deliveryFee}
                onChange={(e) => updateField('deliveryFee', Number(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="freeDelivery">Free Delivery Threshold (KES)</Label>
              <Input
                id="freeDelivery"
                type="number"
                min={0}
                value={settings.freeDeliveryThreshold}
                onChange={(e) => updateField('freeDeliveryThreshold', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">Orders above this amount get free delivery. Set to 0 to disable.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Products</CardTitle>
            <CardDescription>Manage what you sell in the shop and set prices.</CardDescription>
          </div>
          <Button size="sm" onClick={addProduct}>
            <Plus className="h-4 w-4 mr-1" />
            Add Product
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {settings.products.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No products yet. Click &quot;Add Product&quot; to get started.
            </p>
          )}
          {settings.products.map((product, idx) => {
            const isExpanded = expandedProduct === product.id;
            return (
              <div key={product.id} className="border rounded-lg overflow-hidden">
                {/* Product header row */}
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-xl flex-shrink-0">{product.emoji || '📦'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name || 'Unnamed product'}</p>
                    <p className="text-xs text-muted-foreground">KES {product.price.toLocaleString()} / {product.unit || '—'}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Switch
                      checked={product.available}
                      onCheckedChange={(v) => {
                        updateProduct(idx, 'available', v);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {product.available ? 'Available' : 'Hidden'}
                    </span>
                    {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Expanded form */}
                {isExpanded && (
                  <div className="border-t p-4 space-y-4 bg-muted/20">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1.5">
                        <Label>Emoji</Label>
                        <Input value={product.emoji} onChange={(e) => updateProduct(idx, 'emoji', e.target.value)} placeholder="🐔" className="text-center text-lg" />
                      </div>
                      <div className="col-span-1 sm:col-span-3 space-y-1.5">
                        <Label>Product Name</Label>
                        <Input value={product.name} onChange={(e) => updateProduct(idx, 'name', e.target.value)} placeholder="Live Broiler Chicken" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Description</Label>
                      <Input value={product.description} onChange={(e) => updateProduct(idx, 'description', e.target.value)} placeholder="Short description for customers" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1.5">
                        <Label>Price (KES)</Label>
                        <Input type="number" min={0} value={product.price} onChange={(e) => updateProduct(idx, 'price', Number(e.target.value))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Unit</Label>
                        <Input value={product.unit} onChange={(e) => updateProduct(idx, 'unit', e.target.value)} placeholder="bird / kg / tray" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Min Order</Label>
                        <Input type="number" min={1} value={product.minOrder} onChange={(e) => updateProduct(idx, 'minOrder', Number(e.target.value))} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Max Order</Label>
                        <Input type="number" min={1} value={product.maxOrder} onChange={(e) => updateProduct(idx, 'maxOrder', Number(e.target.value))} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label>Badges <span className="text-muted-foreground font-normal">(comma-separated)</span></Label>
                        <Input value={product.badges.join(', ')} onChange={(e) => updateBadges(idx, e.target.value)} placeholder="Best Seller, Farm Raised" />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Category</Label>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          value={product.category}
                          onChange={(e) => updateProduct(idx, 'category', e.target.value)}
                        >
                          <option value="chickens">Chickens</option>
                          <option value="eggs">Eggs</option>
                          <option value="chicks">Day-Old Chicks</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Details / Features <span className="text-muted-foreground font-normal">(one per line)</span></Label>
                      <textarea
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                        value={product.details.join('\n')}
                        onChange={(e) => updateDetails(idx, e.target.value)}
                        placeholder={"Average weight 2–3 kg\nVaccinated & healthy\nMinimum 1 bird"}
                        rows={3}
                      />
                    </div>

                    <Separator />
                    <Button variant="destructive" size="sm" onClick={() => removeProduct(idx)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove Product
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} size="lg">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          {saving ? 'Saving…' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
