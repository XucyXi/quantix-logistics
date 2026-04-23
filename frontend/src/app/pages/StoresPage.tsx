import {Package, Store, Truck, Users} from 'lucide-react';
import {
  MasterTable,
  MasterTableCell,
  MasterTableRow,
} from '../components/MasterTable';

const stores = [
  {
    id: 'C-001',
    name: 'K-Market Töölö',
    city: 'Helsinki',
    contact: 'Mikko Niemi',
    orders: 18,
    status: 'Aktiivinen',
  },
  {
    id: 'C-002',
    name: 'S-Market Kallio',
    city: 'Helsinki',
    contact: 'Laura Salonen',
    orders: 14,
    status: 'Aktiivinen',
  },
  {
    id: 'C-003',
    name: 'Prisma Tampere',
    city: 'Tampere',
    contact: 'Jari Lehtinen',
    orders: 9,
    status: 'Odottaa',
  },
  {
    id: 'C-004',
    name: 'Alepa Turku',
    city: 'Turku',
    contact: 'Sari Koskinen',
    orders: 11,
    status: 'Aktiivinen',
  },
];

export function StoresPage() {
  return (
    <div style={{fontFamily: "'Space Grotesk', sans-serif"}}>
      <div style={{marginBottom: '1.5rem'}}>
        <h1
          style={{
            color: '#0f2444',
            fontWeight: 800,
            fontSize: '1.4rem',
            margin: 0,
          }}
        >
          Kaupat
        </h1>
        <p
          style={{color: '#64748b', fontSize: '0.85rem', margin: '0.5rem 0 0'}}
        >
          Asiakaskauppojen hallinta ja seuranta
        </p>
      </div>

      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        style={{marginBottom: '1.5rem'}}
      >
        {[
          {label: 'Kauppoja', value: '48', icon: Store, color: '#f97316'},
          {label: 'Aktiivisia', value: '42', icon: Truck, color: '#16a34a'},
          {
            label: 'Tilauksia tänään',
            value: '126',
            icon: Package,
            color: '#2563eb',
          },
          {
            label: 'Yhteyshenkilöitä',
            value: '48',
            icon: Users,
            color: '#8b5cf6',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: 'white',
              borderRadius: 14,
              padding: '1rem',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 8px rgba(0,0,0,0.05)',
            }}
          >
            <div
              style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <stat.icon size={20} color={stat.color} />
              </div>
              <div>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: '#0f2444',
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </div>
                <div style={{color: '#64748b', fontSize: '0.8rem'}}>
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <MasterTable
        title="Asiakaskaupat"
        description="Lista asiakkaista, yhteyshenkilöistä ja tilausvolyymeista"
        columns={[
          {key: 'id', label: 'ID'},
          {key: 'name', label: 'Nimi'},
          {key: 'city', label: 'Kaupunki'},
          {key: 'contact', label: 'Yhteyshenkilö'},
          {key: 'orders', label: 'Tilauksia'},
          {key: 'status', label: 'Tila'},
        ]}
      >
        {stores.map((store) => (
          <MasterTableRow key={store.id}>
            <MasterTableCell>{store.id}</MasterTableCell>
            <MasterTableCell>
              <div style={{fontWeight: 600, color: '#0f2444'}}>
                {store.name}
              </div>
            </MasterTableCell>
            <MasterTableCell>{store.city}</MasterTableCell>
            <MasterTableCell>{store.contact}</MasterTableCell>
            <MasterTableCell>{store.orders}</MasterTableCell>
            <MasterTableCell>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.35rem 0.7rem',
                  borderRadius: 999,
                  backgroundColor:
                    store.status === 'Aktiivinen' ? '#dcfce7' : '#fef3c7',
                  color: store.status === 'Aktiivinen' ? '#166534' : '#a16207',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {store.status}
              </span>
            </MasterTableCell>
          </MasterTableRow>
        ))}
      </MasterTable>
    </div>
  );
}
