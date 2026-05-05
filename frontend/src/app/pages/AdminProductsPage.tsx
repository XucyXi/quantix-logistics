import {useState, useEffect, useCallback} from 'react';
import {
  Package,
  Tags,
  AlertTriangle,
  Edit,
  Trash2,
  Plus,
  X,
  AlignLeft,
  FolderCog,
  Save,
  Loader2,
} from 'lucide-react';
import {
  MasterTable,
  MasterTableCell,
  MasterTableRow,
} from '../components/MasterTable';
import {
  productService,
  BackendProduct,
  Category,
} from '../services/productService';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categories: string[];
}

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [viewingDescription, setViewingDescription] = useState<Product | null>(
    null
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Category Management State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{
    old: string;
    new: string;
    id: number;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categories: [] as string[],
  });

  // Cursor pagination states
  const [nextCursor, setNextCursor] = useState<number | string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchProducts = useCallback(
    async (cursor: number | string | null = 0, isLoadMore = false) => {
      if (cursor === null) return;

      try {
        if (isLoadMore) setLoadingMore(true);
        else setLoading(true);

        const [rawResponse, fetchedCategories] = await Promise.all([
          productService.getAllProducts(cursor, 24),
          productService.getAllCategories().catch((e) => {
            console.warn('Kategorioiden haku epäonnistui:', e);
            return [];
          }),
        ]);

        const rawProducts =
          rawResponse.products || rawResponse.data || rawResponse.items || [];
        const fetchedNextCursor =
          rawResponse.nextCursor !== undefined
            ? rawResponse.nextCursor
            : rawResponse.cursor || null;

        type ExtBackendProduct = BackendProduct & {
          categories?: string[];
          category_name?: string;
        };

        const mappedProducts: Product[] = rawProducts.map(
          (p: ExtBackendProduct) => {
            let catArray: string[] = [];

            if (Array.isArray(p.categories)) {
              catArray = p.categories;
            } else if (p.category_name) {
              catArray = [p.category_name];
            }

            return {
              id: Number(p.product_id || p.id),
              name: p.name,
              description: p.description || '',
              price: parseFloat(String(p.base_price || p.price || 0)),
              stock: parseInt(String(p.stock_quantity || 0), 10),
              categories: catArray.filter(Boolean),
            };
          }
        );

        if (isLoadMore) {
          // Funktionaalinen tilan päivitys: estää vanhojen tietojen ylikirjoituksen
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
        if (!isLoadMore) setCategories(fetchedCategories);
      } catch (err) {
        console.error('Virhe datan haussa:', err);
        setError('Tietojen lataaminen epäonnistui. Yritä myöhemmin uudelleen.');
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

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Haluatko varmasti poistaa tämän tuotteen?')) {
      try {
        await productService.deleteProduct(id);
        // Funktionaalinen tilan päivitys: varmistaa ettei useita rivejä poistu väärin!
        setProducts((prev) => prev.filter((p) => p.id !== id));
      } catch (err: unknown) {
        console.error('Tuotteen poisto epäonnistui:', err);

        const apiError = err as {response?: {status?: number}};

        if (apiError.response?.status === 409) {
          alert(
            'Tuotetta ei voi poistaa, koska se on sidottu olemassa olevaan tilaushistoriaan. Voit nollata sen varastosaldon estääksesi uusien tilauksien teon.'
          );
        } else {
          alert('Tuotteen poisto epäonnistui.');
        }
      }
    }
  };

  const openProductModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        stock: product.stock.toString(),
        categories: product.categories || [],
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        categories: [],
      });
    }
    setIsProductModalOpen(true);
  };

  const toggleProductCategory = (categoryName: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(categoryName)
        ? prev.categories.filter((c) => c !== categoryName)
        : [...prev.categories, categoryName],
    }));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      categories: formData.categories,
    };

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formattedData);
        // Funktionaalinen päivitys
        setProducts((prev) =>
          prev.map((p) =>
            p.id === editingProduct.id ? {...p, ...formattedData} : p
          )
        );
      } else {
        const res = await productService.createProduct(formattedData);
        const newProduct: Product = {
          id: res.id || res.product_id || Date.now(), // Vahvempi fallback-ID
          ...formattedData,
        };
        // Funktionaalinen päivitys
        setProducts((prev) => [...prev, newProduct]);
      }
      setIsProductModalOpen(false);
    } catch (err) {
      console.error('Tuotteen tallennus epäonnistui:', err);
      alert(
        'Tuotteen tallennus epäonnistui. Tarkista tiedot ja yritä uudelleen.'
      );
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    try {
      const res = await productService.createCategory(trimmed);
      setCategories((prev) => [
        ...prev,
        {category_id: res.category_id, name: trimmed},
      ]);
      setNewCategoryName('');
    } catch (err) {
      console.error('Kategorian luonti epäonnistui:', err);
      alert('Kategorian luonti epäonnistui. Nimi saattaa olla jo käytössä.');
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    const linkedProducts = products.filter((p) =>
      p.categories.includes(cat.name)
    ).length;

    if (linkedProducts > 0) {
      if (
        !window.confirm(
          `Kategoriaan on linkitetty ${linkedProducts} tuotetta. Poistetaanko se silti tuotteilta ja järjestelmästä?`
        )
      ) {
        return;
      }
    } else if (!window.confirm('Poistetaanko tämä kategoria?')) {
      return;
    }

    try {
      await productService.deleteCategory(cat.category_id);
      setCategories((prev) =>
        prev.filter((c) => c.category_id !== cat.category_id)
      );

      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          categories: p.categories.filter((c) => c !== cat.name),
        }))
      );
    } catch (err) {
      console.error('Kategorian poisto epäonnistui:', err);
      alert('Kategorian poisto epäonnistui.');
    }
  };

  const saveEditedCategory = async () => {
    if (!editingCategory) return;
    const trimmedNew = editingCategory.new.trim();

    if (!trimmedNew || trimmedNew === editingCategory.old) {
      setEditingCategory(null);
      return;
    }

    try {
      await productService.updateCategory(editingCategory.id, trimmedNew);

      setCategories((prev) =>
        prev.map((c) =>
          c.category_id === editingCategory.id ? {...c, name: trimmedNew} : c
        )
      );

      setProducts((prev) =>
        prev.map((p) => ({
          ...p,
          categories: p.categories.map((c) =>
            c === editingCategory.old ? trimmedNew : c
          ),
        }))
      );
      setEditingCategory(null);
    } catch (err) {
      console.error('Kategorian päivitys epäonnistui:', err);
      alert('Kategorian päivitys epäonnistui. Nimi saattaa olla jo käytössä.');
    }
  };

  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const activeCategoriesCount = categories.length;

  return (
    <div className="font-sans relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
        <div>
          <h1 className="text-foreground font-extrabold text-2xl m-0">
            Tuotteet
          </h1>
          <p className="text-muted-foreground text-sm mt-2 mb-0">
            Hallinnoi varaston tuotteita ja saldoja
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-secondary text-secondary-foreground px-4 py-2.5 rounded-xl font-bold hover:bg-secondary/80 transition-all cursor-pointer shadow-sm border border-border"
          >
            <FolderCog size={18} /> Kategoriat
          </button>
          <button
            onClick={() => openProductModal()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all hover:-translate-y-0.5 cursor-pointer shadow-md"
          >
            <Plus size={18} /> Lisää tuote
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: 'Tuotteita ladattu',
            value: products.length,
            icon: Package,
            colorClass: 'text-blue-500',
            bgClass: 'bg-blue-500/10',
          },
          {
            label: 'Aktiivisia kategorioita',
            value: activeCategoriesCount,
            icon: Tags,
            colorClass: 'text-purple-500',
            bgClass: 'bg-purple-500/10',
          },
          {
            label: 'Loppu varastosta',
            value: outOfStockCount,
            icon: AlertTriangle,
            colorClass:
              outOfStockCount > 0 ? 'text-destructive' : 'text-green-500',
            bgClass:
              outOfStockCount > 0 ? 'bg-destructive/10' : 'bg-green-500/10',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-card rounded-2xl p-5 border border-border shadow-sm flex items-center gap-4"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bgClass}`}
            >
              <stat.icon size={24} className={stat.colorClass} />
            </div>
            <div>
              <div className="text-2xl font-extrabold text-foreground leading-none mb-1">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground animate-pulse font-medium">
          Ladataan tuotteita tietokannasta...
        </div>
      ) : error ? (
        <div className="text-center py-6 px-4 text-destructive bg-destructive/10 rounded-xl border border-destructive/20 font-medium flex items-center justify-center gap-2">
          <AlertTriangle size={20} /> {error}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-card rounded-2xl border border-border shadow-sm mb-6">
            <MasterTable
              columns={[
                {key: 'id', label: 'ID'},
                {key: 'name', label: 'Nimi'},
                {key: 'description', label: 'Kuvaus'},
                {key: 'category', label: 'Kategoriat'},
                {key: 'price', label: 'Hinta (€)'},
                {key: 'stock', label: 'Varastosaldo'},
                {key: 'actions', label: 'Toiminnot', align: 'right'},
              ]}
            >
              {products.map((product) => (
                <MasterTableRow key={product.id}>
                  <MasterTableCell>
                    <span className="text-muted-foreground font-mono text-xs font-medium">
                      {product.id}
                    </span>
                  </MasterTableCell>
                  <MasterTableCell>
                    <div className="font-bold text-foreground">
                      {product.name}
                    </div>
                  </MasterTableCell>
                  <MasterTableCell>
                    {product.description ? (
                      <button
                        onClick={() => setViewingDescription(product)}
                        className="text-left text-sm text-muted-foreground hover:text-primary transition-colors max-w-[150px] sm:max-w-[200px] truncate block cursor-pointer"
                        title="Klikkaa nähdäksesi koko kuvaus"
                      >
                        {product.description}
                      </button>
                    ) : (
                      <span className="text-muted-foreground/50 text-sm italic">
                        Ei kuvausta
                      </span>
                    )}
                  </MasterTableCell>
                  <MasterTableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {product.categories.map((catName) => (
                        <span
                          key={catName}
                          className="px-2.5 py-1 bg-muted/50 text-foreground rounded-lg text-xs font-bold border border-border"
                        >
                          {catName}
                        </span>
                      ))}
                    </div>
                  </MasterTableCell>
                  <MasterTableCell className="font-bold text-foreground">
                    {product.price.toFixed(2)} €
                  </MasterTableCell>
                  <MasterTableCell>
                    <span
                      className={`font-bold ${
                        product.stock === 0
                          ? 'text-destructive bg-destructive/10 px-2 py-1 rounded-md'
                          : 'text-foreground'
                      }`}
                    >
                      {product.stock} kpl
                    </span>
                  </MasterTableCell>
                  <MasterTableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openProductModal(product)}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                        title="Muokkaa"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                        title="Poista"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </MasterTableCell>
                </MasterTableRow>
              ))}
            </MasterTable>
          </div>

          {nextCursor && (
            <div className="flex justify-center mb-10">
              <button
                onClick={() => fetchProducts(nextCursor, true)}
                disabled={loadingMore}
                className="bg-secondary text-secondary-foreground border border-border font-bold px-8 py-3 rounded-xl shadow-sm hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {loadingMore ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Plus size={18} />
                )}
                {loadingMore ? 'Ladataan...' : 'Lataa lisää tuotteita'}
              </button>
            </div>
          )}
        </>
      )}

      {/* MODAL: VIEW DESCRIPTION */}
      {viewingDescription && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fadeIn p-6">
            <div className="flex justify-between items-start mb-5">
              <h3 className="text-lg font-bold text-foreground m-0 flex items-center gap-2">
                <AlignLeft size={20} className="text-primary" />
                {viewingDescription.name}
              </h3>
              <button
                onClick={() => setViewingDescription(null)}
                className="text-muted-foreground hover:bg-muted p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
              {viewingDescription.description}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingDescription(null)}
                className="px-5 py-2 font-bold bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors cursor-pointer"
              >
                Sulje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CATEGORIES */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center p-5 border-b border-border bg-muted/30">
              <h2 className="text-lg font-bold text-foreground m-0 flex items-center gap-2">
                <FolderCog size={20} className="text-primary" /> Kategorioiden
                hallinta
              </h2>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-muted-foreground hover:bg-muted p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <form
                onSubmit={handleAddCategory}
                className="flex flex-col sm:flex-row gap-3 mb-8"
              >
                <input
                  type="text"
                  placeholder="Uusi kategoria..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 p-3 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-sm transition-all"
                />
                <button
                  type="submit"
                  disabled={!newCategoryName.trim()}
                  className="bg-primary text-primary-foreground px-6 py-3 sm:py-0 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  Lisää
                </button>
              </form>
              <div className="flex flex-col gap-3">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6 font-medium">
                    Ei kategorioita järjestelmässä.
                  </p>
                ) : (
                  categories.map((cat) => {
                    const linkedCount = products.filter((p) =>
                      p.categories.includes(cat.name)
                    ).length;
                    const isEditing = editingCategory?.id === cat.category_id;
                    return (
                      <div
                        key={cat.category_id}
                        className="flex items-center justify-between p-3.5 bg-muted/30 border border-border rounded-xl"
                      >
                        {isEditing ? (
                          <div className="flex flex-1 gap-2 mr-2">
                            <input
                              autoFocus
                              type="text"
                              value={editingCategory.new}
                              onChange={(e) =>
                                setEditingCategory({
                                  ...editingCategory,
                                  new: e.target.value,
                                })
                              }
                              className="flex-1 p-2 rounded-lg bg-background border border-primary/50 focus:ring-2 focus:ring-primary/20 text-foreground text-sm outline-none transition-all"
                            />
                            <button
                              onClick={saveEditedCategory}
                              className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-lg cursor-pointer transition-colors shadow-sm"
                              title="Tallenna"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="p-2 text-muted-foreground hover:bg-muted rounded-lg cursor-pointer transition-colors"
                              title="Peruuta"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground text-sm">
                                {cat.name}
                              </span>
                              <span className="text-xs font-medium text-muted-foreground mt-0.5">
                                {linkedCount}{' '}
                                {linkedCount === 1 ? 'tuote' : 'tuotetta'}{' '}
                                linkitetty
                              </span>
                            </div>
                            <div className="flex gap-1.5 shrink-0">
                              <button
                                onClick={() =>
                                  setEditingCategory({
                                    old: cat.name,
                                    new: cat.name,
                                    id: cat.category_id,
                                  })
                                }
                                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat)}
                                className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[40] p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-border bg-muted/30 shrink-0">
              <h2 className="text-lg font-bold text-foreground m-0 flex items-center gap-2">
                {editingProduct ? (
                  <Edit size={20} className="text-primary" />
                ) : (
                  <Plus size={20} className="text-primary" />
                )}
                {editingProduct ? 'Muokkaa tuotetta' : 'Lisää uusi tuote'}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-muted-foreground hover:bg-muted p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleSaveProduct}
              className="p-6 flex flex-col gap-5 overflow-y-auto"
            >
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Nimi
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({...formData, name: e.target.value})
                  }
                  className="w-full p-3 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                />
              </div>
              <div>
                <label className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  <span>Kuvaus</span>
                  <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full font-medium">
                    Valinnainen
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({...formData, description: e.target.value})
                  }
                  placeholder="Kirjoita tuotteelle lyhyt kuvaus..."
                  className="w-full p-3 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all resize-none"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Hinta (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({...formData, price: e.target.value})
                    }
                    className="w-full p-3 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Varastosaldo (kpl)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({...formData, stock: e.target.value})
                    }
                    className="w-full p-3 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Kategoriat
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-muted/30 rounded-xl border border-border max-h-48 overflow-y-auto">
                  {categories.map((cat) => (
                    <label
                      key={cat.category_id}
                      className="flex items-center gap-3 text-sm text-foreground cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(cat.name)}
                        onChange={() => toggleProductCategory(cat.name)}
                        className="w-4.5 h-4.5 rounded border-border text-primary focus:ring-primary focus:ring-offset-background bg-background cursor-pointer"
                      />
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
                {formData.categories.length === 0 && (
                  <p className="text-destructive font-medium text-xs mt-2 flex items-center gap-1">
                    <AlertTriangle size={14} /> Valitse tuotteelle vähintään
                    yksi kategoria.
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-5 border-t border-border shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-5 py-2.5 font-bold text-muted-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
                >
                  Peruuta
                </button>
                <button
                  type="submit"
                  disabled={formData.categories.length === 0}
                  className="px-6 py-2.5 font-bold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer flex items-center gap-2"
                >
                  <Save size={18} /> Tallenna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
