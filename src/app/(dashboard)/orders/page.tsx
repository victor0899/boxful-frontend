'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { Typography, Button, Space, Card, Row, Col } from 'antd';
import { PlusOutlined, DownloadOutlined, HistoryOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import OrderFilters from '@/components/orders/OrderFilters';
import OrdersTable from '@/components/orders/OrdersTable';
import { useOrders } from '@/hooks/useOrders';
import { colors } from '@/lib/theme';

const { Title, Text } = Typography;

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
      {/* Hero Section */}
      <div style={{ marginBottom: 48 }}>
        <Title
          level={1}
          style={{
            fontSize: 42,
            fontWeight: 700,
            color: colors.gray[500],
            marginBottom: 16,
          }}
        >
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
          Dale una ventaja competitiva a tu negocio con entregas{' '}
          <strong>el mismo día</strong> (Área Metropolitana) y <strong>el día siguiente</strong> a
          nivel nacional.
        </Text>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={() => router.push('/orders/create')}
          style={{ height: 56, fontSize: 18, paddingLeft: 32, paddingRight: 32 }}
        >
          Crear orden
        </Button>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 32, fontWeight: 700, color: colors.blue[500] }}>
                {meta?.total || 0}
              </Text>
              <br />
              <Text style={{ fontSize: 16, color: colors.gray[300] }}>Total de órdenes</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 32, fontWeight: 700, color: '#52c41a' }}>
                {orders.filter((o) => o.status === 'DELIVERED').length}
              </Text>
              <br />
              <Text style={{ fontSize: 16, color: colors.gray[300] }}>Entregadas</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 32, fontWeight: 700, color: '#faad14' }}>
                {orders.filter((o) => o.status === 'IN_TRANSIT').length}
              </Text>
              <br />
              <Text style={{ fontSize: 16, color: colors.gray[300] }}>En tránsito</Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* History Section */}
      <Card
        title={
          <Space>
            <HistoryOutlined />
            <span style={{ fontSize: 20, fontWeight: 600 }}>Historial de órdenes</span>
          </Space>
        }
        extra={
          <Button icon={<DownloadOutlined />} onClick={handleExport} loading={exporting}>
            Exportar CSV
          </Button>
        }
      >
        <OrderFilters onFilter={handleFilter} onClear={handleClear} loading={loading} />

        <div style={{ marginTop: 24 }}>
          <OrdersTable orders={orders} loading={loading} meta={meta} onPageChange={handlePageChange} />
        </div>
      </Card>
    </>
  );
}
