import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PocketSummary } from '../../types';
import { useData } from '../../context/DataContext';
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
  const { formatMoney } = useData();
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [isTooltipActive, setIsTooltipActive] = React.useState(false);

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
    React.useEffect(() => {
      if (active && payload && payload.length) {
        setIsTooltipActive(true);
      } else {
        setIsTooltipActive(false);
      }
    }, [active, payload]);

    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const sliceColor = data.color || '#FAAE2B';
      const isLight = isColorLight(sliceColor);
      const textColor = isLight ? '#18181B' : '#FFFFFF';
      const subTextColor = isLight ? '#27272A' : '#F4F4F5';

      return (
        <div
          className="p-3 rounded-2xl border-2 border-brand-dark text-xs shadow-saweria font-bold select-none min-w-[150px] animate-in fade-in zoom-in-95 duration-150"
          style={{ backgroundColor: sliceColor }}
        >
          <p className="font-black drop-shadow-sm truncate" style={{ color: textColor }}>
            {data.name}
          </p>
          <p className="text-sm font-black tabular-nums mt-0.5 drop-shadow-sm" style={{ color: textColor }}>
            {formatMoney(data.value)}
          </p>
          <p className="text-[10px] font-extrabold uppercase mt-0.5" style={{ color: subTextColor }}>
            Porsi: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const isAnyActive = hoveredIndex !== null || isTooltipActive;

  return (
    <div className="flex flex-col items-center justify-center relative w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart onMouseLeave={() => setHoveredIndex(null)}>
          <Tooltip
            content={<CustomTooltip />}
            wrapperStyle={{ zIndex: 50, pointerEvents: 'none' }}
            allowEscapeViewBox={{ x: true, y: true }}
          />
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
            onMouseEnter={(_, index) => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={(_, index) => setHoveredIndex(hoveredIndex === index ? null : index)}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="cursor-pointer transition-all duration-150"
                opacity={hoveredIndex === null || hoveredIndex === index ? 1 : 0.45}
                stroke="#18181B"
                strokeWidth={hoveredIndex === index ? 3 : 2}
              />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label (Smoothly hidden when hovering/tapping any slice to prevent text collisions) */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-opacity duration-200 ${
          isAnyActive ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-darkMuted">
          Total Gaji
        </span>
        <span className="text-sm font-black text-brand-dark tabular-nums">
          {formatMoney(monthlyIncome)}
        </span>
      </div>
    </div>
  );
};
