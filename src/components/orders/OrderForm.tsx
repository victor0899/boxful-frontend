'use client';

import { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Steps,
  Card,
  InputNumber,
  Switch,
  Space,
  message,
  Typography,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  UserOutlined,
  InboxOutlined,
  PlusOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useOrders } from '@/hooks/useOrders';
import type { AxiosError } from 'axios';

const { Title } = Typography;

interface PackageFormValues {
  description: string;
  weight: number;
  height: number;
  width: number;
  length: number;
  quantity: number;
}

export default function OrderForm() {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { createOrder } = useOrders();
  const router = useRouter();

  const steps = [
    { title: 'Datos del Cliente', icon: <UserOutlined /> },
    { title: 'Paquetes', icon: <InboxOutlined /> },
  ];

  const validateCurrentStep = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields([
          'clientName',
          'clientPhone',
          'clientAddress',
          'clientDepartment',
          'clientMunicipality',
        ]);
      } else {
        await form.validateFields();
      }
      return true;
    } catch {
      return false;
    }
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const orderData = {
        clientName: values.clientName,
        clientEmail: values.clientEmail || undefined,
        clientPhone: values.clientPhone,
        clientAddress: values.clientAddress,
        clientDepartment: values.clientDepartment,
        clientMunicipality: values.clientMunicipality,
        clientReference: values.clientReference || undefined,
        packages: values.packages.map((pkg: PackageFormValues) => ({
          description: pkg.description,
          weight: Number(pkg.weight),
          height: Number(pkg.height),
          width: Number(pkg.width),
          length: Number(pkg.length),
          quantity: Number(pkg.quantity),
        })),
        isCOD: values.isCOD || false,
        codExpectedAmount: values.isCOD ? Number(values.codExpectedAmount) : undefined,
      };

      await createOrder(orderData);
      message.success('Orden creada exitosamente');
      router.push('/orders');
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      if (axiosError.response?.data?.message) {
        const msg = Array.isArray(axiosError.response.data.message)
          ? axiosError.response.data.message.join(', ')
          : axiosError.response.data.message;
        message.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Title level={3} style={{ marginBottom: 24 }}>
        Nueva Orden de Envío
      </Title>

      <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          packages: [{ description: '', weight: '', height: '', width: '', length: '', quantity: 1 }],
          isCOD: false,
        }}
      >
        {/* Step 1: Client Data */}
        <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
          <Card title="Información del destinatario">
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="clientName"
                  label="Nombre completo"
                  rules={[{ required: true, message: 'Campo requerido' }]}
                >
                  <Input placeholder="Nombre del destinatario" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="clientEmail"
                  label="Email"
                  rules={[{ type: 'email', message: 'Email no válido' }]}
                >
                  <Input placeholder="email@ejemplo.com" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="clientPhone"
                  label="Teléfono"
                  rules={[{ required: true, message: 'Campo requerido' }]}
                >
                  <Input placeholder="+503 7890-1234" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="clientDepartment"
                  label="Departamento"
                  rules={[{ required: true, message: 'Campo requerido' }]}
                >
                  <Input placeholder="San Salvador" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="clientMunicipality"
                  label="Municipio"
                  rules={[{ required: true, message: 'Campo requerido' }]}
                >
                  <Input placeholder="San Salvador" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="clientAddress"
                  label="Dirección"
                  rules={[{ required: true, message: 'Campo requerido' }]}
                >
                  <Input placeholder="Col. Escalón, Calle #123" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="clientReference" label="Referencia">
              <Input placeholder="Frente al parque central" />
            </Form.Item>
          </Card>
        </div>

        {/* Step 2: Packages */}
        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <Card title="Paquetes">
            <Form.List name="packages">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      size="small"
                      style={{ marginBottom: 16 }}
                      title={`Paquete ${name + 1}`}
                      extra={
                        fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(name)}
                          >
                            Eliminar
                          </Button>
                        )
                      }
                    >
                      <Row gutter={16}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            {...restField}
                            name={[name, 'description']}
                            label="Descripción"
                            rules={[{ required: true, message: 'Requerido' }]}
                          >
                            <Input placeholder="Descripción del paquete" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'weight']}
                            label="Peso (kg)"
                            rules={[{ required: true, message: 'Requerido' }]}
                          >
                            <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} placeholder="0.0" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'quantity']}
                            label="Cantidad"
                            rules={[{ required: true, message: 'Requerido' }]}
                          >
                            <InputNumber min={1} style={{ width: '100%' }} placeholder="1" />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        <Col xs={24} md={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'height']}
                            label="Alto (cm)"
                            rules={[{ required: true, message: 'Requerido' }]}
                          >
                            <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} placeholder="0.0" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'width']}
                            label="Ancho (cm)"
                            rules={[{ required: true, message: 'Requerido' }]}
                          >
                            <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} placeholder="0.0" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                          <Form.Item
                            {...restField}
                            name={[name, 'length']}
                            label="Largo (cm)"
                            rules={[{ required: true, message: 'Requerido' }]}
                          >
                            <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} placeholder="0.0" />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Agregar paquete
                  </Button>
                </>
              )}
            </Form.List>
          </Card>

          <Divider />

          <Card title="Contra entrega (COD)">
            <Form.Item name="isCOD" label="Pago contra entrega" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.isCOD !== cur.isCOD}>
              {({ getFieldValue }) =>
                getFieldValue('isCOD') && (
                  <Form.Item
                    name="codExpectedAmount"
                    label="Monto a recolectar ($)"
                    rules={[{ required: true, message: 'Ingresa el monto esperado' }]}
                  >
                    <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="0.00" />
                  </Form.Item>
                )
              }
            </Form.Item>
          </Card>
        </div>

        {/* Navigation buttons */}
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
          <Space>
            {currentStep > 0 && (
              <Button icon={<ArrowLeftOutlined />} onClick={() => setCurrentStep(currentStep - 1)}>
                Anterior
              </Button>
            )}
          </Space>
          <Space>
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={handleNext}>
                Siguiente <ArrowRightOutlined />
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={loading}
                onClick={handleSubmit}
              >
                Crear Orden
              </Button>
            )}
          </Space>
        </div>
      </Form>
    </>
  );
}
