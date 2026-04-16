import {useState, ReactNode} from 'react';
import {Link, useLocation} from 'react-router';
import {LucideIcon, Menu, X, Truck, ChevronRight} from 'lucide-react';

/**
 * Määrittää yksittäisen navigointilinkin rakenteen sivupalkissa.
 */
export interface SidebarNavItem {
  to: string; // Reitin polku (esim. '/asiakkaat')
  icon: LucideIcon; // Lucide-kirjaston ikoni
  label: string; // Navigointipainikkeen näkyvä teksti
}

/**
 * Sivupalkin (Sidebar) ominaisuudet (propsit).
 */
export interface SidebarProps {
  navItems: SidebarNavItem[]; // Lista sivupalkin linkeistä
  userInfo?: {
    // Valinnaiset sisäänkirjautuneen käyttäjän tiedot alareunaan
    name: string;
    role: string;
  };
  onLogout?: () => void; // Funktio, joka ajetaan uloskirjautumisnappia painettaessa
  footer?: ReactNode; // Mahdollisuus korvata koko alaosa täysin omalla elementillä
  brandText?: string; // Yrityksen/sovelluksen pääteksti
  brandSubtext?: string; // Yrityksen/sovelluksen alateksti
}

/**
 * Sidebar - Sivupalkkikomponentti
 * Sisältää brändäyksen, navigointilinkit ja käyttäjätiedot.
 * Voidaan kutistaa (collapse) tilan säästämiseksi.
 */
export function Sidebar({
  navItems,
  userInfo,
  onLogout,
  footer,
  brandText = 'QUANTIX',
  brandSubtext = 'LOGISTICS',
}: SidebarProps) {
  // Tilamuuttuja (state): Määrittää onko sivupalkki auki (leveä) vai supistettu (kapea).
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Hakee nykyisen URL-reitin react-routerista (esim. '/asetukset')
  const location = useLocation();

  /**
   * Apufunktio, joka tarkistaa onko annettu polku tällä hetkellä aktiivinen.
   * Tämä mahdollistaa sen, että aktiivinen linkki voidaan korostaa visuaalisesti.
   */
  const isActive = (path: string) => {
    // Täsmälleen sama reitti (esim. klikattiin '/dashboard' ja ollaan '/dashboard')
    if (path === location.pathname) return true;

    // Tarkistetaan myös alareitit (esim. ollaan '/asiakkaat/123', niin '/asiakkaat'-linkki palaa aktiivisena)
    // Poikkeuksena juurireitti ('/'), jotta se ei olisi aina aktiivinen
    if (path !== '/' && location.pathname.startsWith(path)) return true;

    return false;
  };

  return (
    <aside
      style={{
        // Jos palkki on auki, leveys on 240px, muuten vain 64px (ikonien levyinen)
        width: sidebarOpen ? 240 : 64,
        backgroundColor: '#0f2444', // Tumma laivastonsininen tausta
        transition: 'width 0.3s ease', // Pehmeä animaatio leveyttä muutettaessa
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0, // Estää sivupalkkia puristumasta kasaan, jos viereinen sisältö kasvaa
        position: 'sticky', // Pitää sivupalkin ruudulla vaikka sivua vieritettäisiin
        top: 0,
        height: '100vh', // Koko näytön korkuinen
        overflow: 'hidden', // Piilottaa sisällön (kuten tekstit) leveysanimoinnin aikana
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* 1. Yläosan alue (Header): Logo, bränditeksti ja avaus/sulkunappi */}
      <div
        style={{
          padding: '1rem',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 64,
        }}
      >
        {/* Näytetään logotekstit vain, kun sivupalkki on auki */}
        {sidebarOpen && (
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Truck size={15} color="white" />
            </div>
            <div>
              <div
                style={{
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  lineHeight: 1.2,
                }}
              >
                {brandText}
              </div>
              <div
                style={{color: '#f97316', fontWeight: 600, fontSize: '0.7rem'}}
              >
                {brandSubtext}
              </div>
            </div>
          </div>
        )}

        {/* Nappi, jolla sivupalkki avataan ja suljetaan */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
          aria-label={sidebarOpen ? 'Sulje valikko' : 'Avaa valikko'}
        >
          {/* Vaihtaa ikonia ruksista purilaiseen riippuen tilasta */}
          {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
        </button>
      </div>

      {/* 2. Navigointilinkit (Nav items) */}
      <nav
        style={{
          flex: 1, // Ottaa kaiken jäljelle jäävän tilan ylä- ja alaosan välistä
          padding: '0.75rem 0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}
      >
        {navItems.map(({to, icon: Icon, label}) => {
          // Lasketaan aktiivisuus kerran per linkki
          const active = isActive(to);

          return (
            <Link
              key={to}
              to={to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 0.75rem',
                borderRadius: 8,
                textDecoration: 'none',
                // Aktiivinen linkki korostetaan oranssilla taustalla
                backgroundColor: active
                  ? 'rgba(249,115,22,0.15)'
                  : 'transparent',
                // Aktiivisen linkin teksti/ikoni on oranssi, muiden harmahtava
                color: active ? '#f97316' : 'rgba(255,255,255,0.65)',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              }}
              // Leijumisefektit (hover) hoidetaan JavaScriptillä inline-tyylien takia.
              // Emme muuta aktiivisen linkin värejä, ainoastaan ei-aktiivisten.
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor =
                    'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                }
              }}
            >
              <Icon size={18} style={{flexShrink: 0}} />

              {/* Näytetään teksti vain, jos palkki on auki */}
              {sidebarOpen && (
                <span
                  style={{fontSize: '0.875rem', fontWeight: active ? 600 : 400}}
                >
                  {label}
                </span>
              )}

              {/* Näytetään pieni nuoli oikeassa reunassa osoittamaan aktiivista valintaa (vain jos palkki on auki) */}
              {sidebarOpen && active && (
                <ChevronRight size={14} style={{marginLeft: 'auto'}} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* 3. Alaosa (User info and footer) */}
      {/* Näytetään 'footer'-propsi, JOS se on annettu. Muuten näytetään oletuksena userInfo ja uloskirjautumisnappi. */}
      {footer ||
        (userInfo && (
          <div
            style={{
              padding: '1rem 0.75rem',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {/* Käyttäjän nimi ja rooli piilotetaan, kun palkki on supistettu */}
            {sidebarOpen && userInfo && (
              <div style={{marginBottom: onLogout ? '0.75rem' : 0}}>
                <div
                  style={{
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis', // Lisää "..." jos nimi on liian pitkä
                  }}
                >
                  {userInfo.name}
                </div>
                <div
                  style={{color: 'rgba(255,255,255,0.45)', fontSize: '0.75rem'}}
                >
                  {userInfo.role}
                </div>
              </div>
            )}

            {/* Uloskirjautumisnappi */}
            {onLogout && (
              <button
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  // Nappi keskitetään, kun palkki on supistettu (koska vain ikoni jää näkyviin)
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  gap: '0.625rem',
                  padding: '0.5rem',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: 'rgba(239,68,68,0.1)', // Vaaleanpunainen/punertava tausta varoituksena
                  color: '#f87171',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  width: '100%',
                }}
              >
                {/* Supistetussa tilassa teksti piilotetaan, jotta nappi pysyy kompaktina. */}
                {sidebarOpen ? 'Kirjaudu ulos' : ''}
              </button>
            )}
          </div>
        ))}
    </aside>
  );
}
