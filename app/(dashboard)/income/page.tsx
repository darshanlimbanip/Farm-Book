import { getIncome, getMonthIncomeTotal } from "@/lib/actions/income";
import { getFarms } from "@/lib/actions/farms";
import { getOwner } from "@/lib/supabase/server";
import { IncomeClient } from "@/components/income/IncomeClient";
import { redirect } from "next/navigation";

export default async function IncomePage() {
  const owner = await getOwner();
  if (!owner) redirect("/login");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [income, farms, monthTotal] = await Promise.all([
    getIncome(year, month),
    getFarms(),
    getMonthIncomeTotal(year, month),
  ]);

  return (
    <IncomeClient
      income={income}
      farms={farms}
      monthTotal={monthTotal}
      ownerId={owner.id}
    />
  );
}
