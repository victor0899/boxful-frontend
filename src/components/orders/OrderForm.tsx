'use client';

import { useState, useMemo } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  message,
  Typography,
  Row,
  Col,
  DatePicker,
  Select,
  InputNumber,
} from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { State, City } from 'country-state-city';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import dayjs from 'dayjs';
import { useOrders } from '@/hooks/useOrders';
import { colors } from '@/lib/theme';
import type { AxiosError } from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Package {
  length: number;
  height: number;
  width: number;
  weight: number;
  description: string;
}

export default function OrderForm() {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [currentPackage, setCurrentPackage] = useState<Partial<Package>>({});
  const [step1Data, setStep1Data] = useState<Record<string, unknown>>({});
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [phoneDialCode, setPhoneDialCode] = useState<string>('503');
  const { createOrder } = useOrders();
  const router = useRouter();

  // Obtener departamentos de El Salvador (código ISO: SV)
  const departments = useMemo(() => {
    return State.getStatesOfCountry('SV');
  }, []);

  // Obtener municipios del departamento seleccionado
  const municipalities = useMemo(() => {
    if (!selectedDepartment) return [];
    return City.getCitiesOfState('SV', selectedDepartment);
  }, [selectedDepartment]);

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    // Limpiar el campo de municipio cuando cambia el departamento
    form.resetFields(['municipality']);
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      // Guardar los valores del paso 1
      setStep1Data(values);
      setCurrentStep(1);
    } catch (error) {
      message.error('Por favor completa todos los campos requeridos');
    }
  };

  const handleAddPackage = () => {
    if (
      !currentPackage.length ||
      !currentPackage.height ||
      !currentPackage.width ||
      !currentPackage.weight ||
      !currentPackage.description
    ) {
      message.error('Por favor completa todos los campos del producto');
      return;
    }

    setPackages([...packages, currentPackage as Package]);
    setCurrentPackage({});
  };

  const handleRemovePackage = (index: number) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (packages.length === 0) {
      message.error('Debes agregar al menos un producto');
      return;
    }

    try {
      setLoading(true);

      // Obtener el nombre del departamento del isoCode
      const departmentName = departments.find(
        (dept) => dept.isoCode === step1Data.department
      )?.name || step1Data.department as string;

      // Extraer código de país y número del phone completo
      const fullPhone = step1Data.phone as string;
      const phoneNumber = fullPhone.slice(phoneDialCode.length); // Remover el dialCode del inicio

      const orderData = {
        // Nuevos campos requeridos por el backend (del paso 1)
        pickupAddress: step1Data.pickupAddress as string,
        scheduledDate: step1Data.scheduledDate ? (step1Data.scheduledDate as { toISOString: () => string }).toISOString() : undefined,
        firstName: step1Data.firstName as string,
        lastName: step1Data.lastName as string,
        phoneCode: phoneDialCode,
        phoneNumber: phoneNumber,
        instructions: step1Data.instructions as string | undefined,
        // Campos existentes (del paso 1)
        clientEmail: step1Data.email as string | undefined,
        clientAddress: step1Data.destinationAddress as string,
        clientDepartment: departmentName,
        clientMunicipality: step1Data.municipality as string,
        clientReference: step1Data.referencePoint as string | undefined,
        // Paquetes (del paso 2)
        packages: packages.map((pkg) => ({
          description: pkg.description,
          weight: pkg.weight,
          height: pkg.height,
          width: pkg.width,
          length: pkg.length,
          quantity: 1,
        })),
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
      {/* Hero Section */}
      <Title level={1} style={{ fontSize: 42, fontWeight: 700, color: colors.gray[500], marginBottom: 16 }}>
        Crea una orden
      </Title>
      <Text
        style={{
          fontSize: 18,
          color: colors.gray[500],
          display: 'block',
          marginBottom: 32,
          lineHeight: 1.6,
        }}
      >
        Dale una ventaja competitiva a tu negocio con entregas <strong>el mismo día</strong> (Área
        Metropolitana) y <strong>el día siguiente</strong> a nivel nacional.
      </Text>

      {/* Step 1: Complete data */}
      {currentStep === 0 && (
        <Card>
          <Title level={4} style={{ marginBottom: 24, color: colors.gray[500], fontWeight: 600 }}>
            Completa los datos
          </Title>

          <Form form={form} layout="vertical" initialValues={{ phoneCode: '503' }}>
          {/* Row 1: Dirección de recolección + Fecha programada */}
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                name="pickupAddress"
                label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Dirección de recolección</span>}
                required={false}
                rules={[{ required: true, message: 'Campo requerido' }]}
              >
                <Input  />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="scheduledDate"
                label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Fecha programada</span>}
                required={false}
                rules={[{ required: true, message: 'Campo requerido' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 2: Nombres + Apellidos + Correo */}
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="firstName"
                label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Nombres</span>}
                required={false}
                rules={[{ required: true, message: 'Campo requerido' }]}
              >
                <Input  />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="lastName"
                label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Apellidos</span>}
                required={false}
                rules={[{ required: true, message: 'Campo requerido' }]}
              >
                <Input  />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="email"
                label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Correo electrónico</span>}
                required={false}
                rules={[
                  { required: true, message: 'Campo requerido' },
                  { type: 'email', message: 'Email no válido' },
                ]}
              >
                <Input  />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 3: Teléfono + Dirección del destinatario */}
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="phone"
                label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Teléfono</span>}
                required={false}
                rules={[{ required: true, message: 'Campo requerido' }]}
              >
                <PhoneInput
                  country={'sv'}
                  preferredCountries={['sv', 'hn', 'ni', 'gt']}
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
                      setPhoneDialCode(country.dialCode);
                    }
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={16}>
              <Form.Item
                name="destinationAddress"
                label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Dirección del destinatario</span>}
                required={false}
                rules={[{ required: true, message: 'Campo requerido' }]}
              >
                <Input  />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 4: Departamento + Municipio + Punto de referencia */}
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="department"
                label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Departamento</span>}
                required={false}
                rules={[{ required: true, message: 'Campo requerido' }]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  onChange={handleDepartmentChange}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={departments.map((dept) => ({
                    value: dept.isoCode,
                    label: dept.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="municipality"
                label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Municipio</span>}
                required={false}
                rules={[{ required: true, message: 'Campo requerido' }]}
              >
                <Select
                  showSearch
                  optionFilterProp="children"
                  disabled={!selectedDepartment}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={municipalities.map((city) => ({
                    value: city.name,
                    label: city.name,
                  }))}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="referencePoint"
                label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Punto de referencia</span>}
              >
                <Input  />
              </Form.Item>
            </Col>
          </Row>

          {/* Row 5: Indicaciones */}
          <Row>
            <Col xs={24}>
              <Form.Item
                name="instructions"
                label={<span style={{ color: colors.gray[500], fontWeight: 500 }}>Indicaciones</span>}
              >
                <TextArea rows={3}  />
              </Form.Item>
            </Col>
          </Row>

            {/* Next Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
              <Button
                type="primary"
                size="large"
                onClick={handleNext}
                style={{ minWidth: 160, height: 48, fontSize: 16 }}
                icon={<ArrowRightOutlined />}
                iconPosition="end"
              >
                Siguiente
              </Button>
            </div>
          </Form>
        </Card>
      )}

      {/* Step 2: Add products */}
      {currentStep === 1 && (
        <Card>
          <Title level={4} style={{ marginBottom: 24, color: colors.gray[500], fontWeight: 600 }}>
            Agrega tus productos
          </Title>

          {/* Add product form */}
          <div
            style={{
              backgroundColor: '#f5f5f5',
              padding: 24,
              borderRadius: 8,
              marginBottom: 24,
            }}
          >
            <Row gutter={16} align="middle">
              <Col xs={24} sm={3}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: 40,
                  }}
                >
                  📦
                </div>
              </Col>
              <Col xs={12} sm={3}>
                <div>
                  <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: 500 }}>Largo</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <InputNumber
                      min={1}
                      
                      value={currentPackage.length}
                      onChange={(value) => setCurrentPackage({ ...currentPackage, length: value || 0 })}
                      style={{ width: 60 }}
                    />
                    <Text style={{ fontSize: 12, color: colors.gray[300] }}>cm</Text>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={3}>
                <div>
                  <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: 500 }}>Alto</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <InputNumber
                      min={1}
                      
                      value={currentPackage.height}
                      onChange={(value) => setCurrentPackage({ ...currentPackage, height: value || 0 })}
                      style={{ width: 60 }}
                    />
                    <Text style={{ fontSize: 12, color: colors.gray[300] }}>cm</Text>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={3}>
                <div>
                  <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: 500 }}>Ancho</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <InputNumber
                      min={1}
                      
                      value={currentPackage.width}
                      onChange={(value) => setCurrentPackage({ ...currentPackage, width: value || 0 })}
                      style={{ width: 60 }}
                    />
                    <Text style={{ fontSize: 12, color: colors.gray[300] }}>cm</Text>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={4}>
                <div>
                  <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: 500 }}>
                    Peso en libras
                  </Text>
                  <Input
                    
                    value={currentPackage.weight}
                    onChange={(e) =>
                      setCurrentPackage({ ...currentPackage, weight: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>
              </Col>
              <Col xs={24} sm={6}>
                <div>
                  <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: 500 }}>Contenido</Text>
                  <Input
                    
                    value={currentPackage.description}
                    onChange={(e) => setCurrentPackage({ ...currentPackage, description: e.target.value })}
                  />
                </div>
              </Col>
              <Col xs={24} sm={2}>
                <Button
                  type="default"
                  icon={<PlusOutlined />}
                  onClick={handleAddPackage}
                  style={{ width: '100%', marginTop: 16 }}
                >
                  Agregar
                </Button>
              </Col>
            </Row>
          </div>

          {/* Added products list */}
          {packages.map((pkg, index) => (
            <div
              key={index}
              style={{
                border: `2px solid #52c41a`,
                borderRadius: 8,
                padding: 16,
                marginBottom: 16,
                backgroundColor: '#f6ffed',
              }}
            >
              <Row gutter={16} align="middle">
                <Col xs={6} sm={3}>
                  <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: 500 }}>
                    Peso en libras
                  </Text>
                  <div>
                    <Text style={{ fontSize: 14 }}>{pkg.weight} libras</Text>
                  </div>
                </Col>
                <Col xs={12} sm={6}>
                  <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: 500 }}>Contenido</Text>
                  <div>
                    <Text style={{ fontSize: 14 }}>{pkg.description}</Text>
                  </div>
                </Col>
                <Col xs={6} sm={2}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: 32,
                    }}
                  >
                    📦
                  </div>
                </Col>
                <Col xs={6} sm={2}>
                  <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: 500 }}>Largo</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 14 }}>{pkg.length}</Text>
                    <Text style={{ fontSize: 12, color: colors.gray[300] }}>cm</Text>
                  </div>
                </Col>
                <Col xs={6} sm={2}>
                  <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: 500 }}>Alto</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 14 }}>{pkg.height}</Text>
                    <Text style={{ fontSize: 12, color: colors.gray[300] }}>cm</Text>
                  </div>
                </Col>
                <Col xs={6} sm={2}>
                  <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: 500 }}>Ancho</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 14 }}>{pkg.width}</Text>
                    <Text style={{ fontSize: 12, color: colors.gray[300] }}>cm</Text>
                  </div>
                </Col>
                <Col xs={24} sm={2}>
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemovePackage(index)}
                    style={{ width: '100%' }}
                  >
                    Eliminar
                  </Button>
                </Col>
              </Row>
            </div>
          ))}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            <Button
              size="large"
              onClick={() => setCurrentStep(0)}
              icon={<ArrowLeftOutlined />}
              style={{ minWidth: 160, height: 48, fontSize: 16 }}
            >
              Regresar
            </Button>
            <Button
              type="primary"
              size="large"
              loading={loading}
              onClick={handleSubmit}
              style={{ minWidth: 160, height: 48, fontSize: 16 }}
              icon={<ArrowRightOutlined />}
              iconPosition="end"
            >
              Enviar
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
