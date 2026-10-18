import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatIDR, formatPeriod } from '../domain/finance/financialEngine';
import { isColorLight } from '../domain/finance/pocketIcons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Download,
  PieChart as PieIcon,
  BarChart3,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { pocketSummaries, transactions, overview, selectedPeriod } = useData();

  // Income vs Expense Data
  const incomeVsExpenseData = [
    {
      name: selectedPeriod,
      Pemasukan: overview.monthlyIncome,
      Pengeluaran: overview.totalMonthlyExpense,
    },
  ];

  // Computed dynamic Y-Axis max ceiling for clear headroom & readable intervals
  const yAxisMax = useMemo(() => {
    const maxVal = Math.max(overview.monthlyIncome, overview.totalMonthlyExpense, 1000000);
    return Math.ceil((maxVal * 1.25) / 2000000) * 2000000;
  }, [overview.monthlyIncome, overview.totalMonthlyExpense]);

  // Category spending data
  const categoryData = useMemo(() => {
    return pocketSummaries
      .filter((p) => p.spentAmount > 0)
      .map((p) => ({
        name: p.name,
        value: p.spentAmount,
        color: p.color,
      }));
  }, [pocketSummaries]);

  const [hoveredPocket, setHoveredPocket] = useState<{
    name: string;
    value: number;
    color: string;
  } | null>(null);

  // Dynamic custom tooltip that matches hovered slice color with high-contrast text
  const CustomDonutTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const sliceColor = data.payload.color || '#FAAE2B';
      const isLight = isColorLight(sliceColor);
      const textColor = isLight ? '#18181B' : '#FFFFFF';
      const subTextColor = isLight ? '#27272A' : '#F4F4F5';
      const total = overview.totalMonthlyExpense || 1;
      const percent = ((data.value / total) * 100).toFixed(1);

      return (
        <div
          className="px-4 py-3 rounded-2xl border-2 border-brand-dark shadow-saweria select-none min-w-[170px]"
          style={{ backgroundColor: sliceColor }}
        >
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full border border-brand-dark shrink-0"
              style={{ backgroundColor: isLight ? '#18181B' : '#FFFFFF' }}
            />
            <p
              className="text-xs font-black tracking-tight truncate drop-shadow-sm"
              style={{ color: textColor }}
            >
              {data.name}
            </p>
          </div>

          <p
            className="text-base font-black tabular-nums mt-1 drop-shadow-sm"
            style={{ color: textColor }}
          >
            {formatIDR(data.value)}
          </p>

          <div
            className="mt-1 pt-1 border-t border-black/15 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider"
            style={{ color: subTextColor }}
          >
            <span>Porsi</span>
            <span>{percent}% dari total</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleExportCSV = () => {
    const headers = ['Tanggal', 'Tipe', 'Kategori/Kantong', 'Keterangan', 'Nominal (IDR)'];
    const rows = transactions.map((t) => [
      t.date,
      t.type,
      t.pocket_id || '-',
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pockito_transaksi_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const netSavings = overview.monthlyIncome - overview.totalMonthlyExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-brand-dark shadow-saweria">
        <div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">
            Laporan & Analisis Finansial
          </h2>
          <p className="text-xs sm:text-sm font-bold text-brand-darkMuted mt-1">
            Visualisasi performa arus kas, rasio tabungan, dan realisasi anggaran kantong.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={handleExportCSV}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Ekspor CSV Transaksi
        </Button>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="saweria" className="bg-white">
          <div className="flex items-center justify-between text-xs font-bold text-brand-darkMuted uppercase">
            <span>Total Pemasukan</span>
            <TrendingUp className="w-4 h-4 text-[#047857]" />
          </div>
          <div className="text-xl font-black text-brand-dark tabular-nums mt-1">
            {formatIDR(overview.monthlyIncome)}
          </div>
        </Card>

        <Card variant="saweria" className="bg-white">
          <div className="flex items-center justify-between text-xs font-bold text-brand-darkMuted uppercase">
            <span>Total Pengeluaran</span>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-xl font-black text-brand-dark tabular-nums mt-1">
            {formatIDR(overview.totalMonthlyExpense)}
          </div>
        </Card>

        <Card variant="saweria" className="bg-white">
          <div className="flex items-center justify-between text-xs font-bold text-brand-darkMuted uppercase">
            <span>Surplus / Tabungan Bersih</span>
            <span className="text-brand-primary">💰</span>
          </div>
          <div
            className={`text-xl font-black tabular-nums mt-1 ${
              netSavings >= 0 ? 'text-[#047857]' : 'text-red-600'
            }`}
          >
            {formatIDR(netSavings)}
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Income vs Expense */}
        <Card variant="saweria" className="bg-white">
          <div className="pb-3 border-b-2 border-brand-border flex items-center justify-between">
            <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-primary" />
              <span>Arus Kas: Pemasukan vs Pengeluaran</span>
            </h3>
            <span className="text-[11px] font-bold text-brand-darkMuted bg-brand-cream px-2 py-0.5 rounded-lg border border-brand-border">
              Periode {formatPeriod(selectedPeriod)}
            </span>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={incomeVsExpenseData}
                margin={{ top: 25, right: 15, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E4E7" vertical={false} />
                <XAxis dataKey="name" stroke="#18181B" fontSize={11} fontWeight={700} />
                <YAxis
                  stroke="#18181B"
                  fontSize={11}
                  domain={[0, yAxisMax]}
                  tickFormatter={(val) => `Rp ${(val / 1000).toLocaleString('id-ID')}k`}
                />
                <Tooltip
                  formatter={(val: number) => formatIDR(val)}
                  contentStyle={{
                    backgroundColor: '#18181B',
                    borderRadius: '12px',
                    border: '2px solid #18181B',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                <Bar
                  dataKey="Pemasukan"
                  fill="#10B981"
                  stroke="#18181B"
                  strokeWidth={1.5}
                  radius={[6, 6, 0, 0]}
                >
                  <LabelList
                    dataKey="Pemasukan"
                    position="top"
                    formatter={(val: number) => formatIDR(val)}
                    fill="#18181B"
                    fontSize={11}
                    fontWeight={800}
                    offset={8}
                  />
                </Bar>
                <Bar
                  dataKey="Pengeluaran"
                  fill="#EF4444"
                  stroke="#18181B"
                  strokeWidth={1.5}
                  radius={[6, 6, 0, 0]}
                >
                  <LabelList
                    dataKey="Pengeluaran"
                    position="top"
                    formatter={(val: number) => formatIDR(val)}
                    fill="#18181B"
                    fontSize={11}
                    fontWeight={800}
                    offset={8}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut Chart: Spending Breakdown by Category */}
        <Card variant="saweria" className="bg-white">
          <div className="pb-3 border-b-2 border-brand-border flex items-center justify-between">
            <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-brand-primary" />
              <span>Komposisi Pengeluaran per Kantong</span>
            </h3>
            {categoryData.length > 0 && (
              <span className="text-[11px] font-bold text-brand-darkMuted bg-brand-cream px-2 py-0.5 rounded-lg border border-brand-border">
                {categoryData.length} Kantong
              </span>
            )}
          </div>

          {categoryData.length === 0 ? (
            <div className="h-72 flex items-center justify-center">
              <p className="text-xs text-brand-darkMuted font-bold">
                Belum ada data pengeluaran pada periode ini.
              </p>
            </div>
          ) : (
            <div className="mt-4 flex flex-col sm:flex-row items-center gap-4 min-h-[288px]">
              {/* Donut Chart Visual with Center Hole Total */}
              <div className="w-full sm:w-5/12 h-64 relative flex items-center justify-center shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart onMouseLeave={() => setHoveredPocket(null)}>
                    <Tooltip
                      content={<CustomDonutTooltip />}
                      wrapperStyle={{ zIndex: 50, pointerEvents: 'none' }}
                      allowEscapeViewBox={{ x: true, y: true }}
                    />
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="#18181B"
                      strokeWidth={2}
                      onMouseEnter={(_, index) => setHoveredPocket(categoryData[index])}
                      onMouseLeave={() => setHoveredPocket(null)}
                      onClick={(_, index) =>
                        setHoveredPocket(
                          hoveredPocket?.name === categoryData[index].name
                            ? null
                            : categoryData[index]
                        )
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                          className="cursor-pointer transition-opacity duration-150"
                          opacity={hoveredPocket && hoveredPocket.name !== entry.name ? 0.45 : 1}
                          stroke="#18181B"
                          strokeWidth={hoveredPocket?.name === entry.name ? 3 : 2}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Hole Metric (Smoothly hidden when hovering to prevent text collision) */}
                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2 transition-opacity duration-200 ${
                    hoveredPocket ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-darkMuted truncate max-w-[110px]">
                    Total Keluar
                  </span>
                  <span className="text-xs sm:text-sm font-black text-brand-dark mt-0.5">
                    {formatIDR(overview.totalMonthlyExpense)}
                  </span>
                </div>
              </div>

              {/* Side Breakdown List (Sebelah Chart Donut) */}
              <div className="w-full sm:w-7/12 max-h-64 overflow-y-auto pr-1 space-y-2">
                {categoryData.map((item, index) => {
                  const total = overview.totalMonthlyExpense || 1;
                  const percent = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-xl bg-brand-cream/60 border-2 border-brand-border hover:border-brand-dark transition-all text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* Tanda Warna (Color Indicator Badge) */}
                        <span
                          className="w-3.5 h-3.5 rounded-md border-2 border-brand-dark shrink-0 shadow-saweria-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        {/* Nama Kantong (Di sebelahnya apa) */}
                        <span className="font-bold text-brand-dark truncate" title={item.name}>
                          {item.name}
                        </span>
                      </div>
                      {/* Persentase & Nominal */}
                      <div className="text-right shrink-0 ml-3">
                        <span className="font-black text-brand-dark block text-xs">
                          {percent}%
                        </span>
                        <span className="text-[10px] font-bold text-brand-darkMuted">
                          {formatIDR(item.value)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Budget vs Actual Variance Table */}
      <Card variant="saweria" className="bg-white p-0 overflow-hidden">
        <div className="p-4 border-b-2 border-brand-border">
          <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider">
            Tabel Evaluasi: Rencana vs Realisasi (Budget vs Actual)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-brand-cream border-b-2 border-brand-border font-black text-brand-dark uppercase tracking-wider">
                <th className="p-3.5">Kantong</th>
                <th className="p-3.5">Porsi (%)</th>
                <th className="p-3.5">Rencana Pagu</th>
                <th className="p-3.5">Realisasi Keluar</th>
                <th className="p-3.5">Sisa / Selisih</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border font-bold text-brand-dark">
              {pocketSummaries.map((pocket) => {
                const isOver = pocket.spentAmount > pocket.plannedAmount;
                return (
                  <tr key={pocket.id} className="hover:bg-brand-cream/30">
                    <td className="p-3.5 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pocket.color }} />
                      <span>{pocket.name}</span>
                      {pocket.is_starred && <span>⭐</span>}
                    </td>
                    <td className="p-3.5 tabular-nums">{pocket.allocation_percentage}%</td>
                    <td className="p-3.5 tabular-nums">{formatIDR(pocket.plannedAmount)}</td>
                    <td className="p-3.5 tabular-nums">{formatIDR(pocket.spentAmount)}</td>
                    <td className={`p-3.5 tabular-nums ${isOver ? 'text-red-600' : 'text-[#047857]'}`}>
                      {formatIDR(pocket.remainingAmount)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                          isOver
                            ? 'bg-red-100 text-red-700 border border-red-300'
                            : 'bg-green-100 text-green-700 border border-green-300'
                        }`}
                      >
                        {isOver ? 'Overbudget' : 'Terkendali'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
