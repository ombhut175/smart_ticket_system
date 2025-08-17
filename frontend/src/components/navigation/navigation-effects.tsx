"use client";

import type React from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigationStore, type Breadcrumb } from "@/stores/navigation-store";

const labelMap: Record<string, string> = {
  dashboard: "Dashboard",
  tickets: "Tickets",
  new: "New Ticket",
  moderator: "Moderator",
  admin: "Admin",
  users: "User Management",
  moderators: "Moderators",
  login: "Login",
  signup: "Sign Up",
  "forgot-password": "Forgot Password",
  analytics: "Analytics",
  settings: "Settings",
  profile: "Profile",
};

function generateBreadcrumbs(pathname: string): Breadcrumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Breadcrumb[] = [{ label: "Home", href: "/" }];
  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    const href = index === segments.length - 1 ? undefined : currentPath;
    crumbs.push({ label, href });
  });
  return crumbs;
}

export function NavigationEffects({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading, setIsLoading, setBreadcrumbs } = useNavigationStore((s) => ({
    isLoading: s.isLoading,
    setIsLoading: s.setIsLoading,
    setBreadcrumbs: s.setBreadcrumbs,
  }));

  // Update breadcrumbs when path changes
  useEffect(() => {
    setBreadcrumbs(generateBreadcrumbs(pathname));
  }, [pathname, setBreadcrumbs]);

  // Trigger page transition loading on path change
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname, setIsLoading]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            key="page-loader"
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-12 h-12 border-4 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">Loading...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}

