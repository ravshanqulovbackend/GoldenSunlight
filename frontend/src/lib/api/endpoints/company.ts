import { serverFetch } from "../server-fetch";
import { http } from "../http";
import type { Company, CompanyPayload } from "@/types/company";

export function getCompany() {
  return serverFetch<Company>("pages/company/", { revalidate: 300, tags: ["company"] });
}

/** Admin panelidan (klient komponent) o'qish uchun — `serverFetch` ichki Docker
 * xostiga murojaat qiladi va brauzerdan chaqirilganda ishlamaydi. */
export async function getAdminCompany(): Promise<Company> {
  const { data } = await http.get<Company>("/pages/company/");
  return data;
}

function buildCompanyFormData(payload: CompanyPayload): FormData {
  const formData = new FormData();
  const { logo, ...rest } = payload;
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined) continue;
    formData.append(key, value === null ? "" : String(value));
  }
  if (logo) formData.append("logo", logo);
  return formData;
}

export async function updateCompany(payload: CompanyPayload): Promise<Company> {
  const { data } = await http.patch<Company>("/pages/company/", buildCompanyFormData(payload));
  return data;
}
