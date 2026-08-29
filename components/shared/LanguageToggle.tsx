"use client";

import { useLocale, useTranslations } from "next-intl";
import { updateOwnerLanguage } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/types";

export function LanguageToggle() {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");

  const switchLocale = async (newLocale: Locale) => {
    if (newLocale === locale) return;
    await updateOwnerLanguage(newLocale);
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-1 text-sm font-medium">
      <button
        onClick={() => switchLocale("gu")}
        className={cn(
          "min-h-10 px-2 rounded-md transition-colors",
          locale === "gu"
            ? "text-primary font-bold"
            : "text-muted hover:text-foreground"
        )}
      >
        {t("languageGu")}
      </button>
      <span className="text-muted">|</span>
      <button
        onClick={() => switchLocale("en")}
        className={cn(
          "min-h-10 px-2 rounded-md transition-colors",
          locale === "en"
            ? "text-primary font-bold"
            : "text-muted hover:text-foreground"
        )}
      >
        {t("languageEn")}
      </button>
    </div>
  );
}
