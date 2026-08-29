import { Suspense } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { TopBar } from "@/components/shared/TopBar";
import { BigNumberStat } from "@/components/shared/BigNumberStat";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMonthExpenseTotal } from "@/lib/actions/expenses";
import { getMonthIncomeTotal } from "@/lib/actions/income";
import { getAllSettlements } from "@/lib/actions/settlement";
import { formatCurrency } from "@/lib/utils";
import { CalendarCheck, Users } from "lucide-react";

async function HomeContent() {
  const t = await getTranslations("home");
  const locale = await getLocale();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [expenses, income, settlements] = await Promise.all([
    getMonthExpenseTotal(year, month),
    getMonthIncomeTotal(year, month),
    getAllSettlements(year, month),
  ]);

  const net = income - expenses;
  const pendingWorkers = settlements.filter((s) => s.balanceDue > 0);

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardContent className="p-4">
            <BigNumberStat
              label={t("monthExpenses")}
              value={formatCurrency(expenses, locale)}
              variant="danger"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <BigNumberStat
              label={t("monthIncome")}
              value={formatCurrency(income, locale)}
              variant="success"
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <BigNumberStat
              label={t("netBalance")}
              value={formatCurrency(net, locale)}
              variant={net >= 0 ? "success" : "danger"}
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <Link href="/attendance">
          <Button variant="outline" className="w-full justify-start gap-3 h-14">
            <CalendarCheck className="h-5 w-5 text-primary" />
            {t("todayAttendance")}
          </Button>
        </Link>

        {pendingWorkers.length > 0 ? (
          <div>
            <h2 className="text-sm font-medium text-muted mb-2">
              {t("pendingDues")}
            </h2>
            {pendingWorkers.slice(0, 5).map((w) => (
              <Link key={w.workerId} href={`/workers/${w.workerId}`}>
                <Card className="mb-2">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-muted" />
                      <span className="font-medium">{w.workerName}</span>
                    </div>
                    <span className="text-lg font-bold text-secondary">
                      {formatCurrency(w.balanceDue, locale)}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
            <Link href="/settlement">
              <Button variant="ghost" className="w-full mt-2">
                {t("pendingDues")} →
              </Button>
            </Link>
          </div>
        ) : (
          <p className="text-muted text-sm text-center py-4">
            {t("noPendingDues")}
          </p>
        )}
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="px-4 py-6 space-y-6">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}

export default async function HomePage() {
  const t = await getTranslations("home");

  return (
    <>
      <TopBar title={t("title")} />
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
    </>
  );
}
