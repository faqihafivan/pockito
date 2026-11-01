import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CurrencyInput } from '../ui/CurrencyInput';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { TransactionType } from '../../types';
import {
  AIScannerService,
  ParsedTransaction,
  SampleReceipt,
} from '../../services/aiScannerService';
import {
  Camera,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Receipt,
  RotateCcw,
  Edit3,
  Mic,
  Square,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPocketId?: string;
  defaultMethod?: 'manual' | 'scan' | 'voice' | 'note';
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  defaultPocketId,
  defaultMethod = 'manual',
}) => {
  const { user } = useAuth();
  const { accounts, pockets, addTransaction } = useData();
  const { showToast } = useNotification();

  const [type, setType] = useState<TransactionType>('expense');
  const [inputMethod, setInputMethod] = useState<'manual' | 'scan' | 'voice'>(
    defaultMethod === 'note' ? 'manual' : (defaultMethod as 'manual' | 'scan' | 'voice') || 'manual'
  );

  // Form Fields (Always editable)
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [accountId, setAccountId] = useState<string>(accounts[0]?.id || '');
  const [destinationAccountId, setDestinationAccountId] = useState<string>(accounts[1]?.id || '');
  const [pocketId, setPocketId] = useState<string>(defaultPocketId || pockets[0]?.id || '');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Scanner State inside Modal
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string>('');
  const [apiKeyPrompt, setApiKeyPrompt] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>('');

  // Quick Manual Text State (Input Manual Auto-Fill)
  const [quickManualText, setQuickManualText] = useState<string>('');

  // Voice Note State
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [speechError, setSpeechError] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  // Clean up voice recording on unmount or close
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setType('expense');
      setInputMethod(defaultMethod === 'note' ? 'manual' : (defaultMethod as 'manual' | 'scan' | 'voice') || 'manual');
      setAmount(0);
      setDescription('');
      setAccountId(accounts[0]?.id || '');
      setDestinationAccountId(accounts[1]?.id || '');
      setPocketId(defaultPocketId || pockets[0]?.id || '');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setError('');
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl('');
      setScanSuccessMessage('');
      setQuickManualText('');
      setVoiceTranscript('');
      setSpeechError('');
      setIsListening(false);
      setApiKeyPrompt(false);
    }
  }, [isOpen, defaultPocketId, defaultMethod, accounts, pockets]);

  // Voice Recognition Handler using Web Speech API (id-ID)
  const startVoiceRecording = () => {
    setSpeechError('');
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        'Browser ini belum mendukung Web Speech API langsung. Kamu bisa klik contoh simulasi suara di bawah atau ketik di Input Manual.'
      );
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'id-ID';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceTranscript('');
        setScanSuccessMessage('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setVoiceTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError(
            'Izin mikrofon belum diberikan. Silakan izinkan akses mikrofon di browser, atau klik salah satu contoh simulasi di bawah.'
          );
        } else {
          setSpeechError(`Gagal menangkap suara (${event.error}). Coba klik lagi atau gunakan tombol contoh suara.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err: any) {
      setIsListening(false);
      setSpeechError(err.message || 'Tidak dapat memulai mikrofon.');
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  // When voice finishes speaking, automatically parse and populate form
  useEffect(() => {
    if (!isListening && voiceTranscript.trim() && inputMethod === 'voice') {
      const parsed = AIScannerService.parseQuickNote(voiceTranscript, pockets, accounts);
      applyScanResult(parsed, 'rekaman suara');
      showToast('Suara berhasil dikonversi ke teks dan mengisi form!', 'success');
    }
  }, [isListening, voiceTranscript, inputMethod]);

  // Apply Quick Text in Manual Mode
  const handleApplyQuickText = (text: string) => {
    if (!text.trim()) return;
    const parsed = AIScannerService.parseQuickNote(text, pockets, accounts);
    applyScanResult(parsed, 'catatan cepat');
    showToast('Data otomatis terisi ke form di bawah!', 'success');
  };

  // Apply Voice Transcript (also used by Voice Sample Chips)
  const handleApplyVoiceTranscript = (text: string) => {
    setVoiceTranscript(text);
    const parsed = AIScannerService.parseQuickNote(text, pockets, accounts);
    applyScanResult(parsed, 'simulasi rekaman suara');
    showToast('Suara berhasil dikonversi ke teks dan mengisi form!', 'success');
  };

  // Handle Photo File Select with zero-trust client validation
  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB maximum
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validate file MIME type
    if (!file.type.startsWith('image/') && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Format file tidak didukung. Mohon gunakan foto struk berformat JPG, PNG, atau WebP.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. Validate file size (Max 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setError(`Ukuran foto terlalu besar (${sizeMB} MB). Batas maksimum adalah 5 MB untuk mencegah browser melambat.`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 3. Clean up previous object URL to avoid memory leaks
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanSuccessMessage('');
    setError('');
  };

  // Populate form from scan result (keeping all fields fully editable)
  const applyScanResult = (result: ParsedTransaction, sourceName: string) => {
    if (result.amount > 0) setAmount(result.amount);
    if (result.description) setDescription(result.description);
    if (result.pocket_id) setPocketId(result.pocket_id);
    if (result.account_id) setAccountId(result.account_id);
    if (result.date) setDate(result.date);
    if (result.notes) setNotes(result.notes);

    setScanSuccessMessage(
      `✅ Data dari ${sourceName} berhasil terisi otomatis ke kolom di bawah! Silakan periksa dan ubah kolom jika ada tulisan struk/suara yang keliru sebelum disimpan.`
    );
  };

  // Run Gemini AI Scan on uploaded photo
  const handleScanReceipt = async () => {
    if (!selectedFile) return;

    if (!AIScannerService.hasApiKey()) {
      setApiKeyPrompt(true);
      setError('Kunci API Gemini diperlukan untuk memindai foto struk pribadimu. Atau gunakan salah satu Contoh Struk di bawah.');
      return;
    }

    setIsScanning(true);
    setError('');
    try {
      const result = await AIScannerService.scanReceiptWithGemini(
        selectedFile,
        pockets,
        accounts
      );
      applyScanResult(result, 'struk via AI Gemini');
      showToast('Struk berhasil dibaca! Silakan periksa data di bawah.', 'success');
    } catch (err: unknown) {
      setError((err as Error).message || 'Gagal membaca struk');
    } finally {
      setIsScanning(false);
    }
  };

  // Use pre-configured sample receipt
  const handleSelectSample = (sample: SampleReceipt) => {
    setSelectedFile(null);
    setPreviewUrl(sample.imageUrl);
    setError('');
    const parsed = AIScannerService.loadSampleReceipt(sample, pockets, accounts);
    applyScanResult(parsed, sample.title);
    showToast(`Data ${sample.title} terisi otomatis ke form!`, 'info');
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (amount <= 0) {
      setError('Nominal harus lebih besar dari Rp 0');
      return;
    }
    if (!description.trim()) {
      setError('Keterangan transaksi wajib diisi');
      return;
    }
    if (!accountId) {
      setError('Pilih rekening / sumber dana');
      return;
    }
    if (type === 'transfer' && accountId === destinationAccountId) {
      setError('Rekening tujuan transfer tidak boleh sama dengan rekening asal');
      return;
    }

    setIsSubmitting(true);
    try {
      await addTransaction({
        user_id: user?.id || 'user-demo-1',
        account_id: accountId,
        pocket_id: type === 'expense' ? pocketId : undefined,
        type,
        amount,
        destination_account_id: type === 'transfer' ? destinationAccountId : undefined,
        date: date.includes('T') ? date : `${date}T12:00:00.000Z`,
        description: description.trim(),
        notes: notes.trim() || undefined,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FAAE2B', '#10B981', '#18181B'],
      });

      showToast(`Transaksi "${description.trim()}" berhasil disimpan!`, 'success');
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Gagal menyimpan transaksi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sampleReceipts = AIScannerService.getSampleReceipts();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Transaksi Baru"
      subtitle="Arus kas langsung disinkronkan ke saldo riil & kantong budget"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 1. Transaction Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-brand-cream rounded-2xl border-2 border-brand-dark shadow-saweria-sm">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`py-2 text-xs font-black rounded-xl transition-all ${
              type === 'expense'
                ? 'bg-red-500 text-white shadow-saweria-sm border border-brand-dark'
                : 'text-brand-dark hover:bg-white/60'
            }`}
          >
            Pengeluaran
          </button>
          <button
            type="button"
            onClick={() => {
              setType('income');
              setInputMethod('manual');
            }}
            className={`py-2 text-xs font-black rounded-xl transition-all ${
              type === 'income'
                ? 'bg-[#10B981] text-white shadow-saweria-sm border border-brand-dark'
                : 'text-brand-dark hover:bg-white/60'
            }`}
          >
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => {
              setType('transfer');
              setInputMethod('manual');
            }}
            className={`py-2 text-xs font-black rounded-xl transition-all ${
              type === 'transfer'
                ? 'bg-brand-primary text-brand-dark shadow-saweria-sm border border-brand-dark'
                : 'text-brand-dark hover:bg-white/60'
            }`}
          >
            Transfer
          </button>
        </div>

        {/* 2. Method Selector (Only for Expense) */}
        {type === 'expense' && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between px-0.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
                Metode Input:
              </label>
              <span className="text-[10px] font-bold text-brand-darkMuted">
                {inputMethod === 'manual' && '✍️ Ketik manual & auto-fill'}
                {inputMethod === 'scan' && '📸 Foto struk → terisi otomatis'}
                {inputMethod === 'voice' && '🎙️ Bicara suara / VN'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-brand-cream rounded-2xl border-2 border-brand-dark shadow-saweria-sm">
              <button
                type="button"
                onClick={() => {
                  stopVoiceRecording();
                  setInputMethod('manual');
                  setScanSuccessMessage('');
                }}
                className={`py-2 px-1.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                  inputMethod === 'manual'
                    ? 'bg-white text-brand-dark border-2 border-brand-dark shadow-saweria-sm'
                    : 'text-brand-dark hover:bg-white/60'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Input Manual</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopVoiceRecording();
                  setInputMethod('scan');
                }}
                className={`py-2 px-1.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                  inputMethod === 'scan'
                    ? 'bg-brand-primary text-brand-dark border-2 border-brand-dark shadow-saweria-sm'
                    : 'text-brand-dark hover:bg-white/60'
                }`}
              >
                <Camera className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Scan Struk</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setInputMethod('voice');
                  setScanSuccessMessage('');
                }}
                className={`py-2 px-1.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                  inputMethod === 'voice'
                    ? 'bg-brand-primary text-brand-dark border-2 border-brand-dark shadow-saweria-sm'
                    : 'text-brand-dark hover:bg-white/60'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Suara / VN</span>
              </button>
            </div>
          </div>
        )}

        {/* 3A. Smart Quick-Fill bar for Input Manual */}
        {type === 'expense' && inputMethod === 'manual' && (
          <div className="p-3 rounded-2xl bg-brand-cream border-2 border-brand-dark space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-brand-dark uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
                Ketik Cepat Otomatis (Opsional):
              </label>
              <span className="text-[10px] font-bold text-brand-darkMuted">
                Auto-fill ke kolom form di bawah
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={quickManualText}
                onChange={(e) => setQuickManualText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyQuickText(quickManualText);
                  }
                }}
                placeholder="Contoh: Makan siang soto 25rb BCA tanggal 28/10/2026..."
                className="flex-1 px-3 py-2 rounded-xl border-2 border-brand-dark bg-white font-bold text-xs text-brand-dark outline-none focus:ring-2 focus:ring-brand-primary/40"
              />
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={() => handleApplyQuickText(quickManualText)}
                disabled={!quickManualText.trim()}
              >
                Terapkan
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-1 pt-0.5">
              <span className="text-[10px] font-bold text-brand-darkMuted mr-1">
                💡 Contoh:
              </span>
              {[
                'Makan siang soto 25rb BCA tanggal 28/10/2026',
                'Beli bensin pertalite 35k tunai kemarin',
                'Kopi kenangan 22k gopay hari ini',
              ].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => {
                    setQuickManualText(ex);
                    handleApplyQuickText(ex);
                  }}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white border border-brand-border text-brand-dark hover:bg-brand-primary/30 transition-colors"
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3B. SCANNER WIDGET (When Scan Struk is Active) */}
        {type === 'expense' && inputMethod === 'scan' && (
          <div className="p-3.5 rounded-2xl bg-brand-cream border-2 border-brand-dark space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-brand-border">
                  <img
                    src={previewUrl}
                    alt="Struk"
                    className="w-14 h-14 object-cover rounded-lg border border-brand-dark"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-brand-dark truncate">
                      {selectedFile ? selectedFile.name : 'Contoh Struk Terpilih'}
                    </p>
                    <p className="text-[10px] text-brand-darkMuted">
                      Siap dipindai untuk mengisi kolom di bawah
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<RotateCcw className="w-3 h-3" />}
                  >
                    Ganti
                  </Button>
                </div>

                {selectedFile && (
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={handleScanReceipt}
                    isLoading={isScanning}
                    className="w-full"
                    leftIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Pindai Struk dengan AI
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-2 space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={() => fileInputRef.current?.click()}
                    leftIcon={<Camera className="w-4 h-4" />}
                  >
                    Ambil Foto / Pilih Struk
                  </Button>
                </div>
                <p className="text-[11px] font-bold text-brand-darkMuted">
                  Atau klik contoh struk untuk simulasi langsung:
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {sampleReceipts.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-black bg-white border border-brand-dark text-brand-dark hover:bg-brand-primary transition-colors flex items-center gap-1"
                    >
                      <Receipt className="w-3 h-3 text-brand-primary" />
                      <span>{sample.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick API Key Prompt if missing */}
            {apiKeyPrompt && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs space-y-1.5">
                <div className="font-bold text-amber-900 flex items-center justify-between">
                  <span>Masukkan Google Gemini API Key Gratis:</span>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-600 underline font-bold"
                  >
                    Ambil Key
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-brand-dark bg-white font-mono text-xs"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      if (tempApiKey.trim()) {
                        AIScannerService.setApiKey(tempApiKey);
                        setApiKeyPrompt(false);
                        showToast('API Key tersimpan!', 'success');
                      }
                    }}
                  >
                    Simpan
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3C. VOICE NOTE WIDGET (When Suara / VN is Active) */}
        {type === 'expense' && inputMethod === 'voice' && (
          <div className="p-4 rounded-2xl bg-brand-cream border-2 border-brand-dark space-y-3.5 text-center">
            {/* Big Mic Button & Animation */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="relative">
                {isListening && (
                  <span className="absolute -inset-2.5 rounded-full bg-red-400/40 animate-ping" />
                )}
                <button
                  type="button"
                  onClick={isListening ? stopVoiceRecording : startVoiceRecording}
                  className={`w-16 h-16 rounded-full border-2 border-brand-dark flex items-center justify-center shadow-saweria transition-all transform active:scale-95 ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-brand-primary text-brand-dark hover:bg-brand-primaryDark'
                  }`}
                  title={isListening ? 'Klik untuk berhenti bicara' : 'Klik untuk mulai bicara'}
                >
                  {isListening ? (
                    <Square className="w-6 h-6 fill-white" />
                  ) : (
                    <Mic className="w-7 h-7 stroke-[2.4]" />
                  )}
                </button>
              </div>

              <div>
                <p className="text-xs font-black text-brand-dark">
                  {isListening ? '🔴 Mendengarkan suara kamu... Silakan bicara!' : 'Klik Mikrofon & Mulai Bicara'}
                </p>
                <p className="text-[11px] font-bold text-brand-darkMuted mt-0.5">
                  {isListening
                    ? 'Sebutkan nominal, barang, rekening, dan tanggal transaksimu'
                    : 'Contoh: "Makan siang soto 25 ribu BCA tanggal 28 Oktober 2026"'}
                </p>
              </div>
            </div>

            {/* Voice Transcript Display */}
            {voiceTranscript && (
              <div className="p-3 bg-white rounded-xl border-2 border-brand-dark shadow-saweria-sm text-left space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-darkMuted flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-brand-primary" />
                    Teks Hasil Suara:
                  </span>
                  {!isListening && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300">
                      ✓ Terbaca & Terisi Otomatis
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-brand-dark italic">
                  "{voiceTranscript}"
                </p>
              </div>
            )}

            {speechError && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold text-left flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{speechError}</span>
              </div>
            )}

            {/* Simulation / Sample Voice Chips */}
            <div className="pt-1 border-t border-brand-border/60">
              <p className="text-[10px] font-black uppercase tracking-wider text-brand-darkMuted mb-1.5">
                Atau Klik Simulasi Suara / VN di Bawah:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {[
                  {
                    full: 'Makan siang soto 25rb BCA tanggal 28/10/2026',
                    short: '🍜 Soto 25rb BCA (28/10/2026)',
                  },
                  {
                    full: 'Makan siang soto 25rb BCA 28 oktober 2026',
                    short: '🍜 Soto 25rb BCA (28 Okt 2026)',
                  },
                  {
                    full: 'Beli bensin pertalite 35 ribu tunai kemarin',
                    short: '⛽ Bensin 35rb Tunai (Kemarin)',
                  },
                  {
                    full: 'Kopi kenangan 22k gopay hari ini',
                    short: '☕ Kopi 22k GoPay (Hari ini)',
                  },
                ].map((item) => (
                  <button
                    key={item.full}
                    type="button"
                    onClick={() => handleApplyVoiceTranscript(item.full)}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-brand-dark text-brand-dark hover:bg-brand-primary transition-colors flex items-center gap-1"
                  >
                    <Mic className="w-3 h-3 text-brand-dark" />
                    <span>{item.short}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Success Guidance Banner after Scan / Auto-fill */}
        {scanSuccessMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 text-xs font-bold flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{scanSuccessMessage}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border-2 border-red-500 rounded-xl text-xs font-bold text-red-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. FORM FIELDS (ALWAYS VISIBLE & FULLY EDITABLE BY USER)        */}
        {/* ============================================================== */}
        <div className="pt-2 border-t-2 border-dashed border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black uppercase tracking-wider text-brand-dark">
              Rincian Transaksi
            </span>
            <span className="text-[10px] font-bold text-brand-darkMuted bg-neutral-100 px-2 py-0.5 rounded-full border border-brand-border">
              Tetap bisa diubah/koreksi
            </span>
          </div>
          {inputMethod === 'scan' && (
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              ⚡ Terisi otomatis
            </span>
          )}
        </div>

        {/* Currency Input (Always editable) */}
        <CurrencyInput
          label="Nominal Transaksi (IDR) *"
          value={amount}
          onValueChange={setAmount}
          placeholder="Rp 50.000"
          className="text-lg"
        />

        {/* Description (Always editable) */}
        <Input
          label="Keterangan Transaksi *"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            type === 'expense'
              ? 'Contoh: Nasi padang siang, Kopi, Bayar Wifi'
              : type === 'income'
              ? 'Contoh: Gaji bulanan, Bonus project freelance'
              : 'Contoh: Tarik tunai ATM, Pindah ke GoPay'
          }
          required
        />

        {/* Conditional Fields: Pocket Picker for Expense (Always editable) */}
        {type === 'expense' && (
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
              Pilih Kantong / Pocket *
            </label>
            <select
              value={pocketId}
              onChange={(e) => setPocketId(e.target.value)}
              className="w-full bg-white text-brand-dark font-bold text-sm rounded-xl border-2 border-brand-border p-2.5 focus:border-brand-dark focus:shadow-saweria-sm outline-none cursor-pointer"
            >
              {pockets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.allocation_percentage}%) {p.is_starred ? '⭐' : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Account Pickers & Date (Always editable) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
              {type === 'transfer' ? 'Dari Rekening' : 'Rekening / Kas *'}
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-white text-brand-dark font-bold text-sm rounded-xl border-2 border-brand-border p-2.5 focus:border-brand-dark focus:shadow-saweria-sm outline-none cursor-pointer"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type})
                </option>
              ))}
            </select>
          </div>

          {type === 'transfer' ? (
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
                Ke Rekening Tujuan *
              </label>
              <select
                value={destinationAccountId}
                onChange={(e) => setDestinationAccountId(e.target.value)}
                className="w-full bg-white text-brand-dark font-bold text-sm rounded-xl border-2 border-brand-border p-2.5 focus:border-brand-dark focus:shadow-saweria-sm outline-none cursor-pointer"
              >
                {accounts
                  .filter((a) => a.id !== accountId)
                  .map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.type})
                    </option>
                  ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wider">
                Tanggal Transaksi *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white text-brand-dark font-bold text-sm rounded-xl border-2 border-brand-border p-2.5 focus:border-brand-dark focus:shadow-saweria-sm outline-none cursor-pointer"
                required
              />
            </div>
          )}
        </div>

        {/* Notes (Optional) */}
        <Input
          label="Catatan Tambahan (Opsional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Contoh: Roti gandum, Kopi 250ml"
        />

        {/* Submit Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-brand-border">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Simpan Transaksi
          </Button>
        </div>
      </form>
    </Modal>
  );
};
