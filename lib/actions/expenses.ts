"use server";

import { revalidatePath } from "next/cache";
import { createClient, getOwner } from "@/lib/supabase/server";
import type { ExpenseCategory } from "@/lib/types";
import { getMonthRange } from "@/lib/utils";

export async function getExpenses(year?: number, month?: number) {
  const supabase = await createClient();
  const owner = await getOwner();
  if (!owner) return [];

  let query = supabase
    .from("expenses")
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

export async function createExpense(data: {
  farm_id?: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  note?: string;
  photo_url?: string;
}) {
  const supabase = await createClient();
  const owner = await getOwner();
  if (!owner) return { error: "Not authenticated" };

  const { error } = await supabase.from("expenses").insert({
    owner_id: owner.id,
    farm_id: data.farm_id || null,
    date: data.date,
    category: data.category,
    amount: data.amount,
    note: data.note || null,
    photo_url: data.photo_url || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/expenses");
  revalidatePath("/");
  return { success: true };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/expenses");
  revalidatePath("/");
  return { success: true };
}

export async function getMonthExpenseTotal(year: number, month: number) {
  const expenses = await getExpenses(year, month);
  return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
}
