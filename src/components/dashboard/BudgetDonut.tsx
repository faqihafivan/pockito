import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PocketSummary } from '../../types';
import { formatIDR } from '../../domain/finance/financialEngine';

interface BudgetDonutProps {
  pocketSummaries: PocketSummary[];
  monthlyIncome: number;
  unallocatedPercentage: number;
  unallocatedIncome: number;
}

export const BudgetDonut: React.FC<BudgetDonutProps> = ({
  pocketSummaries,
  monthlyIncome,
  unallocatedPercentage,
  unallocatedIncome,
}) => {
  // Build data points
  const chartData = pocketSummaries.map((p) => ({
    name: p.name,
    value: p.plannedAmount,
    percentage: p.allocation_percentage,
    color: p.color,
  }));

  // Add unallocated slice if greater than 0
  if (unallocatedPercentage > 0) {
    chartData.push({
      name: 'Belum Dialokasikan',
      value: unallocatedIncome,
      percentage: unallocatedPercentage,
      color: '#E4E0D7', // Neutral gray
    });
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-brand-dark text-white p-3 rounded-xl border border-brand-dark text-xs shadow-saweria font-bold">
          <p className="text-brand-primary">{data.name}</p>
          <p className="text-sm font-black tabular-nums mt-0.5">{formatIDR(data.value)}</p>
          <p className="text-[10px] text-gray-300 font-medium">Porsi: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center relative w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip content={<CustomTooltip />} />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            stroke="#18181B"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-darkMuted">
          Total Gaji
        </span>
        <span className="text-sm font-black text-brand-dark tabular-nums">
          {formatIDR(monthlyIncome)}
        </span>
      </div>
    </div>
  );
};
