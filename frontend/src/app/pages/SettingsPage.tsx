import {useState} from 'react';
import {motion} from 'motion/react';
import {
  Bell,
  Lock,
  Mail,
  Database,
  User,
  Shield,
  Loader2,
  Key,
  X,
} from 'lucide-react';
// import api from '../lib/api'; // Ota käyttöön, kun backend on valmis
import {useToast} from '../contexts/ToastContext';

export function SettingsPage() {
  const {showToast} = useToast();

  // --- TILAT (STATE) ---
  const [accountData, setAccountData] = useState({
    companyName: 'Quantix Logistics Oy',
    vatNumber: '1234567-8',
  });
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    orderUpdates: true,
    stockAlerts: false,
    marketing: false,
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpServer: 'smtp.quantixlogistics.fi',
    senderAddress: 'noreply@quantixlogistics.fi',
  });
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);

  const [systemSettings, setSystemSettings] = useState({
    timezone: 'Europe/Helsinki',
    language: 'fi',
  });
  const [isSavingSystem, setIsSavingSystem] = useState(false);

  // --- UUDET TILAT SALASANAN VAIHTOON SISÄLLÄ ---
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- TOIMINNOT (HANDLERS) ---
  const handleSaveAccount = async () => {
    setIsSavingAccount(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      showToast('Tilitiedot tallennettu onnistuneesti!', 'success');
    } catch (e) {
      showToast('Virhe tilitietojen tallennuksessa', 'error');
    } finally {
      setIsSavingAccount(false);
    }
  };

  const handleSaveSystem = async () => {
    setIsSavingSystem(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      showToast('Järjestelmäasetukset tallennettu!', 'success');
    } catch (e) {
      showToast('Virhe järjestelmäasetusten tallennuksessa', 'error');
    } finally {
      setIsSavingSystem(false);
    }
  };

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      showToast('Yhteys SMTP-palvelimeen onnistui!', 'success');
    } catch (e) {
      showToast('SMTP-yhteys epäonnistui. Tarkista asetukset.', 'error');
    } finally {
      setIsTestingSmtp(false);
    }
  };

  // UUSI HANDLER SUORAA SALASANAN VAIHTOA VARTEN
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.new !== passwordForm.confirm) {
      showToast('Uudet salasanat eivät täsmää.', 'error');
      return;
    }
    if (passwordForm.new.length < 8) {
      showToast(
        'Uuden salasanan on oltava vähintään 8 merkkiä pitkä.',
        'error'
      );
      return;
    }

    setIsChangingPassword(true);
    try {
      // TÄHÄN TULEE BACKEND-KUTSU: (Tää on paljon helpompi rakentaa backendiin!)
      // await api.put('/auth/change-password', { currentPassword: passwordForm.current, newPassword: passwordForm.new });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      showToast('Salasana vaihdettu onnistuneesti!', 'success');
      setIsPasswordModalOpen(false);
      setPasswordForm({current: '', new: '', confirm: ''});
    } catch (e) {
      // Tässä voidaan ottaa kiinni backendin virhe, esim. "Väärä nykyinen salasana"
      showToast(
        'Salasanan vaihto epäonnistui. Tarkista nykyinen salasana.',
        'error'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const toggleNotification = (key: keyof typeof notifications) => {
    const newValue = !notifications[key];
    setNotifications((prev) => ({...prev, [key]: newValue}));
  };

  return (
    <div className="font-sans pb-10 relative">
      {/* ... YLÄOSAN KOODI PYSYY TÄYSIN SAMANA (Header, Account, Security, Notifications, System jne.) ... */}
      <motion.div
        initial={{opacity: 0, y: -10}}
        animate={{opacity: 1, y: 0}}
        className="mb-6"
      >
        <h1 className="text-foreground font-extrabold text-2xl m-0 mb-2">
          Asetukset
        </h1>
        <p className="text-muted-foreground text-sm m-0">
          Hallitse järjestelmän asetuksia ja konfiguraatioita
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Account Settings */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.1}}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <User size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-foreground font-bold text-base m-0">
              Tilitiedot
            </h2>
          </div>
          <div className="flex flex-col gap-4 flex-1 justify-between">
            <div className="space-y-4">
              <div>
                <label className="block text-muted-foreground text-sm mb-2 font-semibold">
                  Yrityksen nimi
                </label>
                <input
                  type="text"
                  value={accountData.companyName}
                  onChange={(e) =>
                    setAccountData({
                      ...accountData,
                      companyName: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-lg border border-border bg-input-background text-foreground text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-muted-foreground text-sm mb-2 font-semibold">
                  Y-tunnus
                </label>
                <input
                  type="text"
                  value={accountData.vatNumber}
                  onChange={(e) =>
                    setAccountData({...accountData, vatNumber: e.target.value})
                  }
                  className="w-full p-3 rounded-lg border border-border bg-input-background text-foreground text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <button
              onClick={handleSaveAccount}
              disabled={isSavingAccount}
              className="mt-4 p-3 rounded-lg border-none bg-primary text-primary-foreground cursor-pointer text-sm font-semibold transition-colors hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSavingAccount && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {isSavingAccount ? 'Tallennetaan...' : 'Tallenna muutokset'}
            </button>
          </div>
        </motion.div>

        {/* 2. Security */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.2}}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Lock size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-foreground font-bold text-base m-0">
              Turvallisuus
            </h2>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full text-left p-4 rounded-lg border border-border flex justify-between items-center cursor-pointer transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div>
                <div className="text-foreground font-semibold text-sm mb-1">
                  Vaihda salasana
                </div>
                <div className="text-muted-foreground text-xs">
                  Päivitä tilisi salasana
                </div>
              </div>
              <Shield size={18} className="text-muted-foreground" />
            </button>
            <button
              onClick={() =>
                showToast(
                  '2FA asetukset aukeavat tulevassa päivityksessä.',
                  'success'
                )
              }
              className="w-full text-left p-4 rounded-lg border border-border flex justify-between items-center cursor-pointer transition-colors hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div>
                <div className="text-foreground font-semibold text-sm mb-1">
                  Kaksivaiheinen tunnistautuminen (2FA)
                </div>
                <div className="text-muted-foreground text-xs">
                  Ota käyttöön 2FA lisäturvallisuutta varten
                </div>
              </div>
              <Shield size={18} className="text-muted-foreground" />
            </button>
          </div>
        </motion.div>

        {/* 3. Notifications */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.3}}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Bell size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-foreground font-bold text-base m-0">
              Ilmoitukset
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            {[
              {label: 'Sähköposti-ilmoitukset', key: 'email'},
              {label: 'Push-ilmoitukset', key: 'push'},
              {label: 'Tilauspäivitykset', key: 'orderUpdates'},
              {label: 'Varastoilmoitukset', key: 'stockAlerts'},
              {label: 'Markkinointisähköpostit', key: 'marketing'},
            ].map((item) => {
              const isEnabled =
                notifications[item.key as keyof typeof notifications];
              return (
                <button
                  key={item.key}
                  onClick={() =>
                    toggleNotification(item.key as keyof typeof notifications)
                  }
                  className="flex justify-between items-center py-2 w-full text-left bg-transparent border-none cursor-pointer group"
                >
                  <span className="text-foreground text-sm font-medium group-hover:text-primary transition-colors">
                    {item.label}
                  </span>
                  <div
                    className={`w-11 h-6 rounded-full relative transition-colors ${isEnabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm ${isEnabled ? 'left-[22px]' : 'left-0.5'}`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 4. Email Settings & System Settings Container */}
        <div className="flex flex-col gap-4">
          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.4}}
            className="bg-card rounded-2xl p-6 shadow-sm border border-border"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Mail
                  size={20}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>
              <h2 className="text-foreground font-bold text-base m-0">
                Sähköpostiasetukset (SMTP)
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-muted-foreground text-sm mb-2 font-semibold">
                  SMTP-palvelin
                </label>
                <input
                  type="text"
                  value={emailSettings.smtpServer}
                  onChange={(e) =>
                    setEmailSettings({
                      ...emailSettings,
                      smtpServer: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-lg border border-border bg-input-background text-foreground text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-muted-foreground text-sm mb-2 font-semibold">
                  Lähettäjän osoite
                </label>
                <input
                  type="email"
                  value={emailSettings.senderAddress}
                  onChange={(e) =>
                    setEmailSettings({
                      ...emailSettings,
                      senderAddress: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-lg border border-border bg-input-background text-foreground text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                onClick={handleTestSmtp}
                disabled={isTestingSmtp}
                className="p-3 rounded-lg border border-border bg-card text-muted-foreground cursor-pointer text-sm font-semibold transition-colors hover:text-primary hover:border-primary flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isTestingSmtp && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {isTestingSmtp ? 'Testataan...' : 'Testaa yhteys'}
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{delay: 0.5}}
            className="bg-card rounded-2xl p-6 shadow-sm border border-border"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Database
                  size={20}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
              <h2 className="text-foreground font-bold text-base m-0">
                Järjestelmäasetukset
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-muted-foreground text-sm mb-2 font-semibold">
                    Aikavyöhyke
                  </label>
                  <select
                    value={systemSettings.timezone}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        timezone: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-lg border border-border bg-input-background text-foreground text-sm outline-none transition-colors focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                  >
                    <option value="Europe/Helsinki">Helsinki (UTC+2)</option>
                    <option value="Europe/Stockholm">Stockholm (UTC+1)</option>
                    <option value="Europe/Oslo">Oslo (UTC+1)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-muted-foreground text-sm mb-2 font-semibold">
                    Kieli
                  </label>
                  <select
                    value={systemSettings.language}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        language: e.target.value,
                      })
                    }
                    className="w-full p-3 rounded-lg border border-border bg-input-background text-foreground text-sm outline-none transition-colors focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
                  >
                    <option value="fi">Suomi</option>
                    <option value="en">English</option>
                    <option value="sv">Svenska</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleSaveSystem}
                disabled={isSavingSystem}
                className="p-3 rounded-lg border-none bg-primary text-primary-foreground cursor-pointer text-sm font-semibold transition-colors hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSavingSystem && (
                  <Loader2 size={16} className="animate-spin" />
                )}
                {isSavingSystem ? 'Tallennetaan...' : 'Tallenna asetukset'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* UUSI: SALASANAN VAIHTO SUORAAN SOVELLUKSESSA */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
            <div className="flex justify-between items-center p-5 border-b border-border bg-muted/30">
              <h2 className="text-lg font-bold text-foreground m-0 flex items-center gap-2">
                <Key size={18} className="text-primary" />
                Vaihda salasana
              </h2>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleChangePasswordSubmit}
              className="p-5 flex flex-col gap-4"
            >
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Nykyinen salasana
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.current}
                  onChange={(e) =>
                    setPasswordForm({...passwordForm, current: e.target.value})
                  }
                  className="w-full p-3 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-ring outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Uusi salasana
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.new}
                  onChange={(e) =>
                    setPasswordForm({...passwordForm, new: e.target.value})
                  }
                  className="w-full p-3 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-ring outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Vahvista uusi salasana
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirm}
                  onChange={(e) =>
                    setPasswordForm({...passwordForm, confirm: e.target.value})
                  }
                  className={`w-full p-3 rounded-xl bg-input-background border text-foreground focus:ring-2 outline-none transition-all ${
                    passwordForm.confirm &&
                    passwordForm.new !== passwordForm.confirm
                      ? 'border-destructive focus:ring-destructive'
                      : 'border-border focus:ring-ring'
                  }`}
                />
                {passwordForm.confirm &&
                  passwordForm.new !== passwordForm.confirm && (
                    <p className="text-xs text-destructive mt-1.5">
                      Salasanat eivät täsmää
                    </p>
                  )}
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 font-medium text-muted-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
                >
                  Peruuta
                </button>
                <button
                  type="submit"
                  disabled={
                    isChangingPassword ||
                    !passwordForm.current ||
                    !passwordForm.new ||
                    !passwordForm.confirm
                  }
                  className="px-5 py-2 font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {isChangingPassword && (
                    <Loader2 size={16} className="animate-spin" />
                  )}
                  {isChangingPassword
                    ? 'Tallennetaan...'
                    : 'Tallenna uusi salasana'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 
        TULEVAISUUTTA VARTEN: SÄHKÖPOSTIN KAUTTA TAPAHTUVAN SALASANAN VAIHDON LOGIIKKA (UNOHTUNUT SALASANA)
        
        const [resetEmail, setResetEmail] = useState('');
        
        const handlePasswordResetSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          // await api.post('/auth/reset-password', { email: resetEmail });
          // showToast(`Linkki lähetetty osoitteeseen ${resetEmail}`, 'success');
        };
      */}
    </div>
  );
}
