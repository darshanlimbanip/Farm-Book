"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, CalendarCheck, Users, IndianRupee } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, labelKey: "home" as const },
  { href: "/attendance", icon: CalendarCheck, labelKey: "attendance" as const },
  { href: "/workers", icon: Users, labelKey: "workers" as const },
  { href: "/expenses", icon: IndianRupee, labelKey: "expenses" as const },
];

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border safe-area-pb">
      <div className="flex items-stretch justify-around max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, labelKey }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-3 min-h-[56px] min-w-[72px] flex-1 transition-colors",
                isActive ? "text-primary" : "text-muted"
              )}
            >
              <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-xs font-medium">{t(labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
