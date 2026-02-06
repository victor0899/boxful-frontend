'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Row, Col, Spin } from 'antd';
import { useAuth } from '@/lib/auth-context';

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
      <Col
        xs={0}
        md={12}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
        }}
      >
        <div style={{ textAlign: 'center', color: '#fff' }}>
          <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>Boxful</h1>
          <p style={{ fontSize: 20, opacity: 0.9 }}>Envíos ultra-rápidos</p>
          <p style={{ fontSize: 16, opacity: 0.7, marginTop: 8 }}>
            Gestiona tus órdenes de envío de forma simple y eficiente
          </p>
        </div>
      </Col>
      <Col
        xs={24}
        md={12}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 40,
          background: '#fafafa',
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>{children}</div>
      </Col>
    </Row>
  );
}
