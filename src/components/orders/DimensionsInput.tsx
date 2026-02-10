'use client';

import { InputNumber, Typography } from 'antd';
import { colors } from '@/lib/theme';

const { Text } = Typography;

interface DimensionsInputProps {
  length?: number;
  height?: number;
  width?: number;
  onChange?: (dimension: 'length' | 'height' | 'width', value: number) => void;
  readOnly?: boolean;
  errors?: {
    length?: boolean;
    height?: boolean;
    width?: boolean;
  };
  onClearError?: (dimension: 'length' | 'height' | 'width') => void;
}

export default function DimensionsInput({
  length = 0,
  height = 0,
  width = 0,
  onChange,
  readOnly = false,
  errors = {},
  onClearError,
}: DimensionsInputProps) {
  return (
    <div>
      {/* Labels arriba */}
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1, paddingLeft: 12 }}>
          <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: 500 }}>Largo</Text>
        </div>
        <div style={{ flex: 1, paddingLeft: 12 }}>
          <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: 500 }}>Alto</Text>
        </div>
        <div style={{ flex: 1, paddingLeft: 12 }}>
          <Text style={{ fontSize: 12, color: colors.gray[500], fontWeight: 500 }}>Ancho</Text>
        </div>
      </div>

      {/* Contenedor con inputs */}
      <div
        style={{
          display: 'flex',
          border: `1px solid ${errors.length || errors.height || errors.width ? '#ff4d4f' : '#d9d9d9'}`,
          borderRadius: 8,
          overflow: 'hidden',
          height: 48,
          backgroundColor: '#fff',
        }}
      >
        {/* Largo */}
        <div
          className="dimension-item"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRight: '1px solid #d9d9d9',
            paddingLeft: 12,
            paddingRight: 12,
          }}
        >
          {readOnly ? (
            <Text style={{ fontSize: 14, color: colors.gray[500] }}>{length}</Text>
          ) : (
            <InputNumber
              min={1}
              value={length}
              onChange={(value) => {
                onChange?.('length', value || 0);
                onClearError?.('length');
              }}
              controls={false}
              variant="borderless"
              style={{ width: 55, padding: 0 }}
            />
          )}
          <Text className="dimension-unit" style={{ fontSize: 12, color: colors.gray[300] }}>cm</Text>
        </div>

        {/* Alto */}
        <div
          className="dimension-item"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRight: '1px solid #d9d9d9',
            paddingLeft: 12,
            paddingRight: 12,
          }}
        >
          {readOnly ? (
            <Text style={{ fontSize: 14, color: colors.gray[500] }}>{height}</Text>
          ) : (
            <InputNumber
              min={1}
              value={height}
              onChange={(value) => {
                onChange?.('height', value || 0);
                onClearError?.('height');
              }}
              controls={false}
              variant="borderless"
              style={{ width: 55, padding: 0 }}
            />
          )}
          <Text className="dimension-unit" style={{ fontSize: 12, color: colors.gray[300] }}>cm</Text>
        </div>

        {/* Ancho */}
        <div
          className="dimension-item"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingLeft: 12,
            paddingRight: 12,
          }}
        >
          {readOnly ? (
            <Text style={{ fontSize: 14, color: colors.gray[500] }}>{width}</Text>
          ) : (
            <InputNumber
              min={1}
              value={width}
              onChange={(value) => {
                onChange?.('width', value || 0);
                onClearError?.('width');
              }}
              controls={false}
              variant="borderless"
              style={{ width: 55, padding: 0 }}
            />
          )}
          <Text className="dimension-unit" style={{ fontSize: 12, color: colors.gray[300] }}>cm</Text>
        </div>
      </div>
    </div>
  );
}
