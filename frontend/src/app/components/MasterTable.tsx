import type {ReactNode} from 'react';

interface MasterTableProps {
  title?: string;
  description?: string;
  children: ReactNode;
}

export function MasterTable({title, description, children}: MasterTableProps) {
  return (
    <section style={{padding: '1.5rem'}}>
      {/* Otsikko ja kuvaus näkyvät vain jos ne annetaan propseina. */}
      {(title || description) && (
        <header style={{marginBottom: '1rem'}}>
          {title && (
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '0.25rem',
              }}
            >
              {title}
            </h2>
          )}
          {description && <p style={{color: '#64748b'}}>{description}</p>}
        </header>
      )}
      {/* Itse sisältö renderöidään tähän, jotta taulukko voi vaihtua sivun mukaan. */}
      <div style={{overflowX: 'auto'}}>{children}</div>
    </section>
  );
}
