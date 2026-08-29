"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { TopBar } from "@/components/shared/TopBar";
import { BigNumberStat } from "@/components/shared/BigNumberStat";
import { EmptyState } from "@/components/shared/EmptyState";
import { ExpenseFormSheet } from "@/components/expenses/ExpenseFormSheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { deleteExpense } from "@/lib/actions/expenses";
import { enqueueOfflineAction } from "@/lib/offline/db";
import { useOfflineStore } from "@/lib/offline/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import type { Expense, Farm } from "@/lib/types";

type ExpenseWithFarm = Expense & { farms?: { name: string } | null };

interface ExpensesClientProps {
  expenses: ExpenseWithFarm[];
  farms: Farm[];
  monthTotal: number;
  ownerId: string;
}

export function ExpensesClient({
  expenses,
  farms,
  monthTotal,
  ownerId,
}: ExpensesClientProps) {
  const t = useTranslations("expenses");
  const tCommon = useTranslations("common");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const { isOnline } = useOfflineStore();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!isOnline) {
      await enqueueOfflineAction({
        id: crypto.randomUUID(),
        type: "expense",
        action: "delete",
        payload: { id },
      });
    } else {
      await deleteExpense(id);
    }
    setDeleteId(null);
    router.refresh();
  };

  return (
    <>
      <TopBar
        title={t("title")}
        rightAction={
          <div className="flex gap-2">
            <Link href="/income">
              <Button size="sm" variant="outline">
                {tNav("income")}
              </Button>
            </Link>
            <Button size="sm" onClick={() => setSheetOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("addExpense")}
            </Button>
          </div>
        }
      />

      <div className="px-4 py-4">
        <Card className="mb-6">
          <CardContent className="p-4">
            <BigNumberStat
              label={t("monthTotal")}
              value={formatCurrency(monthTotal, locale)}
              variant="danger"
            />
          </CardContent>
        </Card>

        {expenses.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            action={
              <Button onClick={() => setSheetOpen(true)}>
                <Plus className="h-4 w-4" />
                {t("addExpense")}
              </Button>
            }
          />
        ) : (
          expenses.map((expense) => (
            <Card key={expense.id} className="mb-3">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-lg font-bold">
                      {formatCurrency(Number(expense.amount), locale)}
                    </p>
                    <p className="text-sm text-muted">
                      {t(`categories.${expense.category}`)}
                    </p>
                    <p className="text-xs text-muted">
                      {formatDate(expense.date, locale)}
                      {expense.farms?.name && ` · ${expense.farms.name}`}
                    </p>
                    {expense.note && (
                      <p className="text-xs text-muted mt-1">{expense.note}</p>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteId(expense.id)}
                  >
                    <Trash2 className="h-4 w-4 text-danger" />
                  </Button>
                </div>
                {deleteId === expense.id && (
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
                        onClick={() => handleDelete(expense.id)}
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

      <ExpenseFormSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        farms={farms}
        ownerId={ownerId}
      />
    </>
  );
}
