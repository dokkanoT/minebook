// src/app/(dashboard)/_components/dashboard/QuickLinkCard.tsx
import Link from "next/link";
import { Badge } from "../ui/Badge";

type QuickLinkCardProps = {
  href: string;
  title: string;
  description: string;
  badge?: string;
};

export function QuickLinkCard({ href, title, description, badge }: QuickLinkCardProps) {
  return (
    <Link
      href={href}
      className="flex min-h-24 flex-col justify-between rounded-sm border border-neutral-300 bg-white p-4 transition-colors hover:bg-neutral-50"
    >
      <span className="flex items-start justify-between gap-2">
        <span className="text-sm font-bold">{title} →</span>
        {badge && <Badge variant="solid">{badge}</Badge>}
      </span>
      <span className="mt-3 text-xs text-neutral-600">{description}</span>
    </Link>
  );
}