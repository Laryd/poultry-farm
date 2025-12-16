'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';

interface FinancialSummaryProps {
  refreshKey?: number;
  batchId?: string;
}

export default function FinancialSummary({ refreshKey, batchId }: FinancialSummaryProps) {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, [refreshKey, batchId]);

  const fetchSummary = async () => {
    try {
      const url = batchId
        ? `/api/finances/analytics?period=6months&batch=${batchId}`
        : '/api/finances/analytics?period=6months';
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setSummary(result.data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-2xl font-bold text-gray-400">Loading...</div>
          ) : (
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(summary.totalIncome)}
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 6 months</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-2xl font-bold text-gray-400">Loading...</div>
          ) : (
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(summary.totalExpenses)}
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Last 6 months</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Profit/Loss</CardTitle>
          <DollarSign className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-2xl font-bold text-gray-400">Loading...</div>
          ) : (
            <div
              className={`text-2xl font-bold ${
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
          <Percent className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-2xl font-bold text-gray-400">Loading...</div>
          ) : (
            <div
              className={`text-2xl font-bold ${
                summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {summary.profitMargin.toFixed(1)}%
            </div>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {summary.profitMargin >= 0 ? 'Profitable' : 'Unprofitable'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
