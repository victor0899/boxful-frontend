'use client';

import { Form, Input, Select, DatePicker, Button, Space, Switch } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;

interface FilterValues {
  search?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  isCOD?: string;
}

interface OrderFiltersProps {
  onFilter: (values: FilterValues) => void;
  onClear: () => void;
  loading: boolean;
}

export default function OrderFilters({ onFilter, onClear, loading }: OrderFiltersProps) {
  const [form] = Form.useForm();

  const handleFilter = () => {
    const values = form.getFieldsValue();
    const filters: FilterValues = {};

    if (values.search) filters.search = values.search;
    if (values.status) filters.status = values.status;
    if (values.dateRange?.[0]) filters.fromDate = values.dateRange[0].format('YYYY-MM-DD');
    if (values.dateRange?.[1]) filters.toDate = values.dateRange[1].format('YYYY-MM-DD');
    if (values.isCOD) filters.isCOD = 'true';

    onFilter(filters);
  };

  const handleClear = () => {
    form.resetFields();
    onClear();
  };

  return (
    <Form form={form} layout="inline" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
      <Form.Item name="search">
        <Input placeholder="Buscar por cliente" prefix={<SearchOutlined />} allowClear />
      </Form.Item>

      <Form.Item name="status">
        <Select placeholder="Estado" allowClear style={{ width: 150 }}>
          <Select.Option value="PENDING">Pendiente</Select.Option>
          <Select.Option value="IN_TRANSIT">En tránsito</Select.Option>
          <Select.Option value="DELIVERED">Entregado</Select.Option>
          <Select.Option value="CANCELLED">Cancelado</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item name="dateRange">
        <RangePicker placeholder={['Desde', 'Hasta']} />
      </Form.Item>

      <Form.Item name="isCOD" valuePropName="checked">
        <Switch checkedChildren="COD" unCheckedChildren="Todos" />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" onClick={handleFilter} loading={loading}>
            Filtrar
          </Button>
          <Button icon={<ClearOutlined />} onClick={handleClear}>
            Limpiar
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}
