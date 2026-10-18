import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PocketSummary } from '../../types';
import { formatIDR } from '../../domain/finance/financialEngine';
import { isColorLight } from '../../domain/finance/pocketIcons';

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
      const sliceColor = data.color || '#FAAE2B';
      const isLight = isColorLight(sliceColor);
      const textColor = isLight ? '#18181B' : '#FFFFFF';
      const subTextColor = isLight ? '#27272A' : '#F4F4F5';

      return (
        <div
          className="p-3 rounded-2xl border-2 border-brand-dark text-xs shadow-saweria font-bold select-none min-w-[150px]"
          style={{ backgroundColor: sliceColor }}
        >
          <p className="font-black drop-shadow-sm truncate" style={{ color: textColor }}>
            {data.name}
          </p>
          <p className="text-sm font-black tabular-nums mt-0.5 drop-shadow-sm" style={{ color: textColor }}>
            {formatIDR(data.value)}
          </p>
          <p className="text-[10px] font-extrabold uppercase mt-0.5" style={{ color: subTextColor }}>
            Porsi: {data.percentage}%
          </p>
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
