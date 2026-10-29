import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CurrencyInput } from '../components/ui/CurrencyInput';
import {
  User,
  RefreshCw,
  LogOut,
  Save,
  CheckCircle2,
  Database,
  Shield,
  Trash2,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Key,
  Download,
  Upload,
  FolderArchive,
} from 'lucide-react';
import { formatIDR } from '../domain/finance/financialEngine';
import { AIScannerService } from '../services/aiScannerService';
import { useNotification } from '../context/NotificationContext';
import { PWAInstallButton } from '../components/common/PWAInstallButton';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, isCloudMode, logout } = useAuth();
  const {
    resetToDefaults,
    clearTransactionsAndResetBalance,
    deleteAllUserData,
    exportBackup,
    importBackup,
  } = useData();
  const { showConfirm, showPrompt, showToast } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [income, setIncome] = useState<number>(user?.monthly_income || 0);
  const [geminiKey, setGeminiKey] = useState<string>(() => AIScannerService.getApiKey());
  const [isSaved, setIsSaved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownloadBackup = () => {
    try {
      const jsonStr = exportBackup();
      const dateStr = new Date().toISOString().split('T')[0];
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pockito_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('File cadangan data (JSON) berhasil diunduh!', 'success');
    } catch {
      showToast('Gagal mengunduh file cadangan.', 'error');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      if (content) {
        const confirmed = await showConfirm({
          title: 'Pulihkan Data?',
          message:
            'Memulihkan data akan menggantikan data aktif saat ini dengan data dari file cadangan. Lanjutkan?',
          confirmText: 'Ya, Pulihkan',
        });
        if (confirmed) {
          const res = await importBackup(content);
          if (res.success) {
            showToast(res.message, 'success');
          } else {
            showToast(res.message, 'error');
          }
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveGeminiKey = (e: React.FormEvent) => {
    e.preventDefault();
    AIScannerService.setApiKey(geminiKey);
    showToast('Pengaturan Kunci API Gemini berhasil disimpan!', 'success');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser({
      full_name: fullName.trim(),
      email: email.trim(),
      monthly_income: income,
    });
    setIsSaved(true);
    showToast('Profil dan gaji pokok berhasil disimpan!', 'success');
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetData = async () => {
    const confirmed = await showConfirm({
      title: 'Reset Data Simulasi?',
      message: 'Apakah Anda yakin ingin mereset seluruh data kembali ke pengaturan simulasi bawaan awal?',
      confirmText: 'Ya, Reset Data',
      isDanger: true,
    });
    if (confirmed) {
      setIsResetting(true);
      await resetToDefaults();
      setIsResetting(false);
      showToast('Data berhasil direset ke kondisi awal.', 'success');
    }
  };

  const handleClearTransactions = async () => {
    const targetAmount = income > 0 ? income : 0;
    const confirmed = await showConfirm({
      title: 'Setel Saldo Awal Bersih?',
      message: `Bersihkan transaksi simulasi lama dan setel Saldo Riil menjadi ${formatIDR(targetAmount)} sesuai gaji pokok?\n(Kantong anggaran dan profil akunmu tetap tersimpan aman).`,
      confirmText: `Setel ${formatIDR(targetAmount)}`,
    });
    if (confirmed) {
      setIsResetting(true);
      await clearTransactionsAndResetBalance();
      setIsResetting(false);
      showToast(`Berhasil! Saldo riil akunmu sekarang ${formatIDR(targetAmount)}.`, 'success');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = await showPrompt({
      title: 'Hapus Akun Permanen',
      message: 'PERINGATAN: Seluruh transaksi, kantong, rekening, dan data profil Anda akan DIHAPUS TOTAL dan tidak dapat dikembalikan.\n\nKetik "HAPUS" untuk mengonfirmasi:',
      placeholder: 'Ketik HAPUS',
      confirmText: 'Hapus Sekarang',
    });
    if (confirmation === 'HAPUS') {
      setIsDeleting(true);
      await deleteAllUserData();
      logout();
      setIsDeleting(false);
      showToast('Akun dan seluruh data Anda telah berhasil dihapus.', 'info');
      navigate('/');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border-2 border-brand-dark shadow-saweria">
        <h2 className="text-2xl font-black text-brand-dark tracking-tight">
          Pengaturan Akun & Preferensi
        </h2>
        <p className="text-xs sm:text-sm font-bold text-brand-darkMuted mt-1">
          Sesuaikan profil diri, estimasi gaji pokok, dan mode penyimpanan data.
        </p>
      </div>

      {/* Cloud Status Card */}
      <Card variant="saweria" className="bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border-2 border-brand-dark flex items-center justify-center ${
                isCloudMode ? 'bg-[#10B981]/20 text-[#047857]' : 'bg-brand-primary/20 text-brand-dark'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-brand-dark">
                Status Penyimpanan: {isCloudMode ? 'Supabase Cloud PostgreSQL' : 'Local Storage Mock Mode'}
              </h4>
              <p className="text-xs text-brand-darkMuted mt-0.5">
                {isCloudMode
                  ? 'Data Anda disinkronkan secara aman ke database cloud Supabase dengan Row Level Security.'
                  : 'Aplikasi berjalan dalam mode simulasi lokal mandiri tanpa memerlukan setup API key.'}
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-black uppercase border border-brand-dark ${
              isCloudMode ? 'bg-green-100 text-green-800' : 'bg-brand-primary/30 text-brand-dark'
            }`}
          >
            {isCloudMode ? 'Cloud Aktif' : 'Mode Offline / Demo'}
          </span>
        </div>
      </Card>

      {/* Profile & Income Form */}
      <Card variant="saweria" className="bg-white space-y-5">
        <div className="pb-3 border-b-2 border-brand-border flex items-center justify-between">
          <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-brand-primary" />
            <span>Profil Pengguna & Pemasukan Pokok</span>
          </h3>
          {isSaved && (
            <span className="flex items-center gap-1 text-xs font-black text-[#047857]">
              <CheckCircle2 className="w-4 h-4" /> Berhasil Disimpan
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Lengkap"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input
              label="Alamat Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <CurrencyInput
              label="Gaji Bulanan Pokok (IDR)"
              value={income}
              onValueChange={setIncome}
              helperText="Mengubah angka ini akan secara otomatis memperbarui nilai nominal semua kantong anggaranmu."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Mata Uang Utama"
              value="IDR (Indonesian Rupiah)"
              disabled
              helperText="Standar integer tanpa desimal"
            />
            <Input
              label="Zona Waktu"
              value="Asia/Jakarta (WIB)"
              disabled
              helperText="Standar waktu pelaporan dan reminder"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Card>

      {/* AI Receipt Scanner Configuration */}
      <Card variant="saweria" className="bg-white space-y-4">
        <div className="pb-3 border-b-2 border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider">
              AI Receipt Scanner (Google Gemini)
            </h3>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
              AIScannerService.hasApiKey()
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-900 border-amber-300'
            }`}
          >
            {AIScannerService.hasApiKey() ? 'API Key Terpasang ✨' : 'Mode Demo / Belum Diatur'}
          </span>
        </div>

        <p className="text-xs font-bold text-brand-darkMuted leading-relaxed">
          Fitur Scan Struk Pockito menggunakan model <b>Gemini 1.5 Flash</b> untuk membaca total nominal, nama toko, tanggal, dan item belanja dari foto struk atau screenshot QRIS secara otomatis.
        </p>

        <form onSubmit={handleSaveGeminiKey} className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-black text-brand-dark uppercase tracking-wider">
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 underline"
              >
                <span>Dapatkan API Key Gratis</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="Masukkan AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-brand-dark bg-white font-mono text-xs text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/40 shadow-saweria-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-brand-darkMuted font-medium">
              💡 Tanpa API Key, kamu tetap dapat menguji fitur ini menggunakan <b>Contoh Struk</b> bawaan dan <b>Catatan Cepat via Teks</b>.
            </span>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<Key className="w-3.5 h-3.5" />}
            >
              Simpan Kunci API
            </Button>
          </div>
        </form>
      </Card>

      {/* Cadangan & Pemulihan Data (Backup & Restore) */}
      <Card variant="saweria" className="bg-white space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-brand-border">
          <FolderArchive className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider">
            Cadangan & Pemulihan Data (Backup & Restore)
          </h3>
        </div>

        <p className="text-xs text-brand-darkMuted leading-relaxed">
          Amankan seluruh catatan transaksi, kantong anggaran, rekening, tagihan, dan hutangmu dalam satu file format <b>.JSON</b>. Kamu bisa mengunduhnya untuk arsip atau memulihkannya kapan saja saat ganti perangkat.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleDownloadBackup}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download Cadangan (.JSON)
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Pulihkan dari File (.JSON)
          </Button>
        </div>
      </Card>

      {/* PWA Mobile Installation Card */}
      <PWAInstallButton variant="card" />

      {/* Danger Zone: Reset Data & Logout */}
      <Card variant="saweria" className="bg-red-50/50 border-red-500 space-y-4">
        <h3 className="text-sm font-black text-red-700 uppercase tracking-wider">
          Zona Data & Keluar
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <p className="text-xs font-black text-brand-dark">Reset Data Simulasi</p>
            <p className="text-[11px] text-brand-darkMuted">
              Kembalikan semua transaksi, kantong, dan target tabungan ke template bawaan awal.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetData}
            isLoading={isResetting}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Reset Data Bawaan
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-red-200">
          <div>
            <p className="text-xs font-black text-brand-dark">Setel Saldo Awal Sesuai Gaji ({formatIDR(income)})</p>
            <p className="text-[11px] text-brand-darkMuted">
              Kosongkan riwayat transaksi simulasi lama dan setel Saldo Riil menjadi {formatIDR(income)} sesuai gaji bulananmu.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClearTransactions}
            isLoading={isResetting}
            leftIcon={<RotateCcw className="w-3.5 h-3.5 text-brand-primary" />}
          >
            Setel Saldo {formatIDR(income)}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-red-200">
          <div>
            <p className="text-xs font-black text-brand-dark">Keluar dari Akun</p>
            <p className="text-[11px] text-brand-darkMuted">
              Akhiri sesi aktif Anda pada perangkat ini.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            leftIcon={<LogOut className="w-3.5 h-3.5" />}
          >
            Keluar Sekarang
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-red-200">
          <div>
            <p className="text-xs font-black text-red-600">Hapus Akun & Seluruh Data</p>
            <p className="text-[11px] text-brand-darkMuted">
              Hapus permanen akun, seluruh transaksi, kantong, dan target tabungan Anda (Sesuai Kebijakan Google Play).
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={handleDeleteAccount}
            isLoading={isDeleting}
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          >
            Hapus Akun Permanen
          </Button>
        </div>
      </Card>

      {/* Legal & Compliance (Google Play Store Requirement) */}
      <Card variant="saweria" className="bg-white space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-brand-border">
          <Shield className="w-4 h-4 text-brand-primary" />
          <h3 className="text-sm font-black text-brand-dark uppercase tracking-wider">
            Informasi Hukum & Privasi
          </h3>
        </div>
        <p className="text-xs text-brand-darkMuted leading-relaxed">
          Pockito menjamin integritas dan keamanan data finansial pribadi Anda. Baca dokumen resmi kepatuhan kami:
        </p>
        <div className="flex flex-wrap gap-4 pt-1">
          <Link
            to="/privacy"
            className="text-xs font-black text-brand-dark hover:text-brand-primary flex items-center gap-1.5 underline decoration-brand-border"
          >
            <span>Kebijakan Privasi (Privacy Policy)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/terms"
            className="text-xs font-black text-brand-dark hover:text-brand-primary flex items-center gap-1.5 underline decoration-brand-border"
          >
            <span>Syarat & Ketentuan Layanan</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Card>
    </div>
  );
};
