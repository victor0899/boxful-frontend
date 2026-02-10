'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Layout, Drawer, Typography } from 'antd';
import Image from 'next/image';
import {
  PlusOutlined,
  FileSearchOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import { useBalance } from '@/lib/balance-context';
import { colors } from '@/lib/theme';

const { Sider } = Layout;
const { Text } = Typography;

interface SidebarProps {
  drawerOpen: boolean;
  onDrawerClose: () => void;
}

export default function Sidebar({ drawerOpen, onDrawerClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { balance } = useBalance();

  const handleNavigation = (path: string) => {
    router.push(path);
    onDrawerClose(); // Cerrar drawer después de navegar
  };

  // Contenido del menú reutilizable
  const MenuContent = ({ showBalance = false }: { showBalance?: boolean }) => (
    <>
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

      {/* Balance - solo visible en el drawer móvil */}
      {showBalance && (
        <div
          style={{
            margin: '16px 40px',
            padding: '12px 16px',
            backgroundColor: colors.darkGreen[50],
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <WalletOutlined style={{ fontSize: 16, color: colors.darkGreen[500] }} />
          <Text style={{ fontSize: 14, color: colors.darkGreen[500], fontWeight: 500 }}>
            Monto a liquidar ${balance.toFixed(2)}
          </Text>
        </div>
      )}

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
          onClick={() => handleNavigation('/orders/create')}
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
          onClick={() => handleNavigation('/orders')}
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
    </>
  );

  return (
    <>
      {/* Sider para desktop */}
      <Sider
        width={304}
        breakpoint="lg"
        collapsedWidth={0}
        trigger={null}
        style={{ background: '#f8f9fa' }}
      >
        <MenuContent />
      </Sider>

      {/* Drawer para móviles/tablets */}
      <Drawer
        title={null}
        placement="left"
        onClose={onDrawerClose}
        open={drawerOpen}
        width={304}
        styles={{ body: { padding: 0, background: '#f8f9fa' } }}
      >
        <MenuContent showBalance={true} />
      </Drawer>
    </>
  );
}
