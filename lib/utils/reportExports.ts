import ExcelJS from 'exceljs';
import { format } from 'date-fns';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BatchReport {
  _id: string;
  batchCode: string;
  name: string;
  breed: string;
  category: 'chick' | 'adult';
  currentSize: number;
  initialSize: number;
  startDate: string;
  archived: boolean;
  totalCost?: number;
  maleCount?: number;
  femaleCount?: number;
}

export interface TransactionReport {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
  batchId?: { _id: string; name: string; batchCode: string } | null;
}

export interface EggReport {
  _id: string;
  batchId?: string;
  collected: number;
  sold: number;
  spoiled: number;
  pricePerEgg?: number;
  totalRevenue?: number;
  date: string;
}

export interface FeedReport {
  _id: string;
  type: string;
  price: number;
  bags: number;
  kgPerBag: number;
  totalKg: number;
  date: string;
}

export interface MortalityReport {
  _id: string;
  batchId?: { _id: string; name: string } | null;
  ageGroup: 'chick' | 'adult';
  count: number;
  notes?: string;
  date: string;
}

export interface IncubationReport {
  _id: string;
  batchId?: string;
  inserted: number;
  spoiled: number;
  hatched: number;
  notHatched: number;
  date: string;
}

export interface VaccinationReport {
  _id: string;
  batchId?: { _id: string; name: string; startDate: string } | null;
  vaccineName: string;
  ageInDays: number;
  scheduledDate: string;
  completedDate?: string;
  actualCost?: number;
  notes?: string;
  status: 'pending' | 'completed' | 'overdue';
}

export interface OrderItemReport {
  productId: string;
  productName: string;
  variant?: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
}

export interface OrderReport {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryType: 'pickup' | 'delivery';
  items: OrderItemReport[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface FarmReportData {
  batches: BatchReport[];
  transactions: TransactionReport[];
  eggs: EggReport[];
  feed: FeedReport[];
  mortality: MortalityReport[];
  incubation: IncubationReport[];
  vaccinations: VaccinationReport[];
  orders: OrderReport[];
  dateRange?: { start?: string; end?: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try { return format(new Date(dateStr), 'dd MMM yyyy'); } catch { return String(dateStr); }
}

function kes(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function downloadBuffer(buffer: ArrayBuffer, filename: string): void {
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function styleHeader(row: ExcelJS.Row, bgArgb: string): void {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgArgb } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
      right: { style: 'thin', color: { argb: 'FFD0D0D0' } },
    };
  });
  row.height = 22;
}

function stripeRow(row: ExcelJS.Row, i: number): void {
  if (i % 2 === 0) {
    row.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F7F7' } };
    });
  }
}

function newWorkbook(): ExcelJS.Workbook {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Poultry Farm Management';
  wb.created = new Date();
  return wb;
}

// ─── Batches ──────────────────────────────────────────────────────────────────

export async function generateBatchesExcel(batches: BatchReport[]): Promise<void> {
  const wb = newWorkbook();
  const ws = wb.addWorksheet('Batches', { properties: { tabColor: { argb: 'FF4472C4' } } });

  ws.columns = [
    { header: 'Batch Code', key: 'batchCode', width: 14 },
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Breed', key: 'breed', width: 16 },
    { header: 'Category', key: 'category', width: 10 },
    { header: 'Start Date', key: 'startDate', width: 14 },
    { header: 'Initial Size', key: 'initialSize', width: 13 },
    { header: 'Current Size', key: 'currentSize', width: 13 },
    { header: 'Male', key: 'maleCount', width: 10 },
    { header: 'Female', key: 'femaleCount', width: 10 },
    { header: 'Total Cost (KES)', key: 'totalCost', width: 18 },
    { header: 'Status', key: 'status', width: 12 },
  ];
  styleHeader(ws.getRow(1), 'FF4472C4');

  batches.forEach((b, i) => {
    const row = ws.addRow({
      batchCode: b.batchCode,
      name: b.name,
      breed: b.breed,
      category: b.category === 'chick' ? 'Chick' : 'Adult',
      startDate: fmt(b.startDate),
      initialSize: b.initialSize,
      currentSize: b.currentSize,
      maleCount: b.maleCount ?? '-',
      femaleCount: b.femaleCount ?? '-',
      totalCost: b.totalCost ?? 0,
      status: b.archived ? 'Archived' : 'Active',
    });
    stripeRow(row, i);
    row.getCell(10).numFmt = '#,##0.00';
    const statusCell = row.getCell(11);
    statusCell.font = { color: { argb: b.archived ? 'FF9C0006' : 'FF375623' } };
  });

  const buf = await wb.xlsx.writeBuffer();
  downloadBuffer(buf, `batches_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

// ─── Financial ────────────────────────────────────────────────────────────────

export async function generateFinancialExcel(
  transactions: TransactionReport[],
  dateRange?: { start?: string; end?: string }
): Promise<void> {
  const wb = newWorkbook();

  const income = transactions.filter((t) => t.type === 'income');
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const period = dateRange?.start || dateRange?.end
    ? `${dateRange.start ? fmt(dateRange.start) : 'Start'} – ${dateRange.end ? fmt(dateRange.end) : 'Now'}`
    : 'All Time';

  // Summary sheet
  const summaryWs = wb.addWorksheet('Summary', { properties: { tabColor: { argb: 'FF375623' } } });
  summaryWs.columns = [{ key: 'label', width: 28 }, { key: 'value', width: 22 }];
  styleHeader(summaryWs.getRow(1), 'FF1E3A5F');
  summaryWs.getRow(1).getCell(1).value = 'Financial Summary';
  summaryWs.getRow(1).getCell(2).value = `Period: ${period}`;
  summaryWs.mergeCells(1, 1, 1, 1);

  const summaryRows: [string, string | number][] = [
    ['Total Income', kes(totalIncome)],
    ['Total Expenses', kes(totalExpenses)],
    ['Net Profit / Loss', kes(netProfit)],
    ['Income Transactions', income.length],
    ['Expense Transactions', expenses.length],
    ['Total Transactions', transactions.length],
    ['Report Generated', format(new Date(), 'dd MMM yyyy HH:mm')],
  ];

  summaryRows.forEach(([label, value]) => {
    const row = summaryWs.addRow({ label, value });
    row.getCell(1).font = { bold: true };
    if (label === 'Net Profit / Loss') {
      row.getCell(2).font = { bold: true, color: { argb: netProfit >= 0 ? 'FF375623' : 'FF9C0006' } };
    }
  });

  // All transactions sheet
  const allWs = wb.addWorksheet('All Transactions', { properties: { tabColor: { argb: 'FF4472C4' } } });
  allWs.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Type', key: 'type', width: 10 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount (KES)', key: 'amount', width: 16 },
    { header: 'Description', key: 'description', width: 38 },
    { header: 'Batch', key: 'batch', width: 20 },
  ];
  styleHeader(allWs.getRow(1), 'FF4472C4');
  transactions.forEach((t, i) => {
    const row = allWs.addRow({
      date: fmt(t.date),
      type: t.type === 'income' ? 'Income' : 'Expense',
      category: t.category,
      amount: t.amount,
      description: t.description,
      batch: t.batchId?.name ?? '-',
    });
    stripeRow(row, i);
    row.getCell(4).numFmt = '#,##0.00';
    const typeCell = row.getCell(2);
    typeCell.font = { color: { argb: t.type === 'income' ? 'FF375623' : 'FF9C0006' } };
    row.getCell(4).font = { color: { argb: t.type === 'income' ? 'FF375623' : 'FF9C0006' } };
  });

  // Income sheet
  const incWs = wb.addWorksheet('Income', { properties: { tabColor: { argb: 'FF70AD47' } } });
  incWs.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount (KES)', key: 'amount', width: 16 },
    { header: 'Description', key: 'description', width: 38 },
    { header: 'Batch', key: 'batch', width: 20 },
  ];
  styleHeader(incWs.getRow(1), 'FF70AD47');
  income.forEach((t, i) => {
    const row = incWs.addRow({ date: fmt(t.date), category: t.category, amount: t.amount, description: t.description, batch: t.batchId?.name ?? '-' });
    stripeRow(row, i);
    row.getCell(3).numFmt = '#,##0.00';
  });

  // Expenses sheet
  const expWs = wb.addWorksheet('Expenses', { properties: { tabColor: { argb: 'FFD9534F' } } });
  expWs.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount (KES)', key: 'amount', width: 16 },
    { header: 'Description', key: 'description', width: 38 },
    { header: 'Batch', key: 'batch', width: 20 },
  ];
  styleHeader(expWs.getRow(1), 'FFD9534F');
  expenses.forEach((t, i) => {
    const row = expWs.addRow({ date: fmt(t.date), category: t.category, amount: t.amount, description: t.description, batch: t.batchId?.name ?? '-' });
    stripeRow(row, i);
    row.getCell(3).numFmt = '#,##0.00';
  });

  const buf = await wb.xlsx.writeBuffer();
  downloadBuffer(buf, `financial_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

// ─── Eggs ─────────────────────────────────────────────────────────────────────

export async function generateEggsExcel(eggs: EggReport[]): Promise<void> {
  const wb = newWorkbook();
  const ws = wb.addWorksheet('Egg Production', { properties: { tabColor: { argb: 'FFFFC000' } } });

  ws.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Collected', key: 'collected', width: 12 },
    { header: 'Sold', key: 'sold', width: 10 },
    { header: 'Spoiled', key: 'spoiled', width: 10 },
    { header: 'Retained', key: 'retained', width: 10 },
    { header: 'Price/Egg (KES)', key: 'pricePerEgg', width: 16 },
    { header: 'Revenue (KES)', key: 'revenue', width: 16 },
  ];
  styleHeader(ws.getRow(1), 'FFBF8F00');

  const totals = { collected: 0, sold: 0, spoiled: 0, revenue: 0 };
  eggs.forEach((e, i) => {
    const retained = Math.max(0, e.collected - e.sold - e.spoiled);
    const row = ws.addRow({
      date: fmt(e.date),
      collected: e.collected,
      sold: e.sold,
      spoiled: e.spoiled,
      retained,
      pricePerEgg: e.pricePerEgg ?? '-',
      revenue: e.totalRevenue ?? 0,
    });
    stripeRow(row, i);
    row.getCell(7).numFmt = '#,##0.00';
    totals.collected += e.collected;
    totals.sold += e.sold;
    totals.spoiled += e.spoiled;
    totals.revenue += e.totalRevenue ?? 0;
  });

  ws.addRow([]);
  const totRow = ws.addRow(['TOTALS', totals.collected, totals.sold, totals.spoiled, totals.collected - totals.sold - totals.spoiled, '', totals.revenue]);
  totRow.eachCell((c) => { c.font = { bold: true }; });
  totRow.getCell(7).numFmt = '#,##0.00';

  const buf = await wb.xlsx.writeBuffer();
  downloadBuffer(buf, `egg_production_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

// ─── Feed ─────────────────────────────────────────────────────────────────────

export async function generateFeedExcel(feed: FeedReport[]): Promise<void> {
  const wb = newWorkbook();
  const ws = wb.addWorksheet('Feed', { properties: { tabColor: { argb: 'FF8B6914' } } });

  ws.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Feed Type', key: 'type', width: 22 },
    { header: 'Bags', key: 'bags', width: 10 },
    { header: 'Kg/Bag', key: 'kgPerBag', width: 10 },
    { header: 'Total (Kg)', key: 'totalKg', width: 12 },
    { header: 'Cost (KES)', key: 'price', width: 14 },
  ];
  styleHeader(ws.getRow(1), 'FF8B6914');

  let totalKg = 0, totalCost = 0;
  feed.forEach((f, i) => {
    const row = ws.addRow({ date: fmt(f.date), type: f.type, bags: f.bags, kgPerBag: f.kgPerBag, totalKg: f.totalKg, price: f.price });
    stripeRow(row, i);
    row.getCell(6).numFmt = '#,##0.00';
    totalKg += f.totalKg;
    totalCost += f.price;
  });

  ws.addRow([]);
  const totRow = ws.addRow(['TOTALS', '', '', '', totalKg, totalCost]);
  totRow.eachCell((c) => { c.font = { bold: true }; });
  totRow.getCell(6).numFmt = '#,##0.00';

  const buf = await wb.xlsx.writeBuffer();
  downloadBuffer(buf, `feed_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

// ─── Mortality ────────────────────────────────────────────────────────────────

export async function generateMortalityExcel(mortality: MortalityReport[]): Promise<void> {
  const wb = newWorkbook();
  const ws = wb.addWorksheet('Mortality', { properties: { tabColor: { argb: 'FFD9534F' } } });

  ws.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Batch', key: 'batch', width: 22 },
    { header: 'Age Group', key: 'ageGroup', width: 12 },
    { header: 'Count', key: 'count', width: 10 },
    { header: 'Notes', key: 'notes', width: 38 },
  ];
  styleHeader(ws.getRow(1), 'FFD9534F');

  let total = 0;
  mortality.forEach((m, i) => {
    const row = ws.addRow({ date: fmt(m.date), batch: m.batchId?.name ?? 'Unknown', ageGroup: m.ageGroup === 'chick' ? 'Chick' : 'Adult', count: m.count, notes: m.notes ?? '-' });
    stripeRow(row, i);
    total += m.count;
  });

  ws.addRow([]);
  const totRow = ws.addRow(['TOTALS', '', '', total, '']);
  totRow.eachCell((c) => { c.font = { bold: true }; });

  const buf = await wb.xlsx.writeBuffer();
  downloadBuffer(buf, `mortality_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

// ─── Incubation ───────────────────────────────────────────────────────────────

export async function generateIncubationExcel(incubation: IncubationReport[]): Promise<void> {
  const wb = newWorkbook();
  const ws = wb.addWorksheet('Incubation', { properties: { tabColor: { argb: 'FF7030A0' } } });

  ws.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Inserted', key: 'inserted', width: 12 },
    { header: 'Hatched', key: 'hatched', width: 12 },
    { header: 'Spoiled', key: 'spoiled', width: 12 },
    { header: 'Not Hatched', key: 'notHatched', width: 14 },
    { header: 'Hatch Rate', key: 'hatchRate', width: 12 },
  ];
  styleHeader(ws.getRow(1), 'FF7030A0');

  const tot = { inserted: 0, hatched: 0, spoiled: 0, notHatched: 0 };
  incubation.forEach((r, i) => {
    const rate = r.inserted > 0 ? `${((r.hatched / r.inserted) * 100).toFixed(1)}%` : '-';
    const row = ws.addRow({ date: fmt(r.date), inserted: r.inserted, hatched: r.hatched, spoiled: r.spoiled, notHatched: r.notHatched, hatchRate: rate });
    stripeRow(row, i);
    tot.inserted += r.inserted;
    tot.hatched += r.hatched;
    tot.spoiled += r.spoiled;
    tot.notHatched += r.notHatched;
  });

  ws.addRow([]);
  const overallRate = tot.inserted > 0 ? `${((tot.hatched / tot.inserted) * 100).toFixed(1)}%` : '-';
  const totRow = ws.addRow(['TOTALS', tot.inserted, tot.hatched, tot.spoiled, tot.notHatched, overallRate]);
  totRow.eachCell((c) => { c.font = { bold: true }; });

  const buf = await wb.xlsx.writeBuffer();
  downloadBuffer(buf, `incubation_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

// ─── Vaccinations ─────────────────────────────────────────────────────────────

export async function generateVaccinationsExcel(vaccinations: VaccinationReport[]): Promise<void> {
  const wb = newWorkbook();
  const ws = wb.addWorksheet('Vaccinations', { properties: { tabColor: { argb: 'FF70AD47' } } });

  ws.columns = [
    { header: 'Batch', key: 'batch', width: 20 },
    { header: 'Vaccine', key: 'vaccine', width: 24 },
    { header: 'Age (Days)', key: 'ageInDays', width: 12 },
    { header: 'Scheduled', key: 'scheduled', width: 14 },
    { header: 'Completed', key: 'completed', width: 14 },
    { header: 'Cost (KES)', key: 'cost', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Notes', key: 'notes', width: 32 },
  ];
  styleHeader(ws.getRow(1), 'FF70AD47');

  vaccinations.forEach((v, i) => {
    const row = ws.addRow({
      batch: v.batchId?.name ?? '-',
      vaccine: v.vaccineName,
      ageInDays: v.ageInDays,
      scheduled: fmt(v.scheduledDate),
      completed: v.completedDate ? fmt(v.completedDate) : '-',
      cost: v.actualCost ?? '-',
      status: v.status.charAt(0).toUpperCase() + v.status.slice(1),
      notes: v.notes ?? '-',
    });
    stripeRow(row, i);
    const statusCell = row.getCell(7);
    if (v.status === 'completed') {
      statusCell.font = { color: { argb: 'FF375623' } };
    } else if (v.status === 'overdue') {
      statusCell.font = { bold: true, color: { argb: 'FF9C0006' } };
      row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0F0' } };
    }
  });

  const buf = await wb.xlsx.writeBuffer();
  downloadBuffer(buf, `vaccinations_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function generateOrdersExcel(orders: OrderReport[]): Promise<void> {
  const wb = newWorkbook();

  const ordersWs = wb.addWorksheet('Orders', { properties: { tabColor: { argb: 'FF0070C0' } } });
  ordersWs.columns = [
    { header: 'Order #', key: 'orderNumber', width: 20 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Customer', key: 'customer', width: 22 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Email', key: 'email', width: 26 },
    { header: 'Delivery Type', key: 'deliveryType', width: 14 },
    { header: 'Subtotal (KES)', key: 'subtotal', width: 16 },
    { header: 'Delivery Fee', key: 'deliveryFee', width: 14 },
    { header: 'Total (KES)', key: 'total', width: 14 },
    { header: 'Status', key: 'status', width: 14 },
  ];
  styleHeader(ordersWs.getRow(1), 'FF0070C0');

  orders.forEach((o, i) => {
    const row = ordersWs.addRow({
      orderNumber: o.orderNumber,
      date: fmt(o.createdAt),
      customer: o.customerName,
      phone: o.customerPhone,
      email: o.customerEmail,
      deliveryType: o.deliveryType === 'pickup' ? 'Pickup' : 'Delivery',
      subtotal: o.subtotal,
      deliveryFee: o.deliveryFee,
      total: o.totalAmount,
      status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
    });
    stripeRow(row, i);
    row.getCell(7).numFmt = '#,##0.00';
    row.getCell(9).numFmt = '#,##0.00';
    const statusCell = row.getCell(10);
    if (o.status === 'delivered') statusCell.font = { color: { argb: 'FF375623' } };
    else if (o.status === 'cancelled') statusCell.font = { color: { argb: 'FF9C0006' } };
    else if (o.status === 'pending') statusCell.font = { color: { argb: 'FF7F6000' } };
  });

  const itemsWs = wb.addWorksheet('Order Items', { properties: { tabColor: { argb: 'FF70AD47' } } });
  itemsWs.columns = [
    { header: 'Order #', key: 'orderNumber', width: 20 },
    { header: 'Customer', key: 'customer', width: 22 },
    { header: 'Product', key: 'product', width: 26 },
    { header: 'Variant', key: 'variant', width: 14 },
    { header: 'Quantity', key: 'qty', width: 10 },
    { header: 'Unit', key: 'unit', width: 10 },
    { header: 'Price/Unit (KES)', key: 'price', width: 18 },
    { header: 'Total (KES)', key: 'total', width: 14 },
  ];
  styleHeader(itemsWs.getRow(1), 'FF70AD47');

  let itemIdx = 0;
  orders.forEach((o) => {
    o.items.forEach((item) => {
      const row = itemsWs.addRow({ orderNumber: o.orderNumber, customer: o.customerName, product: item.productName, variant: item.variant ?? '-', qty: item.quantity, unit: item.unit, price: item.pricePerUnit, total: item.totalPrice });
      stripeRow(row, itemIdx++);
      row.getCell(7).numFmt = '#,##0.00';
      row.getCell(8).numFmt = '#,##0.00';
    });
  });

  const buf = await wb.xlsx.writeBuffer();
  downloadBuffer(buf, `orders_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}

// ─── Farm Summary (all-in-one) ────────────────────────────────────────────────

export async function generateFarmSummaryExcel(data: FarmReportData): Promise<void> {
  const wb = newWorkbook();
  const { batches, transactions, eggs, feed, mortality, incubation, vaccinations, orders } = data;

  const activeBatches = batches.filter((b) => !b.archived);
  const totalBirds = activeBatches.reduce((s, b) => s + b.currentSize, 0);
  const income = transactions.filter((t) => t.type === 'income');
  const expenses = transactions.filter((t) => t.type === 'expense');
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);
  const netProfit = totalIncome - totalExpenses;
  const totalEggsCollected = eggs.reduce((s, e) => s + e.collected, 0);
  const totalEggRevenue = eggs.reduce((s, e) => s + (e.totalRevenue ?? 0), 0);
  const totalFeedCost = feed.reduce((s, f) => s + f.price, 0);
  const totalMortality = mortality.reduce((s, m) => s + m.count, 0);
  const totalInserted = incubation.reduce((s, r) => s + r.inserted, 0);
  const totalHatched = incubation.reduce((s, r) => s + r.hatched, 0);
  const overdueVax = vaccinations.filter((v) => v.status === 'overdue').length;
  const completedVax = vaccinations.filter((v) => v.status === 'completed').length;
  const totalOrderRevenue = orders.reduce((s, o) => s + o.totalAmount, 0);

  const period = data.dateRange?.start || data.dateRange?.end
    ? `${data.dateRange.start ? fmt(data.dateRange.start) : 'Start'} – ${data.dateRange.end ? fmt(data.dateRange.end) : 'Now'}`
    : 'All Time';

  // ── Summary sheet ──
  const summaryWs = wb.addWorksheet('Summary', { properties: { tabColor: { argb: 'FF1E3A5F' } } });
  summaryWs.columns = [{ key: 'label', width: 30 }, { key: 'value', width: 24 }];

  const titleRow = summaryWs.addRow(['Farm Summary Report', `Period: ${period}`]);
  titleRow.getCell(1).font = { bold: true, size: 16, color: { argb: 'FF1E3A5F' } };
  titleRow.getCell(2).font = { italic: true, size: 11, color: { argb: 'FF666666' } };
  titleRow.height = 32;

  const genRow = summaryWs.addRow([`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, '']);
  genRow.getCell(1).font = { size: 10, color: { argb: 'FF888888' } };
  summaryWs.addRow([]);

  const sections: [string, string, Array<[string, string | number]>][] = [
    ['FF1E3A5F', 'FLOCK OVERVIEW', [
      ['Active Batches', activeBatches.length],
      ['Total Live Birds', totalBirds.toLocaleString()],
      ['Chick Batches', activeBatches.filter((b) => b.category === 'chick').length],
      ['Adult Batches', activeBatches.filter((b) => b.category === 'adult').length],
      ['Total Mortality', `${totalMortality.toLocaleString()} birds`],
    ]],
    ['FF375623', 'FINANCIALS', [
      ['Total Income', kes(totalIncome)],
      ['Total Expenses', kes(totalExpenses)],
      ['Net Profit / Loss', kes(netProfit)],
      ['Feed Costs', kes(totalFeedCost)],
    ]],
    ['FFBF8F00', 'EGG PRODUCTION', [
      ['Total Collected', `${totalEggsCollected.toLocaleString()} eggs`],
      ['Total Revenue', kes(totalEggRevenue)],
      ['Collection Records', eggs.length],
    ]],
    ['FF7030A0', 'INCUBATION', [
      ['Total Set', `${totalInserted.toLocaleString()} eggs`],
      ['Total Hatched', `${totalHatched.toLocaleString()} chicks`],
      ['Hatch Rate', totalInserted > 0 ? `${((totalHatched / totalInserted) * 100).toFixed(1)}%` : 'N/A'],
    ]],
    ['FF70AD47', 'VACCINATION', [
      ['Total Scheduled', vaccinations.length],
      ['Completed', completedVax],
      ['Overdue', overdueVax],
      ['Pending', vaccinations.filter((v) => v.status === 'pending').length],
    ]],
    ['FF0070C0', 'SHOP ORDERS', [
      ['Total Orders', orders.length],
      ['Pending Orders', orders.filter((o) => o.status === 'pending').length],
      ['Delivered', orders.filter((o) => o.status === 'delivered').length],
      ['Total Revenue', kes(totalOrderRevenue)],
    ]],
  ];

  sections.forEach(([color, title, rows]) => {
    const secRow = summaryWs.addRow([title, '']);
    secRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    secRow.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
    secRow.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
    secRow.height = 20;

    rows.forEach(([label, value]) => {
      const r = summaryWs.addRow([label, value]);
      r.getCell(1).font = { color: { argb: 'FF444444' } };
      if (label === 'Net Profit / Loss') {
        r.getCell(2).font = { bold: true, color: { argb: netProfit >= 0 ? 'FF375623' : 'FF9C0006' } };
      }
      if (label === 'Overdue' && overdueVax > 0) {
        r.getCell(2).font = { bold: true, color: { argb: 'FF9C0006' } };
      }
    });
    summaryWs.addRow([]);
  });

  // ── Batches sheet ──
  const bWs = wb.addWorksheet('Batches', { properties: { tabColor: { argb: 'FF4472C4' } } });
  bWs.columns = [
    { header: 'Code', key: 'batchCode', width: 14 },
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Breed', key: 'breed', width: 16 },
    { header: 'Category', key: 'category', width: 10 },
    { header: 'Start Date', key: 'startDate', width: 14 },
    { header: 'Current Size', key: 'currentSize', width: 13 },
    { header: 'Initial Size', key: 'initialSize', width: 13 },
    { header: 'Male', key: 'maleCount', width: 10 },
    { header: 'Female', key: 'femaleCount', width: 10 },
    { header: 'Cost (KES)', key: 'totalCost', width: 14 },
    { header: 'Status', key: 'status', width: 10 },
  ];
  styleHeader(bWs.getRow(1), 'FF4472C4');
  batches.forEach((b, i) => {
    const row = bWs.addRow({ batchCode: b.batchCode, name: b.name, breed: b.breed, category: b.category === 'chick' ? 'Chick' : 'Adult', startDate: fmt(b.startDate), currentSize: b.currentSize, initialSize: b.initialSize, maleCount: b.maleCount ?? '-', femaleCount: b.femaleCount ?? '-', totalCost: b.totalCost ?? 0, status: b.archived ? 'Archived' : 'Active' });
    stripeRow(row, i);
    row.getCell(10).numFmt = '#,##0.00';
  });

  // ── Financial sheet ──
  const fWs = wb.addWorksheet('Financial', { properties: { tabColor: { argb: 'FF70AD47' } } });
  fWs.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Type', key: 'type', width: 10 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Amount (KES)', key: 'amount', width: 16 },
    { header: 'Description', key: 'description', width: 38 },
    { header: 'Batch', key: 'batch', width: 20 },
  ];
  styleHeader(fWs.getRow(1), 'FF70AD47');
  transactions.forEach((t, i) => {
    const row = fWs.addRow({ date: fmt(t.date), type: t.type === 'income' ? 'Income' : 'Expense', category: t.category, amount: t.amount, description: t.description, batch: t.batchId?.name ?? '-' });
    stripeRow(row, i);
    row.getCell(4).numFmt = '#,##0.00';
    row.getCell(2).font = { color: { argb: t.type === 'income' ? 'FF375623' : 'FF9C0006' } };
  });

  // ── Eggs sheet ──
  const eWs = wb.addWorksheet('Egg Production', { properties: { tabColor: { argb: 'FFBF8F00' } } });
  eWs.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Collected', key: 'collected', width: 12 },
    { header: 'Sold', key: 'sold', width: 10 },
    { header: 'Spoiled', key: 'spoiled', width: 10 },
    { header: 'Price/Egg', key: 'pricePerEgg', width: 12 },
    { header: 'Revenue (KES)', key: 'revenue', width: 16 },
  ];
  styleHeader(eWs.getRow(1), 'FFBF8F00');
  eggs.forEach((e, i) => {
    const row = eWs.addRow({ date: fmt(e.date), collected: e.collected, sold: e.sold, spoiled: e.spoiled, pricePerEgg: e.pricePerEgg ?? '-', revenue: e.totalRevenue ?? 0 });
    stripeRow(row, i);
    row.getCell(6).numFmt = '#,##0.00';
  });

  // ── Feed sheet ──
  const fdWs = wb.addWorksheet('Feed', { properties: { tabColor: { argb: 'FF8B6914' } } });
  fdWs.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Type', key: 'type', width: 22 },
    { header: 'Bags', key: 'bags', width: 10 },
    { header: 'Kg/Bag', key: 'kgPerBag', width: 10 },
    { header: 'Total (Kg)', key: 'totalKg', width: 12 },
    { header: 'Cost (KES)', key: 'price', width: 14 },
  ];
  styleHeader(fdWs.getRow(1), 'FF8B6914');
  feed.forEach((f, i) => {
    const row = fdWs.addRow({ date: fmt(f.date), type: f.type, bags: f.bags, kgPerBag: f.kgPerBag, totalKg: f.totalKg, price: f.price });
    stripeRow(row, i);
    row.getCell(6).numFmt = '#,##0.00';
  });

  // ── Mortality sheet ──
  const mWs = wb.addWorksheet('Mortality', { properties: { tabColor: { argb: 'FFD9534F' } } });
  mWs.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Batch', key: 'batch', width: 22 },
    { header: 'Age Group', key: 'ageGroup', width: 12 },
    { header: 'Count', key: 'count', width: 10 },
    { header: 'Notes', key: 'notes', width: 38 },
  ];
  styleHeader(mWs.getRow(1), 'FFD9534F');
  mortality.forEach((m, i) => {
    const row = mWs.addRow({ date: fmt(m.date), batch: m.batchId?.name ?? '-', ageGroup: m.ageGroup === 'chick' ? 'Chick' : 'Adult', count: m.count, notes: m.notes ?? '-' });
    stripeRow(row, i);
  });

  // ── Incubation sheet ──
  const iWs = wb.addWorksheet('Incubation', { properties: { tabColor: { argb: 'FF7030A0' } } });
  iWs.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Inserted', key: 'inserted', width: 12 },
    { header: 'Hatched', key: 'hatched', width: 12 },
    { header: 'Spoiled', key: 'spoiled', width: 12 },
    { header: 'Not Hatched', key: 'notHatched', width: 14 },
    { header: 'Hatch Rate', key: 'hatchRate', width: 12 },
  ];
  styleHeader(iWs.getRow(1), 'FF7030A0');
  incubation.forEach((r, i) => {
    const rate = r.inserted > 0 ? `${((r.hatched / r.inserted) * 100).toFixed(1)}%` : '-';
    const row = iWs.addRow({ date: fmt(r.date), inserted: r.inserted, hatched: r.hatched, spoiled: r.spoiled, notHatched: r.notHatched, hatchRate: rate });
    stripeRow(row, i);
  });

  // ── Vaccinations sheet ──
  const vWs = wb.addWorksheet('Vaccinations', { properties: { tabColor: { argb: 'FF375623' } } });
  vWs.columns = [
    { header: 'Batch', key: 'batch', width: 20 },
    { header: 'Vaccine', key: 'vaccine', width: 24 },
    { header: 'Age (Days)', key: 'ageInDays', width: 12 },
    { header: 'Scheduled', key: 'scheduled', width: 14 },
    { header: 'Completed', key: 'completed', width: 14 },
    { header: 'Cost (KES)', key: 'cost', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
  ];
  styleHeader(vWs.getRow(1), 'FF375623');
  vaccinations.forEach((v, i) => {
    const row = vWs.addRow({ batch: v.batchId?.name ?? '-', vaccine: v.vaccineName, ageInDays: v.ageInDays, scheduled: fmt(v.scheduledDate), completed: v.completedDate ? fmt(v.completedDate) : '-', cost: v.actualCost ?? '-', status: v.status.charAt(0).toUpperCase() + v.status.slice(1) });
    stripeRow(row, i);
    if (v.status === 'overdue') {
      row.getCell(7).font = { bold: true, color: { argb: 'FF9C0006' } };
    } else if (v.status === 'completed') {
      row.getCell(7).font = { color: { argb: 'FF375623' } };
    }
  });

  // ── Orders sheet ──
  const oWs = wb.addWorksheet('Orders', { properties: { tabColor: { argb: 'FF0070C0' } } });
  oWs.columns = [
    { header: 'Order #', key: 'orderNumber', width: 20 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Customer', key: 'customer', width: 22 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Delivery', key: 'deliveryType', width: 12 },
    { header: 'Total (KES)', key: 'total', width: 14 },
    { header: 'Status', key: 'status', width: 14 },
  ];
  styleHeader(oWs.getRow(1), 'FF0070C0');
  orders.forEach((o, i) => {
    const row = oWs.addRow({ orderNumber: o.orderNumber, date: fmt(o.createdAt), customer: o.customerName, phone: o.customerPhone, deliveryType: o.deliveryType === 'pickup' ? 'Pickup' : 'Delivery', total: o.totalAmount, status: o.status.charAt(0).toUpperCase() + o.status.slice(1) });
    stripeRow(row, i);
    row.getCell(6).numFmt = '#,##0.00';
    if (o.status === 'delivered') row.getCell(7).font = { color: { argb: 'FF375623' } };
    else if (o.status === 'cancelled') row.getCell(7).font = { color: { argb: 'FF9C0006' } };
  });

  const buf = await wb.xlsx.writeBuffer();
  downloadBuffer(buf, `farm_summary_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
}
