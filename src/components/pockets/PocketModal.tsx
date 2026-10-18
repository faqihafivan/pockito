import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Pocket } from '../../types';
import { formatIDR } from '../../domain/finance/financialEngine';
import { Star } from 'lucide-react';

interface PocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  pocketToEdit?: Pocket | null;
}

const AVAILABLE_COLORS = [
  { hex: '#FF7A59', name: 'Coral / Makanan' },
  { hex: '#713B3B', name: 'Burgundy / Tagihan' },
  { hex: '#10B981', name: 'Mint / Tabungan' },
  { hex: '#8B5CF6', name: 'Lavender / Keinginan' },
  { hex: '#0EA5E9', name: 'Cyan / Transport' },
  { hex: '#FAAE2B', name: 'Saweria Amber / Prioritas' },
  { hex: '#EC4899', name: 'Pink / Belanja' },
  { hex: '#18181B', name: 'Charcoal / Investasi' },
];

const AVAILABLE_ICONS = [
  'Utensils',
  'Home',
  'ShieldCheck',
  'Car',
  'Coffee',
  'Smile',
  'PiggyBank',
  'ShoppingBag',
  'BookOpen',
  'Smartphone',
  'HeartPulse',
  'Film',
];

export const PocketModal: React.FC<PocketModalProps> = ({
  isOpen,
  onClose,
  pocketToEdit,
}) => {
  const { user } = useAuth();
  const { pockets, addPocket, updatePocket } = useData();

  const [name, setName] = useState(pocketToEdit?.name || '');
  const [icon, setIcon] = useState(pocketToEdit?.icon || 'Utensils');
  const [color, setColor] = useState(pocketToEdit?.color || '#FF7A59');
  const [percentage, setPercentage] = useState<number>(
    pocketToEdit ? Number(pocketToEdit.allocation_percentage) : 10
  );
  const [isStarred, setIsStarred] = useState(pocketToEdit?.is_starred || false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const monthlyIncome = user?.monthly_income || 0;
  const estimatedNominal = Math.round((monthlyIncome * percentage) / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama kantong wajib diisi');
      return;
    }
    if (percentage <= 0 || percentage > 100) {
      setError('Persentase alokasi harus antara 1% - 100%');
      return;
    }

    setIsSubmitting(true);
    try {
      if (pocketToEdit) {
        await updatePocket(pocketToEdit.id, {
          name: name.trim(),
          icon,
          color,
          allocation_percentage: percentage,
          is_starred: isStarred,
        });
      } else {
        await addPocket({
          user_id: user?.id || 'user-demo-1',
          name: name.trim(),
          icon,
          color,
          allocation_percentage: percentage,
          is_starred: isStarred,
          sort_order: pockets.length + 1,
        });
      }
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Gagal menyimpan kantong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={pocketToEdit ? 'Edit Kantong (Pocket)' : 'Buat Kantong Baru'}
      subtitle="Tentukan nama, warna ceria, dan porsi alokasi bulanan"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Kantong"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Makan Harian, Kos, Ngopi"
          required
        />

        {/* Color Palette Picker */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
            Warna Aksen Kantong
          </label>
          <div className="flex flex-wrap gap-2.5">
            {AVAILABLE_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setColor(c.hex)}
                className={`w-8 h-8 rounded-xl border-2 transition-transform ${
                  color === c.hex
                    ? 'border-brand-dark scale-110 shadow-saweria-sm'
                    : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        {/* Icon Picker */}
        <div>
          <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
            Pilih Ikon Kantong
          </label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`px-2.5 py-1.5 rounded-xl border-2 text-xs font-bold transition-all ${
                  icon === ic
                    ? 'bg-brand-primary border-brand-dark shadow-saweria-sm text-brand-dark'
                    : 'bg-white border-brand-border text-brand-darkMuted hover:border-brand-dark'
                }`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>

        {/* Allocation Percentage Slider & Live Nominal */}
        <div className="bg-brand-cream p-4 rounded-2xl border-2 border-brand-dark space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-dark uppercase tracking-wider">
              Persentase Alokasi
            </span>
            <span className="text-base font-black text-brand-dark">
              {percentage}%
            </span>
          </div>

          <input
            type="range"
            min="1"
            max="100"
            step="1"
            value={percentage}
            onChange={(e) => setPercentage(Number(e.target.value))}
            className="w-full accent-brand-primary cursor-pointer h-2 bg-white rounded-lg border border-brand-dark/20"
          />

          <div className="flex items-center justify-between pt-1 border-t border-brand-border text-xs">
            <span className="text-brand-darkMuted font-bold">Estimasi Nominal / Bulan:</span>
            <span className="font-black text-brand-dark tabular-nums">
              {formatIDR(estimatedNominal)}
            </span>
          </div>
        </div>

        {/* Star Priority Toggle */}
        <label className="flex items-center gap-3 p-3 rounded-xl bg-white border-2 border-brand-border hover:border-brand-dark cursor-pointer select-none transition-all">
          <input
            type="checkbox"
            checked={isStarred}
            onChange={(e) => setIsStarred(e.target.checked)}
            className="w-4 h-4 rounded text-brand-primary accent-brand-primary cursor-pointer"
          />
          <div className="flex items-center gap-2">
            <Star className={`w-4 h-4 ${isStarred ? 'fill-brand-primary text-brand-dark' : 'text-gray-400'}`} />
            <div>
              <p className="text-xs font-black text-brand-dark">Tandai sebagai Kantong Prioritas ⭐</p>
              <p className="text-[11px] text-brand-darkMuted">
                Diutamakan dan dilindungi saat ada rekomendasi penghematan
              </p>
            </div>
          </div>
        </label>

        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-500 rounded-xl text-xs font-bold text-red-600">
            {error}
          </div>
        )}

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {pocketToEdit ? 'Simpan Perubahan' : 'Buat Kantong'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
