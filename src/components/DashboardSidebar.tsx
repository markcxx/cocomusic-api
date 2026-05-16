"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardSidebar() {
  const path = usePathname();

  return (
    <aside className="bg-surface-container-low dark:bg-inverse-surface border-r border-outline-variant dark:border-outline h-full w-64 left-0 hidden md:flex flex-col p-base gap-2 z-10 shrink-0">
      {/* Header */}
      <div className="px-3 py-4 mb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
            C
          </div>
          <div>
            <h2 className="font-title-md text-title-md font-black text-primary">Developer Console</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">cocomusic-api v1.0</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col gap-1">
        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 bg-secondary-container dark:bg-on-secondary-fixed-variant text-on-secondary-container dark:text-secondary-fixed font-semibold rounded-xl scale-95 transition-transform">
          <span className="material-symbols-outlined">dashboard</span>
          <span>Overview</span>
        </Link>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant dark:hover:bg-on-primary-fixed-variant rounded-xl transition-all">
          <span className="material-symbols-outlined">vpn_key</span>
          <span>API Keys</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant dark:hover:bg-on-primary-fixed-variant rounded-xl transition-all">
          <span className="material-symbols-outlined">bar_chart</span>
          <span>Usage</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant dark:hover:bg-on-primary-fixed-variant rounded-xl transition-all">
          <span className="material-symbols-outlined">api</span>
          <span>End points</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant dark:hover:bg-on-primary-fixed-variant rounded-xl transition-all">
          <span className="material-symbols-outlined">security</span>
          <span>Security</span>
        </a>
      </nav>

      {/* Footer Navigation */}
      <div className="mt-auto pt-4 border-t border-outline-variant dark:border-outline flex flex-col gap-1">
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant dark:hover:bg-on-primary-fixed-variant rounded-xl transition-all">
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant dark:text-outline-variant hover:bg-surface-variant dark:hover:bg-on-primary-fixed-variant rounded-xl transition-all">
          <span className="material-symbols-outlined">help_outline</span>
          <span>Support</span>
        </a>
      </div>
    </aside>
  );
}
