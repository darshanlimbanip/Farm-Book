"use client";

import { useTranslations } from "next-intl";
import { LanguageToggle } from "./LanguageToggle";
import { useOfflineStore } from "@/lib/offline/store";
import { cn } from "@/lib/utils";

interface TopBarProps {
  title: string;
  rightAction?: React.ReactNode;
}

export function TopBar({ title, rightAction }: TopBarProps) {
  const t = useTranslations("common");
  const { isOnline, isSyncing, queueCount } = useOfflineStore();

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      {!isOnline && (
        <div className="bg-secondary/20 text-secondary-foreground text-center text-sm py-1.5 px-4 font-medium">
          {t("offline")}
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-3 min-h-14">
        <h1 className="text-xl font-bold text-foreground truncate flex-1">
          {title}
        </h1>
        <div className="flex items-center gap-2">
          {(isSyncing || queueCount > 0) && (
            <div
              className={cn(
                "w-2.5 h-2.5 rounded-full",
                isSyncing ? "bg-secondary animate-pulse" : "bg-secondary"
              )}
              title={isSyncing ? t("syncing") : t("offline")}
            />
          )}
          {rightAction}
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
