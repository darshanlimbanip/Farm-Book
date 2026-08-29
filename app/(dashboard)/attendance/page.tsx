import { getWorkers } from "@/lib/actions/workers";
import { getAttendanceForDate } from "@/lib/actions/attendance";
import { getFarms } from "@/lib/actions/farms";
import { AttendanceClient } from "@/components/attendance/AttendanceClient";
import { toISODate } from "@/lib/utils";
import { redirect } from "next/navigation";

interface Props {
  searchParams: { date?: string };
}

export default async function AttendancePage({ searchParams }: Props) {
  const date = searchParams.date ?? toISODate(new Date());

  const [workers, attendance, farms] = await Promise.all([
    getWorkers(false),
    getAttendanceForDate(date),
    getFarms(),
  ]);

  if (!workers) redirect("/login");

  return (
    <AttendanceClient
      workers={workers}
      attendance={attendance}
      farms={farms}
      initialDate={date}
    />
  );
}
