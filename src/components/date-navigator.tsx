"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DateNavigatorProps {
  currentDate: string;
  dates: string[];
}

export function DateNavigator({ currentDate, dates }: DateNavigatorProps) {
  const router = useRouter();
  const pathname = usePathname();

  const currentIndex = dates.indexOf(currentDate);
  const totalPages = dates.length;
  const currentPage = currentIndex + 1;

  const hasPrev = currentIndex < dates.length - 1;
  const hasNext = currentIndex > 0;

  function navigate(date: string) {
    const params = new URLSearchParams(window.location.search);
    params.set("date", date);
    router.push(`${pathname}?${params.toString()}`);
  }

  function goToToday() {
    const params = new URLSearchParams(window.location.search);
    params.delete("date");
    router.push(`${pathname}?${params.toString()}`);
  }

  const formatted = formatDate(currentDate);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="font-semibold text-lg">{formatted}</span>
        {currentIndex !== 0 && (
          <Button variant="ghost" size="xs" onClick={goToToday}>
            Today
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => navigate(dates[currentIndex + 1])}
          disabled={!hasPrev}
          aria-label="Previous date"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm text-muted-foreground tabular-nums min-w-[80px] text-center">
          {currentPage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => navigate(dates[currentIndex - 1])}
          disabled={!hasNext}
          aria-label="Next date"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[date.getDay()];
  return `${year}년 ${Number(month)}월 ${Number(day)}일 (${weekday})`;
}
