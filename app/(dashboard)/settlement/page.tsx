import { getAllSettlements } from "@/lib/actions/settlement";
import { SettlementClient } from "@/components/settlement/SettlementClient";
import { redirect } from "next/navigation";

interface Props {
  searchParams: { year?: string; month?: string };
}

export default async function SettlementPage({ searchParams }: Props) {
  const now = new Date();
  const year = searchParams.year
    ? parseInt(searchParams.year)
    : now.getFullYear();
  const month = searchParams.month
    ? parseInt(searchParams.month)
    : now.getMonth() + 1;

  const summaries = await getAllSettlements(year, month);

  if (summaries === null) redirect("/login");

  return (
    <SettlementClient summaries={summaries} year={year} month={month} />
  );
}
