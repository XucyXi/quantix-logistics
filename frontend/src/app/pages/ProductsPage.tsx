import {useState, useEffect, useMemo} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {
  Package,
  Search,
  SlidersHorizontal,
  Thermometer,
  AlertCircle,
  Tag,
  Box,
  Plus,
  Minus,
  ShoppingCart,
  Check,
} from 'lucide-react';
import {useCart} from '../contexts/CartContext';
import {useAuth} from '../contexts/AuthContext';

const BUSINESS_DISCOUNT = 0.15;

// Mock wholesale product catalog simulating API response
const PRODUCTS_DATA = {
  updated: '2026-04-02T08:00:00',
  categories: [
    {
      id: 'maito',
      name: 'Maitotuotteet',
      icon: '🥛',
      color: '#3b82f6',
    },
    {
      id: 'liha',
      name: 'Liha & Kala',
      icon: '🥩',
      color: '#ef4444',
    },
    {
      id: 'vihannes',
      name: 'Vihannes & Hedelmä',
      icon: '🥦',
      color: '#22c55e',
    },
    {
      id: 'kuiva',
      name: 'Kuivatuotteet',
      icon: '🌾',
      color: '#f59e0b',
    },
    {
      id: 'pakaste',
      name: 'Pakasteet',
      icon: '❄️',
      color: '#0891b2',
    },
    {
      id: 'juoma',
      name: 'Juomat',
      icon: '🧃',
      color: '#8b5cf6',
    },
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
      isNew: true,
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
      isNew: true,
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
      isNew: true,
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

/** Live-updating “X sitten” for the catalog header (fi, relative time). */
function formatCatalogAge(since: Date, now: Date): string {
  const diffMs = Math.max(0, now.getTime() - since.getTime());
  const rtf = new Intl.RelativeTimeFormat('fi', {numeric: 'auto'});
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return rtf.format(-seconds, 'second');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return rtf.format(-minutes, 'minute');
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return rtf.format(-hours, 'hour');
  const days = Math.floor(hours / 24);
  if (days < 7) return rtf.format(-days, 'day');
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return rtf.format(-weeks, 'week');
  const months = Math.floor(days / 30);
  if (months < 12) return rtf.format(-months, 'month');
  const years = Math.floor(days / 365);
  return rtf.format(-years, 'year');
}

export function ProductsPage() {
  const {addItem} = useCart();
  const {user} = useAuth();
  const isBusinessCustomer = user?.tier === 'business';
  const catalogUpdatedAt = useMemo(
    () => new Date(PRODUCTS_DATA.updated),
    []
  );
  const [liveNow, setLiveNow] = useState(() => new Date());
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedIds, setAddedIds] = useState<string[]>([]);

  useEffect(() => {
    const id = window.setInterval(() => setLiveNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const catalogAgeLabel = useMemo(
    () => formatCatalogAge(catalogUpdatedAt, liveNow),
    [catalogUpdatedAt, liveNow]
  );

  const liveClock = useMemo(
    () =>
      liveNow.toLocaleTimeString('fi-FI', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    [liveNow]
  );

  const filtered = PRODUCTS_DATA.products.filter((p) => {
    const matchesCat =
      activeCategory === 'all' || p.categoryId === activeCategory;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesStock = !onlyInStock || p.inStock;
    return matchesCat && matchesSearch && matchesStock;
  });

  const incrementQuantity = (productId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const decrementQuantity = (productId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1),
    }));
  };

  const addToCart = (productId: string) => {
    const qty = quantities[productId] || 0;
    const product = PRODUCTS_DATA.products.find((p) => p.id === productId);

    if (qty > 0 && product) {
      for (let i = 0; i < qty; i += 1) {
        addItem({
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.pricePerUnit,
          dietTags: product.tags,
        });
      }

      setAddedIds((prev) => [...prev, productId]);
      setTimeout(() => {
        setAddedIds((prev) => prev.filter((id) => id !== productId));
      }, 2000);
      // Reset quantity after adding to cart
      setQuantities((prev) => ({
        ...prev,
        [productId]: 0,
      }));
    }
  };

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
      {/* Header */}
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
          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}
          >
            Päivitetty:{' '}
            {catalogUpdatedAt.toLocaleString('fi-FI', {
              dateStyle: 'short',
              timeStyle: 'medium',
            })}{' '}
            <span style={{color: 'rgba(255,255,255,0.82)'}}>
              ({catalogAgeLabel})
            </span>
            {' · '}
            <span
              style={{
                fontVariantNumeric: 'tabular-nums',
                color: 'rgba(255,255,255,0.88)',
              }}
              title="Paikallinen aika (päivittyy sekunnissa)"
            >
              Nyt {liveClock}
            </span>
            {' · '}
            {PRODUCTS_DATA.products.length} tuotetta · Data haetaan omasta
            API-rajapinnasta
          </p>
        </div>
      </div>

      <div style={{maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem'}}>
        <div
          style={{
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <label
            htmlFor="product-category"
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#64748b',
            }}
          >
            Kategoria
          </label>
          <select
            id="product-category"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            style={{
              maxWidth: 420,
              width: '100%',
              padding: '0.65rem 1rem',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.9rem',
              color: '#0f2444',
              backgroundColor: 'white',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              cursor: 'pointer',
            }}
          >
            <option value="all">Kaikki tuotteet</option>
            {PRODUCTS_DATA.categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filters bar */}
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

        {/* Products grid */}
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '3rem',
              backgroundColor: 'white',
              borderRadius: 16,
              color: '#94a3b8',
            }}
          >
            <AlertCircle size={40} style={{marginBottom: '0.75rem'}} />
            <p>Ei hakuasi vastaavia tuotteita.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((product, i) => {
              const quantity = quantities[product.id] || 0;
              const isAdded = addedIds.includes(product.id);
              return (
                <motion.div
                  key={product.id}
                  initial={{opacity: 0, y: 16}}
                  animate={{opacity: 1, y: 0}}
                  transition={{duration: 0.35, delay: i * 0.03}}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 12,
                    overflow: 'visible',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    border: '1px solid #f1f5f9',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    opacity: product.inStock ? 1 : 0.6,
                  }}
                >
                  {/* Category icon as product visual */}
                  <div
                    style={{
                      width: '100%',
                      height: 180,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#f8fafc',
                      fontSize: '4rem',
                    }}
                  >
                    {PRODUCTS_DATA.categories.find(
                      (c) => c.id === product.categoryId
                    )?.icon ?? '📦'}
                  </div>

                  {/* Content */}
                  <div
                    style={{
                      padding: '1rem',
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Product name */}
                    <h3
                      style={{
                        color: '#0f2444',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        margin: 0,
                        marginBottom: '0.5rem',
                        lineHeight: 1.3,
                        minHeight: '2.6rem',
                      }}
                    >
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div style={{marginBottom: '0.5rem'}}>
                      {isBusinessCustomer ? (
                        <>
                          <div
                            style={{
                              color: '#0f2444',
                              fontWeight: 800,
                              fontSize: '1.5rem',
                              lineHeight: 1,
                            }}
                          >
                            {(product.pricePerUnit * (1 - BUSINESS_DISCOUNT))
                              .toFixed(2)
                              .replace('.', ',')}{' '}
                            €
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginTop: '0.2rem',
                            }}
                          >
                            <span
                              style={{
                                color: '#94a3b8',
                                fontSize: '0.875rem',
                                textDecoration: 'line-through',
                              }}
                            >
                              {product.pricePerUnit
                                .toFixed(2)
                                .replace('.', ',')}{' '}
                              €
                            </span>
                            <span
                              style={{
                                backgroundColor: '#ef4444',
                                color: 'white',
                                fontSize: '0.7rem',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                fontWeight: 600,
                              }}
                            >
                              -15%
                            </span>
                          </div>
                          <div
                            style={{
                              color: '#94a3b8',
                              fontSize: '0.75rem',
                              marginTop: '0.1rem',
                            }}
                          >
                            per {product.unit}
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              color: '#0f2444',
                              fontWeight: 800,
                              fontSize: '1.5rem',
                              lineHeight: 1,
                            }}
                          >
                            {product.pricePerUnit.toFixed(2).replace('.', ',')}{' '}
                            €
                          </div>
                          <div
                            style={{
                              color: '#94a3b8',
                              fontSize: '0.75rem',
                              marginTop: '0.2rem',
                            }}
                          >
                            per {product.unit}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Quantity controls */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginTop: 'auto',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <button
                        onClick={() => decrementQuantity(product.id)}
                        disabled={!product.inStock || quantity === 0}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          border: '1px solid #e2e8f0',
                          backgroundColor: 'white',
                          cursor:
                            product.inStock && quantity > 0
                              ? 'pointer'
                              : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          opacity: !product.inStock || quantity === 0 ? 0.5 : 1,
                        }}
                      >
                        <Minus size={16} color="#64748b" />
                      </button>

                      <div
                        style={{
                          flex: 1,
                          textAlign: 'center',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          color: '#0f2444',
                        }}
                      >
                        {quantity} kpl
                      </div>

                      <button
                        onClick={() => incrementQuantity(product.id)}
                        disabled={!product.inStock}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 8,
                          border: '1px solid #f97316',
                          backgroundColor: '#f97316',
                          cursor: product.inStock ? 'pointer' : 'not-allowed',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                          opacity: !product.inStock ? 0.5 : 1,
                        }}
                      >
                        <Plus size={16} color="white" />
                      </button>
                    </div>

                    {/* Add to cart button */}
                    <motion.button
                      onClick={() => addToCart(product.id)}
                      disabled={!product.inStock || quantity === 0}
                      whileTap={{scale: 0.95}}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: 10,
                        border: 'none',
                        cursor:
                          product.inStock && quantity > 0
                            ? 'pointer'
                            : 'not-allowed',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s',
                        backgroundColor:
                          !product.inStock || quantity === 0
                            ? '#e2e8f0'
                            : isAdded
                              ? '#22c55e'
                              : '#0f2444',
                        color:
                          !product.inStock || quantity === 0
                            ? '#94a3b8'
                            : 'white',
                        position: 'relative',
                        overflow: 'visible',
                      }}
                    >
                      {isAdded ? (
                        <>
                          <Check size={16} />
                          Lisätty!
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={16} />
                          Lisää ostoskoriin
                        </>
                      )}

                      {/* Success animation */}
                      <AnimatePresence>
                        {isAdded && (
                          <motion.div
                            initial={{scale: 0, opacity: 0}}
                            animate={{scale: 1, opacity: 1}}
                            exit={{scale: 0, opacity: 0}}
                            transition={{
                              type: 'spring',
                              stiffness: 500,
                              damping: 25,
                            }}
                            style={{
                              position: 'absolute',
                              top: -40,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              backgroundColor: '#22c55e',
                              color: 'white',
                              padding: '0.5rem 1rem',
                              borderRadius: 8,
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              boxShadow: '0 4px 12px rgba(34,197,94,0.4)',
                              whiteSpace: 'nowrap',
                              zIndex: 10,
                            }}
                          >
                            ✓ {quantity} kpl lisätty!
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
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
