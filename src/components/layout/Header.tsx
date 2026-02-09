'use client';

import { Layout, Button, Dropdown, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, WalletOutlined } from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useBalance } from '@/lib/balance-context';
import { colors } from '@/lib/theme';

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

export default function Header() {
  const { user, logout } = useAuth();
  const { balance } = useBalance();
  const router = useRouter();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === '/orders/create') return 'Crear orden';
    if (pathname === '/orders') return 'Mis envíos';
    return '';
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar sesión',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <Title level={3} style={{ margin: 0, color: colors.textDark, fontWeight: 600 }}>
        {getPageTitle()}
      </Title>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            backgroundColor: colors.darkGreen[50],
            borderRadius: 8,
          }}
        >
          <WalletOutlined style={{ fontSize: 16, color: colors.darkGreen[500] }} />
          <Text style={{ fontSize: 14, color: colors.darkGreen[500], fontWeight: 500 }}>
            Monto a liquidar ${balance.toFixed(2)}
          </Text>
        </div>
        <Dropdown menu={{ items: menuItems }} placement="bottomRight">
          <Button type="text" icon={<UserOutlined />}>
            <Text style={{ marginLeft: 8 }}>
              {user?.firstName} {user?.lastName}
            </Text>
          </Button>
        </Dropdown>
      </div>
    </AntHeader>
  );
}
