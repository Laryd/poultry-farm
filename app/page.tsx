import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import connectDB from '@/lib/db/mongodb';
import Settings from '@/lib/models/Settings';

async function getFarmName(): Promise<string> {
  try {
    await connectDB();
    const s = await Settings.findOne({ key: 'global' }).select('farmName').lean();
    return (s as { farmName?: string } | null)?.farmName ?? 'FreshFarm Poultry';
  } catch {
    return 'FreshFarm Poultry';
  }
}

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect('/dashboard');
  }

  const farmName = await getFarmName();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 35%, #15803d 75%, #166534 100%)',
        }}
      />

      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-yellow-300/25 blur-3xl -translate-x-1/3 -translate-y-1/3 animate-float" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-green-300/20 blur-3xl translate-x-1/3 translate-y-1/3 animate-float-delayed" />
      <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] rounded-full bg-orange-400/20 blur-3xl animate-float-slow" />

      {/* Nav */}
      <header className="shop-glass-nav sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🐔</span>
            <span className="text-xl font-bold text-white font-display">{farmName}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/shop"
              className="text-white/80 hover:text-white text-sm font-medium transition-colors px-3 py-1.5"
            >
              Order Now
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium border border-white/25 transition-all duration-200 backdrop-blur-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 text-white/90 text-sm font-medium mb-8 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse-soft" />
          Farm fresh, delivered daily
        </div>

        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-white leading-[1.1] mb-6">
          Premium Poultry,
          <br />
          <span className="italic text-yellow-200">Straight from</span>
          <br />
          the Farm
        </h1>

        <p className="text-white/75 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Order fresh chickens, eggs, and day-old chicks directly from our farm.
          No middlemen, no compromise on quality.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-amber-700 font-bold text-lg shadow-2xl hover:shadow-amber-500/25 hover:scale-105 transition-all duration-300"
          >
            <span className="text-xl">🛒</span>
            Place an Order
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/15 text-white font-semibold text-lg border border-white/30 hover:bg-white/25 backdrop-blur-sm transition-all duration-300"
          >
            Farm Dashboard
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="shop-glass-card rounded-2xl p-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-white font-display">500+</p>
            <p className="text-white/65 text-sm mt-1">Happy Customers</p>
          </div>
          <div className="border-x border-white/20">
            <p className="text-3xl font-bold text-white font-display">Daily</p>
            <p className="text-white/65 text-sm mt-1">Fresh Harvest</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-white font-display">100%</p>
            <p className="text-white/65 text-sm mt-1">Farm Raised</p>
          </div>
        </div>
      </section>

      {/* Products preview */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <h2 className="font-display text-3xl font-bold text-white text-center mb-4">
          What We Offer
        </h2>
        <p className="text-white/65 text-center mb-10">
          Premium quality, competitive prices
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { emoji: '🐔', name: 'Live Chickens', desc: 'Farm-bred broilers' },
            { emoji: '🍗', name: 'Dressed Chicken', desc: 'Ready to cook' },
            { emoji: '🥚', name: 'Fresh Eggs', desc: '30-egg trays' },
            { emoji: '🐣', name: 'Day-Old Chicks', desc: 'Quality DOC' },
          ].map((p) => (
            <Link key={p.name} href="/shop">
              <div className="shop-glass-card rounded-2xl p-6 text-center cursor-pointer">
                <div className="text-5xl mb-3 animate-float">{p.emoji}</div>
                <p className="font-semibold text-white text-sm">{p.name}</p>
                <p className="text-white/55 text-xs mt-0.5">{p.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="shop-glass-nav py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/50 text-sm">© {new Date().getFullYear()} {farmName}. All rights reserved.</p>
          <Link href="/shop" className="text-white/70 hover:text-white text-sm transition-colors">
            Order Now →
          </Link>
        </div>
      </footer>
    </div>
  );
}
