'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice, type Product } from '@/lib/products';
import { useCart } from '@/components/shop/CartContext';
import { ShoppingCart, Plus, Minus, X, ChevronRight, Check, Phone, MapPin } from 'lucide-react';

export interface ShopSettings {
  farmName: string;
  phone: string;
  deliveryFee: number;
  deliveryRegions: string;
  freeDeliveryThreshold: number;
  products: Product[];
}

function ProductCard({ product }: { product: Product }) {
  const { addItem, items, updateQuantity, removeItem } = useCart();
  const [qty, setQty] = useState(product.minOrder);
  const [added, setAdded] = useState(false);

  const cartItem = items.find((i) => i.productId === product.id);

  const handleAdd = () => {
    addItem(
      {
        productId: product.id,
        productName: product.name,
        price: product.price,
        unit: product.unit,
        emoji: product.emoji,
      },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="shop-glass-card rounded-2xl overflow-hidden flex flex-col">
      {/* Card header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <span className="text-5xl animate-float">{product.emoji}</span>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {product.badges.map((b) => (
              <span
                key={b}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/25 text-white border border-white/30 uppercase tracking-wide"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>
        <p className="text-white/65 text-sm leading-relaxed mb-4">{product.description}</p>

        <ul className="space-y-1 mb-4">
          {product.details.map((d) => (
            <li key={d} className="flex items-center gap-1.5 text-xs text-white/60">
              <Check className="h-3 w-3 text-green-300 flex-shrink-0" />
              {d}
            </li>
          ))}
        </ul>
      </div>

      {/* Price + controls */}
      <div className="mt-auto p-5 pt-0">
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-2xl font-bold text-white">{formatPrice(product.price)}</span>
          <span className="text-white/50 text-sm">/ {product.unit}</span>
        </div>

        {cartItem ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 flex-1 bg-white/15 rounded-xl p-1 border border-white/20">
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                className="h-8 w-8 rounded-lg bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="flex-1 text-center text-white font-semibold text-sm">
                {cartItem.quantity} {product.unit}{cartItem.quantity > 1 && product.unit !== 'tray (30 eggs)' ? 's' : ''}
              </span>
              <button
                onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                className="h-8 w-8 rounded-lg bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={() => removeItem(product.id)}
              className="h-10 w-10 rounded-xl bg-red-500/25 hover:bg-red-500/40 text-red-200 flex items-center justify-center transition-colors border border-red-400/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-white/15 rounded-xl p-1 border border-white/20">
              <button
                onClick={() => setQty(Math.max(product.minOrder, qty - product.minOrder))}
                className="h-8 w-8 rounded-lg bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="flex-1 text-center text-white font-semibold text-sm">
                {qty} {qty === 1 ? product.unit : product.unit}
              </span>
              <button
                onClick={() => setQty(Math.min(product.maxOrder, qty + product.minOrder))}
                className="h-8 w-8 rounded-lg bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <button
              onClick={handleAdd}
              className={`w-full h-10 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-amber-700 hover:bg-white/90 shadow-lg hover:shadow-amber-400/20'
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" />
                  Added!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Add to Order
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CartSidebar({
  isOpen,
  onClose,
  deliveryFee,
}: {
  isOpen: boolean;
  onClose: () => void;
  deliveryFee: number;
}) {
  const router = useRouter();
  const { items, totalAmount, updateQuantity, removeItem } = useCart();
  const total = totalAmount + deliveryFee;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-sm z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'rgba(10,20,40,0.95)', backdropFilter: 'blur(24px)' }}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-amber-400" />
            <h2 className="text-white font-bold text-lg">Your Order</h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-white/40">
              <ShoppingCart className="h-12 w-12" />
              <p className="text-sm">Your order is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/8 border border-white/10"
              >
                <span className="text-2xl">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{item.productName}</p>
                  <p className="text-white/50 text-xs">{formatPrice(item.price)} / {item.unit}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="h-6 w-6 rounded-md bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-white w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="h-6 w-6 rounded-md bg-white/15 hover:bg-white/25 text-white flex items-center justify-center"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-400/70 hover:text-red-400 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Subtotal</span>
                <span className="text-white">{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Delivery fee</span>
                <span className="text-white">{formatPrice(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-1 border-t border-white/10">
                <span className="text-white">Total</span>
                <span className="text-amber-400">{formatPrice(total)}</span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                router.push('/shop/checkout');
              }}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold flex items-center justify-center gap-2 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg"
            >
              Checkout
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export function ShopClient({ settings }: { settings: ShopSettings }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { totalItems, totalAmount } = useCart();

  const PRODUCTS = settings.products.filter((p) => p.available !== false);

  const categories = [
    { id: 'all', label: 'All Products', emoji: '✨' },
    { id: 'chickens', label: 'Chickens', emoji: '🐔' },
    { id: 'eggs', label: 'Eggs', emoji: '🥚' },
    { id: 'chicks', label: 'Day-Old Chicks', emoji: '🐣' },
    { id: 'other', label: 'Other', emoji: '📦' },
  ].filter((cat) => cat.id === 'all' || PRODUCTS.some((p) => p.category === cat.id));

  const filtered =
    activeCategory === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            'linear-gradient(135deg, #1a0a2e 0%, #16213e 30%, #0f3460 60%, #1a4a2a 100%)',
        }}
      />
      {/* Blobs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-3xl animate-float pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-green-500/10 blur-3xl animate-float-delayed pointer-events-none" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-orange-500/5 blur-3xl animate-float-slow pointer-events-none" />

      {/* Navigation */}
      <header className="shop-glass-nav sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🐔</span>
            <span className="text-lg font-bold text-white font-display hidden sm:block">{settings.farmName}</span>
          </Link>

          <div className="flex items-center gap-2">
            {settings.phone && (
              <a
                href={`tel:${settings.phone.replace(/\s/g, '')}`}
                className="hidden sm:flex items-center gap-1.5 text-white/70 hover:text-white text-sm transition-colors px-3 py-1.5"
              >
                <Phone className="h-4 w-4" />
                Call Us
              </a>
            )}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-white border border-amber-400/30 transition-all text-sm font-medium"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden sm:inline">Order</span>
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-400/25 text-amber-300 text-xs font-semibold uppercase tracking-widest mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-soft" />
          Fresh From the Farm
        </div>
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
          Order Farm-Fresh
          <br />
          <span className="text-gradient-amber italic">Poultry Products</span>
        </h1>
        <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto mb-2">
          Premium quality chickens and eggs, harvested fresh and delivered to your door.
        </p>
        <div className="flex items-center justify-center flex-wrap gap-4 text-xs text-white/45 mb-8">
          {settings.deliveryRegions && (
            <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {settings.deliveryRegions}</span>
          )}
          {settings.freeDeliveryThreshold > 0 && (
            <>
              <span>·</span>
              <span>Free delivery on orders over KES {settings.freeDeliveryThreshold.toLocaleString()}</span>
            </>
          )}
        </div>

        {/* Category filter */}
        <div className="flex items-center justify-center flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                  : 'bg-white/10 text-white/70 border border-white/15 hover:bg-white/15 hover:text-white'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Products grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="font-display text-3xl font-bold text-white text-center mb-2">How It Works</h2>
        <p className="text-white/50 text-center text-sm mb-10">Simple, fast, fresh</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { step: '01', emoji: '🛒', title: 'Browse & Select', desc: 'Choose your products and quantities from our farm catalog.' },
            { step: '02', emoji: '📝', title: 'Place Your Order', desc: 'Fill in your details and confirm your delivery preferences.' },
            { step: '03', emoji: '🚚', title: 'Fresh Delivery', desc: 'We process and deliver your order fresh from the farm.' },
          ].map((s) => (
            <div key={s.step} className="shop-glass-card rounded-2xl p-6 text-center">
              <div className="text-xs font-bold text-amber-400/70 tracking-widest uppercase mb-3">{s.step}</div>
              <div className="text-4xl mb-3">{s.emoji}</div>
              <h3 className="font-bold text-white mb-2">{s.title}</h3>
              <p className="text-white/55 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Floating checkout bar (when cart has items) */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-sm px-4">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-base flex items-center justify-between px-5 shadow-2xl shadow-amber-500/40 hover:from-amber-400 hover:to-orange-400 transition-all active:scale-98"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/20 text-sm font-bold">
                {totalItems}
              </span>
              <span>View Order</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{formatPrice(totalAmount)}</span>
              <ChevronRight className="h-5 w-5" />
            </div>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="shop-glass-nav py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">🐔</span>
            <p className="text-white/50 text-sm">© {new Date().getFullYear()} {settings.farmName}</p>
          </div>
          <div className="flex items-center gap-4 text-white/45 text-sm">
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-white/70 transition-colors flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {settings.phone}
              </a>
            )}
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} deliveryFee={settings.deliveryFee} />
    </div>
  );
}
