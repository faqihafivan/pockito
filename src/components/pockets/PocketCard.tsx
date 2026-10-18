import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { PocketSummary } from '../../types';
import { formatIDR } from '../../domain/finance/financialEngine';
import {
  Utensils,
  Home,
  ShieldCheck,
  Car,
  Coffee,
  Smile,
  PiggyBank,
  ShoppingBag,
  BookOpen,
  Smartphone,
  HeartPulse,
  Film,
  Star,
  ChevronRight,
} from 'lucide-react';

interface PocketCardProps {
  pocket: PocketSummary;
  onEdit?: (pocket: PocketSummary) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Home,
  ShieldCheck,
  Car,
  Coffee,
  Smile,
  PiggyBank,
  ShoppingBag,
  BookOpen,
  Smartphone,
  HeartPulse,
  Film,
};

export const PocketCard: React.FC<PocketCardProps> = ({ pocket }) => {
  const navigate = useNavigate();
  const IconComponent = ICON_MAP[pocket.icon] || Utensils;
  const isOverBudget = pocket.spentAmount > pocket.plannedAmount;

  return (
    <Card
      variant="saweria"
      hoverable
      onClick={() => navigate(`/app/budget/${pocket.id}`)}
      className="flex flex-col justify-between group relative overflow-hidden"
    >
      <div>
        {/* Header: Icon, Name, and Star Badge */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl border-2 border-brand-dark flex items-center justify-center text-brand-dark shrink-0 shadow-saweria-sm"
              style={{ backgroundColor: pocket.color }}
            >
              <IconComponent className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-black text-brand-dark leading-tight group-hover:text-brand-primaryHover transition-colors">
                  {pocket.name}
                </h4>
                {pocket.is_starred && (
                  <Star className="w-3.5 h-3.5 fill-brand-primary text-brand-dark shrink-0" />
                )}
              </div>
              <span className="text-[11px] font-bold text-brand-darkMuted">
                Porsi: {pocket.allocation_percentage}% dari Gaji
              </span>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-brand-darkMuted group-hover:translate-x-1 group-hover:text-brand-dark transition-all" />
        </div>

        {/* Planned vs Spent Figures */}
        <div className="mt-4 grid grid-cols-2 gap-2 pt-3 border-t border-brand-border">
          <div>
            <span className="text-[10px] font-bold text-brand-darkMuted uppercase">
              Rencana Pagu
            </span>
            <div className="text-sm font-black text-brand-dark tabular-nums">
              {formatIDR(pocket.plannedAmount)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-brand-darkMuted uppercase">
              Terpakai
            </span>
            <div
              className={`text-sm font-black tabular-nums ${
                isOverBudget ? 'text-red-600' : 'text-brand-dark'
              }`}
            >
              {formatIDR(pocket.spentAmount)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <ProgressBar
            value={pocket.spentPercentage}
            color={pocket.color}
            size="md"
          />
        </div>
      </div>

      {/* Footer: Sisa Saldo */}
      <div className="mt-4 pt-2.5 flex items-center justify-between text-xs font-bold border-t border-dashed border-brand-border">
        <span className="text-brand-darkMuted">Sisa Kuota:</span>
        <span
          className={`font-black tabular-nums ${
            isOverBudget ? 'text-red-600' : 'text-[#047857]'
          }`}
        >
          {isOverBudget
            ? `Melebihi ${formatIDR(Math.abs(pocket.remainingAmount))}`
            : formatIDR(pocket.remainingAmount)}
        </span>
      </div>
    </Card>
  );
};
