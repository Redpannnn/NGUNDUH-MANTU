/**
 * Contact file parser — ubah file kontak (CSV / VCF / XLSX) jadi array nama.
 *
 * Support:
 *  • CSV  — header "name"/"nama"/"fn"/"full name", atau kolom tunggal nama
 *  • VCF  — vCard 2.1/3.0/4.0, ambil field `FN:` (Full Name)
 *  • XLSX — sheet pertama, cari kolom header "name"/"nama", atau kolom pertama
 */

export interface ParsedContact {
  name: string;
  code?: string;
}

export type ImportFormat = "csv" | "vcf" | "xlsx" | "unknown";

/** Deteksi format file dari ekstensi nama file. */
export function detectFormat(fileName: string): ImportFormat {
  const ext = fileName.toLowerCase().split(".").pop() || "";
  if (ext === "csv") return "csv";
  if (ext === "vcf" || ext === "vcard") return "vcf";
  if (ext === "xlsx" || ext === "xls") return "xlsx";
  return "unknown";
}

/** Parse a file (CSV/VCF/XLSX) → array of { name, code? }. */
export async function parseContactFile(file: File): Promise<ParsedContact[]> {
  const format = detectFormat(file.name);
  if (format === "unknown") {
    throw new Error(
      `Format file tidak didukung. Gunakan .csv, .vcf, atau .xlsx.`
    );
  }

  if (format === "xlsx") {
    const buf = await file.arrayBuffer();
    return parseXlsx(buf);
  }

  const text = await file.text();
  if (format === "csv") return parseCsv(text);
  return parseVcf(text);
}

/* ─────────────────────────── CSV ─────────────────────────── */

/** Minimal CSV row parser — handle quoted fields & commas inside quotes. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") {
        out.push(cur);
        cur = "";
      } else cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/** Cari index kolom yang kemungkinan berisi nama. */
function findNameColumn(headers: string[]): number {
  const lower = headers.map((h) => h.toLowerCase());
  const preferred = ["name", "nama", "nama lengkap", "full name", "fn", "contact", "kontak"];
  for (const p of preferred) {
    const i = lower.indexOf(p);
    if (i >= 0) return i;
  }
  // partial match
  for (let i = 0; i < lower.length; i++) {
    if (lower[i].includes("name") || lower[i].includes("nama")) return i;
  }
  return -1;
}

/** Cari index kolom yang kemungkinan berisi code. */
function findCodeColumn(headers: string[]): number {
  const lower = headers.map((h) => h.toLowerCase());
  const preferred = ["code", "kode", "id", "short", "slug"];
  for (const p of preferred) {
    const i = lower.indexOf(p);
    if (i >= 0) return i;
  }
  return -1;
}

function parseCsv(text: string): ParsedContact[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length === 0) return [];

  const firstRow = splitCsvLine(lines[0]);
  const hasHeader = firstRow.some((c) =>
    /(name|nama|code|kode|fn|full\s*name|contact|email|phone|no|telp)/i.test(c)
  );

  let nameIdx = 0;
  let codeIdx = -1;
  let dataStart = 0;

  if (hasHeader) {
    nameIdx = findNameColumn(firstRow);
    if (nameIdx < 0) nameIdx = 0;
    codeIdx = findCodeColumn(firstRow);
    dataStart = 1;
  }

  const out: ParsedContact[] = [];
  for (let i = dataStart; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const name = (cols[nameIdx] || "").trim();
    if (!name) continue;
    const code = codeIdx >= 0 ? (cols[codeIdx] || "").trim() : "";
    out.push({ name, code: code || undefined });
  }
  return out;
}

/* ─────────────────────────── VCF ─────────────────────────── */

function parseVcf(text: string): ParsedContact[] {
  const out: ParsedContact[] = [];
  // Split per vCard block. Setiap block diawali BEGIN:VCARD dan diakhiri END:VCARD
  const blocks = text.split(/BEGIN:VCARD/i);
  for (const block of blocks) {
    if (!block.trim()) continue;
    const endIdx = block.search(/END:VCARD/i);
    const body = endIdx >= 0 ? block.slice(0, endIdx) : block;
    const lines = body.split(/\r?\n/);

    let name = "";
    let code = "";
    for (const raw of lines) {
      const line = raw.trim();
      // FN:Full Name  (FN bisa punya params kayak FN;CHARSET=UTF-8:Name)
      const fnMatch = line.match(/^FN(?:;[^:]*)?:\s*(.+)$/i);
      if (fnMatch) name = fnMatch[1].trim();
      // CARI code di custom field atau NOTE. Beberapa aplikasi simpan di X-ABLABEL dsb.
      const codeMatch = line.match(
        /^(?:X-|NOTE|CATEGORIES)(?:;[^:]*)?:\s*(code|kode)[:=\s]+([^\s;]+)/i
      );
      if (codeMatch) code = codeMatch[2].trim();
    }
    if (name) out.push({ name, code: code || undefined });
  }
  return out;
}

/* ─────────────────────────── XLSX ─────────────────────────── */

async function parseXlsx(buf: ArrayBuffer): Promise<ParsedContact[]> {
  // Dynamic import biar xlsx nggak masuk server bundle kalau nggak dipakai.
  // Pakai import() bukan require() — require() broke ESM build di Vercel.
  const XLSX = await import("xlsx");
  const wb = XLSX.read(buf, { type: "array" });
  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) return [];
  const sheet = wb.Sheets[firstSheetName];

  // Convert ke array-of-arrays (header: 1)
  const rows: string[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
  });
  if (rows.length === 0) return [];

  // Cek apakah baris pertama header
  const firstRow = rows[0].map((c) => String(c || "").trim());
  const hasHeader = firstRow.some((c) =>
    /(name|nama|code|kode|fn|full\s*name|contact|email|phone|no|telp)/i.test(c)
  );

  let nameIdx = 0;
  let codeIdx = -1;
  let dataStart = 0;

  if (hasHeader) {
    nameIdx = findNameColumn(firstRow);
    if (nameIdx < 0) nameIdx = 0;
    codeIdx = findCodeColumn(firstRow);
    dataStart = 1;
  }

  const out: ParsedContact[] = [];
  for (let i = dataStart; i < rows.length; i++) {
    const cols = rows[i].map((c) => String(c || "").trim());
    const name = cols[nameIdx] || "";
    if (!name) continue;
    const code = codeIdx >= 0 ? cols[codeIdx] || "" : "";
    out.push({ name, code: code || undefined });
  }
  return out;
}
