import type { Attendance, Advance } from "@/lib/types";

export function computeDaysWorked(attendance: Attendance[]): number {
  return attendance.reduce((sum, a) => {
    if (a.status === "present") return sum + 1;
    if (a.status === "half_day") return sum + 0.5;
    return sum;
  }, 0);
}

export function computeSettlement(
  attendance: Attendance[],
  advances: Advance[],
  dailyWage: number
) {
  const daysWorked = computeDaysWorked(attendance);
  const gross = daysWorked * dailyWage;
  const advancesTotal = advances.reduce((sum, a) => sum + Number(a.amount), 0);
  const balanceDue = gross - advancesTotal;

  return { daysWorked, gross, advancesTotal, balanceDue };
}
