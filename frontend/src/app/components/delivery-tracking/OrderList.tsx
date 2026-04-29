import React from 'react';
import {Order} from '../../../types/logistics';

export const OrderList = ({
  orders,
  selectedId,
  onSelect,
}: {
  orders: Order[];
  selectedId: number | null;
  onSelect: (order: Order) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_transit':
        return '#4caf50';
      case 'ready_for_pickup':
        return '#2196f3';
      case 'assigned':
        return '#ffc107';
      default:
        return '#9e9e9e';
    }
  };

  return (
    <div
      style={{
        padding: '1rem',
        background: '#f8fafc',
        borderTop: '2px solid #e2e8f0',
        maxHeight: '35vh',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <h3 style={{margin: '0 0 0.5rem 0', fontSize: '1rem'}}>Tilaukset</h3>

      {orders.map((order) => (
        <div
          key={order.order_id}
          onClick={
            order.status !== 'assigned' ? () => onSelect(order) : undefined
          }
          style={{
            padding: '1rem',
            backgroundColor: order.status === 'assigned' ? '#f5f5f5' : 'white',
            border: '1px solid',
            borderColor: selectedId === order.order_id ? '#3b82f6' : '#e2e8f0',
            borderRadius: '8px',
            flexShrink: 0,
            cursor: order.status === 'assigned' ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow:
              selectedId === order.order_id
                ? '0 4px 12px rgba(0,0,0,0.1)'
                : 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.25rem',
            }}
          >
            <strong>Tilaus #{order.order_id}</strong>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: '10px',
                backgroundColor: `${getStatusColor(order.status)}`,
              }}
            >
              {order.status}
            </span>
          </div>

          <div
            style={{fontSize: '0.9rem', color: '#1e293b', marginTop: '0.5rem'}}
          >
            {order.delivery_address}
          </div>

          {order.notes && (
            <div
              style={{
                fontSize: '0.8rem',
                color: '#64748b',
                fontStyle: 'italic',
                marginTop: '0.4rem',
              }}
            >
              {order.notes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
