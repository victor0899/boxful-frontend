'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { Button, Space, DatePicker, Table, Checkbox, App, Tabs, Dropdown, Spin } from 'antd';
import type { TablePaginationConfig, SorterResult } from 'antd/es/table/interface';
import { CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, TruckOutlined, DownloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useOrders } from '@/hooks/useOrders';
import { useBalance } from '@/lib/balance-context';
import api from '@/lib/api';
import type { Order } from '@/types';
import type { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

export default function OrdersPage() {
  const { orders, meta, loading, fetchOrders, exportCsv } = useOrders();
  const { refetchBalance } = useBalance();
  const { message } = App.useApp();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [exporting, setExporting] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('pending');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'ascend' | 'descend' | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [downloadingOrderId, setDownloadingOrderId] = useState<string | null>(null);
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

    if (sortField && sortOrder) {
      filters.sortBy = sortField;
      filters.sortOrder = sortOrder === 'ascend' ? 'asc' : 'desc';
    }

    fetchOrders(filters);
  }, [dateRange, activeTab, sortField, sortOrder, fetchOrders]);

  const handleTableChange = useCallback(
    (pagination: TablePaginationConfig, _filters: Record<string, unknown>, sorter: SorterResult<Order> | SorterResult<Order>[]) => {
      // Manejar sorter único (no array)
      const singleSorter = Array.isArray(sorter) ? sorter[0] : sorter;

      const status = activeTab === 'pending'
        ? 'PENDING,IN_TRANSIT,CANCELLED'
        : 'DELIVERED';

      const queryParams: Record<string, unknown> = {
        page: pagination.current,
        limit: pagination.pageSize,
        status,
      };

      // Agregar ordenamiento si existe
      if (singleSorter?.field && singleSorter?.order) {
        setSortField(String(singleSorter.field));
        setSortOrder(singleSorter.order);

        // Mapear keys del frontend a campos del backend
        const fieldMap: Record<string, string> = {
          firstName: 'clientName',
          lastName: 'clientName',
          clientDepartment: 'clientDepartment',
          clientMunicipality: 'clientMunicipality',
        };

        const backendField = fieldMap[singleSorter.field as string] || (singleSorter.field as string);
        queryParams.sortBy = backendField;
        queryParams.sortOrder = singleSorter.order === 'ascend' ? 'asc' : 'desc';
      } else {
        setSortField(null);
        setSortOrder(null);
      }

      fetchOrders(queryParams);
    },
    [activeTab, fetchOrders],
  );

  const handleExport = async (format: 'csv' | 'excel') => {
    setExporting(true);
    try {
      const filters: Record<string, unknown> = {};

      // Si hay órdenes seleccionadas, exportar solo esas (ignorar otros filtros)
      if (selectedRowKeys.length > 0) {
        filters.ids = selectedRowKeys.join(',');
      } else {
        // Si no hay selección, usar filtros normales
        const status = activeTab === 'pending'
          ? 'PENDING,IN_TRANSIT,CANCELLED'
          : 'DELIVERED';
        filters.status = status;

        if (dateRange && dateRange[0] && dateRange[1]) {
          filters.fromDate = dateRange[0].format('YYYY-MM-DD');
          filters.toDate = dateRange[1].format('YYYY-MM-DD');
        }
      }

      if (format === 'csv') {
        await exportCsv(filters);
      } else {
        // Excel export - llamar a endpoint diferente
        const params = new URLSearchParams();
        if (filters.ids) {
          params.set('ids', filters.ids as string);
        } else {
          if (filters.status) params.set('status', filters.status as string);
          if (filters.fromDate) params.set('fromDate', filters.fromDate as string);
          if (filters.toDate) params.set('toDate', filters.toDate as string);
        }

        const response = await api.get(`/orders/export/excel?${params.toString()}`, {
          responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'ordenes.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }

      const count = selectedRowKeys.length > 0 ? selectedRowKeys.length : 'todas las';
      message.success(`${count} orden(es) exportadas en formato ${format.toUpperCase()}`);
    } catch {
      message.error('Error al exportar órdenes');
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
      // Refrescar la tabla con el filtro del tab actual
      const status = activeTab === 'pending'
        ? 'PENDING,IN_TRANSIT,CANCELLED'
        : 'DELIVERED';
      fetchOrders({ status });
      // Refrescar el balance en el header
      refetchBalance();
    } catch {
      message.error('Error al simular entregas');
    } finally {
      setSimulating(false);
    }
  };

  const handleDownloadPdf = async (orderId: string) => {
    // Verificar si ya hay una descarga en progreso
    if (isDownloadingPdf) {
      message.warning('Ya hay una descarga en progreso. Por favor espera a que termine.');
      return;
    }

    setIsDownloadingPdf(true);
    setDownloadingOrderId(orderId);
    const hide = message.loading('Generando PDF...', 0);

    try {
      const response = await api.get(`/orders/${orderId}/pdf`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const newWindow = window.open(url, '_blank');

      // Limpiar el URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      hide();

      // Detectar si fue bloqueado por el navegador
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        message.warning({
          content: 'PDF generado. Si no se abrió, permite ventanas emergentes en tu navegador y vuelve a intentar.',
          duration: 6,
        });
      } else {
        message.success('PDF generado correctamente');
      }
    } catch {
      hide();
      message.error('Error al abrir el PDF');
    } finally {
      setIsDownloadingPdf(false);
      setDownloadingOrderId(null);
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
      render: (id: string) => {
        const isDownloading = downloadingOrderId === id;
        const isDisabled = isDownloadingPdf && !isDownloading;

        return (
          <a
            onClick={() => !isDisabled && handleDownloadPdf(id)}
            style={{
              color: isDisabled ? '#d9d9d9' : '#2e49ce',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: isDisabled ? 0.5 : 1,
            }}
          >
            {isDownloading ? (
              <Spin size="small" />
            ) : (
              <FilePdfOutlined style={{ fontSize: 16 }} />
            )}
            {id.slice(-6).toUpperCase()}
          </a>
        );
      },
    },
    {
      title: 'Nombre',
      dataIndex: 'clientName',
      key: 'firstName',
      render: (name: string) => name.split(' ')[0] || '',
      sorter: true,
      sortOrder: sortField === 'firstName' ? sortOrder : null,
    },
    {
      title: 'Apellidos',
      dataIndex: 'clientName',
      key: 'lastName',
      render: (name: string) => name.split(' ').slice(1).join(' ') || '',
      sorter: true,
      sortOrder: sortField === 'lastName' ? sortOrder : null,
    },
    {
      title: 'Departamento',
      dataIndex: 'clientDepartment',
      key: 'clientDepartment',
      sorter: true,
      sortOrder: sortField === 'clientDepartment' ? sortOrder : null,
    },
    {
      title: 'Municipio',
      dataIndex: 'clientMunicipality',
      key: 'clientMunicipality',
      sorter: true,
      sortOrder: sortField === 'clientMunicipality' ? sortOrder : null,
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
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          <Dropdown
            menu={{
              items: [
                {
                  key: 'csv',
                  label: 'Descargar CSV',
                  onClick: () => handleExport('csv'),
                },
                {
                  key: 'excel',
                  label: 'Descargar Excel',
                  onClick: () => handleExport('excel'),
                },
              ],
            }}
            trigger={['hover']}
          >
            <Button loading={exporting} icon={<DownloadOutlined />}>
              Descargar órdenes
            </Button>
          </Dropdown>
        </Space>
        {activeTab === 'pending' && (
          <Button
            onClick={handleSimulateDelivery}
            loading={simulating}
            disabled={selectedRowKeys.length === 0}
            icon={<TruckOutlined />}
          >
            Simular entregas ({selectedRowKeys.length})
          </Button>
        )}
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
                onChange={handleTableChange}
                pagination={{
                  current: meta.page,
                  pageSize: meta.limit,
                  total: meta.total,
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
                onChange={handleTableChange}
                pagination={{
                  current: meta.page,
                  pageSize: meta.limit,
                  total: meta.total,
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
