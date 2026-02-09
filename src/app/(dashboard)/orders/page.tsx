'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { Button, Space, DatePicker, Table, Checkbox, App, Tabs } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, TruckOutlined } from '@ant-design/icons';
import { useOrders } from '@/hooks/useOrders';
import api from '@/lib/api';
import type { Order } from '@/types';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export default function OrdersPage() {
  const { orders, meta, loading, fetchOrders, exportCsv } = useOrders();
  const { message } = App.useApp();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [exporting, setExporting] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchOrders({ status: 'PENDING,IN_TRANSIT,CANCELLED' }); // Cargar pendientes por defecto
    }
  }, [fetchOrders]);

  // Cargar órdenes cuando cambia el tab
  useEffect(() => {
    const status = activeTab === 'pending'
      ? 'PENDING,IN_TRANSIT,CANCELLED'
      : 'DELIVERED';
    fetchOrders({ status });
  }, [activeTab, fetchOrders]);

  const handleSearch = useCallback(() => {
    const filters: Record<string, unknown> = { page: 1 };

    // Incluir filtro de status según el tab activo
    const status = activeTab === 'pending'
      ? 'PENDING,IN_TRANSIT,CANCELLED'
      : 'DELIVERED';
    filters.status = status;

    if (dateRange && dateRange[0] && dateRange[1]) {
      filters.fromDate = dateRange[0].format('YYYY-MM-DD');
      filters.toDate = dateRange[1].format('YYYY-MM-DD');
    }
    fetchOrders(filters);
  }, [dateRange, activeTab, fetchOrders]);

  const handlePageChange = useCallback(
    (page: number, pageSize: number) => {
      const status = activeTab === 'pending'
        ? 'PENDING,IN_TRANSIT,CANCELLED'
        : 'DELIVERED';
      fetchOrders({ page, limit: pageSize, status });
    },
    [activeTab, fetchOrders],
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportCsv();
    } finally {
      setExporting(false);
    }
  };

  const handleSimulateDelivery = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Selecciona al menos una orden para simular entrega');
      return;
    }

    setSimulating(true);
    try {
      const selectedOrders = orders.filter((order) => selectedRowKeys.includes(order.id));

      // Simular entrega de cada orden seleccionada
      for (const order of selectedOrders) {
        if (order.status !== 'DELIVERED') {
          await api.post('/webhooks/order-status', {
            orderId: order.id,
            status: 'DELIVERED',
            codCollectedAmount: order.isCOD ? order.codExpectedAmount : undefined,
          });
        }
      }

      message.success(`${selectedOrders.length} orden(es) marcada(s) como entregada(s)`);
      setSelectedRowKeys([]);
      fetchOrders(); // Refrescar la tabla
    } catch (error) {
      message.error('Error al simular entregas');
    } finally {
      setSimulating(false);
    }
  };

  const columns = [
    {
      title: '',
      dataIndex: 'checkbox',
      key: 'checkbox',
      width: 50,
      render: (_: unknown, record: Order) => (
        <Checkbox
          checked={selectedRowKeys.includes(record.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRowKeys([...selectedRowKeys, record.id]);
            } else {
              setSelectedRowKeys(selectedRowKeys.filter((key) => key !== record.id));
            }
          }}
        />
      ),
    },
    {
      title: 'No. de orden',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => id.slice(-6).toUpperCase(),
    },
    {
      title: 'Nombre',
      dataIndex: 'clientName',
      key: 'firstName',
      render: (name: string) => name.split(' ')[0] || '',
    },
    {
      title: 'Apellidos',
      dataIndex: 'clientName',
      key: 'lastName',
      render: (name: string) => name.split(' ').slice(1).join(' ') || '',
    },
    {
      title: 'Departamento',
      dataIndex: 'clientDepartment',
      key: 'department',
    },
    {
      title: 'Municipio',
      dataIndex: 'clientMunicipality',
      key: 'municipality',
    },
    {
      title: 'Paquetes en orden',
      dataIndex: 'packages',
      key: 'packages',
      render: (packages: Array<unknown>) => (
        <span style={{ color: '#52c41a', fontWeight: 600 }}>{packages?.length || 0}</span>
      ),
    },
  ];

  return (
    <div>
      {/* Filters */}
      <div style={{ marginBottom: 24 }}>
        <Space size="middle">
          <RangePicker
            placeholder={['Enero', 'Julio']}
            suffixIcon={<CalendarOutlined />}
            format="MMMM"
            picker="month"
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            style={{ width: 280 }}
          />
          <Button type="primary" onClick={handleSearch} loading={loading}>
            Buscar
          </Button>
          <Button onClick={handleExport} loading={exporting}>
            Descargar órdenes
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <Button
              onClick={handleSimulateDelivery}
              loading={simulating}
              disabled={selectedRowKeys.length === 0}
              icon={<TruckOutlined />}
            >
              Simular entregas ({selectedRowKeys.length})
            </Button>
          )}
        </Space>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'pending',
            label: (
              <span>
                <ClockCircleOutlined /> Pendientes ({meta.counts?.pendingTotal ?? 0})
              </span>
            ),
            children: (
              <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
                pagination={{
                  current: meta.page,
                  pageSize: meta.limit,
                  total: meta.total,
                  onChange: handlePageChange,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} órdenes`,
                }}
                style={{
                  backgroundColor: '#f5f5f5',
                }}
              />
            ),
          },
          {
            key: 'delivered',
            label: (
              <span>
                <CheckCircleOutlined /> Entregadas ({meta.counts?.deliveredTotal ?? 0})
              </span>
            ),
            children: (
              <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
                pagination={{
                  current: meta.page,
                  pageSize: meta.limit,
                  total: meta.total,
                  onChange: handlePageChange,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} órdenes`,
                }}
                style={{
                  backgroundColor: '#f5f5f5',
                }}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
