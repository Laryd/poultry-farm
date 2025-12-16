'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface DashboardFinancialSummaryProps {
  batchId?: string;
}

export default function DashboardFinancialSummary({ batchId }: DashboardFinancialSummaryProps) {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      const url = batchId
        ? `/api/finances/analytics?period=30days&batch=${batchId}`
        : '/api/finances/analytics?period=30days';
      const response = await fetch(url, { cache: 'no-store' });
      const result = await response.json();
      if (result.success) {
        setSummary(result.data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch financial summary:', error);
    } finally {
      setIsLoading(false);
    }
  }, [batchId]);

  // Initial fetch
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Auto-refresh every 3 seconds to pick up new transactions
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSummary();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchSummary]);

  // Refetch when page becomes visible (e.g., after navigating back)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchSummary();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchSummary]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Financial Summary {batchId ? '(Batch)' : '(All)'}
        </h2>
        <Link
          href="/finances"
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View Details →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <div className="text-xl font-bold text-green-600">
                {formatCurrency(summary.totalIncome)}
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <div className="text-xl font-bold text-red-600">
                {formatCurrency(summary.totalExpenses)}
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit/Loss</CardTitle>
            <DollarSign className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-xl font-bold text-gray-400">Loading...</div>
            ) : (
              <div
                className={`text-xl font-bold ${
                  summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(summary.netProfit)}
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {summary.netProfit >= 0 ? 'Profit' : 'Loss'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
