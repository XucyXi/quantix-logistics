import {motion} from 'motion/react';
import {
  Bell,
  Lock,
  Globe,
  Mail,
  Palette,
  Database,
  User,
  Shield,
} from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="font-sans">
      {/* Header */}
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

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account Settings */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.1}}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <User size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-foreground font-bold text-base m-0">
              Tilitiedot
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-muted-foreground text-sm mb-2 font-semibold">
                Yrityksen nimi
              </label>
              <input
                type="text"
                defaultValue="Quantix Logistics Oy"
                className="w-full p-3 rounded-lg border border-border bg-input-background text-foreground text-sm outline-none transition-colors focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-muted-foreground text-sm mb-2 font-semibold">
                Y-tunnus
              </label>
              <input
                type="text"
                defaultValue="1234567-8"
                className="w-full p-3 rounded-lg border border-border bg-input-background text-foreground text-sm outline-none transition-colors focus:border-primary"
              />
            </div>
            <button className="p-3 rounded-lg border-none bg-primary text-primary-foreground cursor-pointer text-sm font-semibold transition-colors hover:bg-primary/90">
              Tallenna muutokset
            </button>
          </div>
        </motion.div>

        {/* Security */}
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
          <div className="flex flex-col gap-4">
            {[
              {label: 'Vaihda salasana', desc: 'Päivitä tilisi salasana'},
              {
                label: 'Kaksivaiheinen tunnistautuminen',
                desc: 'Ota käyttöön 2FA lisäturvallisuutta varten',
              },
              {
                label: 'Kirjautumishistoria',
                desc: 'Tarkastele viimeaikaisia kirjautumisia',
              },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-lg border border-border flex justify-between items-center cursor-pointer transition-colors hover:bg-muted/50"
              >
                <div>
                  <div className="text-foreground font-semibold text-sm mb-1">
                    {item.label}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {item.desc}
                  </div>
                </div>
                <Shield size={18} className="text-muted-foreground" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notifications */}
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
              {label: 'Sähköposti-ilmoitukset', enabled: true},
              {label: 'Push-ilmoitukset', enabled: true},
              {label: 'Tilauspäivitykset', enabled: true},
              {label: 'Varastoilmoitukset', enabled: false},
              {label: 'Markkinointisähköpostit', enabled: false},
            ].map((item) => (
              <div
                key={item.label}
                className="flex justify-between items-center py-2"
              >
                <span className="text-foreground text-sm font-medium">
                  {item.label}
                </span>
                <div
                  className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${
                    item.enabled ? 'bg-primary' : 'bg-muted-foreground/30'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                      item.enabled ? 'left-[22px]' : 'left-0.5'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Email Settings */}
        <motion.div
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{delay: 0.4}}
          className="bg-card rounded-2xl p-6 shadow-sm border border-border"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Mail size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-foreground font-bold text-base m-0">
              Sähköpostiasetukset
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-muted-foreground text-sm mb-2 font-semibold">
                SMTP-palvelin
              </label>
              <input
                type="text"
                defaultValue="smtp.quantixlogistics.fi"
                className="w-full p-3 rounded-lg border border-border bg-input-background text-foreground text-sm outline-none transition-colors focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-muted-foreground text-sm mb-2 font-semibold">
                Lähettäjän osoite
              </label>
              <input
                type="email"
                defaultValue="noreply@quantixlogistics.fi"
                className="w-full p-3 rounded-lg border border-border bg-input-background text-foreground text-sm outline-none transition-colors focus:border-primary"
              />
            </div>
            <button className="p-3 rounded-lg border border-border bg-card text-muted-foreground cursor-pointer text-sm font-semibold transition-colors hover:text-primary hover:border-primary">
              Testaa yhteys
            </button>
          </div>
        </motion.div>

        {/* System Settings */}
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
            <div>
              <label className="block text-muted-foreground text-sm mb-2 font-semibold">
                Aikavyöhyke
              </label>
              <select className="w-full p-3 rounded-lg border border-border bg-input-background text-foreground text-sm outline-none transition-colors focus:border-primary appearance-none cursor-pointer">
                <option value="Europe/Helsinki">Helsinki (UTC+2)</option>
                <option value="Europe/Stockholm">Stockholm (UTC+1)</option>
                <option value="Europe/Oslo">Oslo (UTC+1)</option>
              </select>
            </div>
            <div>
              <label className="block text-muted-foreground text-sm mb-2 font-semibold">
                Kieli
              </label>
              <select className="w-full p-3 rounded-lg border border-border bg-input-background text-foreground text-sm outline-none transition-colors focus:border-primary appearance-none cursor-pointer">
                <option value="fi">Suomi</option>
                <option value="en">English</option>
                <option value="sv">Svenska</option>
              </select>
            </div>
            <button className="p-3 rounded-lg border-none bg-primary text-primary-foreground cursor-pointer text-sm font-semibold transition-colors hover:bg-primary/90">
              Tallenna asetukset
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
