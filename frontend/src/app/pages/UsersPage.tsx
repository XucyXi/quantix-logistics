import {Clock, Shield, UserCheck, Users} from 'lucide-react';
import {
  MasterTable,
  MasterTableCell,
  MasterTableRow,
} from '../components/MasterTable';

const users = [
  {
    id: 'U-001',
    name: 'Anna Miettinen',
    email: 'anna@quantix.fi',
    role: 'Admin',
    lastLogin: '10 min sitten',
  },
  {
    id: 'U-002',
    name: 'Jari Laakso',
    email: 'jari@quantix.fi',
    role: 'Kuljettaja',
    lastLogin: '1 h sitten',
  },
  {
    id: 'U-003',
    name: 'Mira Hakanen',
    email: 'mira@quantix.fi',
    role: 'Varasto',
    lastLogin: '3 h sitten',
  },
  {
    id: 'U-004',
    name: 'Petteri Aalto',
    email: 'petteri@quantix.fi',
    role: 'Kauppa',
    lastLogin: 'Eilen',
  },
];

export function UsersPage() {
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
          Käyttäjät
        </h1>
        <p
          style={{color: '#64748b', fontSize: '0.85rem', margin: '0.5rem 0 0'}}
        >
          Järjestelmän käyttäjät ja roolit
        </p>
      </div>

      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4"
        style={{marginBottom: '1.5rem'}}
      >
        {[
          {label: 'Käyttäjiä', value: '24', icon: Users, color: '#2563eb'},
          {label: 'Adminit', value: '3', icon: Shield, color: '#8b5cf6'},
          {label: 'Aktiiviset', value: '19', icon: UserCheck, color: '#16a34a'},
          {
            label: 'Viime kirjautuminen',
            value: '10 min',
            icon: Clock,
            color: '#f97316',
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
        title="Käyttäjähallinta"
        description="Käyttäjät, sähköpostit, roolit ja viimeisin kirjautuminen"
        columns={[
          {key: 'id', label: 'ID'},
          {key: 'name', label: 'Nimi'},
          {key: 'email', label: 'Sähköposti'},
          {key: 'role', label: 'Rooli'},
          {key: 'lastLogin', label: 'Viime kirjautuminen'},
        ]}
      >
        {users.map((user) => (
          <MasterTableRow key={user.id}>
            <MasterTableCell>{user.id}</MasterTableCell>
            <MasterTableCell>
              <div style={{fontWeight: 600, color: '#0f2444'}}>{user.name}</div>
            </MasterTableCell>
            <MasterTableCell>{user.email}</MasterTableCell>
            <MasterTableCell>{user.role}</MasterTableCell>
            <MasterTableCell>{user.lastLogin}</MasterTableCell>
          </MasterTableRow>
        ))}
      </MasterTable>
    </div>
  );
}
