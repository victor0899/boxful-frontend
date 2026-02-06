'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Row, Col, Spin } from 'antd';
import { useAuth } from '@/lib/auth-context';
import { colors } from '@/lib/theme';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/orders');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row style={{ minHeight: '100vh' }}>
      {/* Left side - Form */}
      <Col
        xs={24}
        lg={12}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: 32,
          paddingRight: 50,
          paddingTop: 48,
          paddingBottom: 48,
          background: colors.white,
        }}
      >
        <div style={{ width: '100%' }}>{children}</div>
      </Col>

      {/* Right side - Image placeholder */}
      <Col
        xs={0}
        lg={12}
        style={{
          background: colors.gray[100],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ textAlign: 'center', color: colors.gray[300] }}>
          <p style={{ fontSize: 16 }}>Imagen del diseño</p>
        </div>
      </Col>
    </Row>
  );
}
