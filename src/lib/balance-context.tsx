'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface BalanceContextType {
  balance: number;
  loading: boolean;
  refetchBalance: () => Promise<void>;
}

const BalanceContext = createContext<BalanceContextType | null>(null);

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ balance: number }>('/orders/settlement-balance');
      setBalance(data.balance);
    } catch {
      // Si el endpoint no existe aún, el balance es 0
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return (
    <BalanceContext.Provider value={{ balance, loading, refetchBalance: fetchBalance }}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error('useBalance must be used within BalanceProvider');
  }
  return context;
}
