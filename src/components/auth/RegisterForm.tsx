'use client';

import { useState } from 'react';
import { Form, Input, Button, message, Typography, Row, Col, Select, DatePicker, Space } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { colors } from '@/lib/theme';
import type { AxiosError } from 'axios';

const { Title, Text } = Typography;

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const onFinish = async (values: {
    firstName: string;
    lastName: string;
    gender: string;
    birthDate: unknown;
    email: string;
    whatsappCode: string;
    whatsappNumber: string;
    password: string;
    confirmPassword: string;
  }) => {
    setLoading(true);
    try {
      await register({
        firstName: values.firstName,
        lastName: values.lastName,
        gender: values.gender,
        birthDate: values.birthDate ? (values.birthDate as { format: (fmt: string) => string }).format('YYYY-MM-DD') : '',
        email: values.email,
        whatsappCode: values.whatsappCode,
        whatsappNumber: values.whatsappNumber,
        password: values.password,
      });
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
      <Title level={2} style={{ marginBottom: 8, color: colors.gray[500], fontWeight: 700 }}>
        Cuéntanos de ti
      </Title>
      <Text style={{ display: 'block', marginBottom: 32, color: colors.gray[500], fontSize: 16 }}>
        Completa la información de registro
      </Text>

      <Form layout="vertical" onFinish={onFinish} size="large">
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Nombre</span>}
              name="firstName"
              rules={[{ required: true, message: 'Ingresa tu nombre' }]}
            >
              <Input placeholder="Digita tu nombre" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Apellido</span>}
              name="lastName"
              rules={[{ required: true, message: 'Ingresa tu apellido' }]}
            >
              <Input placeholder="Digita tu apellido" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Sexo</span>}
              name="gender"
              rules={[{ required: true, message: 'Selecciona tu sexo' }]}
            >
              <Select placeholder="Seleccionar">
                <Select.Option value="M">Masculino</Select.Option>
                <Select.Option value="F">Femenino</Select.Option>
                <Select.Option value="O">Otro</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Fecha de nacimiento</span>}
              name="birthDate"
              rules={[{ required: true, message: 'Selecciona tu fecha de nacimiento' }]}
            >
              <DatePicker placeholder="Seleccionar" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Correo electrónico</span>}
              name="email"
              rules={[
                { required: true, message: 'Ingresa tu email' },
                { type: 'email', message: 'Email no válido' },
              ]}
            >
              <Input placeholder="Digitar correo" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Número de whatsapp</span>}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Form.Item name="whatsappCode" noStyle initialValue="503">
                  <Select style={{ width: 100 }}>
                    <Select.Option value="503">503</Select.Option>
                    <Select.Option value="504">504</Select.Option>
                    <Select.Option value="505">505</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name="whatsappNumber"
                  noStyle
                  rules={[{ required: true, message: 'Ingresa tu número' }]}
                >
                  <Input placeholder="7777 7777" style={{ width: '100%' }} />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Contraseña</span>}
              name="password"
              rules={[
                { required: true, message: 'Ingresa tu contraseña' },
                { min: 6, message: 'Mínimo 6 caracteres' },
              ]}
            >
              <Input.Password placeholder="Digitar contraseña" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Repetir contraseña</span>}
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
              <Input.Password placeholder="Digitar contraseña" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 32 }}>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Siguiente
          </Button>
        </Form.Item>
      </Form>

      <Text style={{ display: 'block', textAlign: 'center', color: colors.gray[500] }}>
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" style={{ color: colors.gray[500], fontWeight: 700 }}>
          Inicia sesión
        </Link>
      </Text>
    </>
  );
}
