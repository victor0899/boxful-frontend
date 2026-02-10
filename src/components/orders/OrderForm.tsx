'use client';

import { useState, useMemo } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Row,
  Col,
  DatePicker,
  Select,
  App,
  Switch,
  Modal,
  Tooltip,
} from 'antd';
import { ArrowRightOutlined, ArrowLeftOutlined, LeftOutlined, PlusOutlined, DeleteOutlined, EditOutlined, InfoCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { State, City } from 'country-state-city';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import dayjs from 'dayjs';
import { useOrders } from '@/hooks/useOrders';
import { colors } from '@/lib/theme';
import type { AxiosError } from 'axios';
import DimensionsInput from './DimensionsInput';

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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingPackage, setEditingPackage] = useState<Partial<Package>>({});
  const [packageErrors, setPackageErrors] = useState<Record<string, boolean>>({});
  const [step1Data, setStep1Data] = useState<Record<string, unknown>>({});
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [phoneDialCode, setPhoneDialCode] = useState<string>('503');
  const [isCOD, setIsCOD] = useState(false);
  const [codAmount, setCodAmount] = useState<number>(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { createOrder } = useOrders();
  const router = useRouter();
  const { message } = App.useApp();

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
    } catch {
      message.error('Por favor completa todos los campos requeridos');
    }
  };

  const handleAddPackage = () => {
    // Validar que el peso sea mayor a 0 si existe
    if (currentPackage.weight !== undefined && currentPackage.weight <= 0) {
      setPackageErrors({ ...packageErrors, weight: true });
      message.error('El peso debe ser mayor a 0');
      return;
    }

    // Validar y marcar errores de campos vacíos
    const errors: Record<string, boolean> = {
      length: !currentPackage.length || currentPackage.length <= 0,
      height: !currentPackage.height || currentPackage.height <= 0,
      width: !currentPackage.width || currentPackage.width <= 0,
      weight: !currentPackage.weight,
      description: !currentPackage.description,
    };

    const hasErrors = Object.values(errors).some(error => error);

    if (hasErrors) {
      setPackageErrors(errors);
      message.error('Por favor completa todos los campos del producto');
      return;
    }

    // Agregar nuevo paquete
    setPackages([...packages, currentPackage as Package]);
    setCurrentPackage({});
    setPackageErrors({});
  };

  const handleEditPackage = (index: number) => {
    setEditingIndex(index);
    setEditingPackage(packages[index]);
  };

  const handleSaveEdit = (index: number) => {
    const updatedPackages = [...packages];
    updatedPackages[index] = editingPackage as Package;
    setPackages(updatedPackages);
    setEditingIndex(null);
    setEditingPackage({});
    message.success('Producto actualizado');
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditingPackage({});
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
        // COD (Pago contra entrega)
        isCOD,
        codExpectedAmount: isCOD && codAmount > 0 ? codAmount : undefined,
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
      setShowSuccessModal(true);
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
                label={
                  <span style={{ color: colors.gray[500], fontWeight: 500 }}>
                    Fecha programada{' '}
                    <Tooltip
                      title={
                        <div style={{ padding: 8 }}>
                          <div style={{ fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CalendarOutlined /> Tarifario por Día
                          </div>
                          <div style={{ fontSize: 12 }}>
                            <div style={{ marginBottom: 4 }}>• Domingo: $5.00</div>
                            <div style={{ marginBottom: 4 }}>• Lunes: $3.00</div>
                            <div style={{ marginBottom: 4 }}>• Martes: $3.00</div>
                            <div style={{ marginBottom: 4 }}>• Miércoles: $3.50</div>
                            <div style={{ marginBottom: 4 }}>• Jueves: $3.50</div>
                            <div style={{ marginBottom: 4 }}>• Viernes: $4.00</div>
                            <div>• Sábado: $4.50</div>
                          </div>
                        </div>
                      }
                      placement="right"
                    >
                      <InfoCircleOutlined style={{ fontSize: 14, color: colors.gray[300], cursor: 'pointer' }} />
                    </Tooltip>
                  </span>
                }
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
                    label: dept.name.replace(/ Department$/i, ''),
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
                    value: city.name.replace(/ Department$/i, ''),
                    label: city.name.replace(/ Department$/i, ''),
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

          {/* Row 6: COD (Pago contra entrega) */}
          <Row>
            <Col xs={24}>
              <div
                style={{
                  backgroundColor: colors.orange[50],
                  padding: 16,
                  borderRadius: 8,
                  marginBottom: 24,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCOD ? 16 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Tooltip title="Permite que el cliente pague su pedido al recibirlo, sin necesidad de pagar en línea previamente.">
                      <InfoCircleOutlined style={{ fontSize: 16, color: colors.gray[500], cursor: 'pointer' }} />
                    </Tooltip>
                    <Text style={{ fontSize: 14, color: colors.gray[500], fontWeight: 500 }}>
                      Pago contra entrega (PCE)
                    </Text>
                  </div>
                  <Switch
                    checked={isCOD}
                    onChange={setIsCOD}
                    style={{ backgroundColor: isCOD ? colors.success[500] : undefined }}
                  />
                </div>
                {isCOD && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, color: colors.gray[500], marginRight: 4 }}>
                      Tu cliente paga el <strong>monto que indiques</strong> al momento de la entrega
                    </Text>
                    <div
                      style={{
                        width: 200,
                        height: 48,
                        border: '1px solid #d9d9d9',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 12px',
                        backgroundColor: '#fff',
                      }}
                    >
                      <Text style={{ color: colors.gray[500] }}>$</Text>
                      <input
                        type="number"
                        value={codAmount > 0 ? codAmount : ''}
                        onChange={(e) => setCodAmount(parseFloat(e.target.value) || 0)}
                        placeholder="00.00"
                        style={{
                          border: 'none',
                          outline: 'none',
                          textAlign: 'right',
                          width: '100%',
                          fontSize: 14,
                          color: colors.gray[500],
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            {/* Chevron - solo visible en móviles */}
            <LeftOutlined
              onClick={() => setCurrentStep(0)}
              className="mobile-back-chevron"
              style={{
                fontSize: 18,
                color: colors.blue.dark,
                cursor: 'pointer',
                transition: 'color 0.2s',
                display: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = colors.blue[500])}
              onMouseLeave={(e) => (e.currentTarget.style.color = colors.blue.dark)}
            />
            <Title level={4} style={{ margin: 0, color: colors.gray[500], fontWeight: 600 }}>
              Agrega tus productos
            </Title>
          </div>

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
              <Col flex="0 0 auto">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Image src="/images/box1.svg" alt="Box" width={30} height={30} />
                </div>
              </Col>

              {/* Dimensiones agrupadas */}
              <Col xs={24} md={9}>
                <DimensionsInput
                  length={currentPackage.length}
                  height={currentPackage.height}
                  width={currentPackage.width}
                  onChange={(dimension, value) => setCurrentPackage({ ...currentPackage, [dimension]: value })}
                  errors={{
                    length: packageErrors.length,
                    height: packageErrors.height,
                    width: packageErrors.width,
                  }}
                  onClearError={(dimension) => setPackageErrors({ ...packageErrors, [dimension]: false })}
                />
              </Col>
              <Col xs={24} md={4}>
                <div>
                  <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: 500 }}>
                    Peso en libras
                  </Text>
                  <Input
                    status={packageErrors.weight ? 'error' : ''}
                    value={currentPackage.weight}
                    onChange={(e) => {
                      setCurrentPackage({ ...currentPackage, weight: parseFloat(e.target.value) || 0 });
                      setPackageErrors({ ...packageErrors, weight: false });
                    }}
                  />
                </div>
              </Col>
              <Col flex="1 1 auto">
                <div>
                  <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: 500 }}>Contenido</Text>
                  <Input
                    status={packageErrors.description ? 'error' : ''}
                    value={currentPackage.description}
                    onChange={(e) => {
                      setCurrentPackage({ ...currentPackage, description: e.target.value });
                      setPackageErrors({ ...packageErrors, description: false });
                    }}
                  />
                </div>
              </Col>
              <Col xs={24} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, gap: 8 }}>
                <Button
                  type="default"
                  icon={<PlusOutlined />}
                  iconPosition="end"
                  onClick={handleAddPackage}
                  style={{
                    background: '#fff',
                    color: colors.textDark,
                    fontWeight: 500,
                    borderColor: '#d9d9d9',
                  }}
                >
                  Agregar
                </Button>
              </Col>
            </Row>
          </div>

          {/* Added products list */}
          {packages.map((pkg, index) => {
            const isEditing = editingIndex === index;
            const displayPkg = isEditing ? editingPackage : pkg;

            return (
              <div
                key={index}
                style={{
                  border: `2px solid ${colors.success[500]}`,
                  borderRadius: 16,
                  padding: '24px 32px',
                  marginBottom: 16,
                  backgroundColor: 'transparent',
                }}
              >
                <Row gutter={[16, 16]} align="top">
                  {/* Peso en libras */}
                  <Col xs={24} sm={12} md={8} lg={8} xl={6}>
                    <div>
                      <Text style={{ fontSize: 14, color: colors.gray[500], fontWeight: 500, display: 'block', marginBottom: 8 }}>
                        Peso en libras
                      </Text>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={displayPkg.weight}
                          onChange={(e) =>
                            setEditingPackage({ ...editingPackage, weight: parseFloat(e.target.value) || 0 })
                          }
                        />
                      ) : (
                        <Input value={`${pkg.weight} libras`} readOnly style={{ cursor: 'default' }} />
                      )}
                    </div>
                  </Col>

                  {/* Contenido */}
                  <Col xs={24} sm={12} md={16} lg={16} xl={8}>
                    <div>
                      <Text style={{ fontSize: 14, color: colors.gray[500], fontWeight: 500, display: 'block', marginBottom: 8 }}>
                        Contenido
                      </Text>
                      {isEditing ? (
                        <Input
                          value={displayPkg.description}
                          onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                        />
                      ) : (
                        <Input value={pkg.description} readOnly style={{ cursor: 'default' }} />
                      )}
                    </div>
                  </Col>

                  {/* Icono de caja - solo visible en pantallas grandes */}
                  <Col xs={0} xl={1} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image src="/images/box1.svg" alt="Box" width={30} height={30} />
                  </Col>

                  {/* Dimensiones */}
                  <Col xs={24} sm={16} md={12} lg={12} xl={5}>
                    <DimensionsInput
                      length={displayPkg.length}
                      height={displayPkg.height}
                      width={displayPkg.width}
                      readOnly={!isEditing}
                      onChange={
                        isEditing
                          ? (dimension, value) =>
                              setEditingPackage({ ...editingPackage, [dimension]: value })
                          : undefined
                      }
                    />
                  </Col>

                  {/* Botones - cambian según el modo */}
                  <Col xs={24} sm={24} md={24} lg={24} xl={4}>
                    <div>
                      <Text style={{ fontSize: 14, color: 'transparent', fontWeight: 500, display: 'block', userSelect: 'none' }}>
                        &nbsp;
                      </Text>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', height: 48 }}>
                        {isEditing ? (
                      <>
                        <Button
                          onClick={() => handleSaveEdit(index)}
                          style={{
                            backgroundColor: colors.success[500],
                            color: '#fff',
                            borderColor: colors.success[500],
                          }}
                        >
                          Actualizar
                        </Button>
                        <Button onClick={handleCancelEdit}>Cancelar</Button>
                      </>
                    ) : (
                      <>
                        <Button
                          type="default"
                          icon={<EditOutlined style={{ fontSize: 18, color: colors.blue[500] }} />}
                          onClick={() => handleEditPackage(index)}
                          style={{
                            background: '#fff',
                            borderColor: '#d9d9d9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 48,
                            width: 48,
                          }}
                        />
                        <Button
                          type="default"
                          icon={<DeleteOutlined style={{ fontSize: 18, color: colors.error[500] }} />}
                          onClick={() => handleRemovePackage(index)}
                          style={{
                            background: '#fff',
                            borderColor: '#d9d9d9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 48,
                            width: 48,
                          }}
                        />
                      </>
                    )}
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            );
          })}

          {/* Navigation buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            {/* Botón Regresar - oculto en móviles */}
            <Button
              className="desktop-back-button"
              size="large"
              onClick={() => setCurrentStep(0)}
              icon={<ArrowLeftOutlined />}
              style={{ minWidth: 160, height: 48, fontSize: 16 }}
            >
              Regresar
            </Button>
            {/* Botón Enviar */}
            <Button
              className="submit-button"
              type="primary"
              size="large"
              loading={loading}
              disabled={packages.length === 0}
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

      {/* Modal de éxito */}
      <Modal
        open={showSuccessModal}
        onCancel={() => setShowSuccessModal(false)}
        footer={null}
        closable={true}
        closeIcon={<span style={{ fontSize: 24, color: colors.gray[500] }}>×</span>}
        centered
        width={600}
      >
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          {/* Icono de éxito */}
          <div style={{ margin: '0 auto 32px', display: 'flex', justifyContent: 'center' }}>
            <Image
              src="/images/done.svg"
              alt="Success"
              width={90}
              height={90}
              style={{ borderRadius: 12 }}
            />
          </div>

          {/* Título */}
          <Title level={2} style={{ marginBottom: 16, fontSize: 32 }}>
            Orden <strong>enviada</strong>
          </Title>

          {/* Descripción */}
          <Text style={{ fontSize: 16, color: colors.gray[500], display: 'block', marginBottom: 32 }}>
            La orden ha sido creada y enviada, puedes
          </Text>

          {/* Botones */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
            <Button
              size="large"
              onClick={() => {
                setShowSuccessModal(false);
                router.push('/orders');
              }}
              style={{ minWidth: 160, height: 48, fontSize: 16 }}
            >
              Ir a inicio
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={() => {
                setShowSuccessModal(false);
                setCurrentStep(0);
                setPackages([]);
                setCurrentPackage({});
                setIsCOD(false);
                setCodAmount(0);
                form.resetFields();
              }}
              style={{ minWidth: 160, height: 48, fontSize: 16 }}
            >
              Crear otra
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
