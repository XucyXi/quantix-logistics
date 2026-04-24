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
    <div className="font-sans">
      <div className="mb-6">
        <h1 className="text-foreground font-extrabold text-2xl m-0">Kaupat</h1>
        <p className="text-muted-foreground text-sm mt-2 mb-0">
          Asiakaskauppojen hallinta ja seuranta
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          {
            label: 'Kauppoja',
            value: '48',
            icon: Store,
            colorClass: 'text-orange-500',
            bgClass: 'bg-orange-500/10',
          },
          {
            label: 'Aktiivisia',
            value: '42',
            icon: Truck,
            colorClass: 'text-green-500',
            bgClass: 'bg-green-500/10',
          },
          {
            label: 'Tilauksia tänään',
            value: '126',
            icon: Package,
            colorClass: 'text-blue-500',
            bgClass: 'bg-blue-500/10',
          },
          {
            label: 'Yhteyshenkilöitä',
            value: '48',
            icon: Users,
            colorClass: 'text-purple-500',
            bgClass: 'bg-purple-500/10',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-2xl p-4 border border-border shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bgClass}`}
              >
                <stat.icon size={20} className={stat.colorClass} />
              </div>
              <div>
                <div className="text-xl font-extrabold text-foreground leading-none mb-1">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-xs">
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
              <div className="font-semibold text-foreground">{store.name}</div>
            </MasterTableCell>
            <MasterTableCell>{store.city}</MasterTableCell>
            <MasterTableCell>{store.contact}</MasterTableCell>
            <MasterTableCell>{store.orders}</MasterTableCell>
            <MasterTableCell>
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                  store.status === 'Aktiivinen'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                }`}
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
