import {useState} from 'react';
import {motion} from 'motion/react';
import {
  ShoppingCart,
  Package,
  Search,
  SlidersHorizontal,
  Thermometer,
  AlertCircle,
  Tag,
  Box,
} from 'lucide-react';
import {useCart} from '../contexts/CartContext';

/**
 * MOCK-DATA: Tämä simuloi oikean API-rajapinnan palauttamaa JSON-dataa.
 * Tarkoitus on mahdollistaa UI:n ja hakulogiikan rakentaminen valmiiksi
 * ennen kuin varsinainen backend ja tietokanta on kytketty.
 * Rakenne (kategoriat ja tuotteet erillään) mukailee tyypillistä relaatiotietokannan vastausta.
 */
const PRODUCTS_DATA = {
  updated: '2026-04-02T08:00:00',
  categories: [
    {id: 'maito', name: 'Maitotuotteet', icon: '🥛', color: '#3b82f6'},
    {id: 'liha', name: 'Liha & Kala', icon: '🥩', color: '#ef4444'},
    {id: 'vihannes', name: 'Vihannes & Hedelmä', icon: '🥦', color: '#22c55e'},
    {id: 'kuiva', name: 'Kuivatuotteet', icon: '🌾', color: '#f59e0b'},
    {id: 'pakaste', name: 'Pakasteet', icon: '❄️', color: '#0891b2'},
    {id: 'juoma', name: 'Juomat', icon: '🧃', color: '#8b5cf6'},
  ],
  products: [
    {
      id: 'p-001',
      sku: 'ML-0012',
      name: 'Täysmaito 3% 1L',
      brand: 'Valio',
      description:
        'Pastöroitu täysmaito, luomulaatuinen. Pakattu 12 pullon laatikoissa.',
      pricePerUnit: 1.19,
      unit: 'l',
      packageSize: '12 × 1 L',
      minOrder: 1,
      categoryId: 'maito',
      storage: 'kylmä',
      kcal: 61,
      inStock: true,
      tags: ['Luomu'],
    },
    {
      id: 'p-002',
      sku: 'ML-0034',
      name: 'Kermaviili 2dl',
      brand: 'Arla',
      description:
        'Perinteinen suomalainen kermaviili. Pakkauskoko 6 × 2 dl per myyntierä.',
      pricePerUnit: 0.89,
      unit: 'dl',
      packageSize: '6 × 200 ml',
      minOrder: 2,
      categoryId: 'maito',
      storage: 'kylmä',
      kcal: 195,
      inStock: true,
      tags: [],
    },
    {
      id: 'p-003',
      sku: 'LK-0089',
      name: 'Naudan jauheliha 20% 500g',
      brand: 'Atria',
      description:
        'Tuore suomalainen naudanjauheliha, rasvapitoisuus 20%. Pakkauskoko 10 × 500 g.',
      pricePerUnit: 4.95,
      unit: 'kpl',
      packageSize: '10 × 500 g',
      minOrder: 1,
      categoryId: 'liha',
      storage: 'kylmä',
      kcal: 220,
      inStock: true,
      tags: ['Suomalainen'],
    },
    {
      id: 'p-004',
      sku: 'LK-0112',
      name: 'Kirjolohifile 400g',
      brand: 'Saarioinen',
      description:
        'Tuore kirjolohifile, nahaton. Sopii grillattavaksi tai paistettavaksi. 8 × 400 g.',
      pricePerUnit: 6.49,
      unit: 'kpl',
      packageSize: '8 × 400 g',
      minOrder: 1,
      categoryId: 'liha',
      storage: 'kylmä',
      kcal: 185,
      inStock: false,
      tags: ['Kotimainen'],
    },
    {
      id: 'p-005',
      sku: 'VH-0201',
      name: 'Kurkku kpl',
      brand: 'Lähitila',
      description:
        'Kotimaiset kasvihuonekurkut. Raikas ja rapea. Toimitetaan 12 kpl laatikoissa.',
      pricePerUnit: 0.69,
      unit: 'kpl',
      packageSize: '12 kpl / ltk',
      minOrder: 1,
      categoryId: 'vihannes',
      storage: 'huoneenlämpö',
      kcal: 12,
      inStock: true,
      tags: ['Kotimainen', 'Luomu'],
    },
    {
      id: 'p-006',
      sku: 'VH-0234',
      name: 'Tomaatti 250g',
      brand: 'Lähitila',
      description:
        'Kirsikkatomaatit rasioissa. Makea ja mehukas. 250 g rasiat, 12 kpl / ltk.',
      pricePerUnit: 1.49,
      unit: 'rasia',
      packageSize: '12 × 250 g',
      minOrder: 1,
      categoryId: 'vihannes',
      storage: 'huoneenlämpö',
      kcal: 18,
      inStock: true,
      tags: ['Kotimainen'],
    },
    {
      id: 'p-007',
      sku: 'KV-0301',
      name: 'Durumvehnäpasta 500g',
      brand: 'Panzani',
      description:
        'Laadukas italialainen pasta. Keitto 8 min. Kartonkilaatikko 20 × 500 g.',
      pricePerUnit: 1.09,
      unit: 'kpl',
      packageSize: '20 × 500 g',
      minOrder: 1,
      categoryId: 'kuiva',
      storage: 'kuiva',
      kcal: 353,
      inStock: true,
      tags: [],
    },
    {
      id: 'p-008',
      sku: 'KV-0345',
      name: 'Basmatiriisi 1kg',
      brand: "Uncle Ben's",
      description:
        'Pitkäjyväinen basmatiriisi. Keitto 12 min. Pakkauskoko 10 × 1 kg.',
      pricePerUnit: 2.39,
      unit: 'kpl',
      packageSize: '10 × 1 kg',
      minOrder: 1,
      categoryId: 'kuiva',
      storage: 'kuiva',
      kcal: 360,
      inStock: true,
      tags: [],
    },
    {
      id: 'p-009',
      sku: 'PK-0401',
      name: 'Pakastebroileri koipireisi 1kg',
      brand: 'HK',
      description:
        'Pakaste koipireisipala. Sopii uuniin tai grilliin. 6 × 1 kg pakkaukset.',
      pricePerUnit: 5.79,
      unit: 'kpl',
      packageSize: '6 × 1 kg',
      minOrder: 1,
      categoryId: 'pakaste',
      storage: 'pakaste',
      kcal: 190,
      inStock: true,
      tags: ['Suomalainen'],
    },
    {
      id: 'p-010',
      sku: 'PK-0423',
      name: 'Pakastemansikka 1kg',
      brand: 'Apetit',
      description:
        'Suomalaiset pakastemansikkat ilman lisäaineita. 8 × 1 kg pakkaukset.',
      pricePerUnit: 4.29,
      unit: 'kpl',
      packageSize: '8 × 1 kg',
      minOrder: 1,
      categoryId: 'pakaste',
      storage: 'pakaste',
      kcal: 32,
      inStock: true,
      tags: ['Kotimainen', 'Luomu'],
    },
    {
      id: 'p-011',
      sku: 'JU-0501',
      name: 'Appelsiinimehu 1L',
      brand: 'Hohes C',
      description:
        'Puristettu appelsiinimehu, ei lisättyä sokeria. 12 × 1 L pakkauskoko.',
      pricePerUnit: 1.99,
      unit: 'l',
      packageSize: '12 × 1 L',
      minOrder: 1,
      categoryId: 'juoma',
      storage: 'kylmä',
      kcal: 45,
      inStock: true,
      tags: [],
    },
    {
      id: 'p-012',
      sku: 'JU-0534',
      name: 'Kivennäisvesi 0.5L',
      brand: 'Vichy',
      description:
        'Luonnollinen kivennäisvesi, ei makuaineita. Huputettu 24 × 0.5 L.',
      pricePerUnit: 0.59,
      unit: 'l',
      packageSize: '24 × 500 ml',
      minOrder: 2,
      categoryId: 'juoma',
      storage: 'huoneenlämpö',
      kcal: 0,
      inStock: true,
      tags: [],
    },
  ],
};

// Ylläpidetään keskitettyjä tyylimäärittelyitä badgeille, jotta UI pysyy yhtenäisenä
const storageLabels: Record<
  string,
  {label: string; color: string; bg: string}
> = {
  kylmä: {label: 'Kylmäsäilytys', color: '#2563eb', bg: '#dbeafe'},
  pakaste: {label: 'Pakaste', color: '#0891b2', bg: '#cffafe'},
  kuiva: {label: 'Kuivasäilytys', color: '#92400e', bg: '#fef3c7'},
  huoneenlämpö: {label: 'Huoneenlämpö', color: '#065f46', bg: '#d1fae5'},
};

const tagColors: Record<string, {bg: string; color: string}> = {
  Luomu: {bg: '#dcfce7', color: '#16a34a'},
  Kotimainen: {bg: '#dbeafe', color: '#2563eb'},
  Suomalainen: {bg: '#ede9fe', color: '#7c3aed'},
};

/**
 * ProductsPage-komponentti
 * Vastaa tuotteiden listaamisesta, filtteröinnistä ja ostoskoriin lisäämisestä.
 * Sisältää monipuolisen hakulogiikan, joka reagoi reaaliaikaisesti käyttäjän syötteisiin.
 */
export function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Säilytetään lisättyjen tuotteiden ID:t väliaikaisesti, jotta voimme
  // näyttää painikkeessa "Lisätty ✓" -animaation ilman erillistä tilaa per tuote.
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const {addItem} = useCart();

  // Yhdistetty filtteröintilogiikka. Tämä ajetaan aina uudestaan,
  // kun jokin state (search, category, inStock) muuttuu.
  const filtered = PRODUCTS_DATA.products.filter((p) => {
    const matchesCat =
      activeCategory === 'all' || p.categoryId === activeCategory;
    // Haku kohdistuu nimeen, brändiin, SKU:hun ja kuvaukseen laajan osumatarkkuuden takaamiseksi.
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesStock = !onlyInStock || p.inStock;

    return matchesCat && matchesSearch && matchesStock;
  });

  const handleAddToCart = (product: (typeof PRODUCTS_DATA.products)[0]) => {
    // Viedään tuote CartContextin hallinnoimaan globaaliin ostoskoriin
    addItem({
      id: product.id,
      name: product.name,
      description: `${product.brand} · ${product.packageSize}`,
      price: product.pricePerUnit,
    });

    // Luodaan UX-efekti: lisätään ID listaan visuaalista palautetta varten
    // ja poistetaan se 1.5 sekunnin kuluttua.
    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(
      () => setAddedIds((prev) => prev.filter((id) => id !== product.id)),
      1500
    );
  };

  // Apu-funktiot datan hakemiseen kategorioiden taulusta
  const getCategoryColor = (categoryId: string) => {
    return (
      PRODUCTS_DATA.categories.find((c) => c.id === categoryId)?.color ??
      '#64748b'
    );
  };

  const getCategoryName = (categoryId: string) => {
    return (
      PRODUCTS_DATA.categories.find((c) => c.id === categoryId)?.name ??
      categoryId
    );
  };

  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
      }}
    >
      {/* Header-osio: Kertoo käyttäjälle päivämäärän ja tuotteiden kokonaismäärän */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f2444 0%, #1e3a5f 100%)',
          padding: '3rem 1.5rem 2rem',
          color: 'white',
        }}
      >
        <div style={{maxWidth: 1280, margin: '0 auto'}}>
          <div style={{marginBottom: '0.5rem'}}>
            <span
              style={{
                backgroundColor: 'rgba(249,115,22,0.15)',
                color: '#f97316',
                padding: '0.25rem 0.875rem',
                borderRadius: 20,
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              TUOTELUETTELO
            </span>
          </div>
          <h1
            style={{
              color: 'white',
              fontSize: 'clamp(1.75rem, 3vw, 2.5rem)',
              fontWeight: 800,
              marginBottom: '0.5rem',
            }}
          >
            Tukkutuotteet
          </h1>
          <p style={{color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem'}}>
            Päivitetty:{' '}
            {new Date(PRODUCTS_DATA.updated).toLocaleString('fi-FI')} ·{' '}
            {PRODUCTS_DATA.products.length} tuotetta · Data haetaan omasta
            API-rajapinnasta
          </p>
        </div>
      </div>

      <div style={{maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem'}}>
        {/* Kategoriatabit: Renderöidään dynaamisesti PRODUCTS_DATA.categories -listasta */}
        <div style={{overflowX: 'auto', marginBottom: '1.5rem'}}>
          <div
            style={{display: 'flex', gap: '0.5rem', minWidth: 'max-content'}}
          >
            <button
              onClick={() => setActiveCategory('all')}
              style={{
                padding: '0.6rem 1.25rem',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.2s',
                backgroundColor: activeCategory === 'all' ? '#0f2444' : 'white',
                color: activeCategory === 'all' ? 'white' : '#64748b',
                boxShadow:
                  activeCategory === 'all'
                    ? '0 4px 12px rgba(15,36,68,0.2)'
                    : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              Kaikki tuotteet
            </button>
            {PRODUCTS_DATA.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  backgroundColor:
                    activeCategory === cat.id ? '#0f2444' : 'white',
                  color: activeCategory === cat.id ? 'white' : '#64748b',
                  boxShadow:
                    activeCategory === cat.id
                      ? '0 4px 12px rgba(15,36,68,0.2)'
                      : '0 1px 4px rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Hakupalkki ja filtterit */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 12,
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              flex: 1,
              minWidth: 200,
            }}
          >
            <Search size={16} color="#94a3b8" />
            <input
              type="text"
              placeholder="Hae tuotetta, brändiä tai SKU-koodia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '0.875rem',
                color: '#374151',
                width: '100%',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            />
          </div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: '#64748b',
              userSelect: 'none',
            }}
          >
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              style={{accentColor: '#f97316', width: 16, height: 16}}
            />
            <SlidersHorizontal size={14} />
            Vain saatavilla olevat
          </label>
          <div
            style={{fontSize: '0.8rem', color: '#94a3b8', marginLeft: 'auto'}}
          >
            {filtered.length} tuotetta
          </div>
        </div>

        {/* Tuotteiden grid-näkymä. Käyttää Framer Motionia animaatioihin */}
        {filtered.length === 0 ? (
          // Virhetila: Renderöidään, jos hakuehdot ovat liian tiukat
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              backgroundColor: 'white',
              borderRadius: 16,
              color: '#94a3b8',
            }}
          >
            <AlertCircle
              size={40}
              style={{marginBottom: '0.75rem', display: 'inline-block'}}
            />
            <p>Ei hakuasi vastaavia tuotteita.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((product, i) => {
              const catColor = getCategoryColor(product.categoryId);
              const storageInfo = storageLabels[product.storage];
              const isAdded = addedIds.includes(product.id);

              return (
                <motion.div
                  key={product.id}
                  // Animaatio: Tuotteet liukuvat pehmeästi ylöspäin yksi kerrallaan
                  initial={{opacity: 0, y: 16}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.35, delay: i * 0.05}}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 16,
                    overflow: 'hidden',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    // Loppuunmyydyt tuotteet himmennetään UX:n parantamiseksi
                    opacity: product.inStock ? 1 : 0.7,
                  }}
                >
                  {/* Visuaalinen indikaattori kategorian väristä */}
                  <div
                    style={{
                      height: 5,
                      backgroundColor: catColor,
                      opacity: product.inStock ? 1 : 0.4,
                    }}
                  />

                  <div
                    style={{
                      padding: '1.25rem',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.625rem',
                      }}
                    >
                      <div style={{flex: 1}}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.25rem',
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              color: catColor,
                              backgroundColor: `${catColor}15`,
                              padding: '0.15rem 0.5rem',
                              borderRadius: 4,
                            }}
                          >
                            {getCategoryName(product.categoryId).toUpperCase()}
                          </span>
                          {!product.inStock && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                color: '#dc2626',
                                backgroundColor: '#fee2e2',
                                padding: '0.15rem 0.5rem',
                                borderRadius: 4,
                              }}
                            >
                              EI SAATAVILLA
                            </span>
                          )}
                        </div>
                        <h3
                          style={{
                            color: '#0f2444',
                            fontWeight: 700,
                            fontSize: '1rem',
                            margin: 0,
                            lineHeight: 1.3,
                          }}
                        >
                          {product.name}
                        </h3>
                        <div
                          style={{
                            color: '#64748b',
                            fontSize: '0.78rem',
                            marginTop: '0.2rem',
                          }}
                        >
                          {product.brand}
                        </div>
                      </div>
                      <div
                        style={{
                          textAlign: 'right',
                          flexShrink: 0,
                          marginLeft: '0.75rem',
                        }}
                      >
                        <div
                          style={{
                            color: '#f97316',
                            fontWeight: 800,
                            fontSize: '1.15rem',
                          }}
                        >
                          {product.pricePerUnit.toFixed(2)} €
                        </div>
                        <div style={{color: '#94a3b8', fontSize: '0.72rem'}}>
                          / {product.unit}
                        </div>
                      </div>
                    </div>

                    <p
                      style={{
                        color: '#64748b',
                        fontSize: '0.83rem',
                        lineHeight: 1.55,
                        marginBottom: '0.875rem',
                      }}
                    >
                      {product.description}
                    </p>

                    {/* Tarkat tuotetiedot (pakkauskoko, sku, säilytys, minimitilaus) */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.5rem',
                        marginBottom: '0.875rem',
                        padding: '0.75rem',
                        backgroundColor: '#f8fafc',
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        <Box size={13} color="#94a3b8" />
                        <span style={{fontSize: '0.75rem', color: '#64748b'}}>
                          {product.packageSize}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        <Tag size={13} color="#94a3b8" />
                        <span style={{fontSize: '0.75rem', color: '#64748b'}}>
                          SKU: {product.sku}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        <Thermometer size={13} color={storageInfo.color} />
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: storageInfo.color,
                            backgroundColor: storageInfo.bg,
                            padding: '0.1rem 0.4rem',
                            borderRadius: 4,
                          }}
                        >
                          {storageInfo.label}
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        <Package size={13} color="#94a3b8" />
                        <span style={{fontSize: '0.75rem', color: '#64748b'}}>
                          Min. {product.minOrder} ltk
                        </span>
                      </div>
                    </div>

                    {/* Tuotetagit (esim. Luomu, Kotimainen) */}
                    {product.tags.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.375rem',
                          flexWrap: 'wrap',
                          marginBottom: '0.875rem',
                        }}
                      >
                        {product.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              padding: '0.2rem 0.6rem',
                              borderRadius: 20,
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              backgroundColor: tagColors[tag]?.bg ?? '#f1f5f9',
                              color: tagColors[tag]?.color ?? '#64748b',
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Ostoskoripainike
                     * Estetty (disabled), jos tuotetta ei ole varastossa.
                     * Väri muuttuu hetkellisesti vihreäksi (isAdded), kun tuote lisätään.
                     */}
                    <button
                      onClick={() =>
                        product.inStock && handleAddToCart(product)
                      }
                      disabled={!product.inStock}
                      style={{
                        marginTop: 'auto',
                        width: '100%',
                        padding: '0.7rem',
                        borderRadius: 10,
                        border: 'none',
                        cursor: product.inStock ? 'pointer' : 'not-allowed',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                        backgroundColor: !product.inStock
                          ? '#e2e8f0'
                          : isAdded
                            ? '#22c55e' // Vihreä onnistumisen väri
                            : '#f97316', // Oranssi oletusväri
                        color: !product.inStock ? '#94a3b8' : 'white',
                      }}
                    >
                      <ShoppingCart size={16} />
                      {!product.inStock
                        ? 'Ei saatavilla'
                        : isAdded
                          ? 'Lisätty! ✓'
                          : 'Lisää tilaukseen'}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
