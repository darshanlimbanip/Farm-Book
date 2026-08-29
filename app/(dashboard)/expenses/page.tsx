import { getExpenses, getMonthExpenseTotal } from "@/lib/actions/expenses";
import { getFarms } from "@/lib/actions/farms";
import { getOwner } from "@/lib/supabase/server";
import { ExpensesClient } from "@/components/expenses/ExpensesClient";
import { redirect } from "next/navigation";

export default async function ExpensesPage() {
  const owner = await getOwner();
  if (!owner) redirect("/login");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [expenses, farms, monthTotal] = await Promise.all([
    getExpenses(year, month),
    getFarms(),
    getMonthExpenseTotal(year, month),
  ]);

  return (
    <ExpensesClient
      expenses={expenses}
      farms={farms}
      monthTotal={monthTotal}
      ownerId={owner.id}
    />
  );
}
