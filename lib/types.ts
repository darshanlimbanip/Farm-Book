export type Locale = "gu" | "en";

export type AttendanceStatus = "present" | "absent" | "half_day";

export type ExpenseCategory =
  | "fuel"
  | "fertilizer"
  | "seeds"
  | "equipment"
  | "labor_other"
  | "misc";

export interface Owner {
  id: string;
  phone: string;
  name: string | null;
  preferred_language: Locale;
  pin_hash: string | null;
  created_at: string;
}

export interface Farm {
  id: string;
  owner_id: string;
  name: string;
  location_text: string;
  acres: number;
  created_at: string;
}

export interface Worker {
  id: string;
  owner_id: string;
  name: string;
  phone: string | null;
  photo_url: string | null;
  daily_wage: number;
  is_active: boolean;
  created_at: string;
}

export interface WorkerFarmAssignment {
  id: string;
  worker_id: string;
  farm_id: string;
}

export interface Attendance {
  id: string;
  worker_id: string;
  farm_id: string;
  date: string;
  status: AttendanceStatus;
  created_at: string;
}

export interface Advance {
  id: string;
  worker_id: string;
  date: string;
  amount: number;
  note: string | null;
  created_at: string;
}

export interface Expense {
  id: string;
  owner_id: string;
  farm_id: string | null;
  date: string;
  category: ExpenseCategory;
  amount: number;
  note: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface Income {
  id: string;
  owner_id: string;
  farm_id: string | null;
  date: string;
  source_text: string;
  amount: number;
  note: string | null;
  created_at: string;
}

export interface WorkerWithFarms extends Worker {
  farms: Farm[];
}

export interface SettlementSummary {
  workerId: string;
  workerName: string;
  daysWorked: number;
  gross: number;
  advancesTotal: number;
  balanceDue: number;
}

export type OfflineActionType =
  | "attendance"
  | "advance"
  | "expense"
  | "income"
  | "farm"
  | "worker"
  | "worker_farm_assignment";

export interface OfflineQueueItem {
  id: string;
  type: OfflineActionType;
  action: "create" | "update" | "delete";
  payload: Record<string, unknown>;
  createdAt: number;
  retries: number;
}
