// src/app/(dashboard)/_components/ui/ArrowLink.tsx
import Link from "next/link";
import type { ReactNode } from "react";

type ArrowLinkProps = {
  href: string;
  children: ReactNode;
};

export function ArrowLink({ href, children }: ArrowLinkProps) {
  return (
    <Link
      href={href}
      className="text-xs font-medium underline underline-offset-4 hover:text-neutral-600"
    >
      {children} →
    </Link>
  );
}