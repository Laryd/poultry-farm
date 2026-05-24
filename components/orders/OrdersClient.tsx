'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/products';
import {
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'delivered' | 'cancelled';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryType: 'pickup' | 'delivery';
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  processing: { label: 'Processing', icon: Package, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
  ready: { label: 'Ready', icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
  delivered: { label: 'Delivered', icon: Truck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (newStatus === status) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/orders/${order._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setStatus(newStatus);
        toast.success(`Order ${order.orderNumber} marked as ${newStatus}`);
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setUpdating(false);
    }
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="glass-card rounded-xl border overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-sm font-mono">{order.orderNumber}</span>
              <StatusBadge status={status} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {order.customerName} · {formattedDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="font-bold text-amber-600 dark:text-amber-400">
            {formatPrice(order.totalAmount)}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-border/50 p-4 space-y-4">
          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${order.customerPhone}`} className="hover:underline text-primary">
                {order.customerPhone}
              </a>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${order.customerEmail}`} className="hover:underline text-primary truncate">
                {order.customerEmail}
              </a>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <span className="text-muted-foreground">
                {order.deliveryType === 'pickup' ? '🏪 Farm pickup · ' : '🚚 Delivery · '}
                {order.deliveryAddress}
              </span>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Items
            </p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2.5 rounded-lg bg-muted/40">
                  <div>
                    <span className="font-medium">{item.productName}</span>
                    <span className="text-muted-foreground ml-2">
                      {item.quantity} × {item.unit}
                    </span>
                  </div>
                  <span className="font-semibold">{formatPrice(item.totalPrice)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-border/50 text-sm">
              <div className="text-muted-foreground space-x-3">
                <span>Subtotal: {formatPrice(order.subtotal)}</span>
                <span>·</span>
                <span>Delivery: {order.deliveryFee === 0 ? 'Free' : formatPrice(order.deliveryFee)}</span>
              </div>
              <span className="font-bold text-base">{formatPrice(order.totalAmount)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="text-sm p-3 rounded-lg bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200">
              <span className="font-medium">Note: </span>{order.notes}
            </div>
          )}

          {/* Status update */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-muted-foreground">Update status:</label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
              disabled={updating}
              className="text-sm rounded-lg border border-border bg-background px-3 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
            >
              {Object.entries(STATUS_CONFIG).map(([val, cfg]) => (
                <option key={val} value={val}>{cfg.label}</option>
              ))}
            </select>
            {updating && (
              <span className="text-xs text-muted-foreground animate-pulse">Updating...</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const STATUS_TABS: Array<{ value: string; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready', label: 'Ready' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export function OrdersClient({
  initialOrders,
  initialStatus,
}: {
  initialOrders: Order[];
  initialStatus: string;
}) {
  const [orders] = useState<Order[]>(initialOrders);
  const [activeStatus, setActiveStatus] = useState(initialStatus);

  const filtered = activeStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === activeStatus);

  const counts = Object.fromEntries(
    STATUS_TABS.map((tab) => [
      tab.value,
      tab.value === 'all' ? orders.length : orders.filter((o) => o.status === tab.value).length,
    ])
  );

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold mt-1">{orders.length}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
            {orders.filter((o) => o.status === 'pending').length}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Delivered</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
            {orders.filter((o) => o.status === 'delivered').length}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Revenue</p>
          <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
            {formatPrice(totalRevenue)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-1 pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveStatus(tab.value)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeStatus === tab.value
                ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'
                : 'text-muted-foreground hover:bg-muted/60'
            }`}
          >
            {tab.label}
            {counts[tab.value] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeStatus === tab.value
                  ? 'bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {counts[tab.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Order list */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground">
            {activeStatus === 'all' ? 'No orders yet' : `No ${activeStatus} orders`}
          </p>
          {activeStatus === 'all' && (
            <p className="text-sm text-muted-foreground/60 mt-1">
              Orders will appear here once customers place them via the shop
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderCard key={order._id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
