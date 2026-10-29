import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  BUDGET_TEMPLATES,
  RecommendationTemplate,
  applyBudgetTemplate,
  TemplateApplicationMode,
} from '../../domain/finance/financialEngine';
import { Sparkles, Check, ArrowRight, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

interface BudgetRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetRecommendationModal: React.FC<BudgetRecommendationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { pockets, transactions, savePockets, saveTransactions } = useData();
  const { showToast } = useNotification();

  const [selectedTemplate, setSelectedTemplate] = useState<RecommendationTemplate>(BUDGET_TEMPLATES[1]);
  const [applyMode, setApplyMode] = useState<TemplateApplicationMode>('rebalance');
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const result = applyBudgetTemplate({
        mode: applyMode,
        template: selectedTemplate,
        currentPockets: pockets,
        currentTransactions: transactions,
        userId: user?.id,
      });

      // 1. Save updated pockets
      await savePockets(result.updatedPockets);

      // 2. If transactions were remapped, update them in state & storage
      if (result.migratedCount > 0) {
        await saveTransactions(result.updatedTransactions);
      }

      if (applyMode === 'rebalance') {
        showToast(
          `Formula ${selectedTemplate.name} berhasil diterapkan! Semua ${pockets.length} kantong & riwayat transaksimu tetap utuh.`,
          'success'
        );
      } else {
        showToast(
          `Struktur baru diterapkan! ${result.migratedCount} transaksi lama telah otomatis dialihkan ke kantong baru.`,
          'success'
        );
      }

      onClose();
    } catch (err) {
      console.error('Failed to apply template:', err);
      showToast('Gagal menerapkan rekomendasi anggaran.', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rekomendasi Alokasi Anggaran"
      subtitle="Pilih formula alokasi teruji tanpa khawatir data atau riwayat transaksimu hilang."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Step 1: Template Selector */}
        <div>
          <label className="text-xs font-black text-brand-dark uppercase tracking-wider block mb-2">
            1. Pilih Formula Alokasi:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {BUDGET_TEMPLATES.map((tpl) => {
              const isSelected = selectedTemplate.id === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-dark bg-brand-primary/15 shadow-saweria-sm'
                      : 'border-brand-border bg-white hover:border-brand-dark'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-brand-dark">{tpl.name}</h4>
                    {isSelected && <Check className="w-4 h-4 text-brand-dark stroke-[3]" />}
                  </div>
                  <p className="text-[11px] text-brand-darkMuted mt-1 leading-snug">{tpl.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Application Mode (Protection Choice) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-black text-brand-dark uppercase tracking-wider">
              2. Metode Penerapan ke Akunmu:
            </label>
            <span className="text-[11px] font-bold text-[#047857] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Anti Kerja 2 Kali</span>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {/* Option A: Rebalance (Safe & Recommended) */}
            <div
              onClick={() => setApplyMode('rebalance')}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                applyMode === 'rebalance'
                  ? 'border-brand-dark bg-emerald-50/70 shadow-saweria-sm'
                  : 'border-brand-border bg-white hover:border-brand-dark'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-xl border-2 border-brand-dark flex items-center justify-center shrink-0 ${
                    applyMode === 'rebalance' ? 'bg-[#10B981] text-white' : 'bg-brand-cream text-brand-dark'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-brand-dark">
                      Sesuaikan Persentase Saja (Aman & Disarankan ⭐)
                    </h4>
                    {applyMode === 'rebalance' && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#10B981] text-white">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-brand-darkMuted mt-0.5 leading-snug">
                    Seluruh {pockets.length} kantong buatanmu tetap utuh! Sistem hanya menyelaraskan persentase alokasi
                    agar sesuai formula 100%. Transaksi tidak diubah sama sekali.
                  </p>
                </div>
              </div>
            </div>

            {/* Option B: Fresh Structure with Auto Migration */}
            <div
              onClick={() => setApplyMode('fresh_remap')}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                applyMode === 'fresh_remap'
                  ? 'border-brand-dark bg-amber-50/70 shadow-saweria-sm'
                  : 'border-brand-border bg-white hover:border-brand-dark'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-xl border-2 border-brand-dark flex items-center justify-center shrink-0 ${
                    applyMode === 'fresh_remap' ? 'bg-[#FAAE2B] text-brand-dark' : 'bg-brand-cream text-brand-dark'
                  }`}
                >
                  <RefreshCw className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-brand-dark">
                      Ganti Struktur Baru + Migrasi Transaksi Otomatis 🔄
                    </h4>
                    {applyMode === 'fresh_remap' && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-brand-dark text-white">
                        Aktif
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-brand-darkMuted mt-0.5 leading-snug">
                    Mengganti daftar kantong murni mengikuti template ({selectedTemplate.pockets.length} pos). Transaksi
                    lamamu otomatis dipindahkan ke kantong baru yang cocok agar riwayat arus kas tidak hilang.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Preview Box */}
        <div className="bg-brand-cream rounded-2xl border-2 border-brand-dark p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black text-brand-dark uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span>
                {applyMode === 'rebalance'
                  ? `Pratinjau Target Alokasi (${selectedTemplate.name}):`
                  : `Daftar Kantong Baru yang Akan Dibuat:`}
              </span>
            </div>
            <span className="text-[11px] font-black text-brand-dark">Total: 100%</span>
          </div>

          <div className="space-y-2">
            {selectedTemplate.pockets.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-brand-border"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-xs font-bold text-brand-dark">{p.name}</span>
                  {p.is_starred && <span className="text-xs">⭐</span>}
                </div>
                <span className="text-xs font-black text-brand-dark">{p.allocation_percentage}%</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/80 border border-brand-border text-[11px] font-bold text-brand-dark">
            <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {applyMode === 'rebalance'
                ? `Jaminan Aman: Tidak ada kantong yang dihapus. Persentase ${pockets.length} kantongmu akan disesuaikan otomatis.`
                : `Jaminan Aman: Seluruh transaksi lamamu (${transactions.length} transaksi) akan otomatis dipetakan ke kantong baru di atas.`}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isApplying}>
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleApply}
            isLoading={isApplying}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {applyMode === 'rebalance' ? 'Terapkan Persentase Aman' : 'Terapkan & Migrasi Data'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
