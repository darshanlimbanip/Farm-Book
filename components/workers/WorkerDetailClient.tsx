"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { TopBar } from "@/components/shared/TopBar";
import { BigNumberStat } from "@/components/shared/BigNumberStat";
import { AdvanceFormSheet } from "@/components/workers/AdvanceFormSheet";
import { WorkerFormSheet } from "@/components/workers/WorkerFormSheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus, Pencil } from "lucide-react";
import type { Advance, Farm, Worker } from "@/lib/types";

interface WorkerDetailClientProps {
  worker: Worker;
  farms: Farm[];
  assignedFarmIds: string[];
  advances: Advance[];
  settlement: {
    daysWorked: number;
    gross: number;
    advancesTotal: number;
    balanceDue: number;
  };
  year: number;
  month: number;
  ownerId: string;
}

export function WorkerDetailClient({
  worker,
  farms,
  assignedFarmIds,
  advances,
  settlement,
  year,
  month,
  ownerId,
}: WorkerDetailClientProps) {
  const t = useTranslations("workers");
  const tSettlement = useTranslations("settlement");
  const tAdvances = useTranslations("advances");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const prevMonth = () => {
    const m = month === 1 ? 12 : month - 1;
    const y = month === 1 ? year - 1 : year;
    return `/workers/${worker.id}?year=${y}&month=${m}`;
  };

  const nextMonth = () => {
    const m = month === 12 ? 1 : month + 1;
    const y = month === 12 ? year + 1 : year;
    return `/workers/${worker.id}?year=${y}&month=${m}`;
  };

  return (
    <>
      <TopBar
        title={worker.name}
        rightAction={
          <Button size="sm" variant="ghost" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            {tCommon("edit")}
          </Button>
        }
      />

      <div className="px-4 py-4 space-y-6">
        <div className="flex items-center justify-between">
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

        <Card className="border-secondary/40 bg-secondary/5">
          <CardContent className="p-6 text-center">
            <BigNumberStat
              label={tSettlement("balanceDue")}
              value={formatCurrency(settlement.balanceDue, locale)}
              variant="accent"
              className="items-center"
            />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <BigNumberStat
                label={tSettlement("daysWorked")}
                value={`${settlement.daysWorked}`}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <BigNumberStat
                label={tSettlement("grossWage")}
                value={formatCurrency(settlement.gross, locale)}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-4">
            <BigNumberStat
              label={tSettlement("totalAdvances")}
              value={formatCurrency(settlement.advancesTotal, locale)}
            />
          </CardContent>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold">{tAdvances("title")}</h2>
            <Button size="sm" onClick={() => setAdvanceOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("addAdvance")}
            </Button>
          </div>
          {advances.length === 0 ? (
            <p className="text-muted text-sm">{tAdvances("emptyDescription")}</p>
          ) : (
            advances.map((adv) => (
              <Card key={adv.id} className="mb-2">
                <CardContent className="flex justify-between p-4">
                  <div>
                    <p className="font-medium">
                      {formatCurrency(Number(adv.amount), locale)}
                    </p>
                    <p className="text-sm text-muted">
                      {formatDate(adv.date, locale)}
                    </p>
                    {adv.note && (
                      <p className="text-xs text-muted mt-1">{adv.note}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <AdvanceFormSheet
        open={advanceOpen}
        onClose={() => setAdvanceOpen(false)}
        workerId={worker.id}
      />

      <WorkerFormSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        worker={worker}
        farms={farms}
        assignedFarmIds={assignedFarmIds}
        ownerId={ownerId}
      />
    </>
  );
}
