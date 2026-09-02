import { http } from "../http";
import type { Paginated } from "@/types/api";
import type { ActivityLogEntry } from "@/types/activityLog";

export async function getActivityLog(page = 1): Promise<Paginated<ActivityLogEntry>> {
  const { data } = await http.get<Paginated<ActivityLogEntry>>("/common/activity-log/", { params: { page } });
  return data;
}
