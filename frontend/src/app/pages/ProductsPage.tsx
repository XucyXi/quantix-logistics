import {useState, useEffect, useMemo, useCallback} from 'react';
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
  Loader2,
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
      <span className="text-white/80">({catalogAgeLabel})</span>
      {' · '}
      <span
        className="tabular-nums text-white/90"
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

  // UUSI TILA: Muistaa popupia varten, kuinka monta tuotetta oikeasti lisättiin
  const [addedQuantities, setAddedQuantities] = useState<
    Record<string, number>
  >({});

  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [nextCursor, setNextCursor] = useState<number | string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProducts = useCallback(
    async (cursor: number | string | null = 0, isLoadMore = false) => {
      if (cursor === null) return;

      try {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        const res = await productService.getAllProducts(cursor, 16);

        const rawProducts = res.products || res.data || res;
        const fetchedNextCursor =
          res.nextCursor !== undefined ? res.nextCursor : res.cursor || null;

        const mappedProducts: Product[] = rawProducts.map(
          (
            p: BackendProduct & {categories?: string[]; category_name?: string}
          ) => {
            let catArray: string[] = [];

            if (Array.isArray(p.categories)) {
              catArray = p.categories;
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
              stock: stockQuantity,
              categories: catArray.filter(Boolean),
              tags: [],
            };
          }
        );

        if (isLoadMore) {
          setProducts((prev) => {
            const newProducts = mappedProducts.filter(
              (mp) => !prev.some((p) => p.id === mp.id)
            );
            return [...prev, ...newProducts];
          });
        } else {
          setProducts(mappedProducts);
        }

        setNextCursor(fetchedNextCursor);
      } catch (err) {
        console.error('Virhe tuotteiden haussa:', err);
        setError(
          'Tuotteiden lataaminen epäonnistui. Yritä myöhemmin uudelleen.'
        );
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchProducts(0, false);
  }, [fetchProducts]);

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
      if (currentQty >= maxStock) return prev;
      return {...prev, [productId]: currentQty + 1};
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

      // Tallennetaan pysyvämmin näyttöä varten paljonko lisättiin
      setAddedQuantities((prev) => ({...prev, [productId]: qty}));
      setAddedIds((prev) => [...prev, productId]);

      setTimeout(() => {
        setAddedIds((prev) => prev.filter((id) => id !== productId));
      }, 2000);

      // Nollataan syöttökenttä välittömästi seuraavaa kertaa varten
      setQuantities((prev) => ({
        ...prev,
        [productId]: 0,
      }));
    }
  };

  return (
    <div className="font-sans bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#0f2444] to-[#1e3a5f] pt-12 pb-10 px-6 text-white shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="mb-2">
            <span className="inline-block bg-orange-500/15 text-orange-500 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
              Tuoteluettelo
            </span>
          </div>
          <h1 className="text-white text-3xl md:text-5xl font-extrabold mb-3">
            Tukkutuotteet
          </h1>
          <p className="text-white/70 text-sm md:text-base leading-relaxed">
            Päivitetty:{' '}
            {catalogUpdatedAt.toLocaleString('fi-FI', {
              dateStyle: 'short',
              timeStyle: 'medium',
            })}{' '}
            <LiveClock catalogUpdatedAt={catalogUpdatedAt} />
            {' · '}
            {products.length} tuotetta ladattu
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2 font-semibold shadow-sm">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="hidden md:flex overflow-x-auto pb-2 mb-6 hide-scrollbar gap-2 min-w-max">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#0f2444] text-white border-[#0f2444] shadow-md'
                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 shadow-sm'
            }`}
          >
            Kaikki tuotteet
          </button>
          {dynamicCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border flex items-center gap-2 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#0f2444] text-white border-[#0f2444] shadow-md'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <span className="text-base">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        <div className="md:hidden mb-6 flex flex-col gap-2">
          <label
            htmlFor="product-category"
            className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
          >
            Kategoria
          </label>
          <select
            id="product-category"
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-[#0f2444] font-bold text-sm shadow-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
          >
            <option value="all">Kaikki tuotteet</option>
            {dynamicCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-2xl p-4 md:p-5 mb-8 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-5 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Hae ladatuista tuotteista..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-[#0f2444] font-bold w-full placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>

          <div className="flex items-center justify-between w-full md:w-auto gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer text-sm font-bold text-slate-500 hover:text-[#0f2444] transition-colors select-none group">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer accent-orange-500"
              />
              <SlidersHorizontal
                size={16}
                className="group-hover:text-orange-500 transition-colors"
              />
              Vain saatavilla olevat
            </label>

            <div className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg whitespace-nowrap border border-slate-200">
              Näytetään {filtered.length}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-500 font-bold animate-pulse flex justify-center items-center gap-3">
            <Loader2 className="animate-spin" /> Ladataan tuotteita...
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-slate-200 text-slate-400 flex flex-col items-center">
            <AlertCircle size={48} className="mb-4 text-slate-300" />
            <p className="font-bold text-lg text-slate-500">
              Ei hakuasi vastaavia tuotteita.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
              {filtered.map((product, i) => {
                const quantity = quantities[product.id] || 0;
                const isAdded = addedIds.includes(product.id);
                const mainCatVisuals = getCategoryVisuals(
                  product.categories[0] || ''
                );
                const isMaxReached = quantity >= product.stock;

                return (
                  <motion.div
                    key={product.id}
                    initial={{opacity: 0, y: 16}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.35, delay: i * 0.03}}
                    className={`bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col relative overflow-visible transition-all hover:shadow-md ${
                      product.inStock ? 'opacity-100' : 'opacity-60'
                    }`}
                  >
                    <div
                      onClick={() => setSelectedProduct(product)}
                      className="w-full h-40 flex items-center justify-center bg-slate-50 text-6xl rounded-t-2xl relative cursor-pointer group transition-colors hover:bg-slate-100"
                    >
                      {mainCatVisuals.icon}
                      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 border border-slate-200 shadow-sm">
                        Varastossa: {product.stock}
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3
                        className="text-[#0f2444] font-extrabold text-sm leading-snug mb-3 min-h-[2.6rem] hover:text-orange-500 transition-colors cursor-pointer line-clamp-2"
                        onClick={() => setSelectedProduct(product)}
                      >
                        {product.name}
                      </h3>

                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {product.categories.slice(0, 2).map((catName) => (
                          <span
                            key={catName}
                            className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[0.7rem] font-bold border border-slate-200"
                          >
                            {catName}
                          </span>
                        ))}
                        {product.categories.length > 2 && (
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-md text-[0.7rem] font-bold border border-slate-200">
                            +{product.categories.length - 2}
                          </span>
                        )}
                      </div>

                      <div className="mb-2">
                        {isBusinessCustomer ? (
                          <>
                            <div className="text-[#0f2444] font-extrabold text-2xl leading-none">
                              {(product.pricePerUnit * (1 - BUSINESS_DISCOUNT))
                                .toFixed(2)
                                .replace('.', ',')}{' '}
                              €
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-slate-400 text-sm font-semibold line-through">
                                {product.pricePerUnit
                                  .toFixed(2)
                                  .replace('.', ',')}{' '}
                                €
                              </span>
                              <span className="bg-red-500 text-white text-[0.7rem] px-2 py-0.5 rounded-md font-bold shadow-sm">
                                -15%
                              </span>
                            </div>
                            <div className="text-slate-400 font-medium text-xs mt-1">
                              per {product.unit}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-[#0f2444] font-extrabold text-2xl leading-none">
                              {product.pricePerUnit
                                .toFixed(2)
                                .replace('.', ',')}{' '}
                              €
                            </div>
                            <div className="text-slate-400 font-medium text-xs mt-1.5">
                              per {product.unit}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="px-5 pb-5 mt-auto">
                      <div className="flex items-center gap-2 mb-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            decrementQuantity(product.id);
                          }}
                          disabled={!product.inStock || quantity === 0}
                          className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-colors ${
                            product.inStock && quantity > 0
                              ? 'border-slate-200 bg-white text-slate-600 hover:text-orange-500 hover:border-orange-300 cursor-pointer shadow-sm'
                              : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                          }`}
                        >
                          <Minus size={16} />
                        </button>

                        <div
                          className={`flex-1 text-center font-extrabold text-sm ${
                            isMaxReached ? 'text-red-500' : 'text-[#0f2444]'
                          }`}
                        >
                          {quantity} kpl
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            incrementQuantity(product.id, product.stock);
                          }}
                          disabled={!product.inStock || isMaxReached}
                          className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-colors shadow-sm ${
                            !product.inStock
                              ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
                              : isMaxReached
                                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'border-orange-500 bg-orange-500 text-white hover:bg-orange-600 cursor-pointer'
                          }`}
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product.id);
                        }}
                        disabled={!product.inStock || quantity === 0}
                        whileTap={
                          product.inStock && quantity > 0 ? {scale: 0.95} : {}
                        }
                        className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all relative overflow-visible shadow-sm ${
                          !product.inStock || quantity === 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : isAdded
                              ? 'bg-green-500 text-white cursor-default border border-green-500'
                              : 'bg-[#0f2444] text-white hover:bg-[#17324f] cursor-pointer border border-[#0f2444] hover:shadow-md'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={18} />
                            Lisätty!
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={18} />
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
                              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-[0_8px_20px_rgba(34,197,94,0.4)] whitespace-nowrap z-20 border border-green-400"
                            >
                              {/* Käytetään tallennettua määrää, jotta näkyy oikea luku vaikka syöttökenttä nollattiin! */}
                              ✓ {addedQuantities[product.id]} kpl lisätty!
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {nextCursor && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => fetchProducts(nextCursor, true)}
                  disabled={loadingMore}
                  className="bg-white border-2 border-slate-200 text-[#0f2444] font-extrabold px-8 py-4 rounded-xl shadow-sm hover:border-orange-500 hover:text-orange-500 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {loadingMore ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                  {loadingMore ? 'Ladataan...' : 'Lataa lisää tuotteita'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODAL: PRODUCT DETAILS */}
      <AnimatePresence>
        {selectedProduct && (
          <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm animate-in fade-in"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{scale: 0.95, opacity: 0}}
              animate={{scale: 1, opacity: 1}}
              exit={{scale: 0.95, opacity: 0}}
              className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start p-6 border-b border-slate-100 bg-slate-50">
                <div>
                  <h3 className="text-xl font-extrabold text-[#0f2444] m-0 mb-2">
                    {selectedProduct.name}
                  </h3>
                  <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                    {selectedProduct.sku}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-2 shadow-sm border border-slate-200 cursor-pointer transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-6">
                <div>
                  <h4 className="text-sm font-extrabold text-[#0f2444] mb-3 flex items-center gap-2">
                    <Tag size={16} className="text-orange-500" /> Kategoriat
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduct.categories.length > 0 ? (
                      selectedProduct.categories.map((catName) => (
                        <span
                          key={catName}
                          className="px-3 py-1.5 bg-orange-500/10 text-orange-600 rounded-lg text-sm font-bold border border-orange-500/20"
                        >
                          {catName}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400 italic font-medium">
                        Ei määritetty
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-[#0f2444] mb-3 flex items-center gap-2">
                    <AlignLeft size={16} className="text-orange-500" />{' '}
                    Tuotekuvaus
                  </h4>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {selectedProduct.description ? (
                      <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed m-0 font-medium">
                        {selectedProduct.description}
                      </p>
                    ) : (
                      <span className="text-sm text-slate-400 italic font-medium">
                        Tuotteella ei ole lisättyä kuvausta.
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 mt-2">
                  <span className="text-sm font-bold text-slate-500">
                    Saatavuus
                  </span>
                  <span
                    className={`text-sm font-extrabold px-3.5 py-1.5 rounded-lg border shadow-sm ${
                      selectedProduct.inStock
                        ? 'bg-green-50 text-green-600 border-green-200'
                        : 'bg-red-50 text-red-500 border-red-200'
                    }`}
                  >
                    {selectedProduct.inStock
                      ? `Varastossa (${selectedProduct.stock} kpl)`
                      : 'Loppu väliaikaisesti'}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
