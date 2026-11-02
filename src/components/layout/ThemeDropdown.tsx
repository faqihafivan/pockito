import React, { useState, useRef, useEffect } from 'react';
import { Palette, Moon, Sun, Check, Sparkles } from 'lucide-react';
import { useTheme, ThemeMode } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';

interface ThemeOption {
  id: ThemeMode;
  name: string;
  tag: string;
  description: string;
  icon: React.ReactNode;
  swatches: {
    primary: string;
    bg: string;
    border: string;
  };
}

export const ThemeDropdown: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { showToast } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themeOptions: ThemeOption[] = [
    {
      id: 'teal-mint',
      name: 'Teal Mint',
      tag: 'Segar & Bersih',
      description: 'Nuansa hijau mint modern yang sejuk, cerah, dan menenangkan mata.',
      icon: <Palette className="w-4 h-4 text-[#379A8D]" />,
      swatches: {
        primary: '#379A8D',
        bg: '#F3FAF8',
        border: '#132F2B',
      },
    },
    {
      id: 'saweria',
      name: 'Saweria Emas',
      tag: 'Klasik Hangat',
      description: 'Gaya klasik Saweria kuning emas neobrutalisme & krem ramah.',
      icon: <Sun className="w-4 h-4 text-[#FAAE2B]" />,
      swatches: {
        primary: '#FAAE2B',
        bg: '#FFFDF8',
        border: '#18181B',
      },
    },
    {
      id: 'midnight',
      name: 'Midnight Dark',
      tag: 'Mode Gelap',
      description: 'Slate pekat gelap dengan kontras neon cyan tajam, nyaman di malam hari.',
      icon: <Moon className="w-4 h-4 text-[#2DD4BF]" />,
      swatches: {
        primary: '#2DD4BF',
        bg: '#0B132B',
        border: '#475569',
      },
    },
  ];

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelectTheme = (selectedId: ThemeMode, themeName: string) => {
    if (selectedId !== theme) {
      setTheme(selectedId);
      showToast(`Tema aktif: ${themeName} ✨`, 'info');
    }
    setIsOpen(false);
  };

  const currentThemeConfig = themeOptions.find((t) => t.id === theme) || themeOptions[0];

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 sm:p-2 rounded-xl border-2 border-brand-dark dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-brand-cream dark:hover:bg-slate-700 shadow-saweria-sm active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center justify-center shrink-0 text-brand-dark dark:text-slate-100 cursor-pointer"
        title={`Tema Aktif: ${currentThemeConfig.name} (${currentThemeConfig.tag}). Klik untuk memilih tema.`}
        aria-label="Pilih Tema Tampilan"
        aria-expanded={isOpen}
      >
        {theme === 'midnight' ? (
          <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-sky-400 stroke-[2.2]" />
        ) : theme === 'teal-mint' ? (
          <Palette className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#379A8D] stroke-[2.2]" />
        ) : (
          <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-500 stroke-[2.2]" />
        )}
      </button>

      {/* Theme Selection Popover Menu */}
      {isOpen && (
        <div className="fixed sm:absolute right-3 sm:right-0 top-16 sm:top-full mt-2 w-[calc(100vw-24px)] max-w-xs sm:w-80 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border-2 border-brand-dark dark:border-slate-700 shadow-saweria-lg p-3 sm:p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b-2 border-brand-border dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-primary/20 dark:bg-brand-primary/10 border border-brand-dark dark:border-slate-700 flex items-center justify-center text-brand-primary">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-black text-brand-dark dark:text-slate-100 tracking-tight leading-none">
                  Pilih Tema Tampilan
                </h3>
                <p className="text-[10px] font-bold text-brand-darkMuted dark:text-slate-400 mt-0.5">
                  Sesuaikan warna demi kenyamanan mata
                </p>
              </div>
            </div>
          </div>

          {/* Theme Option Cards */}
          <div className="space-y-2">
            {themeOptions.map((opt) => {
              const isSelected = opt.id === theme;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectTheme(opt.id, opt.name)}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-brand-cream/90 dark:bg-slate-800 border-brand-dark dark:border-brand-primary shadow-saweria-sm scale-[1.01]'
                      : 'bg-white dark:bg-slate-900/60 border-brand-border/80 dark:border-slate-800 hover:border-brand-dark dark:hover:border-slate-700 hover:bg-brand-cream/40 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Swatches Visual Indicator */}
                  <div className="shrink-0 flex flex-col items-center gap-1.5 pt-0.5">
                    <div
                      className="w-8 h-8 rounded-xl border-2 border-brand-dark dark:border-slate-700 flex items-center justify-center shadow-saweria-xs"
                      style={{ backgroundColor: opt.swatches.bg }}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-black/20"
                        style={{ backgroundColor: opt.swatches.primary }}
                      />
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-xs sm:text-sm font-black text-brand-dark dark:text-slate-100 truncate">
                          {opt.name}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border ${
                            isSelected
                              ? 'bg-brand-primary text-brand-dark border-brand-dark dark:border-slate-700'
                              : 'bg-brand-cream dark:bg-slate-800 text-brand-darkMuted dark:text-slate-400 border-brand-border dark:border-slate-700'
                          }`}
                        >
                          {opt.tag}
                        </span>
                      </div>

                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-brand-primary text-brand-dark border border-brand-dark flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <p className="text-[10.5px] leading-snug font-medium text-brand-darkMuted dark:text-slate-400">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
