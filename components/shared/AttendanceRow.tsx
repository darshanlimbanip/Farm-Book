"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Check, X, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { AttendanceStatus } from "@/lib/types";

interface AttendanceRowProps {
  workerId: string;
  name: string;
  photoUrl?: string | null;
  currentStatus: AttendanceStatus | null;
  onStatusChange: (status: AttendanceStatus) => void;
  disabled?: boolean;
}

export function AttendanceRow({
  name,
  photoUrl,
  currentStatus,
  onStatusChange,
  disabled,
}: AttendanceRowProps) {
  const t = useTranslations("attendance");

  const buttons: {
    status: AttendanceStatus;
    label: string;
    icon: typeof Check;
    variant: "success" | "secondary" | "destructive";
  }[] = [
    { status: "present", label: t("present"), icon: Check, variant: "success" },
    { status: "half_day", label: t("halfDay"), icon: Minus, variant: "secondary" },
    { status: "absent", label: t("absent"), icon: X, variant: "destructive" },
  ];

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt={name}
            width={40}
            height={40}
            className="rounded-full object-cover w-10 h-10 shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
            {getInitials(name)}
          </div>
        )}
        <span className="font-medium text-foreground truncate">{name}</span>
      </div>
      <div className="flex gap-1.5 shrink-0">
        {buttons.map(({ status, label, icon: Icon, variant }) => (
          <Button
            key={status}
            size="pill"
            variant={currentStatus === status ? variant : "outline"}
            className={cn(
              "text-xs px-3 h-10 min-w-0",
              currentStatus === status && status === "present" && "bg-success text-white",
              currentStatus === status && status === "half_day" && "bg-secondary text-secondary-foreground",
              currentStatus === status && status === "absent" && "bg-danger text-white"
            )}
            onClick={() => onStatusChange(status)}
            disabled={disabled}
            aria-label={label}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
