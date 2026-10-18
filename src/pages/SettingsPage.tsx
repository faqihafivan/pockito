import React, { useState } from 'react';
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
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, isCloudMode, logout } = useAuth();
  const { resetToDefaults, deleteAllUserData } = useData();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [income, setIncome] = useState<number>(user?.monthly_income || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser({
      full_name: fullName.trim(),
      email: email.trim(),
      monthly_income: income,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetData = async () => {
    if (
      window.confirm(
        'PERINGATAN: Apakah Anda yakin ingin mereset seluruh data simulasi kembali ke pengaturan bawaan awal?'
      )
    ) {
      setIsResetting(true);
      await resetToDefaults();
      setIsResetting(false);
      alert('Data berhasil direset ke kondisi awal.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.prompt(
      'PERINGATAN HAPUS AKUN PERMANEN:\nSeluruh transaksi, kantong, rekening, dan data profil Anda akan DIHAPUS TOTAL dan tidak dapat dikembalikan.\n\nKetik "HAPUS" untuk mengonfirmasi penghapusan:'
    );
    if (confirmation === 'HAPUS') {
      setIsDeleting(true);
      await deleteAllUserData();
      logout();
      setIsDeleting(false);
      alert('Akun dan seluruh data Anda telah berhasil dihapus secara permanen.');
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
