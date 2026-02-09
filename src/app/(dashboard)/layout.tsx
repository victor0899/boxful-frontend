'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin, App } from 'antd';
import { useAuth } from '@/lib/auth-context';
import { BalanceProvider } from '@/lib/balance-context';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <App>
      <BalanceProvider>
        <div style={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Header />
            <div style={{ flex: 1, padding: 24, background: '#f5f5f5' }}>
              <div style={{ background: '#fff', padding: 24, borderRadius: 8, minHeight: '100%' }}>
                {children}
              </div>
            </div>
            <Footer />
          </div>
        </div>
      </BalanceProvider>
    </App>
  );
}
