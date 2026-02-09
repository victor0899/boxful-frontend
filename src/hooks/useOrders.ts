'use client';

import { useState, useCallback } from 'react';
import api from '@/lib/api';
import type { Order, PaginatedResponse } from '@/types';

interface OrdersQuery {
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  isCOD?: string;
  page?: number;
  limit?: number;
}

interface CreateOrderData {
  // Nuevos campos requeridos
  pickupAddress: string;
  scheduledDate?: string;
  firstName: string;
  lastName: string;
  phoneCode: string;
  phoneNumber: string;
  instructions?: string;
  // Campos existentes
  clientEmail?: string;
  clientAddress: string;
  clientDepartment: string;
  clientMunicipality: string;
  clientReference?: string;
  packages: {
    description: string;
    weight: number;
    height: number;
    width: number;
    length: number;
    quantity: number;
  }[];
  isCOD?: boolean;
  codExpectedAmount?: number;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginatedResponse<Order>['meta']>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async (query: OrdersQuery = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.status) params.set('status', query.status);
      if (query.fromDate) params.set('fromDate', query.fromDate);
      if (query.toDate) params.set('toDate', query.toDate);
      if (query.search) params.set('search', query.search);
      if (query.isCOD) params.set('isCOD', query.isCOD);
      params.set('page', String(query.page || 1));
      params.set('limit', String(query.limit || 10));

      const { data } = await api.get<PaginatedResponse<Order>>(`/orders?${params.toString()}`);
      setOrders(data.data);
      setMeta(data.meta);
    } finally {
      setLoading(false);
    }
  }, []);

  const createOrder = async (orderData: CreateOrderData) => {
    const { data } = await api.post<Order>('/orders', orderData);
    return data;
  };

  const exportCsv = async () => {
    const { data } = await api.get('/orders/export/csv', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ordenes.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return { orders, meta, loading, fetchOrders, createOrder, exportCsv };
}
