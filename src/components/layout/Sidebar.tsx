'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Layout, Menu } from 'antd';
import {
  FileTextOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      key: '/orders',
      icon: <FileTextOutlined />,
      label: 'Mis Órdenes',
    },
    {
      key: '/orders/create',
      icon: <PlusCircleOutlined />,
      label: 'Nueva Orden',
    },
  ];

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth={0}
      style={{ background: '#fff' }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <h2 style={{ color: '#667eea', margin: 0, fontWeight: 700 }}>Boxful</h2>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[pathname]}
        items={menuItems}
        onClick={({ key }) => router.push(key)}
        style={{ borderRight: 0 }}
      />
    </Sider>
  );
}
