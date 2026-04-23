import React from 'react';
import {DeliveryTracking} from '../../../types/logistics';

export const OrderList = ({
  deliveries,
  selectedId,
  onSelect,
}: {
  deliveries: DeliveryTracking[];
  selectedId: number | null;
  onSelect: (delivery: DeliveryTracking) => void;
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

      {deliveries.map((delivery) => (
        <div
          key={delivery.tracking_id}
          onClick={() => onSelect(delivery)}
          style={{
            padding: '1rem',
            background:
              selectedId === delivery.tracking_id ? 'white' : '#f1f5f9',
            border: '1px solid',
            borderColor:
              selectedId === delivery.tracking_id ? '#3b82f6' : '#e2e8f0',
            borderRadius: '8px',
            flexShrink: 0,
            cursor: 'pointer',
          }}
        >
          <strong>Tilaus #{delivery.order_id}</strong>
          <div style={{fontSize: '0.85rem', color: '#64748b'}}>
            Status: {delivery.status}
          </div>
        </div>
      ))}
    </div>
  );
};
