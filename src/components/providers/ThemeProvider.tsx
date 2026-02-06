'use client';

import { ConfigProvider, App } from 'antd';
import { theme } from '@/lib/theme';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider theme={theme}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
