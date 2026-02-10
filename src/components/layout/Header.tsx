'use client';

import { Layout, Button, Dropdown, Typography } from 'antd';
import { UserOutlined, LogoutOutlined, WalletOutlined, MenuOutlined } from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/lib/auth-context';
import { useBalance } from '@/lib/balance-context';
import { colors } from '@/lib/theme';

const { Header: AntHeader } = Layout;
const { Text, Title } = Typography;

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
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
      className="main-header"
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
        {/* Botón hamburguesa - solo visible en móviles/tablets */}
        <Button
          type="text"
          icon={<MenuOutlined />}
          onClick={onMenuClick}
          style={{
            fontSize: 20,
            display: 'none',
          }}
          className="mobile-menu-button"
        />
        {/* Título - oculto en móviles */}
        <Title
          level={3}
          style={{ margin: 0, color: colors.textDark, fontWeight: 600 }}
          className="page-title"
        >
          {getPageTitle()}
        </Title>
      </div>

      {/* Logo - solo visible en móviles/tablets, centrado */}
      <div className="mobile-logo" style={{ display: 'none', flex: 1, justifyContent: 'center' }}>
        <Image
          src="/images/logo.svg"
          alt="Boxful"
          width={120}
          height={40}
          priority
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, justifyContent: 'flex-end' }}>
        {/* Balance - oculto en móviles (se muestra en el drawer) */}
        <div
          className="balance-desktop"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            backgroundColor: colors.darkGreen[50],
            borderRadius: 8,
            whiteSpace: 'nowrap',
          }}
        >
          <WalletOutlined style={{ fontSize: 16, color: colors.darkGreen[500] }} />
          <Text style={{ fontSize: 14, color: colors.darkGreen[500], fontWeight: 500, whiteSpace: 'nowrap' }}>
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
