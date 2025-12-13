import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bird, Egg, Package } from 'lucide-react';

interface SummaryCardsProps {
  data: {
    totalBirds: number;
    totalChicks: number;
    totalAdults: number;
    eggsCollectedToday: number;
    eggsSoldToday: number;
    eggsSpoiledToday: number;
    totalFeedBags: number;
    totalFeedKg: number;
  };
}

export default function SummaryCards({ data }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Birds
          </CardTitle>
          <Bird className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalBirds}</div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {data.totalChicks} chicks, {data.totalAdults} adults
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Chicks
          </CardTitle>
          <Bird className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalChicks}</div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Day-old to young birds
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Adults
          </CardTitle>
          <Bird className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalAdults}</div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Mature/laying birds
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Eggs Today
          </CardTitle>
          <Egg className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.eggsCollectedToday}</div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Sold: {data.eggsSoldToday}, Spoiled: {data.eggsSpoiledToday}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Total Feed
          </CardTitle>
          <Package className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalFeedBags} bags</div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            {data.totalFeedKg.toFixed(1)} kg total
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
