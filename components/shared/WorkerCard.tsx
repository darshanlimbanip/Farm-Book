"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { getInitials } from "@/lib/utils";
import type { AttendanceStatus } from "@/lib/types";
import { Check, X, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkerCardProps {
  id: string;
  name: string;
  dailyWage: number;
  photoUrl?: string | null;
  farmNames?: string[];
  attendanceStatus?: AttendanceStatus | null;
  isActive?: boolean;
}

export function WorkerCard({
  id,
  name,
  dailyWage,
  photoUrl,
  farmNames,
  attendanceStatus,
  isActive = true,
}: WorkerCardProps) {
  const locale = useLocale();
  const t = useTranslations("attendance");
  const tWorkers = useTranslations("workers");

  const statusConfig = {
    present: { label: t("present"), color: "bg-success/10 text-success", icon: Check },
    absent: { label: t("absent"), color: "bg-danger/10 text-danger", icon: X },
    half_day: { label: t("halfDay"), color: "bg-secondary/20 text-secondary-foreground", icon: Minus },
  };

  return (
    <Link href={`/workers/${id}`}>
      <Card className={cn("mb-3", !isActive && "opacity-60")}>
        <CardContent className="flex items-center gap-3 p-4">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={name}
              width={48}
              height={48}
              className="rounded-full object-cover w-12 h-12"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
              {getInitials(name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground truncate">{name}</p>
            <p className="text-sm text-muted">
              {formatCurrency(dailyWage, locale)} / {tWorkers("dailyWage").toLowerCase()}
            </p>
            {farmNames && farmNames.length > 0 && (
              <p className="text-xs text-muted truncate">{farmNames.join(", ")}</p>
            )}
          </div>
          {attendanceStatus && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1",
                statusConfig[attendanceStatus].color
              )}
            >
              {(() => {
                const Icon = statusConfig[attendanceStatus].icon;
                return <Icon className="h-3 w-3" />;
              })()}
              {statusConfig[attendanceStatus].label}
            </span>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
