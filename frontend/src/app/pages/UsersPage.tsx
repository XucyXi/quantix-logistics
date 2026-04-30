import {useState} from 'react';
import {
  Clock,
  Shield,
  UserCheck,
  Users,
  Edit,
  Trash2,
  Plus,
  X,
  Package,
} from 'lucide-react';
import {
  MasterTable,
  MasterTableCell,
  MasterTableRow,
} from '../components/MasterTable';

// Päivitetty mock-data sisältämään "Asiakas"-roolin, tierit ja activeOrders -tiedot
const initialUsers = [
  {
    id: 'U-001',
    name: 'Anna Miettinen',
    email: 'anna@quantix.fi',
    role: 'Admin',
    lastLogin: '10 min sitten',
    tier: null,
    activeOrders: null,
  },
  {
    id: 'U-002',
    name: 'Jari Laakso',
    email: 'jari@quantix.fi',
    role: 'Kuljettaja',
    lastLogin: '1 h sitten',
    tier: null,
    activeOrders: 3,
  },
  {
    id: 'U-003',
    name: 'Mira Hakanen',
    email: 'mira@quantix.fi',
    role: 'Varasto',
    lastLogin: '3 h sitten',
    tier: null,
    activeOrders: null,
  },
  {
    id: 'U-004',
    name: 'Teppo K.',
    email: 'teppo@logistics.fi',
    role: 'Kuljettaja',
    lastLogin: '5 min sitten',
    tier: null,
    activeOrders: 0,
  },
  {
    id: 'U-005',
    name: 'Yritys Oy',
    email: 'info@yritys.fi',
    role: 'Asiakas',
    lastLogin: 'Eilen',
    tier: 'Pro',
    activeOrders: null,
  },
  {
    id: 'U-006',
    name: 'Matti Meikäläinen',
    email: 'matti@testi.fi',
    role: 'Asiakas',
    lastLogin: '2 pv sitten',
    tier: 'Starter',
    activeOrders: null,
  },
  {
    id: 'U-007',
    name: 'Suuri Kauppa Ab',
    email: 'contact@kauppa.fi',
    role: 'Asiakas',
    lastLogin: 'Tänään',
    tier: 'Enterprise',
    activeOrders: null,
  },
];

type TabFilter = 'Kaikki' | 'Asiakkaat' | 'Kuljettajat' | 'Adminit';

export function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>('Kaikki');

  // Lomakkeen tila
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Asiakas',
    tier: 'Starter',
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Haluatko varmasti poistaa tämän käyttäjän?')) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const openModal = (user: any = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier || 'Starter',
      });
    } else {
      setEditingUser(null);
      setFormData({name: '', email: '', role: 'Asiakas', tier: 'Starter'});
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Muotoillaan tallennettava data (jos ei asiakas, nollataan tier. Jos uusi kuski, annetaan 0 tilausta)
    const processedData = {
      ...formData,
      tier: formData.role === 'Asiakas' ? formData.tier : null,
      activeOrders:
        formData.role === 'Kuljettaja'
          ? (editingUser?.activeOrders ?? 0)
          : null,
    };

    if (editingUser) {
      setUsers(
        users.map((u) =>
          u.id === editingUser.id ? {...u, ...processedData} : u
        )
      );
    } else {
      const newUser = {
        id: `U-00${users.length + 1}`,
        ...processedData,
        lastLogin: 'Ei koskaan',
      };
      setUsers([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  // Suodatetaan näytettävät käyttäjät aktiivisen välilehden mukaan
  const filteredUsers = users.filter((u) => {
    if (activeTab === 'Asiakkaat') return u.role === 'Asiakas';
    if (activeTab === 'Kuljettajat') return u.role === 'Kuljettaja';
    if (activeTab === 'Adminit') return u.role === 'Admin';
    return true;
  });

  // Apufunktio tason väritykselle
  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Enterprise':
        return (
          <span className="px-2 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-bold">
            Enterprise
          </span>
        );
      case 'Pro':
        return (
          <span className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold">
            Pro
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-muted text-muted-foreground rounded-lg text-xs font-bold">
            Starter
          </span>
        );
    }
  };

  return (
    <div className="font-sans relative">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-foreground font-extrabold text-2xl m-0">
            Käyttäjät
          </h1>
          <p className="text-muted-foreground text-sm mt-2 mb-0">
            Järjestelmän käyttäjät, asiakkaat ja roolit
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus size={18} />
          Lisää käyttäjä
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
        {[
          {
            label: 'Käyttäjiä',
            value: users.length,
            icon: Users,
            colorClass: 'text-blue-500',
            bgClass: 'bg-blue-500/10',
          },
          {
            label: 'Adminit',
            value: users.filter((u) => u.role === 'Admin').length,
            icon: Shield,
            colorClass: 'text-purple-500',
            bgClass: 'bg-purple-500/10',
          },
          {
            label: 'Asiakkaat',
            value: users.filter((u) => u.role === 'Asiakas').length,
            icon: UserCheck,
            colorClass: 'text-green-500',
            bgClass: 'bg-green-500/10',
          },
          {
            label: 'Kuskit ajossa',
            value: users.filter(
              (u) => u.role === 'Kuljettaja' && (u.activeOrders || 0) > 0
            ).length,
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

      {/* Roolien välilehdet (Tabs) */}
      <div className="flex bg-muted p-1 rounded-xl w-fit mb-4 border border-border">
        {(['Kaikki', 'Asiakkaat', 'Kuljettajat', 'Adminit'] as TabFilter[]).map(
          (tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
              }`}
            >
              {tab}
            </button>
          )
        )}
      </div>

      <MasterTable
        columns={[
          {key: 'id', label: 'ID'},
          {key: 'name', label: 'Nimi'},
          {key: 'email', label: 'Sähköposti'},
          {key: 'role', label: 'Rooli'},
          {key: 'details', label: 'Lisätiedot'},
          {key: 'lastLogin', label: 'Viime kirjautuminen'},
          {key: 'actions', label: 'Toiminnot', align: 'right'},
        ]}
      >
        {filteredUsers.map((user) => (
          <MasterTableRow key={user.id}>
            <MasterTableCell>
              <span className="text-muted-foreground font-mono text-xs">
                {user.id}
              </span>
            </MasterTableCell>
            <MasterTableCell>
              <div className="font-semibold text-foreground">{user.name}</div>
            </MasterTableCell>
            <MasterTableCell>{user.email}</MasterTableCell>
            <MasterTableCell>
              <span className="px-2 py-1 bg-accent text-accent-foreground rounded-lg text-xs font-medium border border-border">
                {user.role}
              </span>
            </MasterTableCell>

            {/* Lisätiedot-sarake */}
            <MasterTableCell>
              {user.role === 'Asiakas' && user.tier ? (
                getTierBadge(user.tier)
              ) : user.role === 'Kuljettaja' ? (
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <Package
                    size={14}
                    className={
                      user.activeOrders
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }
                  />
                  {user.activeOrders ? (
                    <span className="text-foreground">
                      {user.activeOrders} tilausta ajossa
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Vapaalla</span>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </MasterTableCell>

            <MasterTableCell>
              <span className="text-sm">{user.lastLogin}</span>
            </MasterTableCell>

            <MasterTableCell align="right">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => openModal(user)}
                  className="p-2 text-muted-foreground hover:text-primary bg-transparent rounded-lg hover:bg-muted transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="p-2 text-muted-foreground hover:text-destructive bg-transparent rounded-lg hover:bg-muted transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </MasterTableCell>
          </MasterTableRow>
        ))}
      </MasterTable>

      {/* Modaali Käyttäjän lisäykseen / muokkaukseen */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted/30">
              <h2 className="text-lg font-bold text-foreground m-0">
                {editingUser ? 'Muokkaa käyttäjää' : 'Lisää uusi käyttäjä'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nimi
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({...formData, name: e.target.value})
                  }
                  className="w-full p-2.5 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-ring outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Sähköposti
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({...formData, email: e.target.value})
                  }
                  className="w-full p-2.5 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-ring outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5 flex justify-between">
                  Rooli
                  {editingUser?.role === 'Admin' && (
                    <span className="text-xs text-muted-foreground italic">
                      Admin-tili
                    </span>
                  )}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({...formData, role: e.target.value})
                  }
                  className="w-full p-2.5 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-ring outline-none transition-all"
                >
                  {/* Estetään uusien adminien lisääminen. Näytetään Admin-vaihtoehto vain jos muokataan jo olemassa olevaa adminia. */}
                  {editingUser?.role === 'Admin' && (
                    <option value="Admin">Admin</option>
                  )}
                  <option value="Asiakas">Asiakas</option>
                  <option value="Kuljettaja">Kuljettaja</option>
                  <option value="Varasto">Varasto</option>
                </select>
                {!editingUser && (
                  <p className="text-xs text-muted-foreground mt-1.5">
                    * Admin-oikeuksia ei voi määrittää uutta käyttäjää luodessa.
                  </p>
                )}
              </div>

              {/* Tason valinta (Näkyy vain asiakkaille) */}
              {formData.role === 'Asiakas' && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Asiakastaso (Tier)
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) =>
                      setFormData({...formData, tier: e.target.value})
                    }
                    className="w-full p-2.5 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-ring outline-none transition-all"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-medium text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                >
                  Peruuta
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
                >
                  Tallenna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
