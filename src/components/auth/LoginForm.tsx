'use client';

import { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { colors } from '@/lib/theme';
import type { AxiosError } from 'axios';

const { Title, Text } = Typography;

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Inicio de sesión exitoso');
      router.push('/orders');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      message.error(axiosError.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title level={2} style={{ marginBottom: 8, color: colors.gray[500], fontWeight: 700 }}>
        Bienvenido
      </Title>
      <Text style={{ display: 'block', marginBottom: 32, color: colors.gray[500], fontSize: 16 }}>
        Por favor ingresa tus credenciales
      </Text>

      <Form layout="vertical" onFinish={onFinish} size="large">
        <Form.Item
          label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Correo electrónico</span>}
          name="email"
          rules={[
            { required: true, message: 'Ingresa tu email' },
            { type: 'email', message: 'Email no válido' },
          ]}
        >
          <Input placeholder="Digita tu correo" />
        </Form.Item>

        <Form.Item
          label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Contraseña</span>}
          name="password"
          rules={[{ required: true, message: 'Ingresa tu contraseña' }]}
        >
          <Input.Password placeholder="Digita tu contraseña" />
        </Form.Item>

        <Form.Item style={{ marginTop: 32 }}>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Iniciar sesión
          </Button>
        </Form.Item>
      </Form>

      <Text style={{ display: 'block', textAlign: 'center', color: colors.gray[500] }}>
        ¿Necesitas una cuenta?{' '}
        <Link href="/register" style={{ color: colors.gray[500], fontWeight: 700 }}>
          Regístrate aquí
        </Link>
      </Text>
    </>
  );
}
