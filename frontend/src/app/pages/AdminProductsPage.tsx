import {useState, useEffect} from 'react';
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

  // Fetch products and categories from Backend via Service
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Haetaan tuotteet ja kategoriat rinnakkain Service-kerroksen kautta
        const [rawProducts, fetchedCategories] = await Promise.all([
          productService.getAllProducts(),
          productService.getAllCategories().catch((e) => {
            console.warn('Kategorioiden haku epäonnistui:', e);
            return []; // Fallback tyhjään arrayyn, ettei sivu kaadu
          }),
        ]);

        const mappedProducts: Product[] = rawProducts.map(
          (p: BackendProduct) => {
            let catArray: string[] = [];

            // BackendProduct:ssa categories voi olla array
            if (p.categories && Array.isArray(p.categories)) {
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
              categories: catArray.filter(Boolean), // Poistetaan mahdolliset tyhjät tai nullit
            };
          }
        );

        setProducts(mappedProducts);
        setCategories(fetchedCategories);
      } catch (err) {
        console.error('Virhe datan haussa:', err);
        setError('Tietojen lataaminen epäonnistui. Yritä myöhemmin uudelleen.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- PRODUCT MANAGEMENT ---

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Haluatko varmasti poistaa tämän tuotteen?')) {
      try {
        // Käytetään Servicen funktiota
        await productService.deleteProduct(id);
        setProducts(products.filter((p) => p.id !== id));
      } catch (err) {
        console.error('Tuotteen poisto epäonnistui:', err);
        alert('Tuotteen poisto epäonnistui.');
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
        // Päivitys Service-kerroksen kautta
        await productService.updateProduct(editingProduct.id, formattedData);
        setProducts(
          products.map((p) =>
            p.id === editingProduct.id ? {...p, ...formattedData} : p
          )
        );
      } else {
        // Luonti Service-kerroksen kautta
        const res = await productService.createProduct(formattedData);
        const newProduct: Product = {
          id: res.id || Date.now(),
          ...formattedData,
        }; // res.id varmistus
        setProducts([...products, newProduct]);
      }
      setIsProductModalOpen(false);
    } catch (err) {
      console.error('Tuotteen tallennus epäonnistui:', err);
      alert(
        'Tuotteen tallennus epäonnistui. Tarkista tiedot ja yritä uudelleen.'
      );
    }
  };

  // --- CATEGORY MANAGEMENT ---

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;

    try {
      // Luonti Service-kerroksen kautta
      const res = await productService.createCategory(trimmed);
      setCategories([
        ...categories,
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
      // Poisto Service-kerroksen kautta
      await productService.deleteCategory(cat.category_id);
      setCategories(
        categories.filter((c) => c.category_id !== cat.category_id)
      );

      // Päivitetään paikallinen tuotelista poistamalla kategoria
      setProducts(
        products.map((p) => ({
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
      // Päivitys Service-kerroksen kautta
      await productService.updateCategory(editingCategory.id, trimmedNew);

      // Päivitä kategorialista paikallisesti
      setCategories(
        categories.map((c) =>
          c.category_id === editingCategory.id ? {...c, name: trimmedNew} : c
        )
      );

      // Päivitä kategoria myös kaikkiin siihen linkitettyihin tuotteisiin
      setProducts(
        products.map((p) => ({
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

  // --- RENDER HELPERS ---

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
        <div className="flex gap-2">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm border border-border"
          >
            <FolderCog size={18} />
            Kategoriat
          </button>
          <button
            onClick={() => openProductModal()}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
          >
            <Plus size={18} />
            Lisää tuote
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        {[
          {
            label: 'Tuotteita yhteensä',
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
            className="bg-card rounded-2xl p-4 border border-border shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bgClass}`}
              >
                <stat.icon size={20} className={stat.colorClass} />
              </div>
              <div>
                <div className="text-xl font-extrabold text-foreground leading-none mb-1">
                  {stat.value}
                </div>
                <div className="text-muted-foreground text-xs">
                  {stat.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-muted-foreground">
          Ladataan tuotteita tietokannasta...
        </div>
      ) : error ? (
        <div className="text-center py-10 text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
          {error}
        </div>
      ) : (
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
                <span className="text-muted-foreground font-mono text-xs">
                  {product.id}
                </span>
              </MasterTableCell>
              <MasterTableCell>
                <div className="font-semibold text-foreground">
                  {product.name}
                </div>
              </MasterTableCell>

              <MasterTableCell>
                {product.description ? (
                  <button
                    onClick={() => setViewingDescription(product)}
                    className="text-left text-sm text-muted-foreground hover:text-primary transition-colors max-w-[150px] sm:max-w-[200px] truncate block"
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
                      className="px-2 py-1 bg-accent text-accent-foreground rounded-lg text-xs font-medium border border-border"
                    >
                      {catName}
                    </span>
                  ))}
                </div>
              </MasterTableCell>
              <MasterTableCell className="font-medium text-foreground">
                {product.price.toFixed(2)} €
              </MasterTableCell>
              <MasterTableCell>
                <span
                  className={`font-bold ${product.stock === 0 ? 'text-destructive' : 'text-foreground'}`}
                >
                  {product.stock} kpl
                </span>
              </MasterTableCell>
              <MasterTableCell align="right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => openProductModal(product)}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </MasterTableCell>
            </MasterTableRow>
          ))}
        </MasterTable>
      )}

      {/* MODAL: READING THE DESCRIPTION */}
      {viewingDescription && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fadeIn p-5">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-foreground m-0 flex items-center gap-2">
                <AlignLeft size={18} className="text-primary" />
                {viewingDescription.name}
              </h3>
              <button
                onClick={() => setViewingDescription(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {viewingDescription.description}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingDescription(null)}
                className="px-4 py-2 font-medium bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors"
              >
                Sulje
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANAGE CATEGORIES */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted/30">
              <h2 className="text-lg font-bold text-foreground m-0 flex items-center gap-2">
                <FolderCog size={20} className="text-primary" /> Kategorioiden
                hallinta
              </h2>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              {/* Add New Category */}
              <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Uusi kategoria..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 p-2 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-ring outline-none text-sm"
                />
                <button
                  type="submit"
                  disabled={!newCategoryName.trim()}
                  className="bg-primary text-primary-foreground px-4 rounded-xl text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                  Lisää
                </button>
              </form>

              {/* Category List */}
              <div className="flex flex-col gap-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
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
                        className="flex items-center justify-between p-3 bg-muted/30 border border-border rounded-xl"
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
                              className="flex-1 p-1.5 rounded-lg bg-background border border-border text-foreground text-sm"
                            />
                            <button
                              onClick={saveEditedCategory}
                              className="p-1.5 text-green-600 hover:bg-green-500/10 rounded-lg"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground text-sm">
                                {cat.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {linkedCount}{' '}
                                {linkedCount === 1 ? 'tuote' : 'tuotetta'}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() =>
                                  setEditingCategory({
                                    old: cat.name,
                                    new: cat.name,
                                    id: cat.category_id,
                                  })
                                }
                                className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat)}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
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

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[40] p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted/30 shrink-0">
              <h2 className="text-lg font-bold text-foreground m-0">
                {editingProduct ? 'Muokkaa tuotetta' : 'Lisää uusi tuote'}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSaveProduct}
              className="p-5 flex flex-col gap-4 overflow-y-auto"
            >
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Nimi
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({...formData, name: e.target.value})
                  }
                  className="w-full p-2.5 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-ring outline-none transition-all"
                />
              </div>

              <div>
                <label className="flex justify-between block text-sm font-medium text-foreground mb-1.5">
                  Kuvaus{' '}
                  <span className="text-muted-foreground text-xs font-normal">
                    (Valinnainen)
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({...formData, description: e.target.value})
                  }
                  placeholder="Kirjoita tuotteelle kuvaus..."
                  className="w-full p-2.5 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-ring outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
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
                    className="w-full p-2.5 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-ring outline-none transition-all"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Varastosaldo
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({...formData, stock: e.target.value})
                    }
                    className="w-full p-2.5 rounded-xl bg-input-background border border-border text-foreground focus:ring-2 focus:ring-ring outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Kategoriat (valitse vähintään yksi)
                </label>
                <div className="grid grid-cols-2 gap-2 p-3 bg-input-background rounded-xl border border-border max-h-40 overflow-y-auto">
                  {categories.map((cat) => (
                    <label
                      key={cat.category_id}
                      className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer hover:opacity-80"
                    >
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(cat.name)}
                        onChange={() => toggleProductCategory(cat.name)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background bg-background"
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
                {formData.categories.length === 0 && (
                  <p className="text-destructive text-xs mt-1.5">
                    Valitse tuotteelle kategoria.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-border shrink-0">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 font-medium text-muted-foreground hover:bg-muted rounded-xl transition-colors"
                >
                  Peruuta
                </button>
                <button
                  type="submit"
                  disabled={formData.categories.length === 0}
                  className="px-4 py-2 font-medium bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tallenna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
