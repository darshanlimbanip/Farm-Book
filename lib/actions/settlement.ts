"use server";

import { createClient, getOwner } from "@/lib/supabase/server";
import { computeSettlement } from "@/lib/settlement";
import { getMonthRange } from "@/lib/utils";
import type { SettlementSummary } from "@/lib/types";

export async function getSettlementForWorker(
  workerId: string,
  year: number,
  month: number
) {
  const supabase = await createClient();
  const { start, end } = getMonthRange(year, month);

  const { data: worker } = await supabase
    .from("workers")
    .select("*")
    .eq("id", workerId)
    .single();

  if (!worker) return null;

  const { data: attendance } = await supabase
    .from("attendance")
    .select("*")
    .eq("worker_id", workerId)
    .gte("date", start)
    .lte("date", end);

  const { data: advances } = await supabase
    .from("advances")
    .select("*")
    .eq("worker_id", workerId)
    .gte("date", start)
    .lte("date", end);

  const settlement = computeSettlement(
    attendance ?? [],
    advances ?? [],
    Number(worker.daily_wage)
  );

  return {
    worker,
    attendance: attendance ?? [],
    advances: advances ?? [],
    ...settlement,
  };
}

export async function getAllSettlements(
  year: number,
  month: number
): Promise<SettlementSummary[]> {
  const supabase = await createClient();
  const owner = await getOwner();
  if (!owner) return [];

  const { start, end } = getMonthRange(year, month);

  const { data: workers } = await supabase
    .from("workers")
    .select("*")
    .eq("owner_id", owner.id)
    .eq("is_active", true);

  if (!workers) return [];

  const summaries: SettlementSummary[] = [];

  for (const worker of workers) {
    const { data: attendance } = await supabase
      .from("attendance")
      .select("*")
      .eq("worker_id", worker.id)
      .gte("date", start)
      .lte("date", end);

    const { data: advances } = await supabase
      .from("advances")
      .select("*")
      .eq("worker_id", worker.id)
      .gte("date", start)
      .lte("date", end);

    const settlement = computeSettlement(
      attendance ?? [],
      advances ?? [],
      Number(worker.daily_wage)
    );

    summaries.push({
      workerId: worker.id,
      workerName: worker.name,
      ...settlement,
    });
  }

  return summaries.sort((a, b) => b.balanceDue - a.balanceDue);
}
