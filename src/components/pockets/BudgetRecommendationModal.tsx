import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { BUDGET_TEMPLATES, RecommendationTemplate } from '../../domain/finance/financialEngine';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

interface BudgetRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BudgetRecommendationModal: React.FC<BudgetRecommendationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { savePockets } = useData();

  const [selectedTemplate, setSelectedTemplate] = useState<RecommendationTemplate>(BUDGET_TEMPLATES[1]);
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      // Build new pockets from template
      const newPockets = selectedTemplate.pockets.map((p, index) => ({
        id: 'pocket-tpl-' + index + '-' + Math.random().toString(36).substring(2, 6),
        user_id: user?.id || 'user-demo-1',
        name: p.name,
        icon: p.icon,
        color: p.color,
        allocation_percentage: p.allocation_percentage,
        is_starred: p.is_starred,
        sort_order: index + 1,
      }));

      await savePockets(newPockets);
      onClose();
    } catch (err) {
      console.error('Failed to apply template:', err);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rekomendasi Alokasi Anggaran"
      subtitle="Pilih formula alokasi teruji. Perubahan hanya berlaku jika Anda menyetujui."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Template Selector Pills */}
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

        {/* Preview Diff Box */}
        <div className="bg-brand-cream rounded-2xl border-2 border-brand-dark p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-black text-brand-dark uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <span>Pratinjau Kantong yang Akan Diterapkan:</span>
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

          <p className="text-[11px] text-brand-darkMuted leading-tight pt-1">
            *Catatan: Menerapkan rekomendasi ini akan memperbarui daftar kantong Anda menjadi template di atas. Transaksi yang sudah tercatat sebelumnya tetap aman.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleApply}
            isLoading={isApplying}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Terapkan Template
          </Button>
        </div>
      </div>
    </Modal>
  );
};
