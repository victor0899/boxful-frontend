'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export function useBalance() {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ balance: number }>('/orders/settlement-balance');
      setBalance(data.balance);
    } catch (error) {
      // Si el endpoint no existe aún, el balance es 0
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  return { balance, loading, refetchBalance: fetchBalance };
}
