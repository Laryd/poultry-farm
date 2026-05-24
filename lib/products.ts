export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: 'chickens' | 'eggs' | 'chicks';
  minOrder: number;
  maxOrder: number;
  emoji: string;
  badges: string[];
  available: boolean;
  details: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: 'live-broiler',
    name: 'Live Broiler Chicken',
    description: 'Farm-fresh, well-fed broiler chickens. Healthy and ready for purchase.',
    price: 1200,
    unit: 'bird',
    category: 'chickens',
    minOrder: 1,
    maxOrder: 100,
    emoji: '🐔',
    badges: ['Best Seller', 'Farm Raised'],
    available: true,
    details: ['Average weight 2–3 kg', 'Vaccinated & healthy', 'Minimum 1 bird'],
  },
  {
    id: 'dressed-chicken',
    name: 'Dressed Chicken',
    description: 'Cleaned and dressed chicken, ready to cook. Perfect for restaurants & homes.',
    price: 600,
    unit: 'kg',
    category: 'chickens',
    minOrder: 1,
    maxOrder: 50,
    emoji: '🍗',
    badges: ['Ready to Cook'],
    available: true,
    details: ['Freshly processed', 'Hygienic handling', 'Whole or cut pieces'],
  },
  {
    id: 'eggs-tray',
    name: 'Fresh Eggs',
    description: 'Farm-fresh eggs from our free-range hens. Packed in trays of 30.',
    price: 500,
    unit: 'tray (30 eggs)',
    category: 'eggs',
    minOrder: 1,
    maxOrder: 50,
    emoji: '🥚',
    badges: ['Farm Fresh', 'Daily Collected'],
    available: true,
    details: ['30 eggs per tray', 'Collected daily', 'Rich golden yolk'],
  },
  {
    id: 'doc',
    name: 'Day-Old Chicks (DOC)',
    description: 'High-quality day-old chicks for your farm. Vaccinated and certified.',
    price: 150,
    unit: 'chick',
    category: 'chicks',
    minOrder: 10,
    maxOrder: 500,
    emoji: '🐣',
    badges: ['Certified', 'Vaccinated'],
    available: true,
    details: ['Vaccinated at hatchery', 'Minimum order: 10 chicks', 'Available on request'],
  },
];

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(amount);
}
