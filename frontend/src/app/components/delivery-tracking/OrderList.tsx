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
          onClick={() => onSelect(order)}
          style={{
            padding: '1rem',
            background: selectedId === order.order_id ? 'white' : '#f1f5f9',
            border: '1px solid',
            borderColor: selectedId === order.order_id ? '#3b82f6' : '#e2e8f0',
            borderRadius: '8px',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <strong>Tilaus #{order.order_id}</strong>
          <div style={{fontSize: '0.85rem', color: '#64748b'}}>
            Status: {order.status}
          </div>
        </div>
      ))}
    </div>
  );
};
