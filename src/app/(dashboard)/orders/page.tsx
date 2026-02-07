'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { Button, Space, DatePicker, Table, Checkbox } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useOrders } from '@/hooks/useOrders';
import type { Order } from '@/types';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export default function OrdersPage() {
  const { orders, meta, loading, fetchOrders, exportCsv } = useOrders();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [exporting, setExporting] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchOrders();
    }
  }, [fetchOrders]);

  const handleSearch = useCallback(() => {
    const filters: Record<string, unknown> = { page: 1 };
    if (dateRange && dateRange[0] && dateRange[1]) {
      filters.fromDate = dateRange[0].format('YYYY-MM-DD');
      filters.toDate = dateRange[1].format('YYYY-MM-DD');
    }
    fetchOrders(filters);
  }, [dateRange, fetchOrders]);

  const handlePageChange = useCallback(
    (page: number, pageSize: number) => {
      fetchOrders({ page, limit: pageSize });
    },
    [fetchOrders],
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportCsv();
    } finally {
      setExporting(false);
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
        </Space>
      </div>

      {/* Table */}
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
    </div>
  );
}
