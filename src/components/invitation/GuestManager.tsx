"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Trash,
  Check,
  Loader2,
  ExternalLink,
  Plus,
  MessageCircle,
  Pencil,
  Eye,
  EyeOff,
  X,
  FileDown,
  FileType2,
  CheckCheck,
  BadgeCheck,
  ClipboardCheck,
} from "lucide-react";
import { parseContactFile, detectFormat, type ParsedContact } from "@/lib/contact-import";
import { useToast } from "@/hooks/use-toast";

type Guest = {
  id: string;
  code: string;
  name: string;
  createdAt: string;
};

/** Template pesan WhatsApp yang di-copy per tamu. {name} & {link} di-replace. */
function buildWaMessage(name: string, link: string): string {
  return `Assalamualikum Wr. Wb

Dengan memohon Rahmat Dan Ridho Allah SWT, Dan tanpa mengurangi rasa hormat kami. melalui media sosial ini, kami *Meilany Nugraheni & Fadhil Rizqi Nur Syahid* mengundang Bapak/Ibu/Sdr/i ${name} untuk berkenan hadir di acara pernikahan kami.

Detail Acara:
${link}

Merupakan suatu kehormatan dan kebahagiaan jika Anda bersedia hadir dan turut memberikan doa restu untuk kami

Terimakasih kami sampaikan Bapak/Ibu/Sdr/i ${name}.

Wassalamualaikum Wr.Wb`;
}

export default function GuestManager() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkText, setBulkText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    added: number;
    errors: string[];
  } | null>(null);
  /** track which guest's button was just copied: "wa-{id}" or "link-{id}" */
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  /** Set of guest IDs yang pesannya udah pernah di-copy (persistent badge). */
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set());
  /** Total pesan yang udah di-copy — derived dari copiedIds.size biar selalu sinkron. */
  const copyCount = copiedIds.size;
  const { toast } = useToast();

  const [fetchError, setFetchError] = useState("");

  /** Set of guest IDs yang preview-nya lagi dibuka (hide/unhide teks pesan). */
  const [previewOpen, setPreviewOpen] = useState<Set<string>>(new Set());

  /** Guest ID yang sedang di-edit (inline). */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  /** Import kontak state */
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    added: number;
    errors: string[];
    format?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const fetchGuests = useCallback(async () => {
    setFetchError("");
    try {
      const res = await fetch("/api/guests", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (data?.ok && Array.isArray(data.rows)) {
        setGuests(data.rows);
      } else {
        setFetchError(data?.error || "Gagal memuat daftar tamu.");
      }
    } catch {
      setFetchError("Gagal terhubung ke server. Cek koneksi/database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  /** Parse textarea → array of {code, name}. Format per baris:
   *  "nama"           → code auto dari nama
   *  "code|nama"      → code custom
   *  "# komentar"     → di-skip */
  const parseBulk = (text: string): { code: string; name: string }[] => {
    const lines = text.split("\n");
    const out: { code: string; name: string }[] = [];
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith("#")) continue;
      if (line.includes("|")) {
        const [code, ...rest] = line.split("|");
        const name = rest.join("|").trim();
        if (name) out.push({ code: code.trim().toLowerCase(), name });
      } else {
        out.push({ code: "", name: line });
      }
    }
    return out;
  };

  const handleBulkAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setResult(null);

    const entries = parseBulk(bulkText);
    if (entries.length === 0) {
      setResult({ added: 0, errors: ["Tidak ada nama valid ditemukan."] });
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: entries }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        setResult({
          added: data.added ?? 0,
          errors: data.errors ?? [
            data.error || `Server error (HTTP ${res.status})`,
          ],
        });
      } else {
        setResult({
          added: data.added ?? 0,
          errors: data.errors ?? [],
        });
        setBulkText("");
      }
      // ALWAYS refresh list — even on error, so user sees current DB state.
      await fetchGuests();
    } catch {
      setResult({ added: 0, errors: ["Gagal terhubung ke server."] });
    } finally {
      setSubmitting(false);
    }
  };

  const [removingAll, setRemovingAll] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus tamu ini?")) return;
    try {
      await fetch(`/api/guests?id=${id}`, { method: "DELETE" });
      fetchGuests();
    } catch {
      // silent
    }
  };

  /** Hapus SEMUA tamu — clear database Guest table. */
  const handleRemoveAll = async () => {
    setShowClearConfirm(false);
    setRemovingAll(true);
    try {
      // Delete semua tamu secara parallel
      await Promise.all(
        guests.map((g) =>
          fetch(`/api/guests?id=${g.id}`, { method: "DELETE" })
        )
      );
      // Reset state copy counter juga
      setCopiedIds(new Set());
      setCopiedKey(null);
      setPreviewOpen(new Set());
      await fetchGuests();
      toast({
        title: "Daftar tamu dikosongkan",
        description: "Semua data tamu telah dihapus.",
      });
    } catch {
      toast({
        title: "Gagal menghapus",
        description: "Terjadi kesalahan. Coba lagi.",
      });
    } finally {
      setRemovingAll(false);
    }
  };

  /** Toggle preview (hide/unhide) untuk satu tamu. */
  const togglePreview = (id: string) => {
    setPreviewOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /** Mulai edit nama tamu. */
  const startEdit = (g: Guest) => {
    setEditingId(g.id);
    setEditName(g.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
  };

  /** Simpan hasil edit nama → PUT /api/guests?id=xxx */
  const saveEdit = async (g: Guest) => {
    const name = editName.trim();
    if (!name) return;
    if (name === g.name) {
      cancelEdit();
      return;
    }
    setEditSaving(true);
    try {
      const res = await fetch(`/api/guests?id=${g.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        // update local state supaya langsung keliatan
        setGuests((prev) =>
          prev.map((x) => (x.id === g.id ? { ...x, name } : x))
        );
        // Reset status "sudah disalin" — nama berubah, pesan baru, bisa disalin ulang
        setCopiedIds((prev) => {
          const next = new Set(prev);
          next.delete(g.id);
          return next;
        });
        cancelEdit();
      } else {
        alert(data?.error || "Gagal menyimpan perubahan.");
      }
    } catch {
      alert("Gagal terhubung ke server.");
    } finally {
      setEditSaving(false);
    }
  };

  /** Handle file import — parse & POST bulk. */
  const handleImportFile = async (file: File) => {
    setImporting(true);
    setImportResult(null);
    const format = detectFormat(file.name);

    try {
      const parsed: ParsedContact[] = await parseContactFile(file);
      if (parsed.length === 0) {
        setImportResult({
          added: 0,
          errors: [
            `Tidak ada nama kontak ditemukan di file "${file.name}". Pastikan ada kolom Nama / Name / FN.`,
          ],
          format,
        });
        return;
      }

      const entries = parsed.map((p) => ({
        code: (p.code || "").trim().toLowerCase(),
        name: p.name,
      }));

      const res = await fetch("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: entries }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setImportResult({
          added: data.added ?? 0,
          errors: data.errors ?? [],
          format,
        });
        await fetchGuests();
      } else {
        setImportResult({
          added: data.added ?? 0,
          errors: data.errors ?? [
            data.error || `Server error (HTTP ${res.status})`,
          ],
          format,
        });
        await fetchGuests();
      }
    } catch (err) {
      setImportResult({
        added: 0,
        errors: [
          err instanceof Error
            ? err.message
            : "Gagal membaca file. Pastikan format benar.",
        ],
        format,
      });
    } finally {
      setImporting(false);
      // reset file input biar bisa import file yang sama lagi
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImportFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImportFile(file);
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const copyToClipboard = async (text: string, key: string, guestId: string, guestName: string) => {
    // Sudah pernah disalin? Jangan copy lagi — harus edit nama dulu.
    if (copiedIds.has(guestId)) {
      toast({
        title: "Sudah disalin",
        description: `Pesan "${guestName}" sudah disalin. Edit nama dulu buat salin ulang.`,
      });
      return;
    }

    let success = false;
    try {
      await navigator.clipboard.writeText(text);
      success = true;
    } catch {
      // clipboard may be blocked; still toggle UI
    }

    // Brief "OK" state on the button
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);

    // Persistent "copied" badge — counter auto ngikutin copiedIds.size
    setCopiedIds((prev) => {
      const next = new Set(prev);
      next.add(guestId);
      return next;
    });

    // Toast notification — count = jumlah tamu yang statusnya "sudah disalin"
    toast({
      title: success ? "Pesan disalin" : "Gagal menyalin",
      description: success
        ? `${copiedIds.size + 1} pesan telah disalin — "${guestName}"`
        : "Clipboard diblokir browser. Coba klik kotak teks lalu Ctrl+C.",
    });
  };

  // Preview jumlah nama yang akan ditambahkan
  const previewCount = parseBulk(bulkText).length;

  return (
    <main className="min-h-[100dvh] w-full bg-stone-100 px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="font-wedding text-[2.2rem] leading-none text-[#740404] sm:text-[2.6rem]">
            Kelola Tamu Undangan
          </h1>
          <p className="font-script mt-2 text-[0.85rem] text-[#3a3424] sm:text-[0.95rem]">
            Meilany &amp; Fadhil — The Wedding
          </p>
          <a
            href={origin + "/"}
            className="font-latin mt-3 inline-flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.2em] text-[#544c39] hover:text-[#740404]"
          >
            <ExternalLink className="size-3" />
            Lihat Undangan
          </a>
        </motion.div>

        {/* Bulk add form — single column */}
        <motion.form
          onSubmit={handleBulkAdd}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 rounded-3xl bg-[#f4f4ec] p-5 shadow-[0_18px_45px_-15px_rgba(76,58,40,0.35)] sm:p-6"
        >
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-serif-display text-[1rem] font-medium text-[#3a3424]">
              Tambah Tamu
            </h2>
            {importing && (
              <span className="inline-flex items-center gap-1.5 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-[#740404]">
                <Loader2 className="size-3.5 animate-spin" />
                Mengimpor…
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.vcf,.vcard,.xlsx,.xls"
              onChange={onFileInputChange}
              className="hidden"
            />
          </div>

          {/* Drag-drop zone untuk import */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => !importing && fileInputRef.current?.click()}
            className={
              "mb-3 cursor-pointer rounded-xl border-2 border-dashed px-3 py-3 text-center transition-colors " +
              (dragOver
                ? "border-[#740404] bg-[#740404]/5"
                : "border-[#544c39]/20 bg-white/40 hover:border-[#740404]/50 hover:bg-white/70")
            }
          >
            <p className="flex items-center justify-center gap-1.5 text-[0.68rem] text-[#544c39]">
              <FileDown className="size-3.5" />
              <span>
                Tarik &amp; lepas file di sini, atau klik{" "}
                <span className="font-medium text-[#740404] underline">
                  Import Kontak
                </span>
              </span>
            </p>
            <p className="mt-0.5 flex items-center justify-center gap-1.5 text-[0.6rem] text-[#544c39]/60">
              <FileType2 className="size-3" />
              Format: CSV, VCF (vCard), XLSX
            </p>
          </div>

          <p className="mb-3 text-[0.72rem] leading-relaxed text-[#544c39]">
            Ketik / paste nama tamu — <strong>satu nama per baris</strong>. Code
            otomatis dibuat dari nama. Atau pakai format{" "}
            <code className="rounded bg-[#740404]/10 px-1 py-0.5 text-[#740404]">
              code|nama
            </code>{" "}
            untuk code custom.
          </p>

          <textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder={
              "Contoh:\nBudi Santoso\nSiti Aminah\nkeluarga-besar|Keluarga Besar Wijaya"
            }
            rows={6}
            className="w-full resize-y rounded-xl border border-[#544c39]/20 bg-white/70 px-3 py-2.5 font-script text-[0.85rem] leading-relaxed text-[#3a3424] placeholder:text-[#544c39]/40 focus:border-[#740404]/50 focus:outline-none focus:ring-2 focus:ring-[#740404]/20"
          />

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-[0.72rem] text-[#544c39]">
              {previewCount > 0
                ? `${previewCount} nama siap ditambah`
                : "Belum ada nama"}
            </span>
            <button
              type="submit"
              disabled={submitting || previewCount === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#740404] px-6 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-white transition-colors hover:bg-[#5b0101] disabled:cursor-not-allowed disabled:opacity-50 sm:text-[0.72rem]"
            >
              {submitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Plus className="size-4" />
              )}
              Tambah Semua
            </button>
          </div>

          {/* Result feedback */}
          {result && (
            <div className="mt-4 rounded-xl border border-[#544c39]/15 bg-white/50 px-4 py-3">
              {result.added > 0 && (
                <p className="text-[0.8rem] font-medium text-green-700">
                  ✓ {result.added} tamu berhasil ditambahkan
                </p>
              )}
              {result.errors.length > 0 && (
                <ul className="mt-1.5 space-y-0.5">
                  {result.errors.slice(0, 5).map((err, i) => (
                    <li
                      key={i}
                      className="text-[0.72rem] leading-relaxed text-red-700"
                    >
                      • {err}
                    </li>
                  ))}
                  {result.errors.length > 5 && (
                    <li className="text-[0.72rem] text-red-700">
                      • ...dan {result.errors.length - 5} lainnya
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}

          {/* Import result feedback */}
          {importResult && (
            <div className="mt-4 rounded-xl border border-[#740404]/20 bg-[#740404]/5 px-4 py-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-[0.8rem] font-medium text-[#740404]">
                  <FileDown className="size-3.5" />
                  Import Kontak
                  {importResult.format && (
                    <span className="ml-1 rounded bg-[#740404]/15 px-1.5 py-0.5 font-latin text-[0.55rem] uppercase tracking-[0.14em]">
                      {importResult.format}
                    </span>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setImportResult(null)}
                  className="text-[#544c39]/50 hover:text-[#740404]"
                >
                  <X className="size-3.5" />
                </button>
              </div>
              {importResult.added > 0 && (
                <p className="text-[0.8rem] font-medium text-green-700">
                  ✓ {importResult.added} kontak berhasil diimport &amp;
                  ditambahkan ke daftar tamu
                </p>
              )}
              {importResult.errors.length > 0 && (
                <ul className="mt-1.5 space-y-0.5">
                  {importResult.errors.slice(0, 5).map((err, i) => (
                    <li
                      key={i}
                      className="text-[0.72rem] leading-relaxed text-red-700"
                    >
                      • {err}
                    </li>
                  ))}
                  {importResult.errors.length > 5 && (
                    <li className="text-[0.72rem] text-red-700">
                      • ...dan {importResult.errors.length - 5} lainnya
                    </li>
                  )}
                </ul>
              )}
            </div>
          )}
        </motion.form>

        {/* Guest list */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-3xl bg-[#f4f4ec] p-5 shadow-[0_18px_45px_-15px_rgba(76,58,40,0.35)] sm:p-6"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif-display text-[1rem] font-medium text-[#3a3424]">
              Daftar Tamu
            </h2>
            <div className="flex items-center gap-2">
              {/* Total copied counter badge — jumlah tamu yang statusnya "sudah disalin" */}
              {copyCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 font-latin text-[0.58rem] uppercase tracking-[0.14em] text-green-700 ring-1 ring-green-300">
                  <ClipboardCheck className="size-3" />
                  {copyCount} pesan disalin
                </span>
              )}
              <span className="font-latin text-[0.62rem] uppercase tracking-[0.2em] text-[#544c39]">
                {guests.length} tamu
              </span>
              {/* Remove all button */}
              {guests.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  disabled={removingAll}
                  aria-label="Hapus semua tamu"
                  title="Hapus semua tamu"
                  className="inline-flex h-7 items-center justify-center gap-1 rounded-full border border-red-300 px-2 text-[0.58rem] font-medium uppercase tracking-[0.12em] text-red-600 transition-colors hover:border-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {removingAll ? (
                    <Loader2 className="size-3 animate-spin" />
                  ) : (
                    <Trash className="size-3" />
                  )}
                  Hapus Semua
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8 text-[#544c39]/60">
              <Loader2 className="size-5 animate-spin" />
            </div>
          ) : fetchError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-[0.8rem] font-medium text-red-700">
                ⚠ {fetchError}
              </p>
              <button
                type="button"
                onClick={() => fetchGuests()}
                className="mt-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-red-700 underline hover:text-red-900"
              >
                Coba lagi
              </button>
            </div>
          ) : guests.length === 0 ? (
            <p className="py-8 text-center text-[0.85rem] text-[#544c39]/60">
              Belum ada tamu. Tambahkan di atas, import kontak, lalu klik{" "}
              <strong>Tambah Semua</strong>.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {guests.map((g, idx) => {
                const link = `${origin}/?to=${g.code}`;
                const message = buildWaMessage(g.name, link);
                const waKey = `wa-${g.id}`;
                const isPreviewOpen = previewOpen.has(g.id);
                const isEditing = editingId === g.id;
                return (
                  <div
                    key={g.id}
                    className="rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-[#544c39]/10"
                  >
                    {/* Row 1: number + name + buttons.
                        Mobile: stacked (name on top, buttons below).
                        Desktop (sm+): single row, buttons beside name. */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2 sm:min-w-0 sm:flex-1">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#544c39]/10 font-latin text-[0.7rem] font-medium text-[#544c39]">
                          {idx + 1}
                        </span>
                        <div className="flex min-w-0 flex-1 flex-col">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                saveEdit(g);
                              }
                              if (e.key === "Escape") cancelEdit();
                            }}
                            autoFocus
                            disabled={editSaving}
                            className="w-full rounded-md border border-[#740404]/40 bg-white px-2 py-1 font-serif-display text-[0.95rem] font-medium text-[#3a3424] focus:border-[#740404] focus:outline-none focus:ring-2 focus:ring-[#740404]/20"
                          />
                        ) : (
                          <span className="flex min-w-0 items-center gap-1.5">
                            <span className="truncate font-serif-display text-[0.95rem] font-medium text-[#3a3424]">
                              {g.name}
                            </span>
                            {copiedIds.has(g.id) && (
                              <BadgeCheck className="size-4 shrink-0 text-green-600" aria-label="Pesan sudah disalin" />
                            )}
                          </span>
                        )}
                        <span className="font-latin text-[0.6rem] uppercase tracking-[0.16em] text-[#544c39]/60">
                          /?to={g.code}
                        </span>
                      </div>
                      </div>

                      {/* Action buttons */}
                      {isEditing ? (
                        /* Save / Cancel saat edit mode */
                        <div className="flex items-center justify-end gap-1.5 sm:shrink-0">
                          <button
                            type="button"
                            onClick={() => saveEdit(g)}
                            disabled={editSaving || !editName.trim()}
                            aria-label="Simpan perubahan"
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-green-600 text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {editSaving ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Check className="size-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={editSaving}
                            aria-label="Batal edit"
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#544c39]/30 text-[#544c39] transition-colors hover:bg-[#544c39]/10 disabled:opacity-50"
                          >
                            <X className="size-4" />
                          </button>
                        </div>
                      ) : (
                        /* Tombol normal: Salin, Preview, Edit, Hapus */
                        <div className="flex items-center justify-end gap-1.5 sm:shrink-0">
                          {/* Salin Pesan WA — disabled (hijau) kalau udah disalin, enabled balik setelah nama di-edit */}
                          <button
                            type="button"
                            onClick={() => copyToClipboard(message, waKey, g.id, g.name)}
                            disabled={copiedIds.has(g.id)}
                            aria-label={
                              copiedIds.has(g.id)
                                ? `Pesan ${g.name} sudah disalin`
                                : `Salin pesan WhatsApp untuk ${g.name}`
                            }
                            title={
                              copiedIds.has(g.id)
                                ? "Sudah disalin. Edit nama buat salin ulang."
                                : "Salin pesan WhatsApp"
                            }
                            className={
                              "inline-flex h-9 items-center justify-center gap-1 rounded-full px-2.5 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-white transition-colors disabled:cursor-not-allowed sm:px-3 sm:text-[0.62rem] " +
                              (copiedIds.has(g.id)
                                ? "bg-green-600 hover:bg-green-600"
                                : "bg-[#740404] hover:bg-[#5b0101]")
                            }
                          >
                            {copiedKey === waKey ? (
                              <CheckCheck className="size-3.5 text-green-300" />
                            ) : copiedIds.has(g.id) ? (
                              <CheckCheck className="size-3.5" />
                            ) : (
                              <MessageCircle className="size-3.5" />
                            )}
                            {copiedKey === waKey ? "OK" : copiedIds.has(g.id) ? "Disalin" : "Salin"}
                          </button>
                          {/* Preview (hide/unhide teks pesan) */}
                          <button
                            type="button"
                            onClick={() => togglePreview(g.id)}
                            aria-label={
                              isPreviewOpen
                                ? `Sembunyikan preview pesan ${g.name}`
                                : `Tampilkan preview pesan ${g.name}`
                            }
                            aria-pressed={isPreviewOpen}
                            className={
                              "flex h-9 w-9 items-center justify-center rounded-full border transition-colors " +
                              (isPreviewOpen
                                ? "border-[#740404] bg-[#740404]/10 text-[#740404]"
                                : "border-[#544c39]/30 text-[#544c39] hover:border-[#740404] hover:text-[#740404]")
                            }
                          >
                            {isPreviewOpen ? (
                              <EyeOff className="size-4" />
                            ) : (
                              <Eye className="size-4" />
                            )}
                          </button>
                          {/* Edit nama */}
                          <button
                            type="button"
                            onClick={() => startEdit(g)}
                            aria-label={`Edit nama ${g.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#544c39]/30 text-[#544c39] transition-colors hover:border-[#740404] hover:bg-[#740404]/10 hover:text-[#740404]"
                          >
                            <Pencil className="size-4" />
                          </button>
                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(g.id)}
                            aria-label={`Hapus ${g.name}`}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-red-300 text-red-600 transition-colors hover:border-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Row 2: preview teks pesan — collapsible */}
                    <AnimatePresence initial={false}>
                      {isPreviewOpen && !isEditing && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <textarea
                            readOnly
                            value={message}
                            onClick={(e) => e.currentTarget.select()}
                            aria-label={`Pesan WhatsApp untuk ${g.name}`}
                            className="mt-2.5 w-full resize-y rounded-xl border border-[#544c39]/15 bg-stone-50/80 px-3 py-2 font-script text-[0.72rem] leading-relaxed text-[#3a3424] focus:border-[#740404]/40 focus:outline-none"
                            rows={6}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Help text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 text-center text-[0.7rem] leading-relaxed text-[#544c39]/70"
        >
          Klik <strong>Salin</strong> untuk copy pesan WhatsApp lengkap,{" "}
          <strong>Preview</strong> buat lihat/sembunyikan teks pesan,{" "}
          <strong>Edit</strong> buat ganti nama, atau <strong>Hapus</strong>{" "}
          buat hapus tamu. Import kontak dari file CSV / VCF / XLSX lewat tombol
          di atas.
        </motion.p>
      </div>

      {/* Confirmation dialog — Hapus Semua */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-[#f4f4ec] p-6 shadow-2xl"
            >
              <div className="mb-3 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="size-7 text-red-600" />
                </div>
              </div>
              <h3 className="font-serif-display mb-1.5 text-center text-[1.1rem] font-medium text-[#3a3424]">
                Hapus Semua Tamu?
              </h3>
              <p className="mb-5 text-center text-[0.8rem] leading-relaxed text-[#544c39]">
                {guests.length} tamu akan dihapus permanen. Aksi ini nggak bisa
                di-undo.
              </p>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  disabled={removingAll}
                  className="flex-1 rounded-xl border border-[#544c39]/25 bg-white/60 px-4 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-[#544c39] transition-colors hover:bg-white disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleRemoveAll}
                  disabled={removingAll}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.14em] text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {removingAll ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Hapus Semua
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
