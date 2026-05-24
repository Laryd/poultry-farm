import Link from 'next/link';
import { CheckCircle, Phone, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Order Confirmed | FreshFarm Poultry',
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
      <div
        className="fixed inset-0 -z-10"
        style={{
          background:
            'linear-gradient(135deg, #1a0a2e 0%, #16213e 40%, #0f3460 70%, #1a4a2a 100%)',
        }}
      />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-green-500/10 blur-3xl pointer-events-none" />

      <div className="max-w-md w-full text-center">
        {/* Success icon */}
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl scale-150" />
          <div className="relative h-20 w-20 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
        </div>

        <div className="shop-glass-card rounded-2xl p-8">
          <h1 className="font-display text-3xl font-bold text-white mb-2">
            Order Confirmed!
          </h1>
          <p className="text-white/60 text-sm mb-6 leading-relaxed">
            Thank you for your order. We&apos;ve received it and will be in touch shortly
            to confirm the details.
          </p>

          {order && (
            <div className="bg-white/8 border border-white/15 rounded-xl p-4 mb-6">
              <p className="text-white/45 text-xs uppercase tracking-widest mb-1">Order Number</p>
              <p className="text-white font-bold text-lg font-mono">{order}</p>
            </div>
          )}

          <div className="space-y-3 text-left mb-6">
            {[
              { icon: '📱', text: 'You will receive an SMS/call to confirm your order' },
              { icon: '⏱️', text: 'Orders are typically processed within 24 hours' },
              { icon: '🚚', text: 'Delivery is arranged based on your location and availability' },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3 text-sm text-white/60">
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/shop"
              className="flex-1 h-11 rounded-xl bg-white/12 hover:bg-white/18 text-white font-medium border border-white/20 flex items-center justify-center gap-2 transition-all text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Shop More
            </Link>
            <a
              href="tel:+254700000000"
              className="flex-1 h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold flex items-center justify-center gap-2 transition-all text-sm shadow-lg shadow-amber-500/20"
            >
              <Phone className="h-4 w-4" />
              Call Us
            </a>
          </div>
        </div>

        <p className="mt-6 text-white/30 text-xs">
          Keep your order number safe for reference
        </p>
      </div>
    </div>
  );
}
