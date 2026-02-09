'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Layout } from 'antd';
import Image from 'next/image';
import {
  PlusOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';
import { colors } from '@/lib/theme';

const { Sider } = Layout;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Sider
      width={304}
      breakpoint="lg"
      collapsedWidth={0}
      style={{ background: '#f8f9fa' }}
    >
      <div
        style={{
          padding: '0 40px',
        }}
      >
        <Image
          src="/images/logo.svg"
          alt="Boxful"
          width={260}
          height={87}
          priority
        />
      </div>
      <div
        style={{
          padding: '0 40px 16px 40px',
          fontSize: 14,
          fontWeight: 600,
          color: colors.textDark,
        }}
      >
        MENÚ
      </div>
      <div style={{ padding: '0 40px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div
          onClick={() => router.push('/orders/create')}
          style={{
            height: 56,
            fontSize: 16,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            borderRadius: 4,
            background: pathname === '/orders/create' ? colors.blue[500] : 'transparent',
            color: pathname === '/orders/create' ? '#fff' : colors.textDark,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/orders/create') {
              e.currentTarget.style.background = '#f0f0f0';
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/orders/create') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <PlusOutlined style={{ fontSize: 20 }} />
          <span>Crear orden</span>
        </div>
        <div
          onClick={() => router.push('/orders')}
          style={{
            height: 56,
            fontSize: 16,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: 'pointer',
            borderRadius: 4,
            background: pathname === '/orders' ? colors.blue[500] : 'transparent',
            color: pathname === '/orders' ? '#fff' : colors.textDark,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (pathname !== '/orders') {
              e.currentTarget.style.background = '#f0f0f0';
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== '/orders') {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          <FileSearchOutlined style={{ fontSize: 20 }} />
          <span>Historial</span>
        </div>
      </div>
    </Sider>
  );
}
