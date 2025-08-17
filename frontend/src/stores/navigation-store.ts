"use client";

import { create } from "zustand";

export type Breadcrumb = { label: string; href?: string };

interface NavigationState {
  isLoading: boolean;
  breadcrumbs: Breadcrumb[];
  setIsLoading: (loading: boolean) => void;
  setBreadcrumbs: (crumbs: Breadcrumb[]) => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  isLoading: false,
  breadcrumbs: [],
  setIsLoading: (isLoading) => set({ isLoading }),
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
}));

