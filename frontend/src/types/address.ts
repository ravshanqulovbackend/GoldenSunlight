export interface Address {
  id: number;
  title: string;
  full_name: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  building: string;
  apartment: string;
  landmark: string;
  is_default: boolean;
  created_at: string;
}

export interface AddressPayload {
  title?: string;
  full_name: string;
  phone: string;
  city: string;
  district?: string;
  street: string;
  building?: string;
  apartment?: string;
  landmark?: string;
  is_default?: boolean;
}
