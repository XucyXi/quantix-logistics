import {useState} from 'react';
import {Map} from './Map';
import {OrderList} from './OrderList';
import {DeliveryTracking} from '../../../types/logistics';

export const DeliveryManager = ({
  deliveries,
}: {
  deliveries: DeliveryTracking[];
}) => {
  const [selectedOrder, setSelectedOrder] = useState<DeliveryTracking | null>(
    deliveries?.[0] || null
  );

  if (!selectedOrder) {
    return <div style={{padding: '1rem'}}>Ei toimituksia saatavilla</div>;
  }

  return (
    <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
      <div style={{flex: 1, minHeight: '300px'}}>
        <Map
          startCoords={[60.1699, 24.9384]}
          endCoords={[selectedOrder.latitude, selectedOrder.longitude]}
        />
      </div>

      <div style={{maxHeight: '40vh', overflowY: 'auto'}}>
        <OrderList
          deliveries={deliveries}
          selectedId={selectedOrder?.tracking_id}
          onSelect={setSelectedOrder}
        />
      </div>
    </div>
  );
};
