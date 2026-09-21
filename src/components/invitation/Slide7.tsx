"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Send } from "lucide-react";
import { useInvitation } from "@/lib/invitation-store";

const BG_IMAGE =
  "https://the.invisimple.id/wp-content/uploads/2026/03/BG-ALL-PAGE-TEMA-2-.jpg";

type Attendance = "hadir" | "tidak" | "ragu";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Slide7() {
  const goTo = useInvitation((s) => s.goTo);

  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<Attendance>("hadir");
  const [count, setCount] = useState(1);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // ── Wishes list (existing RSVP submissions from other guests) ──
  type Wish = {
    id: string;
    name: string;
    attendance: string;
    count: number;
    message: string | null;
    createdAt: string;
  };
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [wishesLoading, setWishesLoading] = useState(false);

  const fetchWishes = async () => {
    setWishesLoading(true);
    try {
      const res = await fetch("/api/rsvp", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data?.ok && Array.isArray(data.rows)) {
        setWishes(data.rows);
      }
    } catch {
      // silent — wishes are a nice-to-have, not critical
    } finally {
      setWishesLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, attendance, count, message }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data?.error || "Gagal mengirim");
      }
      setStatus("success");
      // refresh wishes list so the new submission appears
      fetchWishes();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Gagal mengirim");
    }
  };

  return (
    <main className="relative flex min-h-[100dvh] w-full flex-col items-center overflow-hidden bg-stone-100">
      <motion.img
        src={BG_IMAGE}
        alt="Latar RSVP"
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="h-full w-full object-cover"
        style={{ position: "fixed", inset: 0, zIndex: 0 }}
        loading="eager"
      />
      {/* Bg solid overlay putih (60% opacity, no blur) — di slide 7 aja.
          position: absolute supaya scoped ke slide 7, nggak bocor ke slide lain. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-white/60"
      />
      <button
        type="button"
        onClick={() => goTo("cover")}
        aria-label="Kembali ke cover"
        className="group absolute left-4 top-6 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#544c39]/40 bg-white/60 text-[#544c39] backdrop-blur-sm transition-colors hover:border-[#544c39] hover:bg-white hover:text-[#3a3424] sm:left-8 sm:top-8"
      >
        <svg className="size-4 transition-transform group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex w-full max-w-[24rem] flex-col items-center px-6 py-20"
      >
        <motion.h2
          variants={item}
          className="font-wedding text-[2.6rem] leading-none text-[#5b0101] sm:text-[3.2rem]"
        >
          RSVP
        </motion.h2>

        <span
          aria-hidden
          className="my-5 h-px w-24 bg-gradient-to-r from-transparent via-[#544c39]/40 to-transparent"
        />

        <motion.p
          variants={item}
          className="font-script mb-6 text-center text-[0.82rem] leading-relaxed text-[#5b0101] sm:text-[0.9rem]"
        >
          Konfirmasi kehadiran Anda agar kami dapat mempersiapkan acara dengan
          sebaik-baiknya.
        </motion.p>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex w-full flex-col items-center rounded-3xl bg-[#f4f4ec] px-6 py-10 text-center shadow-[0_22px_50px_-18px_rgba(60,45,25,0.4)]"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#544c39] shadow-sm">
                <Check className="size-7" />
              </div>
              <p className="font-wedding text-[1.8rem] text-[#544c39]">Terima Kasih</p>
              <p className="font-script mt-2 text-[0.82rem] text-[#3a3424] sm:text-[0.9rem]">
                Konfirmasi kehadiran Anda telah kami terima.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setName("");
                  setMessage("");
                  setCount(1);
                  setAttendance("hadir");
                }}
                className="mt-6 inline-flex h-10 items-center justify-center rounded-full border border-[#544c39]/40 bg-white/60 px-5 text-[0.62rem] font-medium uppercase tracking-[0.24em] text-[#544c39] transition-colors hover:border-[#544c39] hover:bg-white hover:text-[#3a3424] sm:text-[0.68rem]"
              >
                Kirim lagi
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              variants={item}
              initial="hidden"
              animate="show"
              onSubmit={handleSubmit}
              className="flex w-full flex-col gap-4 rounded-3xl bg-[#f4f4ec] px-6 py-7 shadow-[0_22px_50px_-18px_rgba(60,45,25,0.4)]"
            >
              <label className="flex flex-col gap-1.5">
                <span className="font-latin text-[0.62rem] font-medium uppercase tracking-[0.24em] text-[#544c39]">
                  Nama
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Anda"
                  required
                  className="h-10 rounded-xl border border-[#544c39]/20 bg-white/70 px-3 font-script text-[0.9rem] text-[#3a3424] placeholder:text-[#544c39]/40 focus:border-[#544c39]/50 focus:outline-none focus:ring-2 focus:ring-[#544c39]/20"
                />
              </label>

              <fieldset className="flex flex-col gap-1.5">
                <legend className="font-latin text-[0.62rem] font-medium uppercase tracking-[0.24em] text-[#544c39]">
                  Kehadiran
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { v: "hadir", label: "Hadir" },
                    { v: "ragu", label: "Ragu" },
                    { v: "tidak", label: "Tidak Hadir" },
                  ] as { v: Attendance; label: string }[]).map((opt) => (
                    <button
                      key={opt.v}
                      type="button"
                      onClick={() => setAttendance(opt.v)}
                      className={`h-10 rounded-xl border text-[0.62rem] font-medium uppercase tracking-[0.16em] transition-colors ${
                        attendance === opt.v
                          ? "border-[#544c39] bg-[#544c39] text-white"
                          : "border-[#544c39]/25 bg-white/60 text-[#544c39] hover:border-[#544c39]/50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <label className="flex flex-col gap-1.5">
                <span className="font-latin text-[0.62rem] font-medium uppercase tracking-[0.24em] text-[#544c39]">
                  Jumlah Hadir
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCount((c) => Math.max(1, c - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#544c39]/25 bg-white/60 text-[#544c39] transition-colors hover:border-[#544c39]/50"
                    aria-label="Kurangi"
                  >
                    −
                  </button>
                  <span className="font-serif-display min-w-[2rem] text-center text-[1.2rem] font-medium text-[#3a3424]">
                    {count}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCount((c) => Math.min(20, c + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#544c39]/25 bg-white/60 text-[#544c39] transition-colors hover:border-[#544c39]/50"
                    aria-label="Tambah"
                  >
                    +
                  </button>
                </div>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="font-latin text-[0.62rem] font-medium uppercase tracking-[0.24em] text-[#544c39]">
                  Ucapan &amp; Doa
                </span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan ucapan dan doa restu Anda..."
                  rows={3}
                  className="resize-none rounded-xl border border-[#544c39]/20 bg-white/70 px-3 py-2 font-script text-[0.85rem] leading-relaxed text-[#3a3424] placeholder:text-[#544c39]/40 focus:border-[#544c39]/50 focus:outline-none focus:ring-2 focus:ring-[#544c39]/20"
                />
              </label>

              {status === "error" && (
                <p className="font-script text-center text-[0.78rem] text-red-700">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading" || !name.trim()}
                className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#544c39] px-6 text-[0.66rem] font-medium uppercase tracking-[0.24em] text-white transition-colors hover:bg-[#3a3424] disabled:cursor-not-allowed disabled:opacity-50 sm:text-[0.72rem]"
              >
                {status === "loading" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                <span>Kirim Konfirmasi</span>
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* ── Ucapan & doa dari tamu (existing RSVP submissions) ── */}
        <motion.div
          variants={item}
          className="mt-10 flex w-full flex-col items-center"
        >
          <h3 className="font-latin text-[0.72rem] font-medium uppercase tracking-[0.28em] text-[#5b0101] sm:text-[0.78rem]">
            Ucapan &amp; Doa
          </h3>
          <span
            aria-hidden
            className="my-4 h-px w-24 bg-gradient-to-r from-transparent via-[#544c39]/40 to-transparent"
          />

          {wishesLoading && wishes.length === 0 ? (
            <div className="flex w-full items-center justify-center py-6 text-[#544c39]/60">
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : wishes.length === 0 ? (
            <p className="font-script py-4 text-center text-[0.8rem] text-[#5b0101]/70 sm:text-[0.88rem]">
              Belum ada ucapan. Jadilah yang pertama mengirim doa restu.
            </p>
          ) : (
            <div className="flex max-h-80 w-full flex-col gap-3 overflow-y-auto pr-1 no-scrollbar">
              {wishes.map((w) => {
                const attLabel =
                  w.attendance === "hadir"
                    ? "Hadir"
                    : w.attendance === "tidak"
                    ? "Tidak Hadir"
                    : "Ragu";
                return (
                  <div
                    key={w.id}
                    className="rounded-2xl bg-[#f4f4ec] px-4 py-3.5 shadow-[0_8px_20px_-12px_rgba(60,45,25,0.4)] ring-1 ring-[#544c39]/10"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-serif-display text-[0.9rem] font-medium text-[#3a3424]">
                        {w.name}
                      </span>
                      <span className="font-latin rounded-full bg-[#544c39]/10 px-2.5 py-0.5 text-[0.55rem] font-medium uppercase tracking-[0.16em] text-[#544c39]">
                        {attLabel}
                        {w.count > 1 ? ` · ${w.count} org` : ""}
                      </span>
                    </div>
                    {w.message && (
                      <p className="font-script mt-1.5 text-[0.8rem] leading-relaxed text-[#3a3424]">
                        {w.message}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>
    </main>
  );
}
