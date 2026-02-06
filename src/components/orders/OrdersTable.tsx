'use client';

import { Table, Tag, Typography, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { Order } from '@/types';

const { Text } = Typography;

const statusConfig: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'blue', label: 'Pendiente' },
  IN_TRANSIT: { color: 'orange', label: 'En tránsito' },
  DELIVERED: { color: 'green', label: 'Entregado' },
  CANCELLED: { color: 'red', label: 'Cancelado' },
};

interface OrdersTableProps {
  orders: Order[];
  loading: boolean;
  meta: { total: number; page: number; limit: number; totalPages: number };
  onPageChange: (page: number, pageSize: number) => void;
}

export default function OrdersTable({ orders, loading, meta, onPageChange }: OrdersTableProps) {
  const columns: ColumnsType<Order> = [
    {
      title: 'Cliente',
      dataIndex: 'clientName',
      key: 'clientName',
      render: (name: string, record: Order) => (
        <div>
          <Text strong>{name}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.clientPhone}
          </Text>
        </div>
      ),
    },
    {
      title: 'Dirección',
      key: 'address',
      responsive: ['md'],
      render: (_: unknown, record: Order) => (
        <Tooltip title={record.clientAddress}>
          <Text ellipsis style={{ maxWidth: 200 }}>
            {record.clientMunicipality}, {record.clientDepartment}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Paquetes',
      key: 'packages',
      responsive: ['lg'],
      render: (_: unknown, record: Order) => (
        <Text>{record.packages.length} paquete(s)</Text>
      ),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = statusConfig[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'COD',
      key: 'cod',
      responsive: ['md'],
      render: (_: unknown, record: Order) => (
        <>
          {record.isCOD ? (
            <Tag color="purple">
              COD ${record.codExpectedAmount?.toFixed(2)}
            </Tag>
          ) : (
            <Text type="secondary">-</Text>
          )}
        </>
      ),
    },
    {
      title: 'Envío',
      dataIndex: 'shippingCost',
      key: 'shippingCost',
      responsive: ['lg'],
      render: (cost: number | null) =>
        cost !== null ? `$${cost.toFixed(2)}` : '-',
    },
    {
      title: 'Liquidación',
      dataIndex: 'settlementAmount',
      key: 'settlementAmount',
      responsive: ['lg'],
      render: (amount: number | null) => {
        if (amount === null || amount === undefined) return '-';
        const color = amount >= 0 ? 'green' : 'red';
        return <Text style={{ color }}>${amount.toFixed(2)}</Text>;
      },
    },
    {
      title: 'Fecha',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={orders}
      rowKey="id"
      loading={loading}
      pagination={{
        current: meta.page,
        pageSize: meta.limit,
        total: meta.total,
        showSizeChanger: true,
        showTotal: (total) => `Total: ${total} órdenes`,
        onChange: onPageChange,
      }}
    />
  );
}
