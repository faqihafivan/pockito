import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  WifiOff,
  X,
} from 'lucide-react';

export type DialogType = 'info' | 'success' | 'warning' | 'danger';

export interface AlertOptions {
  title?: string;
  message: string;
  type?: DialogType;
  buttonText?: string;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export interface PromptOptions {
  title?: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface NotificationContextType {
  showAlert: (options: AlertOptions | string) => Promise<void>;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
  showPrompt: (options: PromptOptions) => Promise<string | null>;
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  isOnline: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Modal Dialog State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    mode: 'alert' | 'confirm' | 'prompt';
    title: string;
    message: string;
    type: DialogType;
    confirmText: string;
    cancelText: string;
    isDanger: boolean;
    promptValue: string;
    promptPlaceholder: string;
  }>({
    isOpen: false,
    mode: 'alert',
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Mengerti',
    cancelText: 'Batal',
    isDanger: false,
    promptValue: '',
    promptPlaceholder: '',
  });

  // Resolver references for Promises
  const alertResolver = useRef<(() => void) | null>(null);
  const confirmResolver = useRef<((value: boolean) => void) | null>(null);
  const promptResolver = useRef<((value: string | null) => void) | null>(null);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Network Offline / Online State & Listeners
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
      return navigator.onLine;
    }
    return true;
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Koneksi internet terhubung kembali!', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast('Koneksi terputus. Mode offline aktif.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 1. Show Alert (Replacement for window.alert)
  const showAlert = (options: AlertOptions | string): Promise<void> => {
    return new Promise((resolve) => {
      alertResolver.current = resolve;
      const opts = typeof options === 'string' ? { message: options } : options;
      setDialogState({
        isOpen: true,
        mode: 'alert',
        title: opts.title || 'Informasi Pockito',
        message: opts.message,
        type: opts.type || 'info',
        confirmText: opts.buttonText || 'Siap, Mengerti',
        cancelText: '',
        isDanger: opts.type === 'danger',
        promptValue: '',
        promptPlaceholder: '',
      });
    });
  };

  // 2. Show Confirm (Replacement for window.confirm)
  const showConfirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmResolver.current = resolve;
      setDialogState({
        isOpen: true,
        mode: 'confirm',
        title: options.title || 'Konfirmasi Aksi',
        message: options.message,
        type: options.isDanger ? 'danger' : 'info',
        confirmText: options.confirmText || (options.isDanger ? 'Ya, Hapus' : 'Ya, Lanjutkan'),
        cancelText: options.cancelText || 'Batal',
        isDanger: Boolean(options.isDanger),
        promptValue: '',
        promptPlaceholder: '',
      });
    });
  };

  // 3. Show Prompt (Replacement for window.prompt)
  const showPrompt = (options: PromptOptions): Promise<string | null> => {
    return new Promise((resolve) => {
      promptResolver.current = resolve;
      setDialogState({
        isOpen: true,
        mode: 'prompt',
        title: options.title || 'Masukkan Data',
        message: options.message,
        type: 'info',
        confirmText: options.confirmText || 'Simpan',
        cancelText: options.cancelText || 'Batal',
        isDanger: false,
        promptValue: options.defaultValue || '',
        promptPlaceholder: options.placeholder || '',
      });
    });
  };

  // 4. Show Toast
  const showToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleCloseDialog = (confirmed: boolean) => {
    if (dialogState.mode === 'alert') {
      if (alertResolver.current) alertResolver.current();
    } else if (dialogState.mode === 'confirm') {
      if (confirmResolver.current) confirmResolver.current(confirmed);
    } else if (dialogState.mode === 'prompt') {
      if (promptResolver.current) promptResolver.current(confirmed ? dialogState.promptValue : null);
    }

    setDialogState((prev) => ({ ...prev, isOpen: false }));
    alertResolver.current = null;
    confirmResolver.current = null;
    promptResolver.current = null;
  };

  const getHeaderIcon = () => {
    if (dialogState.isDanger || dialogState.type === 'danger') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-red-100 border-2 border-brand-dark flex items-center justify-center text-red-600 shadow-saweria-sm shrink-0">
          <AlertTriangle className="w-6 h-6 stroke-[2.3]" />
        </div>
      );
    }
    if (dialogState.type === 'success') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-[#C9D9C5] border-2 border-brand-dark flex items-center justify-center text-[#047857] shadow-saweria-sm shrink-0">
          <CheckCircle2 className="w-6 h-6 stroke-[2.3]" />
        </div>
      );
    }
    if (dialogState.type === 'warning') {
      return (
        <div className="w-12 h-12 rounded-2xl bg-brand-primary/30 border-2 border-brand-dark flex items-center justify-center text-brand-dark shadow-saweria-sm shrink-0">
          <AlertTriangle className="w-6 h-6 stroke-[2.3]" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-2xl bg-white border-2 border-brand-dark flex items-center justify-center p-1.5 shadow-saweria-sm shrink-0">
        <img src="/pockito.png" alt="Pockito" className="w-full h-full object-contain" />
      </div>
    );
  };

  return (
    <NotificationContext.Provider
      value={{
        showAlert,
        showConfirm,
        showPrompt,
        showToast,
        isOnline,
      }}
    >
      {children}

      {/* ================= POCKITO DIALOG MODAL ================= */}
      {dialogState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 selection:bg-brand-primary">
          {/* Backdrop with Blur */}
          <div
            className="fixed inset-0 bg-brand-dark/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-150"
            onClick={() => handleCloseDialog(false)}
          />

          {/* Dialog Container */}
          <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl border-2 border-brand-dark shadow-saweria-lg z-10 overflow-hidden transform animate-in fade-in zoom-in-95 duration-150">
            {/* Top decorative stripe */}
            <div
              className={`h-2.5 w-full border-b-2 border-brand-dark ${
                dialogState.isDanger ? 'bg-red-500' : 'bg-brand-primary'
              }`}
            />

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3.5">
                {getHeaderIcon()}
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-brand-dark tracking-tight leading-snug">
                    {dialogState.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-darkMuted font-medium leading-relaxed whitespace-pre-line">
                    {dialogState.message}
                  </p>
                </div>
              </div>

              {/* Prompt Input Field */}
              {dialogState.mode === 'prompt' && (
                <div className="pt-1">
                  <Input
                    label="Input Nominal / Teks"
                    value={dialogState.promptValue}
                    onChange={(e) =>
                      setDialogState((prev) => ({ ...prev, promptValue: e.target.value }))
                    }
                    placeholder={dialogState.promptPlaceholder}
                    autoFocus
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                {dialogState.mode !== 'alert' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCloseDialog(false)}
                  >
                    {dialogState.cancelText}
                  </Button>
                )}

                <Button
                  variant={dialogState.isDanger ? 'danger' : 'primary'}
                  size="sm"
                  onClick={() => handleCloseDialog(true)}
                >
                  {dialogState.confirmText}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= OFFLINE STATUS BANNER ================= */}
      {!isOnline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-0 inset-x-0 z-[60] bg-amber-400 border-b-2 border-brand-dark px-4 py-1.5 text-center text-xs font-black text-brand-dark shadow-saweria flex items-center justify-center gap-2"
        >
          <WifiOff className="w-4 h-4 shrink-0 stroke-[2.5]" />
          <span>Mode Offline Aktif — Periksa koneksi internet Anda. Data lokal tetap tersimpan aman.</span>
        </div>
      )}

      {/* ================= FLOATING TOAST NOTIFICATIONS ================= */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2.5 pointer-events-none max-w-xs sm:max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-2xl border-2 border-brand-dark shadow-saweria bg-white animate-in slide-in-from-top-3 duration-200 ${
              toast.type === 'success'
                ? 'border-l-8 border-l-[#10B981]'
                : toast.type === 'error'
                ? 'border-l-8 border-l-red-500'
                : toast.type === 'warning'
                ? 'border-l-8 border-l-brand-primary'
                : 'border-l-8 border-l-brand-primary'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />}
              {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-brand-dark shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-brand-dark shrink-0" />}
              <span className="text-xs font-black text-brand-dark leading-tight">{toast.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-brand-darkMuted hover:text-brand-dark p-1 rounded-lg"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
