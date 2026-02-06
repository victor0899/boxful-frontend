'use client';

import { useState } from 'react';
import { Form, Input, Button, Typography, Row, Col, Select, DatePicker, Space, App, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { colors } from '@/lib/theme';
import api from '@/lib/api';
import type { AxiosError } from 'axios';

const { Title, Text } = Typography;

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingFormData, setPendingFormData] = useState<{
    firstName: string;
    lastName: string;
    gender: string;
    birthDate: string;
    email: string;
    whatsappCode: string;
    whatsappNumber: string;
    password: string;
  } | null>(null);
  const { register } = useAuth();
  const router = useRouter();
  const { modal, message } = App.useApp();

  const sendVerificationCode = async (email: string) => {
    setLoading(true);
    try {
      await api.post('/verification/send-code', { email });
      message.success('Código enviado a tu email');
      setVerificationModalOpen(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      message.error(axiosError.response?.data?.message || 'Error al enviar código');
    } finally {
      setLoading(false);
    }
  };

  const verifyCodeAndRegister = async () => {
    if (!pendingFormData) return;

    if (verificationCode.length !== 6) {
      message.error('El código debe tener 6 dígitos');
      return;
    }

    setLoading(true);
    try {
      // Verificar código
      await api.post('/verification/verify-code', {
        email: pendingFormData.email,
        code: verificationCode,
      });

      // Si el código es válido, proceder con el registro
      await register(pendingFormData);
      message.success('Registro exitoso');
      setVerificationModalOpen(false);
      router.push('/orders');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      message.error(axiosError.response?.data?.message || 'Código inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = (values: {
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
    const phoneNumber = `+${values.whatsappCode} ${values.whatsappNumber}`;

    modal.confirm({
      title: (
        <span style={{ color: colors.gray[500], fontSize: 24, fontWeight: 600 }}>
          Confirmar número de teléfono
        </span>
      ),
      icon: (
        <ExclamationCircleOutlined
          style={{
            fontSize: 64,
            color: '#FFA940',
            backgroundColor: '#FFF7E6',
            borderRadius: '50%',
            padding: 24,
          }}
        />
      ),
      content: (
        <Text style={{ fontSize: 16, color: colors.gray[500] }}>
          Está seguro de que desea continuar con el número <strong>{phoneNumber}</strong>?
        </Text>
      ),
      okText: 'Aceptar',
      cancelText: 'Cancelar',
      centered: true,
      onOk: () => {
        // Guardar datos del formulario
        const formData = {
          firstName: values.firstName,
          lastName: values.lastName,
          gender: values.gender,
          birthDate: values.birthDate ? (values.birthDate as { format: (fmt: string) => string }).format('YYYY-MM-DD') : '',
          email: values.email,
          whatsappCode: values.whatsappCode,
          whatsappNumber: values.whatsappNumber,
          password: values.password,
        };
        setPendingFormData(formData);
        // Enviar código de verificación
        sendVerificationCode(values.email);
      },
      okButtonProps: {
        style: { height: 48, fontSize: 16, minWidth: 120 },
      },
      cancelButtonProps: {
        style: { height: 48, fontSize: 16, minWidth: 120 },
      },
    });
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

      {/* Modal de verificación de código */}
      <Modal
        open={verificationModalOpen}
        onCancel={() => {
          setVerificationModalOpen(false);
          setVerificationCode('');
        }}
        footer={null}
        centered
        width={480}
      >
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Title level={3} style={{ color: colors.gray[500], marginBottom: 16 }}>
            Verificar tu email
          </Title>
          <Text style={{ display: 'block', marginBottom: 32, color: colors.gray[500] }}>
            Ingresa el código de 6 dígitos que enviamos a <strong>{pendingFormData?.email}</strong>
          </Text>

          <Input
            placeholder="000000"
            maxLength={6}
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
            style={{
              fontSize: 24,
              textAlign: 'center',
              letterSpacing: 8,
              fontWeight: 600,
              height: 56,
              marginBottom: 24,
            }}
          />

          <Button
            type="primary"
            onClick={verifyCodeAndRegister}
            loading={loading}
            block
            size="large"
            disabled={verificationCode.length !== 6}
          >
            Verificar y registrar
          </Button>

          <Button
            type="link"
            onClick={() => pendingFormData && sendVerificationCode(pendingFormData.email)}
            style={{ marginTop: 16, color: colors.blue[500] }}
          >
            Reenviar código
          </Button>
        </div>
      </Modal>
    </>
  );
}
