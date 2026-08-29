"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { AttendanceStatus } from "@/lib/types";

export async function getAttendanceForDate(date: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attendance")
    .select("*")
    .eq("date", date);

  return data ?? [];
}

export async function markAttendance(data: {
  worker_id: string;
  farm_id: string;
  date: string;
  status: AttendanceStatus;
}) {
  const supabase = await createClient();

  const { error } = await supabase.from("attendance").upsert(
    {
      worker_id: data.worker_id,
      farm_id: data.farm_id,
      date: data.date,
      status: data.status,
    },
    { onConflict: "worker_id,date" }
  );

  if (error) return { error: error.message };
  revalidatePath("/attendance");
  return { success: true };
}

export async function getWorkerAttendance(
  workerId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("attendance")
    .select("*")
    .eq("worker_id", workerId)
    .gte("date", startDate)
    .lte("date", endDate);

  return data ?? [];
}
