"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { TopBar } from "@/components/shared/TopBar";
import { AttendanceRow } from "@/components/shared/AttendanceRow";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { markAttendance } from "@/lib/actions/attendance";
import { enqueueOfflineAction } from "@/lib/offline/db";
import { useOfflineStore } from "@/lib/offline/store";
import { toISODate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Attendance, AttendanceStatus, Farm, Worker } from "@/lib/types";

type WorkerWithFarms = Worker & {
  worker_farm_assignments?: { farm_id: string; farms: Farm | null }[];
};

interface AttendanceClientProps {
  workers: WorkerWithFarms[];
  attendance: Attendance[];
  farms: Farm[];
  initialDate: string;
}

export function AttendanceClient({
  workers,
  attendance: initialAttendance,
  farms,
  initialDate,
}: AttendanceClientProps) {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { isOnline } = useOfflineStore();
  const [date, setDate] = useState(initialDate);
  const [localAttendance, setLocalAttendance] = useState(initialAttendance);
  const [farmFilter, setFarmFilter] = useState<string | null>(null);

  const getStatus = useCallback(
    (workerId: string): AttendanceStatus | null => {
      const record = localAttendance.find((a) => a.worker_id === workerId);
      return record?.status ?? null;
    },
    [localAttendance]
  );

  const getDefaultFarmId = (worker: WorkerWithFarms): string => {
    const assignment = worker.worker_farm_assignments?.[0];
    return assignment?.farm_id ?? farms[0]?.id ?? "";
  };

  const handleStatusChange = async (
    worker: WorkerWithFarms,
    status: AttendanceStatus
  ) => {
    const farmId = getDefaultFarmId(worker);
    if (!farmId) return;

    const optimistic: Attendance = {
      id: crypto.randomUUID(),
      worker_id: worker.id,
      farm_id: farmId,
      date,
      status,
      created_at: new Date().toISOString(),
    };

    setLocalAttendance((prev) => {
      const filtered = prev.filter((a) => a.worker_id !== worker.id);
      return [...filtered, optimistic];
    });

    const payload = {
      worker_id: worker.id,
      farm_id: farmId,
      date,
      status,
    };

    if (!isOnline) {
      await enqueueOfflineAction({
        id: crypto.randomUUID(),
        type: "attendance",
        action: "create",
        payload,
      });
    } else {
      await markAttendance(payload);
      router.refresh();
    }
  };

  const filteredWorkers = farmFilter
    ? workers.filter((w) =>
        w.worker_farm_assignments?.some((a) => a.farm_id === farmFilter)
      )
    : workers;

  return (
    <>
      <TopBar title={t("title")} />

      <div className="px-4 py-4 space-y-4">
        <div>
          <label className="text-sm text-muted">{t("selectDate")}</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              router.push(`/attendance?date=${e.target.value}`);
            }}
            className="mt-1"
          />
        </div>

        {farms.length > 1 && (
          <div>
            <p className="text-sm text-muted mb-2">{t("filterByFarm")}</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFarmFilter(null)}
                className={cn(
                  "px-3 py-2 rounded-full text-sm font-medium border whitespace-nowrap min-h-10",
                  !farmFilter
                    ? "bg-primary text-white border-primary"
                    : "bg-card border-border"
                )}
              >
                {tCommon("all")}
              </button>
              {farms.map((farm) => (
                <button
                  key={farm.id}
                  onClick={() => setFarmFilter(farm.id)}
                  className={cn(
                    "px-3 py-2 rounded-full text-sm font-medium border whitespace-nowrap min-h-10",
                    farmFilter === farm.id
                      ? "bg-primary text-white border-primary"
                      : "bg-card border-border"
                  )}
                >
                  {farm.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {filteredWorkers.length === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        ) : (
          <div className="bg-card rounded-lg border border-border px-4">
            {filteredWorkers.map((worker) => (
              <AttendanceRow
                key={worker.id}
                workerId={worker.id}
                name={worker.name}
                photoUrl={worker.photo_url}
                currentStatus={getStatus(worker.id)}
                onStatusChange={(status) => handleStatusChange(worker, status)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
