import { getWorker } from "@/lib/actions/workers";
import { getFarms } from "@/lib/actions/farms";
import { getAdvancesForWorker } from "@/lib/actions/advances";
import { getSettlementForWorker } from "@/lib/actions/settlement";
import { getOwner } from "@/lib/supabase/server";
import { WorkerDetailClient } from "@/components/workers/WorkerDetailClient";
import { getMonthRange } from "@/lib/utils";
import { redirect, notFound } from "next/navigation";

interface Props {
  params: { id: string };
  searchParams: { year?: string; month?: string };
}

export default async function WorkerDetailPage({ params, searchParams }: Props) {
  const owner = await getOwner();
  if (!owner) redirect("/login");

  const worker = await getWorker(params.id);
  if (!worker) notFound();

  const now = new Date();
  const year = searchParams.year
    ? parseInt(searchParams.year)
    : now.getFullYear();
  const month = searchParams.month
    ? parseInt(searchParams.month)
    : now.getMonth() + 1;

  const { start, end } = getMonthRange(year, month);

  const [farms, advances, settlementData] = await Promise.all([
    getFarms(),
    getAdvancesForWorker(params.id, start, end),
    getSettlementForWorker(params.id, year, month),
  ]);

  if (!settlementData) notFound();

  const assignedFarmIds =
    worker.worker_farm_assignments?.map(
      (a: { farm_id: string }) => a.farm_id
    ) ?? [];

  return (
    <WorkerDetailClient
      worker={worker}
      farms={farms}
      assignedFarmIds={assignedFarmIds}
      advances={advances}
      settlement={{
        daysWorked: settlementData.daysWorked,
        gross: settlementData.gross,
        advancesTotal: settlementData.advancesTotal,
        balanceDue: settlementData.balanceDue,
      }}
      year={year}
      month={month}
      ownerId={owner.id}
    />
  );
}
