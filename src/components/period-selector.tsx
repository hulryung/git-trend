"use client";

import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const periods = [
  { value: "daily", label: "Today" },
  { value: "weekly", label: "This Week" },
  { value: "monthly", label: "This Month" },
] as const;

interface PeriodSelectorProps {
  current: string;
}

export function PeriodSelector({ current }: PeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Tabs
      value={current}
      onValueChange={(value) => {
        const params = new URLSearchParams(window.location.search);
        params.set("period", value);
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <TabsList>
        {periods.map((p) => (
          <TabsTrigger key={p.value} value={p.value}>
            {p.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
