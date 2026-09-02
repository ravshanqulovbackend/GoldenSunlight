import { http } from "../http";
import type { Paginated } from "@/types/api";
import type { Address, AddressPayload } from "@/types/address";

export async function getAddresses(): Promise<Paginated<Address>> {
  const { data } = await http.get<Paginated<Address>>("/orders/addresses/");
  return data;
}

export async function createAddress(payload: AddressPayload): Promise<Address> {
  const { data } = await http.post<Address>("/orders/addresses/", payload);
  return data;
}

export async function updateAddress(id: number, payload: Partial<AddressPayload>): Promise<Address> {
  const { data } = await http.patch<Address>(`/orders/addresses/${id}/`, payload);
  return data;
}

export async function deleteAddress(id: number): Promise<void> {
  await http.delete(`/orders/addresses/${id}/`);
}
