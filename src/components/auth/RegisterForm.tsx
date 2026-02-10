'use client';

import { useState } from 'react';
import { Form, Input, Button, Typography, Row, Col, Select, DatePicker, App, Modal } from 'antd';
import { LeftOutlined, DollarOutlined, FrownOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import dayjs from 'dayjs';
import { useAuth } from '@/lib/auth-context';
import { colors } from '@/lib/theme';
import api from '@/lib/api';
import type { AxiosError } from 'axios';

const { Title, Text } = Typography;

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [whatsappDialCode, setWhatsappDialCode] = useState<string>('503');
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
    whatsapp: string;
    password: string;
    confirmPassword: string;
  }) => {
    // Extraer código de país y número del whatsapp completo
    const fullWhatsapp = values.whatsapp;
    const whatsappNumber = fullWhatsapp.slice(whatsappDialCode.length); // Remover el dialCode del inicio
    const phoneNumber = `+${whatsappDialCode} ${whatsappNumber}`;

    modal.confirm({
      title: null,
      icon: null,
      width: 498,
      closable: true,
      content: (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          {/* Icono centrado */}
          <div
            style={{
              width: 160,
              height: 160,
              borderRadius: '50%',
              backgroundColor: '#FFF7E6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px',
            }}
          >
            <img
              src="/images/warning.svg"
              alt="Warning"
              style={{ width: 90, height: 90 }}
            />
          </div>

          {/* Título */}
          <div style={{ fontSize: 24, color: colors.gray[500], marginBottom: 16, fontWeight: 400 }}>
            Confirmar número <strong style={{ fontWeight: 600 }}>de teléfono</strong>
          </div>

          {/* Texto de confirmación */}
          <Text style={{ fontSize: 16, color: colors.gray[500] }}>
            Está seguro de que desea continuar con el número <strong>{phoneNumber}</strong>?
          </Text>
        </div>
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
          whatsappCode: whatsappDialCode,
          whatsappNumber: whatsappNumber,
          password: values.password,
        };
        setPendingFormData(formData);
        // Enviar código de verificación
        sendVerificationCode(values.email);
      },
      okButtonProps: {
        style: {
          height: 48,
          fontSize: 16,
          minWidth: 120,
          backgroundColor: colors.blue[500],
          borderColor: colors.blue[500],
        },
      },
      cancelButtonProps: {
        style: {
          height: 48,
          fontSize: 16,
          minWidth: 120,
          color: colors.gray[500],
        },
      },
    });
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <LeftOutlined
          onClick={() => router.push('/login')}
          style={{
            fontSize: 16,
            color: colors.blue.dark,
            cursor: 'pointer',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = colors.blue[500])}
          onMouseLeave={(e) => (e.currentTarget.style.color = colors.blue.dark)}
        />
        <Title level={2} style={{ margin: 0, color: colors.blue.dark, fontWeight: 700 }}>
          Cuéntanos de ti
        </Title>
      </div>
      <Text style={{ display: 'block', marginBottom: 32, color: colors.gray[500], fontSize: 16 }}>
        Completa la información de registro
      </Text>

      <Form layout="vertical" onFinish={onFinish} size="large">
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Nombre</span>}
              name="firstName"
              required={false}
              rules={[{ required: true, message: 'Ingresa tu nombre' }]}
            >
              <Input placeholder="Digita tu nombre" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Apellido</span>}
              name="lastName"
              required={false}
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
              required={false}
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
              required={false}
              rules={[{ required: true, message: 'Selecciona tu fecha de nacimiento' }]}
            >
              <DatePicker
                placeholder="Seleccionar"
                style={{ width: '100%' }}
                disabledDate={(current) => current && current > dayjs().endOf('day')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Correo electrónico</span>}
              name="email"
              required={false}
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
              name="whatsapp"
              required={false}
              rules={[{ required: true, message: 'Ingresa tu número' }]}
            >
              <PhoneInput
                country={'sv'}
                preferredCountries={['sv', 'hn', 'ni', 'gt', 'us', 'mx', 'cr']}
                containerStyle={{ width: '100%' }}
                inputStyle={{
                  width: '100%',
                  height: '48px',
                  fontSize: '14px',
                  borderRadius: '8px',
                }}
                buttonStyle={{
                  borderRadius: '8px 0 0 8px',
                }}
                onChange={(_value, country: { dialCode?: string }) => {
                  // Guardar el dialCode cuando cambia el país
                  if (country.dialCode) {
                    setWhatsappDialCode(country.dialCode);
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Contraseña</span>}
              name="password"
              required={false}
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
              required={false}
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
          <Text style={{ display: 'block', marginBottom: 16, color: colors.gray[500] }}>
            Ingresa el código de 6 dígitos que enviamos a <strong>{pendingFormData?.email}</strong>
          </Text>

          <div
            style={{
              backgroundColor: '#FFF7E6',
              border: '1px solid #FFD591',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 24,
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
              <DollarOutlined style={{ fontSize: 24, color: '#FFA940' }} />
              <FrownOutlined style={{ fontSize: 24, color: '#FFA940' }} />
            </div>
            <Text style={{ fontSize: 14, color: colors.gray[500], display: 'block', marginBottom: 8 }}>
              Debido a las limitaciones de Resend (tier gratuito), este código no será enviado a tu correo electrónico.
            </Text>
            <Text style={{ fontSize: 14, color: colors.gray[500], display: 'block' }}>
              Por favor, utiliza el siguiente código: <strong style={{ color: colors.blue[500] }}>000000</strong>.
            </Text>
          </div>

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
