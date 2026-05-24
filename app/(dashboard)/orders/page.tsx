import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db/mongodb';
import Order from '@/lib/models/Order';
import { OrdersClient } from '@/components/orders/OrdersClient';

async function getOrders(status?: string) {
  await connectDB();
  const filter: Record<string, unknown> = {};
  if (status && status !== 'all') {
    filter.status = status;
  }
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();

  return orders.map((o) => ({
    ...o,
    _id: o._id.toString(),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }));
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session) redirect('/login');

  const { status } = await searchParams;
  const orders = await getOrders(status);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customer Orders</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage and track all customer orders
        </p>
      </div>
      <OrdersClient initialOrders={orders} initialStatus={status || 'all'} />
    </div>
  );
}
