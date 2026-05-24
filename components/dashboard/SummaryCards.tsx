import { Bird, Egg, Package } from 'lucide-react';

interface SummaryCardsProps {
  data: {
    totalBirds: number;
    totalChicks: number;
    totalAdults: number;
    totalMales: number;
    totalFemales: number;
    eggsCollectedToday: number;
    eggsSoldToday: number;
    eggsSpoiledToday: number;
    totalFeedBags: number;
    totalFeedKg: number;
  };
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  extra?: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  accent: string;
}

function StatCard({ title, value, subtitle, extra, icon: Icon, iconColor, iconBg, accent }: StatCardProps) {
  return (
    <div className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-200">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-15 ${accent}`} />
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
        <div className={`h-8 w-8 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      {subtitle && (
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1.5">{subtitle}</p>
      )}
      {extra && (
        <p className="text-xs text-slate-400 dark:text-slate-600 mt-0.5">{extra}</p>
      )}
    </div>
  );
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  const genderInfo =
    data.totalMales > 0 || data.totalFemales > 0
      ? `${data.totalMales > 0 ? data.totalMales + ' ♂' : ''} ${data.totalFemales > 0 ? data.totalFemales + ' ♀' : ''}`.trim()
      : undefined;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
      <StatCard
        title="Total Birds"
        value={data.totalBirds}
        subtitle={`${data.totalChicks} chicks · ${data.totalAdults} adults`}
        extra={genderInfo}
        icon={Bird}
        iconColor="text-amber-600 dark:text-amber-400"
        iconBg="bg-amber-100 dark:bg-amber-900/30"
        accent="bg-amber-400"
      />
      <StatCard
        title="Chicks"
        value={data.totalChicks}
        subtitle="Day-old to young birds"
        icon={Bird}
        iconColor="text-yellow-600 dark:text-yellow-400"
        iconBg="bg-yellow-100 dark:bg-yellow-900/30"
        accent="bg-yellow-400"
      />
      <StatCard
        title="Adults"
        value={data.totalAdults}
        subtitle="Mature / laying birds"
        icon={Bird}
        iconColor="text-green-600 dark:text-green-400"
        iconBg="bg-green-100 dark:bg-green-900/30"
        accent="bg-green-400"
      />
      <StatCard
        title="Eggs Today"
        value={data.eggsCollectedToday}
        subtitle={`Sold: ${data.eggsSoldToday} · Spoiled: ${data.eggsSpoiledToday}`}
        icon={Egg}
        iconColor="text-orange-600 dark:text-orange-400"
        iconBg="bg-orange-100 dark:bg-orange-900/30"
        accent="bg-orange-400"
      />
      <StatCard
        title="Total Feed"
        value={`${data.totalFeedBags} bags`}
        subtitle={`${data.totalFeedKg.toFixed(1)} kg total`}
        icon={Package}
        iconColor="text-blue-600 dark:text-blue-400"
        iconBg="bg-blue-100 dark:bg-blue-900/30"
        accent="bg-blue-400"
      />
    </div>
  );
}
