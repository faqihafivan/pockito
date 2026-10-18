import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { formatIDR } from '../domain/finance/financialEngine';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
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
          <div className="pb-3 border-b-2 border-brand-border">
            <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-primary" />
              <span>Arus Kas: Pemasukan vs Pengeluaran</span>
            </h3>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenseData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#18181B" fontSize={11} fontWeight={700} />
                <YAxis stroke="#18181B" fontSize={11} tickFormatter={(val) => `Rp ${val / 1000}k`} />
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
                <Bar dataKey="Pemasukan" fill="#10B981" stroke="#18181B" strokeWidth={1.5} radius={[6, 6, 0, 0]} />
                <Bar dataKey="Pengeluaran" fill="#EF4444" stroke="#18181B" strokeWidth={1.5} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Pie Chart: Spending Breakdown by Category */}
        <Card variant="saweria" className="bg-white">
          <div className="pb-3 border-b-2 border-brand-border">
            <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-brand-primary" />
              <span>Komposisi Pengeluaran per Kantong</span>
            </h3>
          </div>

          <div className="h-64 mt-4 flex items-center justify-center">
            {categoryData.length === 0 ? (
              <p className="text-xs text-brand-darkMuted font-bold">
                Belum ada data pengeluaran pada periode ini.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(val: number) => formatIDR(val)}
                    contentStyle={{
                      backgroundColor: '#18181B',
                      borderRadius: '12px',
                      color: '#fff',
                      fontWeight: 700,
                    }}
                  />
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    stroke="#18181B"
                    strokeWidth={2}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
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
