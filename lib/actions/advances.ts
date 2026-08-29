"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getAdvancesForWorker(
  workerId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("advances")
    .select("*")
    .eq("worker_id", workerId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false });

  return data ?? [];
}

export async function createAdvance(data: {
  worker_id: string;
  date: string;
  amount: number;
  note?: string;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("advances").insert({
    worker_id: data.worker_id,
    date: data.date,
    amount: data.amount,
    note: data.note || null,
  });

  if (error) return { error: error.message };
  revalidatePath(`/workers/${data.worker_id}`);
  revalidatePath("/settlement");
  return { success: true };
}
