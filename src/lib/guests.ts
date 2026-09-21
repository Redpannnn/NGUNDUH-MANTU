/**
 * ─────────────────────────────────────────────────────────────────
 *  DAFTAR TAMU UNDANGAN  (Guest List Manager)
 * ─────────────────────────────────────────────────────────────────
 *
 *  Cara manage / custom nama tamu di cover undangan:
 *
 *  1. Daftarkan setiap tamu di array GUESTS di bawah, dengan format:
 *        { code: "kode-unik", name: "Nama Lengkap Tamu" }
 *
 *  2. Kirim link undangan ke tamu dengan menambahkan ?to=<code> di akhir URL:
 *        https://undangan-anda.vercel.app/?to=budi
 *
 *     Maka di cover akan tampil "Budi Santoso" (bukan "Tamu Undangan").
 *
 *  ATURAN RESOLUSI NAMA TAMU (otomatis di cover):
 *    • ?to=budi       → "Budi Santoso"   (cocok dengan code di GUESTS)
 *    • ?to=Budi+Sapo  → "Budi Sapo"      (code tidak terdaftar → tampil literal)
 *    • (tanpa ?to=)   → "Tamu Undangan"  (default)
 *
 *  Tambah / edit / hapus entri sesuai kebutuhan. Save file, perubahan
 *  langsung aktif (auto reload).
 */

export type Guest = { code: string; name: string };

export const GUESTS: Guest[] = [
  // ───── Contoh (silakan ganti / tambah) ─────
  // { code: "budi", name: "Budi Santoso" },
  // { code: "siti", name: "Siti Aminah" },
  // { code: "keluarga-besar", name: "Keluarga Besar Santoso" },
];

/**
 * Cari nama lengkap tamu berdasarkan code.
 * Return undefined kalau code tidak terdaftar di GUESTS.
 */
export function lookupGuest(code: string): string | undefined {
  const found = GUESTS.find(
    (g) => g.code.toLowerCase() === code.toLowerCase().trim()
  );
  return found?.name;
}
