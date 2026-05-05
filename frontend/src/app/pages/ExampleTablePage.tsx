import {
  MasterTable,
  MasterTableRow,
  MasterTableCell,
} from '../components/MasterTable';

// Mock data for demonstration
const orders = [
  {
    order: 'ORD-001',
    customer: 'K-Market Kamppi',
    date: '2024-04-23',
    status: 'Toimitettu',
    amount: '250.00€',
  },
  {
    order: 'ORD-002',
    customer: 'S-Market Vallila',
    date: '2024-04-23',
    status: 'Käsittelyssä',
    amount: '150.75€',
  },
  {
    order: 'ORD-003',
    customer: 'Lidl Pasila',
    date: '2024-04-22',
    status: 'Peruttu',
    amount: '320.50€',
  },
  {
    order: 'ORD-004',
    customer: 'Alepa Töölö',
    date: '2024-04-21',
    status: 'Toimitettu',
    amount: '45.00€',
  },
];

const statusStyles: Record<string, {bg: string; color: string}> = {
  Toimitettu: {bg: '#dcfce7', color: '#166534'},
  Käsittelyssä: {bg: '#fef3c7', color: '#92400e'},
  Peruttu: {bg: '#fee2e2', color: '#991b1b'},
};

export function ExampleTablePage() {
  return (
    <div className="p-4 md:p-6">
      <MasterTable
        title="Responsiivinen Taulukko"
        description="Tämä taulukko käyttää MasterTable-komponenttia ja mukautuu eri näytöille."
        columns={[
          {key: 'order', label: 'Tilaus'},
          {key: 'customer', label: 'Asiakas'},
          {key: 'status', label: 'Tila'},
          {key: 'date', label: 'Päivämäärä'},
          {key: 'amount', label: 'Summa'},
        ]}
      >
        {orders.map((order) => (
          <MasterTableRow key={order.order}>
            <MasterTableCell>
              <span style={{fontWeight: 700}}>{order.order}</span>
            </MasterTableCell>
            <MasterTableCell>{order.customer}</MasterTableCell>
            <MasterTableCell>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: statusStyles[order.status]?.bg || '#f1f5f9',
                  color: statusStyles[order.status]?.color || '#475569',
                }}
              >
                {order.status}
              </span>
            </MasterTableCell>
            <MasterTableCell>{order.date}</MasterTableCell>
            <MasterTableCell>
              <div style={{textAlign: 'right', fontWeight: 600}}>
                {order.amount}
              </div>
            </MasterTableCell>
          </MasterTableRow>
        ))}
      </MasterTable>
    </div>
  );
}
