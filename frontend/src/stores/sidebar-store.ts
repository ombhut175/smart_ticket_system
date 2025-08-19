"use client";

import { create } from "zustand";

export type SidebarStateType = "expanded" | "collapsed";

interface SidebarState {
  state: SidebarStateType;
  open: boolean;
  openMobile: boolean;
  isMobile: boolean;
  setOpen: (open: boolean | ((o: boolean) => boolean)) => void;
  setOpenMobile: (open: boolean | ((o: boolean) => boolean)) => void;
  setIsMobile: (isMobile: boolean) => void;
  toggleSidebar: () => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  state: "expanded",
  open: true,
  openMobile: false,
  isMobile: false,
  setOpen: (value) =>
    set((s) => {
      const open = typeof value === "function" ? value(s.open) : value;
      return { open, state: open ? "expanded" : "collapsed" };
    }),
  setOpenMobile: (value) =>
    set((s) => ({ openMobile: typeof value === "function" ? value(s.openMobile) : value })),
  setIsMobile: (isMobile) => set({ isMobile }),
  toggleSidebar: () => {
    const { isMobile, setOpen, setOpenMobile } = get();
    if (isMobile) {
      setOpenMobile((o) => !o);
    } else {
      setOpen((o) => !o);
    }
  },
}));

