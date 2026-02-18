"use client";

import { useRouter, usePathname } from "next/navigation";

const languages = [
  "All",
  "TypeScript",
  "JavaScript",
  "Python",
  "Rust",
  "Go",
  "Java",
  "C++",
  "C",
  "Ruby",
  "Swift",
  "Kotlin",
  "PHP",
  "Shell",
  "Zig",
];

interface LanguageFilterProps {
  current: string;
}

export function LanguageFilter({ current }: LanguageFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleChange(lang: string) {
    const params = new URLSearchParams(window.location.search);
    if (lang === "All") {
      params.delete("language");
    } else {
      params.set("language", lang);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => handleChange(lang)}
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            (lang === "All" && !current) || current === lang
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          }`}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
