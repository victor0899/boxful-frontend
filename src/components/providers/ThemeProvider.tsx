'use client';

import { ConfigProvider } from 'antd';
import { theme } from '@/lib/theme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <ConfigProvider theme={theme}>{children}</ConfigProvider>;
}
