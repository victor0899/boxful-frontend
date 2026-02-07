'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Layout, Menu } from 'antd';
import Image from 'next/image';
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
      key: '/orders/create',
      icon: <PlusCircleOutlined />,
      label: 'Crear orden',
    },
    {
      key: '/orders',
      icon: <FileTextOutlined />,
      label: 'Historial',
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
          padding: '0 16px',
        }}
      >
        <Image
          src="/images/logo.svg"
          alt="Boxful"
          width={120}
          height={40}
          priority
        />
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
