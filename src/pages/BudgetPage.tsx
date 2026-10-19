import { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PocketModal } from '../components/pockets/PocketModal';
import { BudgetRecommendationModal } from '../components/pockets/BudgetRecommendationModal';
import { Pocket } from '../types';
import { formatIDR } from '../domain/finance/financialEngine';
import {
  Plus,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Star,
} from 'lucide-react';

import { useNotification } from '../context/NotificationContext';

export const BudgetPage: React.FC = () => {
  const { user } = useAuth();
  const {
    pocketSummaries,
    overview,
    updatePocket,
    deletePocket,
  } = useData();
  const { showConfirm, showToast } = useNotification();

  const [isPocketModalOpen, setIsPocketModalOpen] = useState(false);
  const [pocketToEdit, setPocketToEdit] = useState<Pocket | null>(null);
  const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);

  const monthlyIncome = user?.monthly_income || 0;

  const handleEdit = (pocket: Pocket) => {
    setPocketToEdit(pocket);
    setIsPocketModalOpen(true);
  };

  const handlePercentageChange = async (pocketId: string, newPercentage: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(newPercentage)));
    await updatePocket(pocketId, { allocation_percentage: clamped });
  };

  const handleToggleStar = async (pocket: Pocket) => {
    await updatePocket(pocket.id, { is_starred: !pocket.is_starred });
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = await showConfirm({
      title: 'Hapus Kantong?',
      message: `Yakin ingin menghapus kantong "${name}"?\nTransaksi yang sudah tercatat pada kantong ini tidak akan terhapus.`,
      confirmText: 'Ya, Hapus',
      isDanger: true,
    });
    if (confirmed) {
      await deletePocket(id);
      showToast(`Kantong "${name}" berhasil dihapus`, 'info');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border-2 border-brand-dark shadow-saweria">
        <div>
          <h2 className="text-2xl font-black text-brand-dark tracking-tight">
            Kantong Anggaran (Pockets)
          </h2>
          <p className="text-xs sm:text-sm font-bold text-brand-darkMuted mt-1">
            Bagi gaji bulananmu ke pos-pos terencana. Star ⭐ kantong prioritas untuk melindunginya.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsRecommendationOpen(true)}
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          >
            Rekomendasi
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setPocketToEdit(null);
              setIsPocketModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Buat Kantong
          </Button>
        </div>
      </div>

      {/* Allocation Status Alert Banner */}
      <div
        className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 ${overview.isOverallocated
            ? 'bg-red-50 border-red-500 text-red-800'
            : overview.unallocatedPercentage > 0
              ? 'bg-brand-primary/20 border-brand-dark text-brand-dark'
              : 'bg-[#10B981]/20 border-brand-dark text-[#047857]'
          }`}
      >
        <div className="flex items-center gap-3">
          {overview.isOverallocated ? (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-brand-dark shrink-0" />
          )}
          <div>
            <p className="text-xs font-black">
              {overview.isOverallocated
                ? `Alokasi Melebihi 100% (${overview.totalAllocationPercentage}% terpakai)! Mohon kurangi persentase kantong.`
                : overview.unallocatedPercentage > 0
                  ? `Ada sisa ${overview.unallocatedPercentage}% (${formatIDR(overview.unallocatedIncome)}) yang belum dialokasikan.`
                  : 'Alokasi Seimbang Sempurna (100% Gaji Terbagi)!'}
            </p>
            <p className="text-[11px] opacity-80 mt-0.5">
              Dasar perhitungan: Gaji bulanan {formatIDR(monthlyIncome)}
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-lg font-black tabular-nums">{overview.totalAllocationPercentage}%</span>
          <span className="text-xs font-bold block">/ 100%</span>
        </div>
      </div>

      {/* Detailed Pocket Control List */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-brand-dark">Daftar Kantong Aktif</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pocketSummaries.map((pocket) => (
            <Card key={pocket.id} variant="saweria" className="bg-white space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl border-2 border-brand-dark flex items-center justify-center text-brand-dark shadow-saweria-sm"
                    style={{ backgroundColor: pocket.color }}
                  >
                    <span className="font-black text-sm">{pocket.name.charAt(0)}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-black text-brand-dark">{pocket.name}</h4>
                      <button
                        onClick={() => handleToggleStar(pocket)}
                        title="Tandai Prioritas"
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-4 h-4 ${pocket.is_starred ? 'fill-brand-primary text-brand-dark' : 'text-gray-300'
                            }`}
                        />
                      </button>
                    </div>
                    <p className="text-[11px] text-brand-darkMuted font-bold">
                      Pagu Rencana: {formatIDR(pocket.plannedAmount)} / bulan
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEdit(pocket)}
                    className="p-1.5 rounded-lg border border-brand-border hover:border-brand-dark hover:bg-brand-cream text-brand-dark"
                    title="Edit Kantong"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(pocket.id, pocket.name)}
                    className="p-1.5 rounded-lg border border-brand-border hover:border-red-500 hover:bg-red-50 text-red-600"
                    title="Hapus Kantong"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Live Percentage Adjuster */}
              <div className="p-3 bg-brand-cream rounded-xl border border-brand-border space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-brand-dark">
                  <span>Atur Alokasi:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePercentageChange(pocket.id, pocket.allocation_percentage - 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-brand-dark font-black flex items-center justify-center hover:bg-brand-primary"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-black tabular-nums">{pocket.allocation_percentage}%</span>
                    <button
                      onClick={() => handlePercentageChange(pocket.id, pocket.allocation_percentage + 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-brand-dark font-black flex items-center justify-center hover:bg-brand-primary"
                    >
                      +
                    </button>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={pocket.allocation_percentage}
                  onChange={(e) => handlePercentageChange(pocket.id, Number(e.target.value))}
                  className="w-full accent-brand-primary cursor-pointer h-2 bg-white rounded-lg border border-brand-dark/20"
                />
              </div>

              {/* Spending progress indicator */}
              <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-brand-border">
                <span className="text-brand-darkMuted">Terpakai bulan ini:</span>
                <span className="font-black text-brand-dark tabular-nums">
                  {formatIDR(pocket.spentAmount)} ({pocket.spentPercentage}%)
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      <PocketModal
        isOpen={isPocketModalOpen}
        onClose={() => setIsPocketModalOpen(false)}
        pocketToEdit={pocketToEdit}
      />

      <BudgetRecommendationModal
        isOpen={isRecommendationOpen}
        onClose={() => setIsRecommendationOpen(false)}
      />
    </div>
  );
};
