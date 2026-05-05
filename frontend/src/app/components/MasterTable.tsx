import {ReactNode} from 'react';

/**
 * Määrittää taulukon yksittäisen sarakkeen rakenteen.
 * Näiden perusteella luodaan taulukon otsikkorivi (thead).
 */
export interface MasterTableColumn {
  key: string;
  label: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

/**
 * Päätaulukon ominaisuudet (propsit).
 */
export interface MasterTableProps {
  columns: MasterTableColumn[];
  children?: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  emptyMessage?: string;
}

/**
 * MasterTable - Uudelleenkäytettävä päätaulukkokomponentti.
 * Tottelee Tailwind-teemoja (Dark/Light mode).
 */
export function MasterTable({
  columns,
  children,
  title,
  description,
  actions,
  emptyMessage = 'Ei näytettäviä tietoja',
}: MasterTableProps) {
  return (
    <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden font-sans">
      {/* Yläpalkki (Header section) */}
      {(title || description || actions) && (
        <div className="p-6 border-b border-border flex flex-wrap items-center justify-between gap-4">
          <div>
            {title && (
              <h2 className="m-0 text-card-foreground text-xl font-semibold mb-1">
                {title}
              </h2>
            )}
            {description && (
              <p className="m-0 text-muted-foreground text-sm">{description}</p>
            )}
          </div>

          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}

      {/* Taulukon kääre */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          {/* Taulukon otsikkorivi */}
          <thead className="bg-muted border-b border-border">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-muted-foreground font-semibold text-xs uppercase tracking-wider whitespace-nowrap"
                  style={{
                    textAlign: column.align || 'left',
                    width: column.width,
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Taulukon sisältö */}
          <tbody className="divide-y divide-border">
            {children ? (
              children
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-12 text-center text-muted-foreground text-sm"
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
  children: ReactNode;
  onClick?: () => void;
  className?: string; // Lisätty tuki ulkoisille luokille
}

/**
 * MasterTableRow - Yksittäinen rivi taulukossa (<tr>).
 */
export function MasterTableRow({
  children,
  onClick,
  className = '',
}: MasterTableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={`transition-colors duration-150 ${
        onClick ? 'cursor-pointer hover:bg-muted/50' : ''
      } ${className}`}
    >
      {children}
    </tr>
  );
}

/**
 * Taulukon yksittäisen solun ominaisuudet (propsit).
 */
export interface MasterTableCellProps {
  children: ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

/**
 * MasterTableCell - Yksittäinen solu taulukossa (<td>).
 */
export function MasterTableCell({
  children,
  align = 'left',
  className = '',
}: MasterTableCellProps) {
  return (
    <td
      className={`p-4 text-foreground ${className}`}
      style={{textAlign: align}}
    >
      {children}
    </td>
  );
}
