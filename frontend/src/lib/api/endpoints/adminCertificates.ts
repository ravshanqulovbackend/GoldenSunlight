import { http } from "../http";
import type { Paginated } from "@/types/api";
import type { Certificate, CertificatePayload } from "@/types/certificate";

export async function getAllAdminCertificates(): Promise<Certificate[]> {
  const all: Certificate[] = [];
  let page = 1;
  while (true) {
    const { data } = await http.get<Paginated<Certificate>>("/certificates/admin/", { params: { page } });
    all.push(...data.results);
    if (!data.next) break;
    page += 1;
  }
  return all;
}

function buildCertificateFormData(payload: Partial<CertificatePayload>): FormData {
  const formData = new FormData();
  const { image, ...rest } = payload;
  for (const [key, value] of Object.entries(rest)) {
    if (value === undefined) continue;
    formData.append(key, value === null ? "" : String(value));
  }
  if (image) formData.append("image", image);
  return formData;
}

export async function createCertificate(payload: CertificatePayload): Promise<Certificate> {
  const { data } = await http.post<Certificate>("/certificates/admin/", buildCertificateFormData(payload));
  return data;
}

export async function updateCertificate(id: number, payload: Partial<CertificatePayload>): Promise<Certificate> {
  const { data } = await http.patch<Certificate>(`/certificates/admin/${id}/`, buildCertificateFormData(payload));
  return data;
}

export async function deleteCertificate(id: number): Promise<void> {
  await http.delete(`/certificates/admin/${id}/`);
}
