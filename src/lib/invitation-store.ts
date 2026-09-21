import { create } from "zustand";

export type SlideId = "cover" | "slide-2" | "slide-3" | "slide-4" | "slide-5";

interface InvitationState {
  /** slide yang sedang aktif / tampil */
  current: SlideId;
  /** apakah undangan sudah dibuka (lewat tombol "Buka Undangan") */
  opened: boolean;
  /** apakah music sedang play */
  musicPlaying: boolean;
  /** pindah ke slide tertentu */
  goTo: (slide: SlideId) => void;
  /** buka undangan — menandai opened, pindah ke slide berikutnya, start music */
  openInvitation: () => void;
  /** toggle music play/pause */
  toggleMusic: () => void;
  /** set music playing state (dipanggil dari audio element onPlay/onPause) */
  setMusicPlaying: (v: boolean) => void;
}

export const useInvitation = create<InvitationState>((set) => ({
  current: "cover",
  opened: false,
  musicPlaying: false,
  goTo: (slide) => set({ current: slide }),
  openInvitation: () =>
    set((state) => ({
      opened: true,
      current: state.current === "cover" ? "slide-2" : state.current,
      // start music when the invitation is opened (autoplay on user gesture)
      musicPlaying: true,
    })),
  toggleMusic: () => set((s) => ({ musicPlaying: !s.musicPlaying })),
  setMusicPlaying: (v) => set({ musicPlaying: v }),
}));
