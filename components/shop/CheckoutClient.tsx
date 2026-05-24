'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/components/shop/CartContext';
import { formatPrice } from '@/lib/products';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Truck,
  Store,
  MessageSquare,
  ChevronRight,
  ShoppingCart,
} from 'lucide-react';

interface FormData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryType: 'pickup' | 'delivery';
  notes: string;
}

export function CheckoutClient({ deliveryFee: baseFee = 300 }: { deliveryFee?: number }) {
  const router = useRouter();
  const { items, totalAmount, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    deliveryAddress: '',
    deliveryType: 'delivery',
    notes: '',
  });

  const deliveryFee = form.deliveryType === 'delivery' ? baseFee : 0;
  const totalWithDelivery = totalAmount + deliveryFee;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
            unit: i.unit,
            pricePerUnit: i.price,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to place order');
        return;
      }

      clearCart();
      router.push(`/shop/order-success?order=${data.order.orderNumber}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div
          className="fixed inset-0 -z-10"
          style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 40%, #0f3460 70%, #1a4a2a 100%)' }}
        />
        <div className="shop-glass-card rounded-2xl p-10 text-center max-w-sm mx-4">
          <ShoppingCart className="h-12 w-12 text-white/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-white/55 text-sm mb-6">Add some products before checking out.</p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-12">
      <div
        className="fixed inset-0 -z-10"
        style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #16213e 40%, #0f3460 70%, #1a4a2a 100%)' }}
      />
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full bg-amber-500/8 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-96 h-96 rounded-full bg-green-500/8 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="shop-glass-nav sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link
            href="/shop"
            className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Shop</span>
          </Link>
          <div className="flex items-center gap-2 ml-2">
            <span className="text-xl">🐔</span>
            <span className="font-bold text-white font-display">FreshFarm</span>
          </div>
          <div className="ml-auto text-white/50 text-sm font-medium">Checkout</div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
          Complete Your Order
        </h1>
        <p className="text-white/55 text-sm mb-8">
          Fill in your details to confirm your farm-fresh order.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Form */}
            <div className="lg:col-span-3 space-y-5">
              {/* Contact */}
              <div className="shop-glass-card rounded-2xl p-6 space-y-4">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-amber-400" />
                  Contact Information
                </h2>

                <div className="space-y-1.5">
                  <label className="text-white/75 text-xs font-medium uppercase tracking-wide block">
                    Full Name *
                  </label>
                  <input
                    name="customerName"
                    type="text"
                    required
                    placeholder="John Kamau"
                    value={form.customerName}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus:border-amber-400/60 focus:bg-white/15 transition-all text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-white/75 text-xs font-medium uppercase tracking-wide flex items-center gap-1 block">
                      <Mail className="h-3 w-3" /> Email *
                    </label>
                    <input
                      name="customerEmail"
                      type="email"
                      required
                      placeholder="john@example.com"
                      value={form.customerEmail}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus:border-amber-400/60 focus:bg-white/15 transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-white/75 text-xs font-medium uppercase tracking-wide flex items-center gap-1 block">
                      <Phone className="h-3 w-3" /> Phone *
                    </label>
                    <input
                      name="customerPhone"
                      type="tel"
                      required
                      placeholder="+254 7XX XXX XXX"
                      value={form.customerPhone}
                      onChange={handleChange}
                      className="w-full h-11 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus:border-amber-400/60 focus:bg-white/15 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="shop-glass-card rounded-2xl p-6 space-y-4">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-amber-400" />
                  Delivery Details
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, deliveryType: 'delivery' }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.deliveryType === 'delivery'
                        ? 'bg-amber-500/20 border-amber-400/50 text-white'
                        : 'bg-white/8 border-white/15 text-white/55 hover:bg-white/12'
                    }`}
                  >
                    <Truck className="h-5 w-5 mb-1.5 text-amber-400" />
                    <p className="text-sm font-semibold">Delivery</p>
                    <p className="text-xs opacity-70">KES 300 fee</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, deliveryType: 'pickup' }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      form.deliveryType === 'pickup'
                        ? 'bg-green-500/20 border-green-400/50 text-white'
                        : 'bg-white/8 border-white/15 text-white/55 hover:bg-white/12'
                    }`}
                  >
                    <Store className="h-5 w-5 mb-1.5 text-green-400" />
                    <p className="text-sm font-semibold">Pick Up</p>
                    <p className="text-xs opacity-70">Free · at farm</p>
                  </button>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/75 text-xs font-medium uppercase tracking-wide block">
                    {form.deliveryType === 'delivery' ? 'Delivery Address *' : 'Your Location (for contact)'}
                  </label>
                  <input
                    name="deliveryAddress"
                    type="text"
                    required
                    placeholder={
                      form.deliveryType === 'delivery'
                        ? 'Street, estate, city...'
                        : 'Your general area'
                    }
                    value={form.deliveryAddress}
                    onChange={handleChange}
                    className="w-full h-11 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus:border-amber-400/60 focus:bg-white/15 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="shop-glass-card rounded-2xl p-6 space-y-3">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-amber-400" />
                  Additional Notes
                </h2>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Any special requests, preferred delivery time, etc."
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/35 focus:outline-none focus:border-amber-400/60 focus:bg-white/15 transition-all text-sm resize-none"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="shop-glass-card rounded-2xl p-6 sticky top-24">
                <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-amber-400" />
                  Order Summary
                </h2>

                <div className="space-y-3 mb-5">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <span className="text-xl">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.productName}</p>
                        <p className="text-white/45 text-xs">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="text-white text-sm font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/55">Subtotal</span>
                    <span className="text-white">{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/55">
                      {form.deliveryType === 'pickup' ? 'Pick up' : 'Delivery'}
                    </span>
                    <span className={form.deliveryType === 'pickup' ? 'text-green-400' : 'text-white'}>
                      {form.deliveryType === 'pickup' ? 'Free' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold pt-2 border-t border-white/10">
                    <span className="text-white">Total</span>
                    <span className="text-amber-400">{formatPrice(totalWithDelivery)}</span>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 rounded-xl bg-red-500/20 border border-red-400/30 text-red-200 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-5 w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold flex items-center justify-center gap-2 hover:from-amber-400 hover:to-orange-400 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      Place Order
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-white/35 text-xs">
                  We&apos;ll confirm your order via phone/email
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
