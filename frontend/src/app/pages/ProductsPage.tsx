import {useState, useEffect, useMemo} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import {
  Search,
  SlidersHorizontal,
  AlertCircle,
  Plus,
  Minus,
  ShoppingCart,
  Check,
  X,
  AlignLeft,
  Tag,
} from 'lucide-react';
import {useCart} from '../contexts/CartContext';
import {useAuth} from '../contexts/AuthContext';
import {productService, BackendProduct} from '../services/productService';

const BUSINESS_DISCOUNT = 0.15;
const CATALOG_UPDATED = '2026-05-03T08:00:00';

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  description: string;
  pricePerUnit: number;
  unit: string;
  inStock: boolean;
  stock: number;
  categories: string[];
  tags: string[];
}

export interface CategoryUI {
  id: string;
  name: string;
  icon: string;
  color: string;
}

function getCategoryVisuals(name: string): {icon: string; color: string} {
  const lower = name.toLowerCase();
  if (lower.includes('maito')) return {icon: '🥛', color: '#3b82f6'};
  if (lower.includes('liha') || lower.includes('kala'))
    return {icon: '🥩', color: '#ef4444'};
  if (lower.includes('vihannes') || lower.includes('hedelmä'))
    return {icon: '🥦', color: '#22c55e'};
  if (lower.includes('kuiva')) return {icon: '🌾', color: '#f59e0b'};
  if (lower.includes('pakaste')) return {icon: '❄️', color: '#0891b2'};
  if (lower.includes('juoma')) return {icon: '🧃', color: '#8b5cf6'};
  if (lower.includes('elektroniikka')) return {icon: '💻', color: '#64748b'};
  if (lower.includes('toimisto')) return {icon: '📎', color: '#475569'};
  return {icon: '📦', color: '#94a3b8'};
}

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

function LiveClock({catalogUpdatedAt}: {catalogUpdatedAt: Date}) {
  const [liveNow, setLiveNow] = useState(() => new Date());

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

  return (
    <>
      <span style={{color: 'rgba(255,255,255,0.82)'}}>({catalogAgeLabel})</span>
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
    </>
  );
}

export function ProductsPage() {
  const {addItem} = useCart();
  const {user} = useAuth();
  const isBusinessCustomer = user?.tier === 'business';
  const catalogUpdatedAt = useMemo(() => new Date(CATALOG_UPDATED), []);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const rawProducts = await productService.getAllProducts();

        const mappedProducts: Product[] = rawProducts.map(
          (p: BackendProduct) => {
            let catArray: string[] = [];
            if (
              Array.isArray((p as unknown as {categories: string[]}).categories)
            ) {
              catArray = (p as unknown as {categories: string[]}).categories;
            } else if (p.category_name) {
              catArray = [p.category_name];
            }

            const stockQuantity = parseInt(String(p.stock_quantity || 0), 10);

            return {
              id: String(p.product_id || p.id),
              sku: `SKU-${p.product_id || p.id}`,
              name: p.name,
              brand: 'Quantix',
              description: p.description || '',
              pricePerUnit: parseFloat(String(p.base_price || p.price || 0)),
              unit: 'kpl',
              inStock: stockQuantity > 0,
              stock: stockQuantity, // Tarvitaan rajoitinta varten
              categories: catArray.filter(Boolean),
              tags: [],
            };
          }
        );

        setProducts(mappedProducts);
      } catch (err) {
        console.error('Virhe tuotteiden haussa:', err);
        setError(
          'Tuotteiden lataaminen epäonnistui. Yritä myöhemmin uudelleen.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const dynamicCategories = useMemo(() => {
    const map = new Map<string, CategoryUI>();
    products.forEach((p) => {
      p.categories.forEach((catName) => {
        if (!map.has(catName)) {
          map.set(catName, {
            id: catName,
            name: catName,
            ...getCategoryVisuals(catName),
          });
        }
      });
    });
    return Array.from(map.values());
  }, [products]);

  const filtered = products.filter((p) => {
    const matchesCat =
      activeCategory === 'all' || p.categories.includes(activeCategory);
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesStock = !onlyInStock || p.inStock;
    return matchesCat && matchesSearch && matchesStock;
  });

  const incrementQuantity = (productId: string, maxStock: number) => {
    setQuantities((prev) => {
      const currentQty = prev[productId] || 0;
      // Ei anneta nostaa määrää yli varastosaldon
      if (currentQty >= maxStock) {
        return prev;
      }
      return {
        ...prev,
        [productId]: currentQty + 1,
      };
    });
  };

  const decrementQuantity = (productId: string) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1),
    }));
  };

  const addToCart = (productId: string) => {
    const qty = quantities[productId] || 0;
    const product = products.find((p) => p.id === productId);

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
      setQuantities((prev) => ({
        ...prev,
        [productId]: 0,
      }));
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
      }}
    >
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
            <LiveClock catalogUpdatedAt={catalogUpdatedAt} />
            {' · '}
            {products.length} tuotetta · Live-tilausjärjestelmä
          </p>
        </div>
      </div>

      <div style={{maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem'}}>
        {loading && (
          <div style={{textAlign: 'center', padding: '4rem', color: '#64748b'}}>
            Ladataan tuotteita tietokannasta...
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              color: '#ef4444',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
            }}
          >
            <AlertCircle
              size={20}
              style={{display: 'inline', marginRight: '0.5rem'}}
            />
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div style={{overflowX: 'auto', marginBottom: '1.5rem'}}>
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  minWidth: 'max-content',
                }}
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
                    backgroundColor:
                      activeCategory === 'all' ? '#0f2444' : 'white',
                    color: activeCategory === 'all' ? 'white' : '#64748b',
                    boxShadow:
                      activeCategory === 'all'
                        ? '0 4px 12px rgba(15,36,68,0.2)'
                        : '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  Kaikki tuotteet
                </button>
                {dynamicCategories.map((cat) => (
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
                {dynamicCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

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
                style={{
                  fontSize: '0.8rem',
                  color: '#94a3b8',
                  marginLeft: 'auto',
                }}
              >
                {filtered.length} tuotetta
              </div>
            </div>

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
                <AlertCircle
                  size={40}
                  style={{marginBottom: '0.75rem', margin: '0 auto'}}
                />
                <p>Ei hakuasi vastaavia tuotteita.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map((product, i) => {
                  const quantity = quantities[product.id] || 0;
                  const isAdded = addedIds.includes(product.id);
                  const mainCatVisuals = getCategoryVisuals(
                    product.categories[0] || ''
                  );

                  // OLLAANKO MAKSIMISSA?
                  const isMaxReached = quantity >= product.stock;

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
                      <div
                        onClick={() => setSelectedProduct(product)}
                        style={{cursor: 'pointer'}}
                        className="group"
                      >
                        <div
                          style={{
                            width: '100%',
                            height: 160,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f8fafc',
                            fontSize: '4rem',
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                            position: 'relative',
                          }}
                        >
                          {mainCatVisuals.icon}
                          {/* Näytetään varastosaldo visuaalisesti */}
                          <div className="absolute top-3 right-3 bg-white/90 px-2 py-1 rounded-md text-xs font-bold text-slate-700 border border-slate-200 shadow-sm">
                            Varastossa: {product.stock}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: '1rem',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
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
                            className="group-hover:text-primary transition-colors"
                          >
                            {product.name}
                          </h3>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {product.categories.slice(0, 2).map((catName) => (
                              <span
                                key={catName}
                                className="px-2 py-0.5 bg-accent text-accent-foreground rounded-md text-[0.7rem] font-medium border border-border"
                              >
                                {catName}
                              </span>
                            ))}
                            {product.categories.length > 2 && (
                              <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-md text-[0.7rem] font-medium">
                                +{product.categories.length - 2}
                              </span>
                            )}
                          </div>

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
                                  {(
                                    product.pricePerUnit *
                                    (1 - BUSINESS_DISCOUNT)
                                  )
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
                                  {product.pricePerUnit
                                    .toFixed(2)
                                    .replace('.', ',')}{' '}
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
                        </div>
                      </div>

                      <div className="px-4 pb-4 mt-auto">
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.75rem',
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              decrementQuantity(product.id);
                            }}
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
                              opacity:
                                !product.inStock || quantity === 0 ? 0.5 : 1,
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
                              color: isMaxReached ? '#ef4444' : '#0f2444', // Muuttuu punaiseksi jos maksimi
                            }}
                          >
                            {quantity} kpl
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              incrementQuantity(product.id, product.stock); // Välitetään maksimi saldo funktiolle
                            }}
                            disabled={!product.inStock || isMaxReached} // Disabloidaan, jos saldo on täynnä
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              border: `1px solid ${isMaxReached ? '#e2e8f0' : '#f97316'}`,
                              backgroundColor: isMaxReached
                                ? '#f1f5f9'
                                : '#f97316',
                              cursor:
                                product.inStock && !isMaxReached
                                  ? 'pointer'
                                  : 'not-allowed',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.2s',
                              opacity: !product.inStock ? 0.5 : 1,
                            }}
                          >
                            <Plus
                              size={16}
                              color={isMaxReached ? '#94a3b8' : 'white'}
                            />
                          </button>
                        </div>

                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product.id);
                          }}
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
          </>
        )}
      </div>

      {selectedProduct && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start p-5 border-b border-border bg-muted/20">
              <div>
                <h3 className="text-xl font-bold text-foreground m-0 mb-1">
                  {selectedProduct.name}
                </h3>
                <span className="text-xs text-muted-foreground font-mono bg-background px-2 py-1 rounded border border-border">
                  {selectedProduct.sku}
                </span>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-muted-foreground hover:text-foreground bg-background rounded-full p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-5">
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Tag size={16} className="text-primary" /> Kategoriat
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.categories.length > 0 ? (
                    selectedProduct.categories.map((catName) => (
                      <span
                        key={catName}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium border border-primary/20"
                      >
                        {catName}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      Ei määritetty
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <AlignLeft size={16} className="text-primary" /> Tuotekuvaus
                </h4>
                <div className="bg-muted/30 p-3 rounded-xl border border-border">
                  {selectedProduct.description ? (
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed m-0">
                      {selectedProduct.description}
                    </p>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">
                      Tuotteella ei ole lisättyä kuvausta.
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-t border-border mt-2">
                <span className="text-sm font-medium text-muted-foreground">
                  Saatavuus
                </span>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full ${selectedProduct.inStock ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}
                >
                  {selectedProduct.inStock
                    ? `Varastossa (${selectedProduct.stock} kpl)`
                    : 'Loppu väliaikaisesti'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
