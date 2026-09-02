import { http } from "../http";
import type { Paginated } from "@/types/api";
import type { PartnershipRequest, PartnershipRequestPayload } from "@/types/partnership";

export async function createPartnershipRequest(payload: PartnershipRequestPayload): Promise<PartnershipRequest> {
  const { data } = await http.post<PartnershipRequest>("/pages/partnership/", payload);
  return data;
}

export async function getAdminPartnerships(page = 1): Promise<Paginated<PartnershipRequest>> {
  const { data } = await http.get<Paginated<PartnershipRequest>>("/pages/admin/partnerships/", { params: { page } });
  return data;
}

/** Sahifalash UI'siz to'liq ro'yxat uchun — hamkorlik so'rovlari soni odatda kam. */
export async function getAllAdminPartnerships(): Promise<PartnershipRequest[]> {
  const all: PartnershipRequest[] = [];
  let page = 1;
  while (true) {
    const data = await getAdminPartnerships(page);
    all.push(...data.results);
    if (!data.next) break;
    page += 1;
  }
  return all;
}
