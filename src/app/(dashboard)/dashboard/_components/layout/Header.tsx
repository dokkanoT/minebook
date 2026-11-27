"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, BookOpen, CircleUserRound, Menu, Settings, X } from "lucide-react";
import { SidebarNav } from "./SidebarNav";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    menuRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !menuRef.current) return;

      const focusable = Array.from(
        menuRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-neutral-200 bg-white/95 px-3 backdrop-blur sm:gap-4 sm:px-5">
        <button
          ref={triggerRef}
          type="button"
          aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          aria-expanded={menuOpen}
          aria-controls={menuOpen ? "dashboard-navigation-drawer" : undefined}
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20"
        >
          {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>

      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="メニューを閉じる"
            onClick={closeMenu}
            className="absolute inset-0 h-full w-full cursor-default bg-neutral-950/35 backdrop-blur-[1px]"
          />
          <aside
            id="dashboard-navigation-drawer"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="メインメニュー"
            className="absolute inset-y-0 left-0 flex w-[min(19rem,88vw)] flex-col overflow-y-auto border-r border-neutral-200 bg-white p-5 shadow-2xl shadow-neutral-950/15"
          >
            <div className="mb-7 flex items-center justify-between">
              <Link href="/dashboard" onClick={closeMenu} className="inline-flex items-center gap-2 rounded-md text-neutral-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20">
                <BookOpen className="h-5 w-5" aria-hidden />
                <span className="text-lg font-bold tracking-tight">MineBook</span>
              </Link>
              <button
                type="button"
                onClick={closeMenu}
                aria-label="メニューを閉じる"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <p className="mb-3 px-3 text-xs font-semibold tracking-wide text-neutral-500">ライブラリ管理</p>
            <SidebarNav onNavigate={closeMenu} />
            <section className="mt-5 border-t border-neutral-200 pt-5" aria-labelledby="menu-settings-heading">
              <h2 id="menu-settings-heading" className="mb-2 px-3 text-xs font-semibold tracking-wide text-neutral-500">設定</h2>
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/settings"
                    onClick={closeMenu}
                    aria-current={pathname === "/settings" ? "page" : undefined}
                    className={`flex h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 ${pathname === "/settings" ? "bg-neutral-900 font-semibold text-white" : "text-neutral-700 hover:bg-neutral-100"}`}
                  >
                    <Settings className="h-4 w-4" aria-hidden />
                    設定
                  </Link>
                </li>
                <li>
                  <button type="button" className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20">
                    <Bell className="h-4 w-4" aria-hidden />
                    通知
                  </button>
                </li>
                <li>
                  <button type="button" className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20">
                    <CircleUserRound className="h-4 w-4" aria-hidden />
                    マイアカウント
                  </button>
                </li>
              </ul>
            </section>
          </aside>
        </div>
      )}
    </>
  );
}
