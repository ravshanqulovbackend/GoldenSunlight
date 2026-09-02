import { http } from "../http";
import type { DashboardStats } from "@/types/dashboard";

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await http.get<DashboardStats>("/common/dashboard/");
  return data;
}
