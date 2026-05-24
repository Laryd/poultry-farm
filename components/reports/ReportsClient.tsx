'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  FileSpreadsheet,
  BarChart3,
  DollarSign,
  Egg,
  Wheat,
  Skull,
  FlaskConical,
  Syringe,
  ShoppingCart,
  Download,
  Loader2,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  generateFarmSummaryExcel,
  generateBatchesExcel,
  generateFinancialExcel,
  generateEggsExcel,
  generateFeedExcel,
  generateMortalityExcel,
  generateIncubationExcel,
  generateVaccinationsExcel,
  generateOrdersExcel,
  type FarmReportData,
} from '@/lib/utils/reportExports';

type LoadingKey =
  | 'summary'
  | 'batches'
  | 'financial'
  | 'eggs'
  | 'feed'
  | 'mortality'
  | 'incubation'
  | 'vaccinations'
  | 'orders';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchJson(url: string, key: string): Promise<any[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  const data = await res.json();
  return data[key] ?? data.data ?? [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchOrders(startDate?: string, endDate?: string): Promise<any[]> {
  const res = await fetch('/api/orders?limit=1000');
  if (!res.ok) throw new Error('Failed to fetch orders');
  const data = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orders: any[] = data.orders ?? [];
  if (startDate) orders = orders.filter((o) => new Date(o.createdAt) >= new Date(startDate));
  if (endDate) orders = orders.filter((o) => new Date(o.createdAt) <= new Date(endDate + 'T23:59:59'));
  return orders;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterByDate<T extends Record<string, any>>(items: T[], startDate?: string, endDate?: string): T[] {
  if (!startDate && !endDate) return items;
  return items.filter((item) => {
    const d = new Date(item.date ?? item.createdAt ?? '');
    if (startDate && d < new Date(startDate)) return false;
    if (endDate && d > new Date(endDate + 'T23:59:59')) return false;
    return true;
  });
}

export default function ReportsClient() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState<Record<LoadingKey, boolean>>({
    summary: false, batches: false, financial: false, eggs: false,
    feed: false, mortality: false, incubation: false, vaccinations: false, orders: false,
  });

  function setLoad(key: LoadingKey, val: boolean) {
    setLoading((prev) => ({ ...prev, [key]: val }));
  }

  async function handleSummary() {
    setLoad('summary', true);
    try {
      const [batches, transactions, eggs, feed, mortality, incubation, vaccinations, orders] =
        await Promise.all([
          fetchJson('/api/batches', 'data'),
          fetchJson(
            `/api/transactions${startDate ? `?startDate=${startDate}` : ''}${endDate ? `${startDate ? '&' : '?'}endDate=${endDate}` : ''}`,
            'data'
          ),
          fetchJson('/api/eggs', 'data'),
          fetchJson('/api/feed', 'data'),
          fetchJson('/api/mortality', 'data'),
          fetchJson('/api/incubator', 'data'),
          fetchJson('/api/vaccinations', 'data'),
          fetchOrders(startDate, endDate),
        ]);

      const dateRange = startDate || endDate ? { start: startDate || undefined, end: endDate || undefined } : undefined;

      const data: FarmReportData = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        batches: batches as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        transactions: transactions as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eggs: filterByDate(eggs, startDate, endDate) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        feed: filterByDate(feed, startDate, endDate) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mortality: filterByDate(mortality, startDate, endDate) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        incubation: filterByDate(incubation, startDate, endDate) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        vaccinations: vaccinations as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orders: orders as any,
        dateRange,
      };

      await generateFarmSummaryExcel(data);
      toast.success('Farm summary report downloaded');
    } catch (err) {
      toast.error('Failed to generate report');
      console.error(err);
    } finally {
      setLoad('summary', false);
    }
  }

  async function handleBatches() {
    setLoad('batches', true);
    try {
      const batches = await fetchJson('/api/batches', 'data');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await generateBatchesExcel(batches as any);
      toast.success('Batches report downloaded');
    } catch {
      toast.error('Failed to generate batches report');
    } finally {
      setLoad('batches', false);
    }
  }

  async function handleFinancial() {
    setLoad('financial', true);
    try {
      let url = '/api/transactions';
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (params.toString()) url += '?' + params.toString();
      const transactions = await fetchJson(url, 'data');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await generateFinancialExcel(transactions as any, { start: startDate || undefined, end: endDate || undefined });
      toast.success('Financial report downloaded');
    } catch {
      toast.error('Failed to generate financial report');
    } finally {
      setLoad('financial', false);
    }
  }

  async function handleEggs() {
    setLoad('eggs', true);
    try {
      const eggs = await fetchJson('/api/eggs', 'data');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await generateEggsExcel(filterByDate(eggs, startDate, endDate) as any);
      toast.success('Egg production report downloaded');
    } catch {
      toast.error('Failed to generate egg report');
    } finally {
      setLoad('eggs', false);
    }
  }

  async function handleFeed() {
    setLoad('feed', true);
    try {
      const feed = await fetchJson('/api/feed', 'data');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await generateFeedExcel(filterByDate(feed, startDate, endDate) as any);
      toast.success('Feed report downloaded');
    } catch {
      toast.error('Failed to generate feed report');
    } finally {
      setLoad('feed', false);
    }
  }

  async function handleMortality() {
    setLoad('mortality', true);
    try {
      const mortality = await fetchJson('/api/mortality', 'data');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await generateMortalityExcel(filterByDate(mortality, startDate, endDate) as any);
      toast.success('Mortality report downloaded');
    } catch {
      toast.error('Failed to generate mortality report');
    } finally {
      setLoad('mortality', false);
    }
  }

  async function handleIncubation() {
    setLoad('incubation', true);
    try {
      const incubation = await fetchJson('/api/incubator', 'data');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await generateIncubationExcel(filterByDate(incubation, startDate, endDate) as any);
      toast.success('Incubation report downloaded');
    } catch {
      toast.error('Failed to generate incubation report');
    } finally {
      setLoad('incubation', false);
    }
  }

  async function handleVaccinations() {
    setLoad('vaccinations', true);
    try {
      const vaccinations = await fetchJson('/api/vaccinations', 'data');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await generateVaccinationsExcel(vaccinations as any);
      toast.success('Vaccinations report downloaded');
    } catch {
      toast.error('Failed to generate vaccinations report');
    } finally {
      setLoad('vaccinations', false);
    }
  }

  async function handleOrders() {
    setLoad('orders', true);
    try {
      const orders = await fetchOrders(startDate, endDate);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await generateOrdersExcel(orders as any);
      toast.success('Orders report downloaded');
    } catch {
      toast.error('Failed to generate orders report');
    } finally {
      setLoad('orders', false);
    }
  }

  const anyLoading = Object.values(loading).some(Boolean);

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card className="border-amber-200 dark:border-amber-800/40 bg-amber-50/50 dark:bg-amber-900/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-600" />
            Date Range Filter
          </CardTitle>
          <CardDescription>
            Optionally filter all reports by date range. Leave blank to include all records.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">From</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">To</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-40"
              />
            </div>
            {(startDate || endDate) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setStartDate(''); setEndDate(''); }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Farm Summary — hero card */}
      <Card className="border-2 border-slate-800 dark:border-slate-600 bg-slate-900 dark:bg-slate-900 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-xl">
            <BarChart3 className="h-5 w-5 text-amber-400" />
            Farm Summary Report
          </CardTitle>
          <CardDescription className="text-slate-300">
            All-in-one Excel workbook with 9 sheets covering every area of your farm:
            batches, finances, eggs, feed, mortality, incubation, vaccinations, and orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            size="lg"
            className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold"
            onClick={handleSummary}
            disabled={anyLoading}
          >
            {loading.summary ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <FileSpreadsheet className="h-5 w-5 mr-2" />
            )}
            {loading.summary ? 'Generating…' : 'Download Full Farm Summary'}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Individual Reports
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ReportCard
            icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            title="Batches"
            description="All batches with breed, size, gender breakdown, cost, and status."
            loading={loading.batches}
            disabled={anyLoading}
            onDownload={handleBatches}
          />
          <ReportCard
            icon={<DollarSign className="h-5 w-5 text-green-600" />}
            iconBg="bg-green-100 dark:bg-green-900/30"
            title="Financial"
            description="Income, expenses, and net profit with separate sheets for each type."
            loading={loading.financial}
            disabled={anyLoading}
            onDownload={handleFinancial}
          />
          <ReportCard
            icon={<Egg className="h-5 w-5 text-yellow-600" />}
            iconBg="bg-yellow-100 dark:bg-yellow-900/30"
            title="Egg Production"
            description="Daily egg collection logs with sold, spoiled, and revenue totals."
            loading={loading.eggs}
            disabled={anyLoading}
            onDownload={handleEggs}
          />
          <ReportCard
            icon={<Wheat className="h-5 w-5 text-orange-600" />}
            iconBg="bg-orange-100 dark:bg-orange-900/30"
            title="Feed"
            description="All feed purchases showing type, quantity, weight, and cost."
            loading={loading.feed}
            disabled={anyLoading}
            onDownload={handleFeed}
          />
          <ReportCard
            icon={<Skull className="h-5 w-5 text-red-600" />}
            iconBg="bg-red-100 dark:bg-red-900/30"
            title="Mortality"
            description="Bird death records per batch with age group and notes."
            loading={loading.mortality}
            disabled={anyLoading}
            onDownload={handleMortality}
          />
          <ReportCard
            icon={<FlaskConical className="h-5 w-5 text-purple-600" />}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            title="Incubation"
            description="Incubation logs with inserted, hatched, and hatch rate per batch."
            loading={loading.incubation}
            disabled={anyLoading}
            onDownload={handleIncubation}
          />
          <ReportCard
            icon={<Syringe className="h-5 w-5 text-teal-600" />}
            iconBg="bg-teal-100 dark:bg-teal-900/30"
            title="Vaccinations"
            description="Full vaccination schedule across all batches, with overdue highlighted."
            loading={loading.vaccinations}
            disabled={anyLoading}
            onDownload={handleVaccinations}
          />
          <ReportCard
            icon={<ShoppingCart className="h-5 w-5 text-indigo-600" />}
            iconBg="bg-indigo-100 dark:bg-indigo-900/30"
            title="Orders"
            description="Customer orders with item detail, delivery type, and status breakdown."
            loading={loading.orders}
            disabled={anyLoading}
            onDownload={handleOrders}
          />
        </div>
      </div>
    </div>
  );
}

function ReportCard({
  icon,
  iconBg,
  title,
  description,
  loading,
  disabled,
  onDownload,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  loading: boolean;
  disabled: boolean;
  onDownload: () => void;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconBg}`}>{icon}</div>
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription className="text-sm leading-relaxed">{description}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto pt-0">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onDownload}
          disabled={disabled}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Download className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Generating…' : 'Download Excel'}
        </Button>
      </CardContent>
    </Card>
  );
}
