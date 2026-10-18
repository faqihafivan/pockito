import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { Pocket } from '../../types';
import { formatIDR } from '../../domain/finance/financialEngine';
import { Star, Lock, Check } from 'lucide-react';
import {
  POCKET_ICONS,
  PRESET_COLORS,
  getPocketIcon,
  isColorLight,
} from '../../domain/finance/pocketIcons';

interface PocketModalProps {
  isOpen: boolean;
  onClose: () => void;
  pocketToEdit?: Pocket | null;
}

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

  // Map of colors already used by OTHER pockets
  const usedColorsMap = useMemo(() => {
    const map = new Map<string, string>();
    pockets.forEach((p) => {
      // If editing existing pocket, don't lock its own color
      if (pocketToEdit && p.id === pocketToEdit.id) return;
      map.set(p.color.toLowerCase(), p.name);
    });
    return map;
  }, [pockets, pocketToEdit]);

  // Synchronize form fields whenever modal opens or pocketToEdit changes
  useEffect(() => {
    if (isOpen) {
      if (pocketToEdit) {
        setName(pocketToEdit.name);
        setIcon(pocketToEdit.icon);
        setColor(pocketToEdit.color);
        setPercentage(Number(pocketToEdit.allocation_percentage));
        setIsStarred(Boolean(pocketToEdit.is_starred));
      } else {
        setName('');
        setIcon('Utensils');
        const available = PRESET_COLORS.find(
          (c) => !usedColorsMap.has(c.hex.toLowerCase())
        )?.hex || '#FF7A59';
        setColor(available);
        setPercentage(10);
        setIsStarred(false);
      }
      setError('');
    }
  }, [isOpen, pocketToEdit, usedColorsMap]);

  const isCurrentColorTaken = usedColorsMap.has(color.toLowerCase());
  const takenByPocketName = usedColorsMap.get(color.toLowerCase());

  const monthlyIncome = user?.monthly_income || 0;
  const estimatedNominal = Math.round((monthlyIncome * percentage) / 100);

  const CurrentIcon = getPocketIcon(icon);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama kantong wajib diisi');
      return;
    }
    if (isCurrentColorTaken) {
      setError(`Warna ini sudah dipakai oleh kantong "${takenByPocketName}". Silakan pilih warna lain agar setiap kantong unik.`);
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
      subtitle="Sesuaikan nama, ikon unik, warna bebas tanpa duplikasi, dan alokasi gaji"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Live Preview Card */}
        <div className="flex items-center gap-3.5 p-3.5 bg-brand-cream/80 rounded-2xl border-2 border-brand-dark">
          <div
            className="w-12 h-12 rounded-xl border-2 border-brand-dark flex items-center justify-center shadow-saweria-sm shrink-0 transition-colors"
            style={{ backgroundColor: color }}
          >
            <CurrentIcon className="w-6 h-6 stroke-[2.2] text-brand-dark" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-brand-darkMuted uppercase tracking-wider block">
              Pratinjau Kantong
            </span>
            <h4 className="text-sm font-black text-brand-dark truncate">
              {name.trim() || 'Nama Kantong Baru'}
            </h4>
            <span className="text-[11px] font-bold text-brand-darkMuted">
              Alokasi: {percentage}% ({formatIDR(estimatedNominal)})
            </span>
          </div>
        </div>

        <Input
          label="Nama Kantong"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          placeholder="Contoh: Makan Harian, Kos & Listrik, Ngopi"
          required
        />

        {/* Color Palette Picker with Unique Color Constraint */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider">
              Pilih Warna Aksen (Bebas & Unik)
            </label>
            <span className="text-[10px] font-bold text-brand-darkMuted">
              {usedColorsMap.size} warna telah terpakai
            </span>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {PRESET_COLORS.map((c) => {
              const isUsed = usedColorsMap.has(c.hex.toLowerCase());
              const usedBy = usedColorsMap.get(c.hex.toLowerCase());
              const isSelected = color.toLowerCase() === c.hex.toLowerCase();
              const light = isColorLight(c.hex);

              return (
                <button
                  key={c.hex}
                  type="button"
                  disabled={isUsed}
                  onClick={() => {
                    setColor(c.hex);
                    if (error) setError('');
                  }}
                  className={`relative w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${
                    isUsed
                      ? 'border-gray-400 opacity-30 cursor-not-allowed scale-95'
                      : isSelected
                      ? 'border-brand-dark scale-110 shadow-saweria-sm ring-2 ring-brand-primary'
                      : 'border-transparent hover:scale-105 hover:border-brand-dark'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={
                    isUsed
                      ? `Terkunci: Sudah dipakai oleh kantong "${usedBy}"`
                      : c.name
                  }
                >
                  {isUsed ? (
                    <Lock className="w-3.5 h-3.5 text-brand-dark" />
                  ) : isSelected ? (
                    <Check
                      className="w-4 h-4 stroke-[3]"
                      style={{ color: light ? '#18181B' : '#FFFFFF' }}
                    />
                  ) : null}
                </button>
              );
            })}

            {/* Custom Color Input */}
            <div className="relative inline-flex items-center gap-1.5 pl-2 border-l border-brand-border">
              <label
                htmlFor="custom-color-picker"
                className="w-8 h-8 rounded-xl border-2 border-brand-dark cursor-pointer flex items-center justify-center bg-white shadow-saweria-sm hover:scale-105 transition-transform"
                title="Pilih warna kustom sendiri"
                style={{ backgroundColor: color }}
              >
                <input
                  id="custom-color-picker"
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    if (error) setError('');
                  }}
                  className="opacity-0 w-0 h-0 absolute pointer-events-none"
                />
              </label>
              <span className="text-[10px] font-bold text-brand-dark uppercase">
                {color}
              </span>
            </div>
          </div>

          {isCurrentColorTaken && (
            <p className="text-[11px] font-bold text-red-600 mt-1.5 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Warna ini sudah digunakan oleh kantong &quot;{takenByPocketName}&quot;. Silakan pilih warna yang belum dipakai.
            </p>
          )}
        </div>

        {/* Icon Picker with Visual Icon Grid */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider">
              Pilih Ikon Kantong ({POCKET_ICONS.length} Ikon Unik)
            </label>
            <span className="text-[10px] font-bold text-brand-primary font-black">
              Ikon Aktif: {POCKET_ICONS.find((i) => i.id === icon)?.label || icon}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-2 bg-brand-cream/40 rounded-2xl border border-brand-border">
            {POCKET_ICONS.map((item) => {
              const IconComp = item.icon;
              const isSelected = icon === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIcon(item.id)}
                  title={item.label}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'bg-brand-primary border-brand-dark shadow-saweria-sm scale-105'
                      : 'bg-white border-brand-border text-brand-darkMuted hover:border-brand-dark hover:bg-white'
                  }`}
                >
                  <IconComp className="w-6 h-6 stroke-[2.2] text-brand-dark shrink-0" />
                  <span className="text-[9px] font-bold text-brand-dark truncate max-w-full mt-1">
                    {item.label}
                  </span>
                </button>
              );
            })}
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
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={isCurrentColorTaken}
          >
            {pocketToEdit ? 'Simpan Perubahan' : 'Buat Kantong'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
