export interface User {
  id: string;
  firstName: string;
  lastName: string;
  gender?: string;
  birthDate?: string;
  email: string;
  whatsappCode?: string;
  whatsappNumber?: string;
  createdAt?: string;
}

export interface Package {
  description: string;
  weight: number;
  height: number;
  width: number;
  length: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  clientName: string;
  clientEmail?: string;
  clientPhone: string;
  clientAddress: string;
  clientDepartment: string;
  clientMunicipality: string;
  clientReference?: string;
  packages: Package[];
  status: string;
  isCOD: boolean;
  codExpectedAmount?: number;
  codCollectedAmount?: number;
  shippingCost?: number;
  codCommission?: number;
  settlementAmount?: number;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface ShippingCost {
  id: string;
  dayOfWeek: number;
  dayName: string;
  cost: number;
}
