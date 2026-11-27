// src/app/(dashboard)/_components/layout/SidebarNav.tsx
"use client";

import Link from "next/link";
import {
  BookOpen,
  ChartNoAxesCombined,
  History,
  LayoutDashboard,
  Library,
  Settings,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./navItems";

const NAV_ICONS: Record<(typeof NAV_ITEMS)[number]["href"], LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/dashboard/bookshelf": BookOpen,
  "/dashboard/collection": Library,
  "/dashboard/ranking": Trophy,
  "/dashboard/history": History,
  "/dashboard/analysis": ChartNoAxesCombined,
  "/settings": Settings,
};

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="メインメニュー">
      <ul className="space-y-1">
        {NAV_ITEMS.filter(({ href }) => href !== "/settings").map(({ label, href }) => {
          const active =
            href === "/dashboard"
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
          const Icon = NAV_ICONS[href];
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                onClick={onNavigate}
                className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 ${
                  active ? "bg-neutral-900 font-semibold text-white" : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
