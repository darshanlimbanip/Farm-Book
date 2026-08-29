"use server";

import { revalidatePath } from "next/cache";
import { createClient, getOwner } from "@/lib/supabase/server";
import { getMonthRange } from "@/lib/utils";

export async function getIncome(year?: number, month?: number) {
  const supabase = await createClient();
  const owner = await getOwner();
  if (!owner) return [];

  let query = supabase
    .from("income")
    .select("*, farms(name)")
    .eq("owner_id", owner.id)
    .order("date", { ascending: false });

  if (year && month) {
    const { start, end } = getMonthRange(year, month);
    query = query.gte("date", start).lte("date", end);
  }

  const { data } = await query;
  return data ?? [];
}

export async function createIncome(data: {
  farm_id?: string;
  date: string;
  source_text: string;
  amount: number;
  note?: string;
}) {
  const supabase = await createClient();
  const owner = await getOwner();
  if (!owner) return { error: "Not authenticated" };

  const { error } = await supabase.from("income").insert({
    owner_id: owner.id,
    farm_id: data.farm_id || null,
    date: data.date,
    source_text: data.source_text,
    amount: data.amount,
    note: data.note || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/income");
  revalidatePath("/");
  return { success: true };
}

export async function deleteIncome(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("income").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/income");
  revalidatePath("/");
  return { success: true };
}

export async function getMonthIncomeTotal(year: number, month: number) {
  const income = await getIncome(year, month);
  return income.reduce((sum, i) => sum + Number(i.amount), 0);
}
