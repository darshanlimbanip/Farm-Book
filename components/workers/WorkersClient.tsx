"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { TopBar } from "@/components/shared/TopBar";
import { WorkerCard } from "@/components/shared/WorkerCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { WorkerFormSheet } from "@/components/workers/WorkerFormSheet";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toggleWorkerActive } from "@/lib/actions/workers";
import { Plus } from "lucide-react";
import type { Farm, Worker } from "@/lib/types";
import Link from "next/link";

type WorkerWithAssignments = Worker & {
  worker_farm_assignments?: { farm_id: string; farms: { name: string } | null }[];
};

interface WorkersClientProps {
  workers: WorkerWithAssignments[];
  farms: Farm[];
  ownerId: string;
}

export function WorkersClient({ workers, farms, ownerId }: WorkersClientProps) {
  const t = useTranslations("workers");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const filtered = showInactive
    ? workers
    : workers.filter((w) => w.is_active);

  return (
    <>
      <TopBar
        title={t("title")}
        rightAction={
          <div className="flex items-center gap-2">
            <Link href="/farms">
              <Button size="sm" variant="outline">
                {tNav("farms")}
              </Button>
            </Link>
            <Button size="sm" onClick={() => setSheetOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("addWorker")}
            </Button>
          </div>
        }
      />

      <div className="px-4 py-2 flex items-center justify-between">
        <span className="text-sm text-muted">{t("markInactive")}</span>
        <Switch checked={showInactive} onCheckedChange={setShowInactive} />
      </div>

      <div className="px-4 pb-4">
        {filtered.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
            action={
              <Button onClick={() => setSheetOpen(true)}>
                <Plus className="h-4 w-4" />
                {t("addWorker")}
              </Button>
            }
          />
        ) : (
          filtered.map((worker) => {
            const farmNames =
              worker.worker_farm_assignments
                ?.map((a) => a.farms?.name)
                .filter(Boolean) as string[] | undefined;

            return (
              <div key={worker.id} className="relative">
                <WorkerCard
                  id={worker.id}
                  name={worker.name}
                  dailyWage={Number(worker.daily_wage)}
                  photoUrl={worker.photo_url}
                  farmNames={farmNames}
                  isActive={worker.is_active}
                />
                {!worker.is_active && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={async () => {
                      await toggleWorkerActive(worker.id, true);
                      router.refresh();
                    }}
                  >
                    {t("markActive")}
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>

      <WorkerFormSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        farms={farms}
        ownerId={ownerId}
      />
    </>
  );
}
