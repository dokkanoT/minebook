// src/app/(dashboard)/_components/layout/SidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./navItems";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="メインメニュー">
      <ul className="space-y-1">
        {NAV_ITEMS.map(({ label, href }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-10 items-center rounded-sm px-3 text-sm transition-colors ${
                  active ? "bg-neutral-200 font-bold" : "text-neutral-800 hover:bg-neutral-100"
                }`}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}