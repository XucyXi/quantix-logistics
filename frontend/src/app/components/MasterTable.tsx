import {ReactNode} from 'react';

/**
 * Määrittää taulukon yksittäisen sarakkeen rakenteen.
 * Näiden perusteella luodaan taulukon otsikkorivi (thead).
 */
export interface MasterTableColumn {
  key: string; // Uniikki tunniste sarakkeelle (esim. 'name', 'email')
  label: string; // Sarakkeen näkyvä otsikko käyttäjälle
  width?: string; // Valinnainen leveys (esim. '100px' tai '20%')
  align?: 'left' | 'center' | 'right'; // Tekstin tasaus sarakkeessa
}

/**
 * Päätaulukon ominaisuudet (propsit).
 */
export interface MasterTableProps {
  columns: MasterTableColumn[]; // Lista sarakkeiden määrittelyistä
  children?: ReactNode; // Taulukon sisältö (MasterTableRow-komponentteja)
  title?: string; // Taulukon pääotsikko
  description?: string; // Otsikon alle tuleva kuvausteksti
  actions?: ReactNode; // Yläpalkkiin tulevat toimintonapit (esim. "Lisää uusi")
  emptyMessage?: string; // Teksti, joka näytetään jos taulukossa ei ole dataa
}

/**
 * MasterTable - Uudelleenkäytettävä päätaulukkokomponentti.
 * Sisältää yläpalkin (otsikko, kuvaus, toiminnot) ja itse taulukon rakenteen.
 */
export function MasterTable({
  columns,
  children,
  title,
  description,
  actions,
  emptyMessage = 'Ei näytettäviä tietoja', // Oletusteksti tyhjälle taulukolle
}: MasterTableProps) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      {/* Yläpalkki (Header section) - Näytetään vain jos sille on annettu sisältöä */}
      {(title || description || actions) && (
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          {/* Otsikko ja kuvaus */}
          <div>
            {title && (
              <h2
                style={{
                  margin: 0,
                  color: '#0f2444',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: description ? '0.25rem' : 0,
                }}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                style={{
                  margin: 0,
                  color: '#64748b',
                  fontSize: '0.875rem',
                }}
              >
                {description}
              </p>
            )}
          </div>

          {/* Toimintonapit (esim. napit, suodattimet) */}
          {actions && (
            <div style={{display: 'flex', gap: '0.5rem'}}>{actions}</div>
          )}
        </div>
      )}

      {/* Taulukon kääre, joka mahdollistaa vaakasuuntaisen vierityksen (horizontal scroll) pienillä näytöillä */}
      <div style={{overflowX: 'auto'}}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem',
          }}
        >
          {/* Taulukon otsikkorivi */}
          <thead>
            <tr
              style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{
                    padding: '0.75rem 1rem',
                    textAlign: column.align || 'left',
                    color: '#475569',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    whiteSpace: 'nowrap', // Estää otsikon rivittymisen
                    width: column.width,
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Taulukon sisältö */}
          <tbody>
            {children ? (
              // Renderöidään rivit, jos niitä on
              children
            ) : (
              // Näytetään tyhjän tilan viesti, jos lapsielementtejä (rivejä) ei annettu
              <tr>
                <td
                  colSpan={columns.length} // Yhdistää solut koko taulukon levyiseksi
                  style={{
                    padding: '3rem 1rem',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '0.875rem',
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Taulukon rivin ominaisuudet (propsit).
 */
export interface MasterTableRowProps {
  children: ReactNode; // Solut (MasterTableCell-komponentit)
  onClick?: () => void; // Valinnainen klikkauskäsittelijä riville
  style?: React.CSSProperties; // Mahdollisuus lisätä omia tyylejä riville
}

/**
 * MasterTableRow - Yksittäinen rivi taulukossa (<tr>).
 * Hoitaa rivin klikkaukset ja leijumisefektit (hover), jos onClick on määritelty.
 */
export function MasterTableRow({
  children,
  onClick,
  style,
}: MasterTableRowProps) {
  return (
    <tr
      onClick={onClick}
      style={{
        borderBottom: '1px solid #e2e8f0',
        transition: 'background-color 0.15s',
        cursor: onClick ? 'pointer' : 'default', // Muuttaa hiiren kursorin jos rivi on klikattava
        ...style,
      }}
      // Hover-efektin toteutus JavaScriptillä inline-tyylien takia
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.backgroundColor = '#f8fafc'; // Vaaleanharmaa tausta hiiren ollessa päällä
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'; // Palautetaan normaaliksi
      }}
    >
      {children}
    </tr>
  );
}

/**
 * Taulukon yksittäisen solun ominaisuudet (propsit).
 */
export interface MasterTableCellProps {
  children: ReactNode; // Solun sisältö (esim. teksti, napit, kuvat)
  align?: 'left' | 'center' | 'right'; // Sisällön tasaus solun sisällä
  style?: React.CSSProperties; // Mahdollisuus lisätä omia tyylejä solulle
}

/**
 * MasterTableCell - Yksittäinen solu taulukossa (<td>).
 */
export function MasterTableCell({
  children,
  align = 'left',
  style,
}: MasterTableCellProps) {
  return (
    <td
      style={{
        padding: '1rem',
        color: '#1e293b',
        textAlign: align,
        ...style,
      }}
    >
      {children}
    </td>
  );
}
