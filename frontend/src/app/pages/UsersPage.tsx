import {useState, useEffect} from 'react';
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
  AlertCircle,
} from 'lucide-react';
import {
  MasterTable,
  MasterTableCell,
  MasterTableRow,
} from '../components/MasterTable';
import {userService, User} from '../services/userService';

type TabFilter = 'Kaikki' | 'Asiakkaat' | 'Kuljettajat' | 'Adminit';

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>('Kaikki');

  // Lomakkeen tila
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Asiakas' as User['role'],
    tier: 'Starter' as 'Starter' | 'Pro' | 'Enterprise',
    password: '', // Lisätty, koska uusi käyttäjä tarvitsee salasanan
    vehicleInfo: '',
  });

  // Haetaan käyttäjät backendistä
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await userService.getAllUsers();
        setUsers(fetchedUsers);
      } catch (err) {
        console.error('Virhe käyttäjien haussa:', err);
        setError('Käyttäjätietojen lataaminen epäonnistui.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (user: User) => {
    // Varmistetaan vielä kerran, ettei vahingossakaan yritetä poistaa adminia
    if (user.role === 'Admin') {
      alert('Admin-käyttäjiä ei voi poistaa!');
      return;
    }

    if (window.confirm(`Haluatko varmasti poistaa käyttäjän ${user.name}?`)) {
      try {
        await userService.deleteUser(user.original_id);
        setUsers(users.filter((u) => u.original_id !== user.original_id));
      } catch (err) {
        console.error('Poisto epäonnistui', err);
        alert(
          'Käyttäjän poistaminen epäonnistui. Kyseisellä asiakkaalla saattaa olla aktiivisia tilauksia järjestelmässä.'
        );
      }
    }
  };

  const openModal = (user: User | null = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier || 'Starter',
        password: '', // Salasanaa ei esitetä muokatessa
        vehicleInfo: user.role === 'Kuljettaja' ? user.vehicleInfo || '' : '',
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'Asiakas',
        tier: 'Starter',
        password: '',
        vehicleInfo: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Varmistetaan, että salasana on syötetty vain uutta käyttäjää luodessa
    if (!editingUser && !formData.password) {
      alert('Uudelle käyttäjälle täytyy määrittää salasana!');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        tier: formData.role === 'Asiakas' ? formData.tier : null,
        vehicleInfo:
          formData.role === 'Kuljettaja' ? formData.vehicleInfo : undefined,
        password: formData.password ? formData.password : undefined,
      };

      if (editingUser) {
        // Päivitys
        await userService.updateUser(editingUser.original_id, payload);

        setUsers(
          users.map((u) =>
            u.original_id === editingUser.original_id
              ? {
                  ...u,
                  name: payload.name,
                  email: payload.email,
                  role: payload.role,
                  tier: payload.tier as 'Starter' | 'Pro' | 'Enterprise' | null,
                  vehicleInfo:
                    payload.role === 'Kuljettaja'
                      ? payload.vehicleInfo || u.vehicleInfo || ''
                      : null,
                }
              : u
          )
        );
      } else {
        // Luonti
        const res = await userService.createUser(payload);

        const newUser: User = {
          id: `U-${res.user_id.toString().padStart(3, '0')}`,
          original_id: res.user_id,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          tier: formData.role === 'Asiakas' ? formData.tier : null,
          lastLogin: 'Ei koskaan',
          activeOrders: formData.role === 'Kuljettaja' ? 0 : null,
          vehicleInfo:
            formData.role === 'Kuljettaja' ? formData.vehicleInfo : null,
        };
        setUsers([...users, newUser]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Käyttäjän tallennus epäonnistui:', err);
      alert(
        'Tallennus epäonnistui. Sähköpostiosoite saattaa olla jo käytössä.'
      );
    }
  };

  const filteredUsers = users.filter((u) => {
    if (activeTab === 'Asiakkaat') return u.role === 'Asiakas';
    if (activeTab === 'Kuljettajat') return u.role === 'Kuljettaja';
    if (activeTab === 'Adminit') return u.role === 'Admin';
    return true;
  });

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

      {/* Roolien välilehdet */}
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

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">
          Ladataan käyttäjiä tietokannasta...
        </div>
      ) : error ? (
        <div className="text-center py-10 text-destructive bg-destructive/10 rounded-xl border border-destructive/20 flex items-center justify-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      ) : (
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
            <MasterTableRow key={user.original_id}>
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
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-medium">
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
                    {user.vehicleInfo ? (
                      <div className="text-muted-foreground">
                        Ajoneuvo: {user.vehicleInfo}
                      </div>
                    ) : null}
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
                  {/* Piilotetaan Muokkaa-nappi Admineilta */}
                  {user.role !== 'Admin' ? (
                    <button
                      onClick={() => openModal(user)}
                      className="p-2 text-muted-foreground hover:text-primary bg-transparent rounded-lg hover:bg-muted transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                  ) : null}

                  {/* Piilotetaan Poista-nappi Admineilta */}
                  {user.role !== 'Admin' ? (
                    <button
                      onClick={() => handleDelete(user)}
                      className="p-2 text-muted-foreground hover:text-destructive bg-transparent rounded-lg hover:bg-muted transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <div className="h-8 w-8" /> // Placeholder jotta asettelu pysyy siistinä
                  )}
                </div>
              </MasterTableCell>
            </MasterTableRow>
          ))}
        </MasterTable>
      )}

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
                  Nimi (Näkyy asiakkaille/kuljettajille)
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
                  Sähköposti (Käytetään sisäänkirjautumiseen)
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

              {/* Salasana (näytetään aina uutta luodessa, muokatessa vapaaehtoinen) */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Salasana{' '}
                  {editingUser && (
                    <span className="text-xs text-muted-foreground font-normal">
                      (Jätä tyhjäksi jos et halua vaihtaa)
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  required={!editingUser} // Pakollinen vain luodessa
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({...formData, password: e.target.value})
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
                    setFormData({
                      ...formData,
                      role: e.target.value as User['role'],
                    })
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
                      setFormData({
                        ...formData,
                        tier: e.target.value as
                          | 'Starter'
                          | 'Pro'
                          | 'Enterprise',
                      })
                    }
                    className="w-full p-2.5 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-ring outline-none transition-all"
                  >
                    <option value="Starter">Starter</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              )}

              {formData.role === 'Kuljettaja' && (
                <div className="animate-fadeIn">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Ajoneuvon tiedot
                  </label>
                  <input
                    type="text"
                    value={formData.vehicleInfo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vehicleInfo: e.target.value,
                      })
                    }
                    placeholder="Esim. Mercedes Sprinter (XYZ-123)"
                    className="w-full p-2.5 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-ring outline-none transition-all"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Tässä voit tallentaa kuljettajan ajoneuvon tiedot.
                  </p>
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
