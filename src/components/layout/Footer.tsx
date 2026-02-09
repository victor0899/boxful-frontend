'use client';

import { Layout } from 'antd';
import { GithubOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { colors } from '@/lib/theme';

const { Footer: AntFooter } = Layout;

export default function Footer() {
  return (
    <AntFooter
      style={{
        textAlign: 'center',
        padding: '24px 40px',
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        color: colors.gray[500],
        fontSize: 14,
      }}
    >
      <div>
        Prueba técnica para Fullstack Developer de Boxful
      </div>
      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <span style={{ fontWeight: 600, color: colors.textDark }}>
          Victor Rodriguez
        </span>
        <a
          href="https://github.com/victor0899"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: colors.blue[500], fontSize: 18 }}
        >
          <GithubOutlined />
        </a>
        <a
          href="mailto:victormanuelrodriguez0899@gmail.com"
          style={{ color: colors.blue[500], fontSize: 18 }}
        >
          <MailOutlined />
        </a>
        <a
          href="tel:+50370243437"
          style={{ color: colors.blue[500], fontSize: 18 }}
        >
          <PhoneOutlined />
        </a>
      </div>
    </AntFooter>
  );
}
