'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { Typography, Button, Space } from 'antd';
import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import OrderFilters from '@/components/orders/OrderFilters';
import OrdersTable from '@/components/orders/OrdersTable';
import { useOrders } from '@/hooks/useOrders';

const { Title } = Typography;

interface FilterValues {
  search?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  isCOD?: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const { orders, meta, loading, fetchOrders, exportCsv } = useOrders();
  const [filters, setFilters] = useState<FilterValues>({});
  const [exporting, setExporting] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchOrders();
    }
  }, [fetchOrders]);

  const handleFilter = useCallback(
    (newFilters: FilterValues) => {
      setFilters(newFilters);
      fetchOrders({ ...newFilters, page: 1 });
    },
    [fetchOrders],
  );

  const handleClear = useCallback(() => {
    setFilters({});
    fetchOrders({ page: 1 });
  }, [fetchOrders]);

  const handlePageChange = useCallback(
    (page: number, pageSize: number) => {
      fetchOrders({ ...filters, page, limit: pageSize });
    },
    [fetchOrders, filters],
  );

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportCsv();
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>
          Mis Órdenes
        </Title>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport} loading={exporting}>
            Exportar CSV
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/orders/create')}>
            Nueva Orden
          </Button>
        </Space>
      </div>

      <OrderFilters onFilter={handleFilter} onClear={handleClear} loading={loading} />

      <OrdersTable
        orders={orders}
        loading={loading}
        meta={meta}
        onPageChange={handlePageChange}
      />
    </>
  );
}
