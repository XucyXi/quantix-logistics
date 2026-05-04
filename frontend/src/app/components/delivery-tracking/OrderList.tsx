/*import React from 'react';
import {Order} from '../../../types/logistics';

export const OrderList = ({
  orders,
  selectedId,
  onSelect,
  variant = 'driver',
}: {
  orders: Order[];
  selectedId: number | null | undefined;
  onSelect: (order: Order) => void;
  variant?: 'driver' | 'customer';
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
*/

import {useState} from 'react';
import {Order} from '../../../types/logistics';

interface OrderListProps {
  orders: Order[];
  selectedId: number | undefined;
  onSelect: (order: Order) => void;
  variant?: 'customer' | 'driver';
}

type TabType = 'active' | 'ready' | 'history' | 'new';

export const OrderList = ({
  orders,
  selectedId,
  onSelect,
  variant = 'driver',
}: OrderListProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('active');

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'new')
      return order.status === 'assigned' || order.status === 'pending';
    if (activeTab === 'active') return order.status === 'in_transit';
    if (activeTab === 'ready') return order.status === 'ready_for_pickup';
    if (activeTab === 'history') return order.status === 'done';
    return true;
  });

  const counts = {
    new: orders.filter((o) => o.status === 'assigned' || o.status === 'pending')
      .length,
    active: orders.filter((o) => o.status === 'in_transit').length,
    ready: orders.filter((o) => o.status === 'ready_for_pickup').length,
    history: orders.filter((o) => o.status === 'done').length,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#fff',
      }}
    >
      <div
        style={{
          display: 'flex',
          overflowX: 'auto',
          borderBottom: '2px solid #eee',
          background: '#fff',
        }}
      >
        <TabButton
          label={`Aktiiviset (${counts.active})`}
          isActive={activeTab === 'active'}
          onClick={() => setActiveTab('active')}
        />
        <TabButton
          label={`Uudet (${counts.new})`}
          isActive={activeTab === 'new'}
          onClick={() => setActiveTab('new')}
        />
        <TabButton
          label={`Valmiit (${counts.ready})`}
          isActive={activeTab === 'ready'}
          onClick={() => setActiveTab('ready')}
        />

        <TabButton
          label={`Historia (${counts.history})`}
          isActive={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        />
      </div>

      <div style={{flex: 1, overflowY: 'auto', padding: '10px'}}>
        {filteredOrders.map((order) => {
          const isSelectable =
            order.status === 'in_transit' ||
            order.status === 'ready_for_pickup';
          return (
            <div
              key={order.order_id}
              onClick={isSelectable ? () => onSelect(order) : undefined}
              style={{
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '8px',
                border:
                  selectedId === order.order_id
                    ? '3px solid #ff4757'
                    : '2px solid #e0e0e0',
                background: isSelectable ? '#fff' : '#f9f9f9',
                cursor: isSelectable ? 'pointer' : 'not-allowed',
              }}
            >
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <span style={{fontWeight: 'bold'}}>#{order.order_id}</span>
                <span
                  style={{
                    fontSize: '13px',
                    color: getStatusColor(order.status),
                  }}
                >
                  ● {order.status}
                </span>
              </div>
              <div style={{fontSize: '15px', color: '#000', marginTop: '4px'}}>
                {order.delivery_address}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
const TabButton = ({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      padding: '8px 16px',
      border: 'none',
      background: 'none',
      borderBottom: isActive ? '3px solid #ff4757' : '3px solid transparent',
      color: isActive ? '#ff4757' : '#666',
      fontWeight: isActive ? 'bold' : 'normal',
      cursor: 'pointer',
      transition: 'all 0.3s',
    }}
  >
    {label}
  </button>
);

const getStatusColor = (status: string) => {
  switch (status) {
    case 'in_transit':
      return '#2ecc71';
    case 'ready_for_pickup':
      return '#f1c40f';
    case 'done':
      return '#3498db';
    case 'pending':
      return '#95a5a6';
    default:
      return '#e67e22';
  }
};
