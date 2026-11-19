// src/app/(dashboard)/_components/history/ScanHistoryExplorer.tsx
"use client";

import { useMemo, useState } from "react";
import { ScanFilterPanel, type ScanStatusFilter } from "./ScanFilterPanel";
import { ScanTable, type ScanRecord } from "./ScanTable";

export function ScanHistoryExplorer({ records }: { records: ScanRecord[] }) {
  const [keyword, setKeyword] = useState("");
  const [date, setDate] = useState("all");
  const [status, setStatus] = useState<ScanStatusFilter>("all");

  const dateOptions = useMemo(
    () => Array.from(new Set(records.map((r) => r.scannedAt.slice(0, 10)))).sort().reverse(),
    [records],
  );

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return records
      .filter(
        (r) =>
          (q === "" || r.title.toLowerCase().includes(q) || r.shop.toLowerCase().includes(q)) &&
          (date === "all" || r.scannedAt.startsWith(date)) &&
          (status === "all" || r.status === status),
      )
      .sort((a, b) => b.scannedAt.localeCompare(a.scannedAt));
  }, [records, keyword, date, status]);

  const reset = () => {
    setKeyword("");
    setDate("all");
    setStatus("all");
  };

  return (
    <div className="mt-4 space-y-4">
      <ScanFilterPanel
        keyword={keyword}
        date={date}
        status={status}
        dateOptions={dateOptions}
        onKeywordChange={setKeyword}
        onDateChange={setDate}
        onStatusChange={setStatus}
        onReset={reset}
      />
      <ScanTable records={filtered} />
    </div>
  );
}