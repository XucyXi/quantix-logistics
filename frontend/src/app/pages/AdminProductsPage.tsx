import {useState} from 'react';
import {
  Package,
  Tags,
  AlertTriangle,
  Edit,
  Trash2,
  Plus,
  X,
  AlignLeft,
} from 'lucide-react';
import {
  MasterTable,
  MasterTableCell,
  MasterTableRow,
} from '../components/MasterTable';
// import api from '../lib/api'; // Enable this when backend is ready

// Updated interface with description
interface Product {
  id: number;
  name: string;
  description?: string; // Optional because some products might not have it
  price: number;
  stock: number;
  categories: string[];
}

const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Omena (Luomu)',
    description:
      'Kotimainen, käsinpoimittu luomuomena suoraan pientuottajalta. Erinomainen välipalaksi tai leivontaan. Säilytä viileässä.',
    price: 2.5,
    stock: 150,
    categories: ['Hedelmät', 'Luomu'],
  },
  {
    id: 2,
    name: 'Maito 1L',
    description:
      'Tämä maitotuote on valmistettu suomalaisesta vapaan lehmän maidosta. Täyteläinen maku ja runsaasti kalsiumia.',
    price: 1.2,
    stock: 45,
    categories: ['Maitotuotteet', 'Kotimainen'],
  },
];

const AVAILABLE_CATEGORIES = [
  'Hedelmät',
  'Maitotuotteet',
  'Leipomo',
  'Kuivatuotteet',
  'Luomu',
  'Kotimainen',
];

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingDescription, setViewingDescription] = useState<Product | null>(
    null
  ); // New state for reading descriptions

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state updated with description
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categories: [] as string[],
  });

  const handleDelete = async (id: number) => {
    if (window.confirm('Haluatko varmasti poistaa tämän tuotteen?')) {
      setProducts(products.filter((p) => p.id !== id));
      /* BACKEND INTEGRATION:
      try { await api.delete(`/products/${id}`); } catch (e) { ... }
      */
    }
  };

  const openModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '', // Load existing description
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
    setIsModalOpen(true);
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const formattedData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      categories: formData.categories,
    };

    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id ? {...p, ...formattedData} : p
        )
      );
      /* BACKEND INTEGRATION:
      try { await api.put(`/products/${editingProduct.id}`, formattedData); } catch (e) { ... }
      */
    } else {
      const nextId =
        products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
      const newProduct: Product = {id: nextId, ...formattedData};
      setProducts([...products, newProduct]);
      /* BACKEND INTEGRATION:
      try { await api.post('/products', formattedData); } catch (e) { ... }
      */
    }
    setIsModalOpen(false);
  };

  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  return (
    <div className="font-sans relative">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-foreground font-extrabold text-2xl m-0">
            Tuotteet
          </h1>
          <p className="text-muted-foreground text-sm mt-2 mb-0">
            Hallinnoi varaston tuotteita ja saldoja
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus size={18} />
          Lisää tuote
        </button>
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
            value: new Set(products.flatMap((p) => p.categories)).size,
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

            {/* TRUNCATED DESCRIPTION CELL */}
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
                {product.categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2 py-1 bg-accent text-accent-foreground rounded-lg text-xs font-medium border border-border"
                  >
                    {cat}
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
                  onClick={() => openModal(product)}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </MasterTableCell>
          </MasterTableRow>
        ))}
      </MasterTable>

      {/* 1. MODAL: READING THE DESCRIPTION */}
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

      {/* 2. MODAL: ADD / EDIT PRODUCT */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fadeIn">
            <div className="flex justify-between items-center p-4 border-b border-border bg-muted/30">
              <h2 className="text-lg font-bold text-foreground m-0">
                {editingProduct ? 'Muokkaa tuotetta' : 'Lisää uusi tuote'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
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

              {/* NEW: TEXTAREA FOR DESCRIPTION */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5 flex justify-between">
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
                <div className="grid grid-cols-2 gap-2 p-3 bg-input-background rounded-xl border border-border">
                  {AVAILABLE_CATEGORIES.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2.5 text-sm text-foreground cursor-pointer hover:opacity-80"
                    >
                      <input
                        type="checkbox"
                        checked={formData.categories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background bg-background"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
                {formData.categories.length === 0 && (
                  <p className="text-destructive text-xs mt-1.5">
                    Valitse tuotteelle kategoria.
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
