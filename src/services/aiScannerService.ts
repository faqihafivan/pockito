import { Account, Pocket } from '../types';

export interface ParsedTransaction {
  amount: number; // Integer IDR
  description: string;
  merchant?: string;
  date: string; // 'YYYY-MM-DD'
  pocket_id?: string;
  account_id?: string;
  items?: string[];
  notes?: string;
  confidence: 'high' | 'medium' | 'low';
  source: 'ai_vision' | 'quick_note' | 'sample';
}

export interface SampleReceipt {
  id: string;
  title: string;
  subtitle: string;
  merchant: string;
  amount: number;
  date: string;
  category: string;
  items: string[];
  imageUrl: string;
}

const STORAGE_API_KEY = 'pockito_gemini_api_key';

export class AIScannerService {
  /**
   * Retrieves user-configured Gemini API Key from localStorage or .env
   */
  static getApiKey(): string {
    const localKey = localStorage.getItem(STORAGE_API_KEY);
    if (localKey && localKey.trim()) {
      return localKey.trim();
    }
    return import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  static setApiKey(key: string): void {
    if (!key.trim()) {
      localStorage.removeItem(STORAGE_API_KEY);
    } else {
      localStorage.setItem(STORAGE_API_KEY, key.trim());
    }
  }

  static hasApiKey(): boolean {
    return Boolean(this.getApiKey());
  }

  /**
   * Sample receipts for immediate zero-config testing
   */
  static getSampleReceipts(): SampleReceipt[] {
    const today = new Date().toISOString().split('T')[0];
    return [
      {
        id: 'sample-indomaret',
        title: 'Struk Indomaret',
        subtitle: 'Kebutuhan harian & sarapan',
        merchant: 'Indomaret Sudirman',
        amount: 47500,
        date: today,
        category: 'Makan & Minum',
        items: ['Roti Tawar Gandum', 'Kopi Susu 250ml', 'Air Mineral 600ml'],
        imageUrl: 'https://images.unsplash.com/photo-1554415707-9e49fe04e873?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'sample-qris-kopi',
        title: 'Bukti QRIS Kafe',
        subtitle: 'Screenshot QRIS Kopi Kenangan',
        merchant: 'Kopi Kenangan Mantan',
        amount: 28000,
        date: today,
        category: 'Nongkrong & Hiburan',
        items: ['Kopi Kenangan Mantan Large', 'Less Sugar'],
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
      },
      {
        id: 'sample-bensin',
        title: 'Struk SPBU Pertamina',
        subtitle: 'Isi Pertalite Motor',
        merchant: 'SPBU Pertamina 31.12',
        amount: 35000,
        date: today,
        category: 'Transport & Bensin',
        items: ['Pertalite 3.5 Liter'],
        imageUrl: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=500&auto=format&fit=crop&q=80',
      },
    ];
  }

  /**
   * Converts a SampleReceipt into a ParsedTransaction matched with user's pockets & accounts
   */
  static loadSampleReceipt(
    sample: SampleReceipt,
    pockets: Pocket[],
    accounts: Account[]
  ): ParsedTransaction {
    const matchedPocket = this.findBestMatchingPocket(
      `${sample.merchant} ${sample.category} ${sample.items.join(' ')}`,
      pockets
    );
    const matchedAccount = accounts.find((a) => !a.is_archived) || accounts[0];

    return {
      amount: sample.amount,
      description: `${sample.merchant}`,
      merchant: sample.merchant,
      date: sample.date,
      pocket_id: matchedPocket?.id,
      account_id: matchedAccount?.id,
      items: sample.items,
      notes: `Item: ${sample.items.join(', ')}`,
      confidence: 'high',
      source: 'sample',
    };
  }

  /**
   * Extracts Date from Indonesian text (e.g. "tanggal 28/10/2026", "28 oktober 2026", "kemarin", "hari ini")
   * and removes the date tokens from the remaining text.
   */
  static extractDate(text: string): { date: string; cleanText: string } {
    const today = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const toYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    let extractedDate = toYMD(today);
    let clean = text;

    // 1. Relative dates: kemarin lusa, kemarin, hari ini
    if (/\b(kemarin\s+lusa|lusa\s+kemarin)\b/i.test(clean)) {
      const d = new Date(today);
      d.setDate(d.getDate() - 2);
      extractedDate = toYMD(d);
      clean = clean.replace(/\b(kemarin\s+lusa|lusa\s+kemarin)\b/gi, '');
      return { date: extractedDate, cleanText: clean };
    }
    if (/\b(kemarin|kemaren)\b/i.test(clean)) {
      const d = new Date(today);
      d.setDate(d.getDate() - 1);
      extractedDate = toYMD(d);
      clean = clean.replace(/\b(kemarin|kemaren)\b/gi, '');
      return { date: extractedDate, cleanText: clean };
    }
    if (/\b(hari\s+ini)\b/i.test(clean)) {
      clean = clean.replace(/\b(hari\s+ini)\b/gi, '');
      return { date: extractedDate, cleanText: clean };
    }

    // 2. Numeric date: DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY (with optional "tanggal" or "tgl")
    // e.g. "tanggal 28/10/2026", "28-10-2026", "28/10/26", "28/10"
    const numericDateRegex = /\b(?:tanggal|tgl)?\s*(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?\b/i;
    const numMatch = clean.match(numericDateRegex);
    if (numMatch) {
      const day = parseInt(numMatch[1], 10);
      const month = parseInt(numMatch[2], 10);
      let year = numMatch[3] ? parseInt(numMatch[3], 10) : today.getFullYear();
      if (year < 100) year += 2000;

      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        extractedDate = `${year}-${pad(month)}-${pad(day)}`;
        clean = clean.replace(numMatch[0], '');
        return { date: extractedDate, cleanText: clean };
      }
    }

    // 3. Named Indonesian month date: e.g. "tanggal 28 oktober 2026", "28 okt 2026", "28 oktober"
    const monthNames: Record<string, number> = {
      januari: 1, jan: 1,
      februari: 2, feb: 2,
      maret: 3, mar: 3,
      april: 4, apr: 4,
      mei: 5,
      juni: 6, jun: 6,
      juli: 7, jul: 7,
      agustus: 8, agu: 8, ags: 8, agust: 8,
      september: 9, sep: 9, sept: 9,
      oktober: 10, okt: 10,
      november: 11, nov: 11,
      desember: 12, des: 12,
    };
    const monthPattern = Object.keys(monthNames).join('|');
    const namedDateRegex = new RegExp(
      `\\b(?:tanggal|tgl)?\\s*(\\d{1,2})\\s+(${monthPattern})(?:\\s+(\\d{2,4}))?\\b`,
      'i'
    );
    const namedMatch = clean.match(namedDateRegex);
    if (namedMatch) {
      const day = parseInt(namedMatch[1], 10);
      const mStr = namedMatch[2].toLowerCase();
      const month = monthNames[mStr];
      let year = namedMatch[3] ? parseInt(namedMatch[3], 10) : today.getFullYear();
      if (year < 100) year += 2000;

      if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
        extractedDate = `${year}-${pad(month)}-${pad(day)}`;
        clean = clean.replace(namedMatch[0], '');
        return { date: extractedDate, cleanText: clean };
      }
    }

    // Strip standalone "tanggal" or "tgl" if lingering
    clean = clean.replace(/\b(tanggal|tgl)\b/gi, '');

    return { date: extractedDate, cleanText: clean };
  }

  /**
   * Converts Indonesian spoken number words (e.g. "dua puluh lima ribu", "tiga puluh lima ribu") to integer.
   */
  static parseIndonesianNumberWords(phrase: string): number {
    const tokens = phrase.toLowerCase().trim().split(/\s+/);
    let total = 0;
    let temp = 0;

    for (const t of tokens) {
      if (t === 'juta') {
        temp = (temp === 0 ? 1 : temp) * 1000000;
        total += temp;
        temp = 0;
      } else if (t === 'ribu') {
        temp = (temp === 0 ? 1 : temp) * 1000;
        total += temp;
        temp = 0;
      } else if (t === 'seratus') {
        temp += 100;
      } else if (t === 'ratus') {
        const last = temp % 10;
        temp = (temp - last) + (last * 100);
      } else if (t === 'seribu') {
        temp += 1000;
      } else if (t === 'sejuta') {
        total += 1000000;
      } else if (t === 'sepuluh') {
        temp += 10;
      } else if (t === 'sebelas') {
        temp += 11;
      } else if (t === 'belas') {
        const last = temp % 10;
        temp = (temp - last) + (last + 10);
      } else if (t === 'puluh') {
        const last = temp % 10;
        temp = (temp - last) + (last * 10);
      } else {
        const digitMap: Record<string, number> = {
          satu: 1, se: 1, dua: 2, tiga: 3, empat: 4, lima: 5,
          enam: 6, tujuh: 7, delapan: 8, sembilan: 9,
        };
        if (digitMap[t] !== undefined) {
          temp += digitMap[t];
        }
      }
    }
    total += temp;
    return total;
  }

  /**
   * Parses natural language Indonesian quick text note or voice transcription
   * Examples:
   * - "makan bakso 25rb pakai gopay"
   * - "Makan siang soto 25rb BCA tanggal 28/10/2026"
   * - "Makan siang soto 25rb BCA 28 oktober 2026"
   * - "Makan siang soto dua puluh lima ribu BCA"
   * - "bensin motor 35000 tunai kemarin"
   * - "kopi susu kenangan 22k"
   * - "bayar wifi indihome 350rb dari bca"
   */
  static parseQuickNote(
    text: string,
    pockets: Pocket[],
    accounts: Account[]
  ): ParsedTransaction {
    const rawText = text.trim();
    if (!rawText) {
      return {
        amount: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
        confidence: 'low',
        source: 'quick_note',
      };
    }

    // 1. Extract Date first (and remove date token from text)
    const { date: extractedDate, cleanText: textWithoutDate } = this.extractDate(rawText);

    let cleanText = textWithoutDate;
    const lower = cleanText.toLowerCase();

    // 2. Extract Amount (Digits first, then Spoken Indonesian Number Words)
    let amount = 0;
    let matchedAmountText = '';

    // Regex matching numbers with 'rb', 'k', 'ribu', 'jt', 'juta', or raw numbers
    const amountRegex = /(\d+[\.,]?\d*)\s*(rb|k|ribu|jt|juta)?/i;
    const match = lower.match(amountRegex);

    if (match) {
      const rawNumStr = match[1].replace(',', '.');
      const num = parseFloat(rawNumStr);
      const unit = (match[2] || '').toLowerCase();

      if (!isNaN(num)) {
        if (unit === 'jt' || unit === 'juta') {
          amount = Math.round(num * 1000000);
        } else if (unit === 'rb' || unit === 'k' || unit === 'ribu') {
          amount = Math.round(num * 1000);
        } else if (num < 1000 && lower.includes('ribu')) {
          amount = Math.round(num * 1000);
        } else {
          amount = Math.round(num >= 1000 ? num : (match[1].includes('.') ? parseInt(match[1].replace('.', ''), 10) : num));
        }
        matchedAmountText = match[0];
      }
    }

    // If no digit amount found, try Indonesian Spoken Number Words (e.g. "dua puluh lima ribu")
    if (amount === 0) {
      const spokenWordsRegex = /\b((?:satu|se|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|sebelas|seratus|seribu|sejuta)(?:\s+(?:belas|puluh|ratus|ribu|juta|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sebelas))+\b)/i;
      const spokenMatch = lower.match(spokenWordsRegex);
      if (spokenMatch) {
        const parsedSpoken = this.parseIndonesianNumberWords(spokenMatch[0]);
        if (parsedSpoken > 0) {
          amount = parsedSpoken;
          matchedAmountText = spokenMatch[0];
        }
      }
    }

    // 3. Detect Account
    let matchedAccount: Account | undefined;
    if (lower.includes('gopay') || lower.includes('go-pay') || lower.includes('qris') || lower.includes('ovo') || lower.includes('dana') || lower.includes('shopee')) {
      matchedAccount = accounts.find((a) => a.type === 'ewallet' || a.name.toLowerCase().includes('gopay') || a.name.toLowerCase().includes('qris'));
    } else if (lower.includes('bca') || lower.includes('bank') || lower.includes('mandiri') || lower.includes('bri') || lower.includes('jago')) {
      matchedAccount = accounts.find((a) => a.type === 'bank' || a.name.toLowerCase().includes('bca'));
    } else if (lower.includes('tunai') || lower.includes('cash') || lower.includes('dompet') || lower.includes('uang saku')) {
      matchedAccount = accounts.find((a) => a.type === 'cash');
    }
    if (!matchedAccount) {
      matchedAccount = accounts.find((a) => !a.is_archived) || accounts[0];
    }

    // 4. Detect Pocket
    const matchedPocket = this.findBestMatchingPocket(lower, pockets);

    // 5. Clean Description
    let desc = cleanText;
    if (matchedAmountText) {
      desc = desc.replace(new RegExp(matchedAmountText, 'i'), '');
    }
    const fillers = [
      /\b(pakai|pake|via|lewat|dari|dengan|di|ke|untuk|buat)\b/gi,
      /\b(gopay|bca|tunai|cash|mandiri|bri|jago|dana|ovo|shopeepay|qris)\b/gi,
      /\b(rb|ribu|k|rupiah|idr)\b/gi,
      /\b(pada|waktu|jam|tgl|tanggal)\b/gi,
    ];
    fillers.forEach((regex) => {
      desc = desc.replace(regex, '');
    });

    // Clean whitespace and punctuation
    desc = desc.replace(/[,\.\-\/\\_]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!desc) {
      desc = matchedPocket ? matchedPocket.name : 'Pengeluaran Cepat';
    } else {
      // Capitalize first letters nicely
      desc = desc
        .split(' ')
        .filter(Boolean)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    return {
      amount,
      description: desc,
      date: extractedDate,
      pocket_id: matchedPocket?.id,
      account_id: matchedAccount?.id,
      confidence: amount > 0 ? 'high' : 'medium',
      source: 'quick_note',
    };
  }

  /**
   * Scans a receipt image via Gemini 1.5 Flash Vision API
   */
  static async scanReceiptWithGemini(
    file: File,
    pockets: Pocket[],
    accounts: Account[]
  ): Promise<ParsedTransaction> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error(
        'Kunci API Gemini belum diatur. Masukkan kunci API di Pengaturan atau coba salah satu Contoh Struk yang disediakan.'
      );
    }

    // Convert file to base64
    const base64Data = await this.fileToBase64(file);
    const mimeType = file.type || 'image/jpeg';

    const promptText = `
Kamu adalah asisten pengenal struk dan bukti transfer finansial Indonesia untuk aplikasi pencatat keuangan Pockito.
Analisis foto struk, invoice, bon, atau screenshot transfer ini.
Kembalikan HANYA JSON murni (tanpa format markdown seperti \`\`\`json) dengan struktur persis berikut:
{
  "merchant": "Nama toko, kafe, atau pihak penerima (contoh: Indomaret, Kopi Kenangan, SPBU Pertamina)",
  "amount": 25000,
  "date": "YYYY-MM-DD",
  "category": "Salah satu dari: Makanan, Belanja, Transportasi, Tagihan, Hiburan, Tabungan, atau Lainnya",
  "items": ["daftar 1-4 nama barang/jasa jika terbaca"],
  "account_type_hint": "Salah satu dari: ewallet (jika ada logo QRIS/GoPay/OVO), bank (jika transfer BCA/Mandiri), cash (jika tunai)"
}
Pastikan amount adalah integer Rupiah (misal 50000, bukan 50.000). Jika tanggal tidak terbaca, gunakan hari ini.
`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    };

    // Try Gemini 1.5 Flash
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      const errMsg = errJson?.error?.message || `Gagal menghubungi Gemini API (Status ${response.status})`;
      throw new Error(errMsg);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      throw new Error('Gemini tidak dapat membaca teks dari gambar ini. Pastikan foto struk terlihat jelas.');
    }

    // Clean any potential markdown wrappers
    let cleanJsonStr = candidateText.trim();
    if (cleanJsonStr.startsWith('```json')) {
      cleanJsonStr = cleanJsonStr.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanJsonStr.startsWith('```')) {
      cleanJsonStr = cleanJsonStr.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    let parsedResult: any;
    try {
      parsedResult = JSON.parse(cleanJsonStr);
    } catch {
      throw new Error('Gagal memproses struktur data dari AI. Coba foto dengan sudut yang lebih terang dan jelas.');
    }

    const amount = typeof parsedResult.amount === 'number' ? Math.round(parsedResult.amount) : parseInt(String(parsedResult.amount).replace(/[^0-9]/g, ''), 10) || 0;
    const merchant = parsedResult.merchant || 'Struk Belanja';
    const date = parsedResult.date && parsedResult.date.match(/^\d{4}-\d{2}-\d{2}$/) ? parsedResult.date : new Date().toISOString().split('T')[0];
    const items = Array.isArray(parsedResult.items) ? parsedResult.items : [];

    // Match pocket
    const searchContext = `${merchant} ${parsedResult.category || ''} ${items.join(' ')}`;
    const matchedPocket = this.findBestMatchingPocket(searchContext, pockets);

    // Match account hint
    let matchedAccount: Account | undefined;
    if (parsedResult.account_type_hint === 'ewallet') {
      matchedAccount = accounts.find((a) => a.type === 'ewallet');
    } else if (parsedResult.account_type_hint === 'bank') {
      matchedAccount = accounts.find((a) => a.type === 'bank');
    } else if (parsedResult.account_type_hint === 'cash') {
      matchedAccount = accounts.find((a) => a.type === 'cash');
    }
    if (!matchedAccount) {
      matchedAccount = accounts.find((a) => !a.is_archived) || accounts[0];
    }

    return {
      amount,
      description: merchant,
      merchant,
      date,
      pocket_id: matchedPocket?.id,
      account_id: matchedAccount?.id,
      items,
      notes: items.length > 0 ? `Item: ${items.join(', ')}` : undefined,
      confidence: 'high',
      source: 'ai_vision',
    };
  }

  /**
   * Helper to find the best pocket based on keyword matching
   */
  private static findBestMatchingPocket(text: string, pockets: Pocket[]): Pocket | undefined {
    const lower = text.toLowerCase();

    // Priority mappings
    const rules: { keywords: string[]; pocketNames: string[]; icons: string[] }[] = [
      {
        keywords: [
          'makan', 'minum', 'kopi', 'bakso', 'mie', 'nasi', 'ayam', 'warteg', 'resto',
          'snack', 'cafe', 'kafe', 'sarapan', 'lunch', 'dinner', 'indomaret', 'alfamart',
          'roti', 'food', 'beverage', 'kenangan', 'janji jiwa', 'chatime', 'mixue', 'mcd', 'kfc',
        ],
        pocketNames: ['makan', 'makanan', 'kuliner', 'food'],
        icons: ['Utensils', 'Coffee'],
      },
      {
        keywords: [
          'kos', 'kost', 'kontrakan', 'wifi', 'indihome', 'biznet', 'listrik', 'pln',
          'air', 'pdam', 'pulsa', 'kuota', 'bpjs', 'tagihan', 'iuran', 'langganan',
        ],
        pocketNames: ['tagihan', 'kos', 'bills', 'rutin', 'rumah'],
        icons: ['Home'],
      },
      {
        keywords: [
          'bensin', 'pertalite', 'pertamax', 'shell', 'spbu', 'gojek', 'goride', 'gocar',
          'grab', 'ojol', 'parkir', 'tol', 'kereta', 'mrt', 'krl', 'service', 'oli', 'motor',
        ],
        pocketNames: ['transport', 'bensin', 'kendaraan'],
        icons: ['Car'],
      },
      {
        keywords: [
          'nongkrong', 'nonton', 'bioskop', 'cinema', 'game', 'steam', 'spotify', 'netflix',
          'karaoke', 'hangout', 'hiburan', 'liburan', 'wisata',
        ],
        pocketNames: ['hiburan', 'nongkrong', 'fun', 'keinginan'],
        icons: ['Smile', 'Coffee'],
      },
      {
        keywords: [
          'nabung', 'investasi', 'reksadana', 'emas', 'bibit', 'darurat', 'tabungan',
        ],
        pocketNames: ['tabungan', 'darurat', 'investasi', 'savings'],
        icons: ['PiggyBank', 'ShieldCheck'],
      },
    ];

    for (const rule of rules) {
      if (rule.keywords.some((kw) => lower.includes(kw))) {
        // Try match pocket name first
        const byName = pockets.find((p) =>
          rule.pocketNames.some((pn) => p.name.toLowerCase().includes(pn))
        );
        if (byName) return byName;

        // Try match pocket icon
        const byIcon = pockets.find((p) => rule.icons.includes(p.icon));
        if (byIcon) return byIcon;
      }
    }

    return pockets[0];
  }

  /**
   * Helper to convert file to Base64 without data URI prefix
   */
  private static fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Strip data:image/...;base64,
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }
}
