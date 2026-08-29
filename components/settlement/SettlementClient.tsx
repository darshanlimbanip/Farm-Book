"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { TopBar } from "@/components/shared/TopBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { SettlementSummary } from "@/lib/types";

interface SettlementClientProps {
  summaries: SettlementSummary[];
  year: number;
  month: number;
}

export function SettlementClient({
  summaries,
  year,
  month,
}: SettlementClientProps) {
  const t = useTranslations("settlement");
  const locale = useLocale();

  const prevMonth = () => {
    const m = month === 1 ? 12 : month - 1;
    const y = month === 1 ? year - 1 : year;
    return `/settlement?year=${y}&month=${m}`;
  };

  const nextMonth = () => {
    const m = month === 12 ? 1 : month + 1;
    const y = month === 12 ? year + 1 : year;
    return `/settlement?year=${y}&month=${m}`;
  };

  return (
    <>
      <TopBar title={t("summaryTitle")} />

      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <Link href={prevMonth()}>
            <Button variant="outline" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <span className="font-medium">
            {String(month).padStart(2, "0")}-{year}
          </span>
          <Link href={nextMonth()}>
            <Button variant="outline" size="icon">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {summaries.length === 0 ? (
          <p className="text-muted text-center py-8">{t("noWorkers")}</p>
        ) : (
          summaries.map((s) => (
            <Link key={s.workerId} href={`/workers/${s.workerId}?year=${year}&month=${month}`}>
              <Card className="mb-3">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-bold">{s.workerName}</p>
                    <p className="text-sm text-muted">
                      {s.daysWorked} {t("daysWorked").toLowerCase()}
                    </p>
                  </div>
                  <p
                    className={`text-xl font-bold ${
                      s.balanceDue > 0 ? "text-secondary" : "text-success"
                    }`}
                  >
                    {formatCurrency(s.balanceDue, locale)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
