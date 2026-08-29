"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { TopBar } from "@/components/shared/TopBar";
import { BigNumberStat } from "@/components/shared/BigNumberStat";
import { EmptyState } from "@/components/shared/EmptyState";
import { IncomeFormSheet } from "@/components/income/IncomeFormSheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteIncome } from "@/lib/actions/income";
import { enqueueOfflineAction } from "@/lib/offline/db";
import { useOfflineStore } from "@/lib/offline/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import type { Farm, Income } from "@/lib/types";

type IncomeWithFarm = Income & { farms?: { name: string } | null };

interface IncomeClientProps {
  income: IncomeWithFarm[];
  farms: Farm[];
  monthTotal: number;
  ownerId: string;
}

export function IncomeClient({
  income,
  farms,
  monthTotal,
  ownerId,
}: IncomeClientProps) {
  const t = useTranslations("income");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { isOnline } = useOfflineStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!isOnline) {
      await enqueueOfflineAction({
        id: crypto.randomUUID(),
        type: "income",
        action: "delete",
        payload: { id },
      });
    } else {
      await deleteIncome(id);
    }
    setDeleteId(null);
    router.refresh();
  };

  return (
    <>
      <TopBar
        title={t("title")}
        rightAction={
          <Button size="sm" onClick={() => setSheetOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("addIncome")}
          </Button>
        }
      />

      <div className="px-4 py-4">
        <Card className="mb-6">
          <CardContent className="p-4">
            <BigNumberStat
              label={t("monthTotal")}
              value={formatCurrency(monthTotal, locale)}
              variant="success"
            />
          </CardContent>
        </Card>

        {income.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            action={
              <Button onClick={() => setSheetOpen(true)}>
                <Plus className="h-4 w-4" />
                {t("addIncome")}
              </Button>
            }
          />
        ) : (
          income.map((item) => (
            <Card key={item.id} className="mb-3">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-bold">
                      {formatCurrency(Number(item.amount), locale)}
                    </p>
                    <p className="text-sm text-muted">{item.source_text}</p>
                    <p className="text-xs text-muted">
                      {formatDate(item.date, locale)}
                      {item.farms?.name && ` · ${item.farms.name}`}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteId(item.id)}
                  >
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
                {deleteId === item.id && (
                  <div className="mt-3 p-3 bg-danger/5 rounded-lg">
                    <p className="text-sm mb-2">{t("deleteConfirm")}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteId(null)}
                      >
                        {tCommon("no")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        {tCommon("yes")}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <IncomeFormSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        farms={farms}
        ownerId={ownerId}
      />
    </>
  );
}
