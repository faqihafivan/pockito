import { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PocketModal } from '../components/pockets/PocketModal';
import { BudgetRecommendationModal } from '../components/pockets/BudgetRecommendationModal';
import { Pocket } from '../types';
import {
  Plus,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Star,
  Sparkles,
  Lock,
  Unlock,
} from 'lucide-react';

import { useNotification } from '../context/NotificationContext';

export const BudgetPage: React.FC = () => {
  const { user } = useAuth();
  const {
    pocketSummaries,
    overview,
    updatePocket,
    deletePocket,
    formatMoney,
  } = useData();
  const { showConfirm, showToast } = useNotification();

  const [isPocketModalOpen, setIsPocketModalOpen] = useState(false);
  const [pocketToEdit, setPocketToEdit] = useState<Pocket | null>(null);
  const [isRecommendationOpen, setIsRecommendationOpen] = useState(false);

  // Per-pocket lock system persisted in localStorage
  const [lockedPocketIds, setLockedPocketIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pockito_locked_pockets');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Global toggle lock for all sliders
  const [isGlobalLocked, setIsGlobalLocked] = useState(false);

  const isPocketLocked = (pocketId: string) => {
    return isGlobalLocked || lockedPocketIds.includes(pocketId);
  };

  const handleToggleLockPocket = (pocketId: string, pocketName: string) => {
    setLockedPocketIds((prev) => {
      const isLocked = prev.includes(pocketId);
      const updated = isLocked ? prev.filter((id) => id !== pocketId) : [...prev, pocketId];
      try {
        localStorage.setItem('pockito_locked_pockets', JSON.stringify(updated));
      } catch {
        // ignore
      }
      showToast(
        !isLocked
          ? `Kantong "${pocketName}" dikunci 🔒 (alokasi aman dari perubahan).`
          : `Kantong "${pocketName}" dibuka 🔓 (dapat diedit kembali).`,
        'info'
      );
      return updated;
    });
  };

  const monthlyIncome = user?.monthly_income || 0;

  // Auto-balance remaining percentage to reach exactly 100% (respects locked pockets)
  const handleAutoBalance = async () => {
    if (pocketSummaries.length === 0) return;
    const currentTotal = overview.totalAllocationPercentage;
    if (currentTotal === 100) return;

    const unlocked = pocketSummaries.filter((p) => !isPocketLocked(p.id));
    const locked = pocketSummaries.filter((p) => isPocketLocked(p.id));

    if (unlocked.length === 0) {
      showToast('Semua kantong sedang terkunci! Buka kunci minimal satu kantong untuk menyeimbangkan.', 'error');
      return;
    }

    const lockedSum = locked.reduce((acc, p) => acc + p.allocation_percentage, 0);
    const availablePercentage = Math.max(0, 100 - lockedSum);
    const unlockedTotal = unlocked.reduce((acc, p) => acc + p.allocation_percentage, 0);

    if (unlockedTotal === 0) {
      const share = Math.floor(availablePercentage / unlocked.length);
      const remainder = availablePercentage - share * unlocked.length;
      for (let i = 0; i < unlocked.length; i++) {
        await updatePocket(unlocked[i].id, {
          allocation_percentage: share + (i === 0 ? remainder : 0),
        });
      }
    } else {
      let allocatedSoFar = 0;
      for (let i = 0; i < unlocked.length; i++) {
        const p = unlocked[i];
        if (i === unlocked.length - 1) {
          const finalShare = Math.max(0, availablePercentage - allocatedSoFar);
          await updatePocket(p.id, { allocation_percentage: finalShare });
        } else {
          const scaled = Math.round((p.allocation_percentage / unlockedTotal) * availablePercentage);
          allocatedSoFar += scaled;
          await updatePocket(p.id, { allocation_percentage: scaled });
        }
      }
    }
    showToast('Alokasi berhasil diseimbangkan tepat 100% (kantong terkunci tetap aman)! ⚖️', 'success');
  };

  // Guard: User cannot leave BudgetPage if total allocation is not 100% (Menjawab feedback user)
  useEffect(() => {
    if (pocketSummaries.length === 0 || overview.totalAllocationPercentage === 100) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Alokasi kantong belum 100%. Yakin ingin keluar?';
      return e.returnValue;
    };

    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (target && target.href && !target.href.includes('/app/budget')) {
        e.preventDefault();
        e.stopPropagation();
        showToast(
          `⚠️ Alokasi belum seimbang (${overview.totalAllocationPercentage}% dari 100%). Mohon seimbangkan alokasi kantong hingga pas 100% sebelum meninggalkan halaman ini!`,
          'error'
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('click', handleLinkClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [pocketSummaries.length, overview.totalAllocationPercentage, showToast]);

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

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Slider Lock / Unlock Toggle Button */}
          <Button
            variant={isGlobalLocked ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => {
              const next = !isGlobalLocked;
              setIsGlobalLocked(next);
              showToast(
                next
                  ? 'Semua Slider Terkunci 🔒: Aman dari sentuhan scroll pada mobile.'
                  : 'Semua Slider Terbuka 🔓: Mode geser alokasi aktif.',
                'info'
              );
            }}
            aria-label={isGlobalLocked ? 'Buka Kunci Semua Slider' : 'Kunci Semua Slider'}
            leftIcon={isGlobalLocked ? <Lock className="w-4 h-4 text-amber-600" /> : <Unlock className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">{isGlobalLocked ? 'Buka Kunci Semua' : 'Kunci Semua Slider'}</span>
            <span className="sm:hidden">{isGlobalLocked ? 'Buka' : 'Kunci'}</span>
          </Button>

          {/* One-tap balance button if not balanced */}
          {overview.totalAllocationPercentage !== 100 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleAutoBalance}
              aria-label="Seimbangkan Alokasi ke 100%"
              leftIcon={<Sparkles className="w-4 h-4" />}
            >
              <span className="hidden sm:inline">Seimbangkan (100%)</span>
              <span className="sm:hidden">Pas 100%</span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsRecommendationOpen(true)}
            aria-label="Rekomendasi Anggaran Cerdas"
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          >
            <span className="hidden sm:inline">Rekomendasi</span>
            <span className="sm:hidden">Saran</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setPocketToEdit(null);
              setIsPocketModalOpen(true);
            }}
            aria-label="Buat Kantong Anggaran Baru"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            <span>Buat Kantong</span>
          </Button>
        </div>
      </div>

      {/* Allocation Status Alert Banner */}
      <div
        className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-4 ${
          overview.isOverallocated
            ? 'bg-red-50 dark:bg-red-950/40 border-red-500 text-red-800 dark:text-red-300'
            : overview.unallocatedPercentage > 0
            ? 'bg-brand-primary/20 dark:bg-amber-950/40 border-brand-dark dark:border-amber-500/40 text-brand-dark dark:text-amber-200'
            : 'bg-[#10B981]/20 dark:bg-emerald-950/40 border-brand-dark dark:border-emerald-600/40 text-[#047857] dark:text-emerald-300'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {overview.isOverallocated ? (
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#047857] dark:text-emerald-300 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-black truncate">
              {overview.isOverallocated
                ? `Alokasi Melebihi 100% (${overview.totalAllocationPercentage}% terpakai)! Mohon kurangi persentase kantong.`
                : overview.unallocatedPercentage > 0
                ? `Ada sisa ${overview.unallocatedPercentage}% (${formatMoney(overview.unallocatedIncome)}) yang belum dialokasikan.`
                : 'Alokasi Seimbang Sempurna (100% Gaji Terbagi)!'}
            </p>
            <p className="text-[11px] opacity-80 mt-0.5 truncate">
              Dasar perhitungan: Gaji bulanan {formatMoney(monthlyIncome)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {overview.totalAllocationPercentage !== 100 && (
            <button
              type="button"
              onClick={handleAutoBalance}
              className="hidden sm:inline-flex px-2.5 py-1 rounded-xl bg-white border border-brand-dark text-[11px] font-black hover:bg-brand-primary transition-colors cursor-pointer shadow-saweria-xs"
            >
              Pas 100%
            </button>
          )}
          <div className="text-right shrink-0">
            <span className="text-lg font-black tabular-nums text-brand-dark dark:text-emerald-300">{overview.totalAllocationPercentage}%</span>
            <span className="text-xs font-bold block">/ 100%</span>
          </div>
        </div>
      </div>

      {/* Persistent Navigation Barrier if not balanced (Menjawab feedback user: tidak bisa pergi sebelum seimbang) */}
      {overview.totalAllocationPercentage !== 100 && pocketSummaries.length > 0 && (
        <div className="p-3.5 bg-amber-500/15 border-2 border-amber-600 rounded-2xl flex items-center justify-between gap-3 text-amber-950 text-xs font-bold">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="truncate">
              🔒 Halaman terkunci: Harap seimbangkan alokasi kantong ke 100% sebelum berpindah ke halaman lain.
            </span>
          </div>
          <button
            type="button"
            onClick={handleAutoBalance}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-black text-xs rounded-xl shadow-saweria-xs transition-colors shrink-0 cursor-pointer"
          >
            Seimbangkan Otomatis
          </button>
        </div>
      )}

      {/* Detailed Pocket Control List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-brand-dark">Daftar Kantong Aktif</h3>
        </div>

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
                        aria-label={pocket.is_starred ? `Hapus ${pocket.name} dari prioritas` : `Tandai ${pocket.name} sebagai prioritas`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-brand-cream/60 transition-transform active:scale-95"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            pocket.is_starred ? 'fill-brand-primary text-brand-dark' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-[11px] text-brand-darkMuted font-bold">
                      Budget Rencana: {formatMoney(pocket.plannedAmount)} / bulan
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleEdit(pocket)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-brand-border hover:border-brand-dark hover:bg-brand-cream text-brand-dark transition-colors"
                    title="Edit Kantong"
                    aria-label={`Edit kantong ${pocket.name}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(pocket.id, pocket.name)}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-brand-border hover:border-red-500 hover:bg-red-50 text-red-600 transition-colors"
                    title="Hapus Kantong"
                    aria-label={`Hapus kantong ${pocket.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Live Percentage Adjuster with Interactive Lock Protection */}
              <div className="p-3 bg-brand-cream dark:bg-slate-800/60 rounded-xl border border-brand-border dark:border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-brand-dark dark:text-slate-100">
                  {/* Interactive Lock Button on Pocket Card */}
                  <button
                    type="button"
                    onClick={() => handleToggleLockPocket(pocket.id, pocket.name)}
                    className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-black transition-all cursor-pointer ${
                      isPocketLocked(pocket.id)
                        ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 border-amber-400 dark:border-amber-600 shadow-saweria-xs'
                        : 'bg-white/90 dark:bg-slate-700/80 text-brand-dark dark:text-slate-200 border-brand-dark/20 dark:border-slate-600 hover:border-brand-dark hover:bg-brand-primary/10'
                    }`}
                    title={
                      isPocketLocked(pocket.id)
                        ? 'Klik untuk membuka kunci alokasi kantong ini'
                        : 'Klik untuk mengunci alokasi kantong ini agar tidak sengaja bergeser'
                    }
                  >
                    {isPocketLocked(pocket.id) ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 stroke-[2.5]" />
                        <span>Terkunci 🔒</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-brand-primary stroke-[2.2]" />
                        <span>Kunci</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePercentageChange(pocket.id, pocket.allocation_percentage - 1)}
                      disabled={isPocketLocked(pocket.id)}
                      className={`w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-white dark:bg-slate-800 border border-brand-dark dark:border-slate-600 font-black flex items-center justify-center transition-transform ${
                        isPocketLocked(pocket.id)
                          ? 'opacity-30 cursor-not-allowed text-gray-400'
                          : 'hover:bg-brand-primary active:scale-95 cursor-pointer text-brand-dark dark:text-slate-100'
                      }`}
                      title={isPocketLocked(pocket.id) ? 'Buka kunci untuk mengubah' : 'Kurangi 1%'}
                      aria-label={`Kurangi 1% alokasi ${pocket.name}`}
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-black tabular-nums text-brand-dark dark:text-slate-100">
                      {pocket.allocation_percentage}%
                    </span>
                    <button
                      onClick={() => handlePercentageChange(pocket.id, pocket.allocation_percentage + 1)}
                      disabled={isPocketLocked(pocket.id)}
                      className={`w-7 h-7 sm:w-6 sm:h-6 rounded-lg bg-white dark:bg-slate-800 border border-brand-dark dark:border-slate-600 font-black flex items-center justify-center transition-transform ${
                        isPocketLocked(pocket.id)
                          ? 'opacity-30 cursor-not-allowed text-gray-400'
                          : 'hover:bg-brand-primary active:scale-95 cursor-pointer text-brand-dark dark:text-slate-100'
                      }`}
                      title={isPocketLocked(pocket.id) ? 'Buka kunci untuk mengubah' : 'Tambah 1%'}
                      aria-label={`Tambah 1% alokasi ${pocket.name}`}
                    >
                      +
                    </button>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  disabled={isPocketLocked(pocket.id)}
                  value={pocket.allocation_percentage}
                  onChange={(e) => handlePercentageChange(pocket.id, Number(e.target.value))}
                  className={`w-full accent-brand-primary h-2 bg-white dark:bg-slate-700 rounded-lg border border-brand-dark/20 dark:border-slate-600 ${
                    isPocketLocked(pocket.id) ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                />
              </div>

              {/* Spending progress indicator */}
              <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-brand-border">
                <span className="text-brand-darkMuted">Terpakai bulan ini:</span>
                <span className="font-black text-brand-dark tabular-nums">
                  {formatMoney(pocket.spentAmount)} ({pocket.spentPercentage}%)
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Mobile Sticky Quick-Allocation & Lock Floating Bar */}
      <div className="fixed bottom-16 left-0 right-0 z-30 p-2.5 px-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t-2 border-brand-dark dark:border-slate-700 shadow-saweria flex items-center justify-between sm:hidden">
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-black tabular-nums px-2 py-0.5 rounded-md border ${
              overview.totalAllocationPercentage === 100
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-400'
                : overview.isOverallocated
                ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-400'
                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-400'
            }`}
          >
            {overview.totalAllocationPercentage}% / 100%
          </span>
          <span className="text-[11px] font-bold text-brand-darkMuted truncate max-w-[110px]">
            {overview.totalAllocationPercentage === 100
              ? 'Seimbang'
              : overview.isOverallocated
              ? 'Kelebihan'
              : `Sisa ${overview.unallocatedPercentage}%`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {overview.totalAllocationPercentage !== 100 && (
            <button
              type="button"
              onClick={handleAutoBalance}
              className="px-2.5 py-1.5 bg-brand-primary text-brand-dark font-black text-xs rounded-lg border border-brand-dark shadow-saweria-xs flex items-center gap-1 active:scale-95 cursor-pointer"
              aria-label="Seimbangkan Alokasi Otomatis ke 100%"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pas 100%</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const next = !isGlobalLocked;
              setIsGlobalLocked(next);
              showToast(
                next
                  ? 'Semua Slider Terkunci 🔒: Aman dari sentuhan scroll pada mobile.'
                  : 'Semua Slider Terbuka 🔓: Mode geser alokasi aktif.',
                'info'
              );
            }}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-black flex items-center gap-1.5 transition-colors active:scale-95 cursor-pointer ${
              isGlobalLocked
                ? 'bg-amber-500 text-white border-amber-600 shadow-saweria-xs'
                : 'bg-white dark:bg-slate-800 text-brand-dark dark:text-slate-100 border-brand-dark'
            }`}
            aria-label={isGlobalLocked ? 'Buka Kunci Semua Slider' : 'Kunci Semua Slider'}
          >
            {isGlobalLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-white" />
                <span>Terkunci</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-brand-primary" />
                <span>Kunci</span>
              </>
            )}
          </button>
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
