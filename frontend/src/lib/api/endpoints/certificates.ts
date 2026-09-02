import { serverFetch } from "../server-fetch";
import type { Certificate } from "@/types/certificate";
import type { Paginated } from "@/types/api";

export async function getCertificates(): Promise<Certificate[]> {
  const data = await serverFetch<Paginated<Certificate>>("certificates/", { revalidate: 300, tags: ["certificates"] });
  return data.results;
}
