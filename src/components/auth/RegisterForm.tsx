'use client';

import { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import type { AxiosError } from 'axios';

const { Title, Text } = Typography;

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const onFinish = async (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      await register(values.name, values.email, values.password);
      message.success('Registro exitoso');
      router.push('/orders');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      message.error(axiosError.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title level={2} style={{ marginBottom: 8 }}>
        Crear Cuenta
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 32 }}>
        Regístrate para gestionar tus envíos
      </Text>

      <Form layout="vertical" onFinish={onFinish} size="large">
        <Form.Item
          name="name"
          rules={[{ required: true, message: 'Ingresa tu nombre' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Nombre completo" />
        </Form.Item>

        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Ingresa tu email' },
            { type: 'email', message: 'Email no válido' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Ingresa tu contraseña' },
            { min: 6, message: 'Mínimo 6 caracteres' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Confirma tu contraseña' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Las contraseñas no coinciden'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Confirmar contraseña" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Registrarse
          </Button>
        </Form.Item>
      </Form>

      <Text>
        ¿Ya tienes cuenta? <Link href="/login">Inicia sesión</Link>
      </Text>
    </>
  );
}
