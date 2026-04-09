import {MasterTable} from '../components/MasterTable';

export function ExampleTablePage() {
  return (
    // Tämä sivu on tarkoitettu MasterTable-komponentin testaukseen ja demonäyttöön.
    <MasterTable
      title="Esimerkkitaulukko"
      description="Tämä sivu toimii taulukkokomponentin kokeilualustana."
    >
      <div style={{padding: '1rem', color: '#475569'}}>
        Varsinainen taulukko tulee tähän kohtaan.
      </div>
    </MasterTable>
  );
}
