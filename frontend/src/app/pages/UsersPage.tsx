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
    <div className="font-sans">
      <div className="mb-6">
        <h1 className="text-foreground font-extrabold text-2xl m-0">
          Käyttäjät
        </h1>
        <p className="text-muted-foreground text-sm mt-2 mb-0">
          Järjestelmän käyttäjät ja roolit
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          {
            label: 'Käyttäjiä',
            value: '24',
            icon: Users,
            colorClass: 'text-blue-500',
            bgClass: 'bg-blue-500/10',
          },
          {
            label: 'Adminit',
            value: '3',
            icon: Shield,
            colorClass: 'text-purple-500',
            bgClass: 'bg-purple-500/10',
          },
          {
            label: 'Aktiiviset',
            value: '19',
            icon: UserCheck,
            colorClass: 'text-green-500',
            bgClass: 'bg-green-500/10',
          },
          {
            label: 'Viime kirjautuminen',
            value: '10 min',
            icon: Clock,
            colorClass: 'text-orange-500',
            bgClass: 'bg-orange-500/10',
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

      {/* Huom: Varmista että MasterTable itse ei sisällä myöskään inline-tyylejä omassa tiedostossaan! */}
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
              <div className="font-semibold text-foreground">{user.name}</div>
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
