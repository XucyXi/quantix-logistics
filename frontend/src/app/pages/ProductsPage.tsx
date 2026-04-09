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

const PRODUCTS_DATA = {
  updated: '2026-04-09T08:00:00',
  categories: [
    {id: 'maito', name: 'Maitotuotteet', icon: '🥛', color: '#3b82f6'},
    {id: 'liha', name: 'Liha & Kala', icon: '🥩', color: '#ef4444'},
    {id: 'vihannes', name: 'Vihannes & Hedelmä', icon: '🥦', color: '#22c55e'},
    {id: 'kuiva', name: 'Kuivatuotteet', icon: '🌾', color: '#f59e0b'},
    {id: 'mauste', name: 'Mausteet & Kastikkeet', icon: '🌶️', color: '#ea580c'},
    {id: 'pakaste', name: 'Pakasteet', icon: '❄️', color: '#0891b2'},
    {id: 'juoma', name: 'Juomat', icon: '🧃', color: '#8b5cf6'},
    {id: 'erikois', name: 'Erikoistuotteet', icon: '✨', color: '#d946ef'},
    {id: 'nonfood', name: 'Siivous & Hygienia', icon: '🧼', color: '#14b8a6'},
    {id: 'kattaus', name: 'Kattaus & Tarjoilu', icon: '🍽️', color: '#0ea5e9'},
    {id: 'keittio', name: 'Keittiötarvikkeet', icon: '🔪', color: '#475569'},
    {id: 'tarvike', name: 'Pakkaustarvikkeet', icon: '🥡', color: '#64748b'},
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
      id: 'p-013',
      sku: 'VH-0299',
      name: 'Kuorittu peruna 10kg',
      brand: 'Vihannestukku',
      description:
        'Käyttövalmis kuorittu yleisperuna suurkeittiöille. Tyhjiöpakattu säkki.',
      pricePerUnit: 14.9,
      unit: 'säkki',
      packageSize: '1 × 10 kg',
      minOrder: 1,
      categoryId: 'vihannes',
      storage: 'kylmä',
      kcal: 76,
      inStock: true,
      tags: ['Kotimainen', 'Suurtalous'],
    },
    {
      id: 'p-014',
      sku: 'KV-0881',
      name: 'Espressopapu Dark Roast 1kg',
      brand: 'Pelican Rouge',
      description:
        'Tummapaahtoinen espressopapu ammattilaiskoneisiin. Myyntierä 6 kg.',
      pricePerUnit: 16.5,
      unit: 'kg',
      packageSize: '6 × 1 kg',
      minOrder: 1,
      categoryId: 'kuiva',
      storage: 'kuiva',
      kcal: 0,
      inStock: true,
      tags: ['Reilu Kauppa'],
    },
    {
      id: 'p-015',
      sku: 'MS-1001',
      name: 'Ketsuppi 10kg sanko',
      brand: 'Felix',
      description:
        'Klassinen tomaattiketsuppi ravintolakäyttöön. Uudelleensuljettava muovisanko pumpulla.',
      pricePerUnit: 24.5,
      unit: 'sanko',
      packageSize: '1 × 10 kg',
      minOrder: 1,
      categoryId: 'mauste',
      storage: 'huoneenlämpö',
      kcal: 95,
      inStock: true,
      tags: ['Suurtalous'],
    },
    {
      id: 'p-016',
      sku: 'PK-0555',
      name: 'Naudan Burgerpihvi 150g x 40',
      brand: 'Lihakunta',
      description:
        'Pakastettu, raaka 100% naudanlihapihvi. Eroteltu suojapapereilla. Laatikossa 40 kpl.',
      pricePerUnit: 48.0,
      unit: 'ltk',
      packageSize: '1 ltk (6 kg)',
      minOrder: 1,
      categoryId: 'pakaste',
      storage: 'pakaste',
      kcal: 250,
      inStock: true,
      tags: ['Kotimainen', 'Suurtalous'],
    },
    {
      id: 'p-017',
      sku: 'NF-2001',
      name: 'Yleispesuaine Sitruuna 5L',
      brand: 'Kiilto Pro',
      description:
        'Ammattikäyttöön tarkoitettu tehokas yleispesuaine. Laimennus 10-20ml / 5L vettä.',
      pricePerUnit: 18.9,
      unit: 'kpl',
      packageSize: '3 × 5 L',
      minOrder: 1,
      categoryId: 'nonfood',
      storage: 'huoneenlämpö',
      kcal: 0,
      inStock: true,
      tags: ['Avainlippu'],
    },
    {
      id: 'p-018',
      sku: 'NF-2050',
      name: 'Vinyylikäsine Puuteriton L',
      brand: 'Abena',
      description:
        'Elintarvikekäyttöön soveltuvat kertakäyttökäsineet. Tukkulaatikko sisältää 10 x 100 kpl rasiaa.',
      pricePerUnit: 35.0,
      unit: 'ltk',
      packageSize: '1000 kpl',
      minOrder: 1,
      categoryId: 'nonfood',
      storage: 'kuiva',
      kcal: 0,
      inStock: true,
      tags: ['Hygienia'],
    },
    {
      id: 'p-019',
      sku: 'TV-3001',
      name: 'Takeaway-rasia sokeriruoko 800ml',
      brand: 'Gastro',
      description:
        'Biohajoava ja kompostoituva yhden lokeron noutoateriarasia. Mikroaaltouunin kestävä.',
      pricePerUnit: 0.18,
      unit: 'kpl',
      packageSize: '500 kpl / ltk',
      minOrder: 1,
      categoryId: 'tarvike',
      storage: 'kuiva',
      kcal: 0,
      inStock: true,
      tags: ['Eko', 'Biohajoava'],
    },
    {
      id: 'p-020',
      sku: 'TV-3022',
      name: 'Puiset aterimet (Haarukka + Veitsi)',
      brand: 'Gastro',
      description:
        'Yksittäispakatut puiset aterimet noutomyyntiin. Kestävä koivu.',
      pricePerUnit: 0.12,
      unit: 'kpl',
      packageSize: '250 settiä / ltk',
      minOrder: 1,
      categoryId: 'tarvike',
      storage: 'kuiva',
      kcal: 0,
      inStock: false,
      tags: ['Eko'],
    },
    {
      id: 'p-021',
      sku: 'JU-0601',
      name: 'Kivennäisvesi 0.5L',
      brand: 'Vichy',
      description:
        'Poreileva kivennäisvesi ravintolakäyttöön. Toimitus 24 pullon laatikoissa.',
      pricePerUnit: 0.59,
      unit: 'kpl',
      packageSize: '24 × 500 ml',
      minOrder: 2,
      categoryId: 'juoma',
      storage: 'huoneenlämpö',
      kcal: 0,
      inStock: true,
      tags: ['Suurtalous'],
    },
    {
      id: 'p-022',
      sku: 'JU-0620',
      name: 'Talon punaviini 3L hanapakkaus',
      brand: 'Bodega Norte',
      description:
        'Ravintolamyyntiin soveltuva keskitäyteläinen punaviini. Tilaus yksiköissä 4 × 3 L.',
      pricePerUnit: 32.9,
      unit: 'kpl',
      packageSize: '4 × 3 L',
      minOrder: 1,
      categoryId: 'juoma',
      storage: 'huoneenlämpö',
      kcal: 82,
      inStock: true,
      tags: ['Aikuiset'],
    },
    {
      id: 'p-023',
      sku: 'JU-0642',
      name: 'Vihreä tee 500g',
      brand: 'Nordic Tea Co.',
      description:
        'Irtolehtitee suurkulutukseen. Sopii buffet- ja kahvilakäyttöön.',
      pricePerUnit: 11.9,
      unit: 'pussi',
      packageSize: '6 × 500 g',
      minOrder: 1,
      categoryId: 'juoma',
      storage: 'kuiva',
      kcal: 0,
      inStock: true,
      tags: ['Suurtalous'],
    },
    {
      id: 'p-024',
      sku: 'ER-7001',
      name: 'Tryffeliöljy 250ml',
      brand: 'Tartufo Doro',
      description:
        'Aito tryffeliöljy viimeistelyyn. Premium-tuote fine dining -keittiöihin.',
      pricePerUnit: 24.9,
      unit: 'pullo',
      packageSize: '6 × 250 ml',
      minOrder: 1,
      categoryId: 'erikois',
      storage: 'huoneenlämpö',
      kcal: 884,
      inStock: true,
      tags: ['Premium'],
    },
    {
      id: 'p-025',
      sku: 'ER-7010',
      name: 'Sampi-kaviaari 50g',
      brand: 'Royal Caviar',
      description:
        'Pientuottajan korkealaatuinen kaviaari juhla- ja tasting-annoksiin.',
      pricePerUnit: 89.0,
      unit: 'purkki',
      packageSize: '12 × 50 g',
      minOrder: 1,
      categoryId: 'erikois',
      storage: 'kylmä',
      kcal: 264,
      inStock: true,
      tags: ['Premium'],
    },
    {
      id: 'p-026',
      sku: 'KT-8002',
      name: 'Posliinilautanen 28 cm',
      brand: 'ProServe',
      description:
        'Kestävä valkoinen tarjoilulautanen ammattikeittiöihin ja cateringiin.',
      pricePerUnit: 6.2,
      unit: 'kpl',
      packageSize: '24 kpl / ltk',
      minOrder: 1,
      categoryId: 'kattaus',
      storage: 'kuiva',
      kcal: 0,
      inStock: true,
      tags: ['Ammattilaislaatu'],
    },
    {
      id: 'p-027',
      sku: 'KT-8015',
      name: 'Viinilasi 35cl',
      brand: 'ProServe',
      description:
        'Ravintolakäyttöön suunniteltu karkaistu viinilasi. Konepesun kestävä.',
      pricePerUnit: 2.95,
      unit: 'kpl',
      packageSize: '36 kpl / ltk',
      minOrder: 1,
      categoryId: 'kattaus',
      storage: 'kuiva',
      kcal: 0,
      inStock: true,
      tags: ['Ammattilaislaatu'],
    },
    {
      id: 'p-028',
      sku: 'KK-9001',
      name: 'Kokinveitsi 20 cm',
      brand: 'Victorinox',
      description: 'Ammattitason kokkiveitsi päivittäiseen prep-käyttöön.',
      pricePerUnit: 39.9,
      unit: 'kpl',
      packageSize: '1 kpl',
      minOrder: 1,
      categoryId: 'keittio',
      storage: 'kuiva',
      kcal: 0,
      inStock: true,
      tags: ['Ammattilaislaatu'],
    },
    {
      id: 'p-029',
      sku: 'KK-9012',
      name: 'Gastronorm-vuoka GN 1/1',
      brand: 'RestoSteel',
      description:
        'RST-vuoka lämpöhauteisiin ja tarjoilulinjastoon. Kestävä ja pinottava.',
      pricePerUnit: 18.5,
      unit: 'kpl',
      packageSize: '6 kpl / ltk',
      minOrder: 1,
      categoryId: 'keittio',
      storage: 'kuiva',
      kcal: 0,
      inStock: true,
      tags: ['Ammattilaislaatu'],
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
  Suurtalous: {bg: '#ffedd5', color: '#c2410c'},
  'Reilu Kauppa': {bg: '#fef08a', color: '#854d0e'},
  Avainlippu: {bg: '#e0e7ff', color: '#4f46e5'},
  Eko: {bg: '#dcfce7', color: '#15803d'},
  Hygienia: {bg: '#f3e8ff', color: '#9333ea'},
  Biohajoava: {bg: '#ccfbf1', color: '#0f766e'},
  Premium: {bg: '#fdf2f8', color: '#be185d'},
  Ammattilaislaatu: {bg: '#e2e8f0', color: '#334155'},
  Aikuiset: {bg: '#fee2e2', color: '#b91c1c'},
};

const productImages: Record<string, string> = {
  'p-001': 'https://loremflickr.com/800/600/milk,bottle?lock=1',
  'p-002': 'https://loremflickr.com/800/600/yoghurt,dairy?lock=2',
  'p-003': 'https://loremflickr.com/800/600/minced,meat?lock=3',
  'p-004': 'https://loremflickr.com/800/600/salmon,fillet?lock=4',
  'p-005':
    'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=800&q=80', // Varmistettu kurkun kuva
  'p-013': 'https://loremflickr.com/800/600/potatoes?lock=6',
  'p-014': 'https://loremflickr.com/800/600/coffee,beans?lock=7',
  'p-015': 'https://loremflickr.com/800/600/ketchup?lock=8',
  'p-016': 'https://loremflickr.com/800/600/burger,patty?lock=9',
  'p-017': 'https://loremflickr.com/800/600/detergent,cleaning?lock=10',
  'p-018': 'https://loremflickr.com/800/600/surgical,gloves?lock=11',
  'p-019': 'https://loremflickr.com/800/600/takeaway,box?lock=12',
  'p-020': 'https://loremflickr.com/800/600/wooden,cutlery?lock=13',
  'p-021': 'https://loremflickr.com/800/600/mineral,water?lock=14',
  'p-022': 'https://loremflickr.com/800/600/red,wine?lock=15',
  'p-023': 'https://loremflickr.com/800/600/tea,leaves?lock=16',
  'p-024': 'https://loremflickr.com/800/600/olive,oil?lock=17',
  'p-025': 'https://loremflickr.com/800/600/caviar?lock=18',
  'p-026': 'https://loremflickr.com/800/600/white,plate?lock=19',
  'p-027': 'https://loremflickr.com/800/600/wine,glass?lock=20',
  'p-028': 'https://loremflickr.com/800/600/chef,knife?lock=21',
  'p-029': 'https://loremflickr.com/800/600/stainless,pan?lock=22',
};

const WHOLESALE_GROUPS = [
  {id: 'all', label: 'Kaikki'},
  {id: 'food', label: 'Elintarvikkeet'},
  {id: 'drinks', label: 'Juomat'},
  {id: 'nonfood', label: 'Non-food'},
  {id: 'takeaway', label: 'Take-away'},
] as const;

const categoryToGroup: Record<string, (typeof WHOLESALE_GROUPS)[number]['id']> =
  {
    maito: 'food',
    liha: 'food',
    vihannes: 'food',
    kuiva: 'food',
    mauste: 'food',
    pakaste: 'food',
    erikois: 'food',
    juoma: 'drinks',
    nonfood: 'nonfood',
    kattaus: 'nonfood',
    keittio: 'nonfood',
    tarvike: 'takeaway',
  };

export function ProductsPage() {
  const [activeGroup, setActiveGroup] =
    useState<(typeof WHOLESALE_GROUPS)[number]['id']>('all');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);

  const [addedIds, setAddedIds] = useState<string[]>([]);
  const {addItem} = useCart();

  const visibleCategories =
    activeGroup === 'all'
      ? PRODUCTS_DATA.categories
      : PRODUCTS_DATA.categories.filter(
          (category) => categoryToGroup[category.id] === activeGroup
        );

  const groupCounts = WHOLESALE_GROUPS.reduce(
    (acc, group) => {
      acc[group.id] =
        group.id === 'all'
          ? PRODUCTS_DATA.products.length
          : PRODUCTS_DATA.products.filter(
              (product) => categoryToGroup[product.categoryId] === group.id
            ).length;
      return acc;
    },
    {} as Record<(typeof WHOLESALE_GROUPS)[number]['id'], number>
  );

  const filtered = PRODUCTS_DATA.products.filter((p) => {
    const matchesGroup =
      activeGroup === 'all' || categoryToGroup[p.categoryId] === activeGroup;
    const matchesCat =
      activeCategory === 'all' || p.categoryId === activeCategory;
    const matchesSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchesStock = !onlyInStock || p.inStock;

    return matchesGroup && matchesCat && matchesSearch && matchesStock;
  });

  const handleAddToCart = (product: (typeof PRODUCTS_DATA.products)[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      description: `${product.brand} · ${product.packageSize}`,
      price: product.pricePerUnit,
    });

    setAddedIds((prev) => [...prev, product.id]);
    setTimeout(
      () => setAddedIds((prev) => prev.filter((id) => id !== product.id)),
      1500
    );
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
              B2B-TUKKU
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
            Tuoteluettelo
          </h1>
          <p style={{color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem'}}>
            Päivitetty:{' '}
            {new Date(PRODUCTS_DATA.updated).toLocaleString('fi-FI')} ·{' '}
            {PRODUCTS_DATA.products.length} tuotetta
          </p>
        </div>
      </div>

      <div style={{maxWidth: 1280, margin: '0 auto', padding: '2rem 1.5rem'}}>
        <div style={{overflowX: 'auto', marginBottom: '0.875rem'}}>
          <div
            style={{display: 'flex', gap: '0.5rem', minWidth: 'max-content'}}
          >
            {WHOLESALE_GROUPS.map((group) => (
              <button
                key={group.id}
                onClick={() => {
                  setActiveGroup(group.id);
                  setActiveCategory('all');
                }}
                style={{
                  padding: '0.55rem 1rem',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  transition: 'all 0.2s',
                  backgroundColor:
                    activeGroup === group.id ? '#0f2444' : '#e2e8f0',
                  color: activeGroup === group.id ? 'white' : '#475569',
                }}
              >
                {group.label} ({groupCounts[group.id]})
              </button>
            ))}
          </div>
        </div>

        <div style={{overflowX: 'auto', marginBottom: '1.5rem'}}>
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              minWidth: 'max-content',
              paddingBottom: '0.5rem',
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
            {visibleCategories.map((cat) => (
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
              const imageSrc = productImages[product.id];

              return (
                <motion.div
                  key={product.id}
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
                    opacity: product.inStock ? 1 : 0.7,
                  }}
                >
                  <div
                    style={{
                      height: 5,
                      backgroundColor: catColor,
                      opacity: product.inStock ? 1 : 0.4,
                    }}
                  />

                  <div
                    style={{
                      position: 'relative',
                      height: 170,
                      backgroundColor: '#e2e8f0',
                      overflow: 'hidden',
                    }}
                  >
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt={product.name}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748b',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}
                      >
                        Ei kuvaa saatavilla
                      </div>
                    )}
                  </div>

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
                            ? '#22c55e'
                            : '#f97316',
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
