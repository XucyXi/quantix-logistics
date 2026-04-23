import {useState} from 'react';
import {Link, useNavigate} from 'react-router';
import {motion, AnimatePresence} from 'motion/react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  CheckCircle,
  Package,
  Leaf,
} from 'lucide-react';
import {useCart} from '../contexts/CartContext';
import {Checkout} from './Checkout';

const tagColors: Record<string, {bg: string; color: string}> = {
  Gluteeniton: {bg: '#fef3c7', color: '#d97706'},
  Vegaani: {bg: '#dcfce7', color: '#16a34a'},
  Kasvis: {bg: '#d1fae5', color: '#059669'},
  Laktoositon: {bg: '#dbeafe', color: '#2563eb'},
  Maidoton: {bg: '#ede9fe', color: '#7c3aed'},
};

const deliveryOptions = [
  {
    id: 'standard',
    label: 'Normaali toimitus',
    eta: '2–3 arkipäivää',
    price: 0,
    desc: 'Sisältyy tilaukseen',
  },
  {
    id: 'express',
    label: 'Pikatoimitus',
    eta: 'Seuraava arkipäivä',
    price: 9.9,
    desc: '+9,90 € / tilaus',
  },
];

export function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    totalPriceWithDiscount,
    discount,
    isBusinessCustomer,
  } = useCart();
  const [delivery, setDelivery] = useState('standard');
  const [orderDone, setOrderDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const navigate = useNavigate();

  const deliveryPrice =
    deliveryOptions.find((d) => d.id === delivery)?.price ?? 0;
  const total = totalPriceWithDiscount + deliveryPrice;
  const vat = total * 0.14;
  const totalWithVat = total;

  const handleOrder = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    clearCart();
    setOrderDone(true);
  };

  if (showCheckout) {
    return <Checkout />;
  }

  if (orderDone) {
    return (
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          padding: '2rem',
        }}
      >
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 20,
            padding: '3rem',
            textAlign: 'center',
            maxWidth: 480,
            boxShadow: '0 8px 40px rgba(0,0,0,0.08)',
          }}
        >
          <motion.div
            initial={{scale: 0}}
            animate={{scale: 1}}
            transition={{type: 'spring', stiffness: 200, damping: 15}}
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: '#dcfce7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <CheckCircle size={36} color="#16a34a" />
          </motion.div>
          <h2
            style={{
              color: '#0f2444',
              fontWeight: 800,
              fontSize: '1.5rem',
              marginBottom: '0.75rem',
            }}
          >
            Tilaus vastaanotettu!
          </h2>
          <p
            style={{
              color: '#64748b',
              fontSize: '0.9rem',
              lineHeight: 1.7,
              marginBottom: '0.75rem',
            }}
          >
            Tilauksesi on lähetetty jakelukeskukselle. Saat vahvistusviestin
            sähköpostitse.
          </p>
          <p
            style={{
              color: '#94a3b8',
              fontSize: '0.82rem',
              marginBottom: '2rem',
            }}
          >
            Tilausnumero:{' '}
            <strong style={{color: '#0f2444'}}>
              ORD-{Math.floor(Math.random() * 9000) + 1000}
            </strong>
          </p>
          <div
            style={{display: 'flex', gap: '0.75rem', justifyContent: 'center'}}
          >
            <Link
              to="/products"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 10,
                border: '1.5px solid #e2e8f0',
                color: '#64748b',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              Jatka tilaamista
            </Link>
            <Link
              to="/"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 10,
                backgroundColor: '#f97316',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: '0.9rem',
              }}
            >
              Etusivulle
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          padding: '2rem',
        }}
      >
        <div style={{textAlign: 'center'}}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}
          >
            <ShoppingCart size={36} color="#94a3b8" />
          </div>
          <h2
            style={{
              color: '#0f2444',
              fontWeight: 700,
              fontSize: '1.4rem',
              marginBottom: '0.75rem',
            }}
          >
            Ostoskori on tyhjä
          </h2>
          <p
            style={{
              color: '#64748b',
              fontSize: '0.9rem',
              marginBottom: '1.5rem',
            }}
          >
            Lisää tuotteita ruokalistalta aloittaaksesi tilauksen.
          </p>
          <Link
            to="/products"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.875rem 1.75rem',
              borderRadius: 10,
              backgroundColor: '#f97316',
              color: 'white',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
            }}
          >
            <Package size={18} />
            Siirry tuoteluetteloon
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        backgroundColor: '#f8fafc',
        minHeight: '80vh',
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f2444 0%, #1e3a5f 100%)',
          padding: '2.5rem 1.5rem 2rem',
          color: 'white',
        }}
      >
        <div style={{maxWidth: 1100, margin: '0 auto'}}>
          <h1
            style={{
              color: 'white',
              fontWeight: 800,
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              marginBottom: '0.25rem',
            }}
          >
            Ostoskori
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '0.875rem',
              margin: 0,
            }}
          >
            {totalItems} tuotetta
          </p>
        </div>
      </div>

      <div style={{maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem'}}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1px solid #f1f5f9',
              }}
            >
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h3
                  style={{
                    color: '#0f2444',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    margin: 0,
                  }}
                >
                  Valitut tuotteet
                </h3>
                <button
                  onClick={clearCart}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  <Trash2 size={13} />
                  Tyhjennä kori
                </button>
              </div>

              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{opacity: 1}}
                    exit={{opacity: 0, x: -20}}
                    transition={{duration: 0.2}}
                    style={{
                      padding: '1.25rem 1.5rem',
                      borderTop: i > 0 ? '1px solid #f1f5f9' : undefined,
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    {/* Image */}
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: 72,
                          height: 72,
                          borderRadius: 10,
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                    )}

                    {/* Info */}
                    <div style={{flex: 1, minWidth: 0}}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: '0.5rem',
                        }}
                      >
                        <h4
                          style={{
                            color: '#0f2444',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            margin: 0,
                          }}
                        >
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc2626',
                            cursor: 'pointer',
                            padding: '0.25rem',
                            flexShrink: 0,
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <p
                        style={{
                          color: '#64748b',
                          fontSize: '0.8rem',
                          lineHeight: 1.5,
                          margin: '0.25rem 0 0.5rem',
                        }}
                      >
                        {item.description}
                      </p>

                      {item.dietTags && item.dietTags.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            gap: '0.3rem',
                            flexWrap: 'wrap',
                            marginBottom: '0.625rem',
                          }}
                        >
                          {item.dietTags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: 20,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                backgroundColor:
                                  tagColors[tag]?.bg ?? '#f1f5f9',
                                color: tagColors[tag]?.color ?? '#64748b',
                              }}
                            >
                              <Leaf
                                size={9}
                                style={{display: 'inline', marginRight: 2}}
                              />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        {/* Quantity */}
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              border: '1.5px solid #e2e8f0',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#374151',
                            }}
                          >
                            <Minus size={12} />
                          </button>
                          <span
                            style={{
                              fontWeight: 700,
                              color: '#0f2444',
                              minWidth: 20,
                              textAlign: 'center',
                              fontSize: '0.9rem',
                            }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              border: '1.5px solid #e2e8f0',
                              backgroundColor: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#374151',
                            }}
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <span
                          style={{
                            fontWeight: 800,
                            color: '#f97316',
                            fontSize: '1rem',
                          }}
                        >
                          {(item.price * item.quantity).toFixed(2)} €
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Delivery options */}
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1px solid #f1f5f9',
                marginTop: '1rem',
              }}
            >
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <h3
                  style={{
                    color: '#0f2444',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    margin: 0,
                  }}
                >
                  Toimitustapa
                </h3>
              </div>
              <div
                style={{
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.625rem',
                }}
              >
                {deliveryOptions.map((opt) => (
                  <label
                    key={opt.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      borderRadius: 10,
                      border: `2px solid ${delivery === opt.id ? '#f97316' : '#e2e8f0'}`,
                      cursor: 'pointer',
                      backgroundColor:
                        delivery === opt.id ? '#fff7ed' : 'white',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="radio"
                      name="delivery"
                      value={opt.id}
                      checked={delivery === opt.id}
                      onChange={() => setDelivery(opt.id)}
                      style={{accentColor: '#f97316'}}
                    />
                    <div style={{flex: 1}}>
                      <div
                        style={{
                          fontWeight: 700,
                          color: '#0f2444',
                          fontSize: '0.9rem',
                        }}
                      >
                        {opt.label}
                      </div>
                      <div style={{color: '#64748b', fontSize: '0.8rem'}}>
                        {opt.eta}
                      </div>
                    </div>
                    <div
                      style={{
                        fontWeight: 700,
                        color: opt.price === 0 ? '#22c55e' : '#374151',
                        fontSize: '0.9rem',
                      }}
                    >
                      {opt.price === 0
                        ? 'Ilmainen'
                        : `+${opt.price.toFixed(2)} €`}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                border: '1px solid #f1f5f9',
                position: 'sticky',
                top: 80,
              }}
            >
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <h3
                  style={{
                    color: '#0f2444',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    margin: 0,
                  }}
                >
                  Tilauksen yhteenveto
                </h3>
              </div>
              <div style={{padding: '1.25rem 1.5rem'}}>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.625rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: '#374151',
                    }}
                  >
                    <span>Tuotteet ({totalItems} kpl)</span>
                    <span>
                      {isBusinessCustomer ? (
                        <span>
                          <span
                            style={{
                              textDecoration: 'line-through',
                              color: '#94a3b8',
                              marginRight: '0.5rem',
                            }}
                          >
                            {totalPrice.toFixed(2)} €
                          </span>
                          <span style={{color: '#22c55e', fontWeight: 600}}>
                            {totalPriceWithDiscount.toFixed(2)} €
                          </span>
                        </span>
                      ) : (
                        <span>{totalPrice.toFixed(2)} €</span>
                      )}
                    </span>
                  </div>
                  {isBusinessCustomer && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.875rem',
                        color: '#22c55e',
                      }}
                    >
                      <span>Business-alennus (15%)</span>
                      <span>-{discount.toFixed(2)} €</span>
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.875rem',
                      color: '#374151',
                    }}
                  >
                    <span>Toimitus</span>
                    <span>
                      {deliveryPrice === 0
                        ? 'Ilmainen'
                        : `${deliveryPrice.toFixed(2)} €`}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.8rem',
                      color: '#94a3b8',
                    }}
                  >
                    <span>ALV (14%)</span>
                    <span>{vat.toFixed(2)} €</span>
                  </div>
                  <div
                    style={{
                      borderTop: '2px solid #f1f5f9',
                      paddingTop: '0.75rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '1rem',
                      fontWeight: 800,
                      color: '#0f2444',
                    }}
                  >
                    <span>Yhteensä</span>
                    <span>{total.toFixed(2)} €</span>
                  </div>
                </div>

                <button
                  onClick={() => setShowCheckout(true)}
                  disabled={loading || items.length === 0}
                  style={{
                    width: '100%',
                    padding: '0.9rem',
                    borderRadius: 10,
                    border: 'none',
                    backgroundColor: items.length === 0 ? '#94a3b8' : '#f97316',
                    color: 'white',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                    fontFamily: "'Space Grotesk', sans-serif",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'background 0.2s',
                    boxShadow:
                      items.length === 0
                        ? 'none'
                        : '0 4px 16px rgba(249,115,22,0.3)',
                  }}
                >
                  {items.length === 0 ? (
                    'Ostoskori tyhjä'
                  ) : (
                    <>
                      Siirry kassalle
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    backgroundColor: '#f8fafc',
                    borderRadius: 8,
                    fontSize: '0.78rem',
                    color: '#64748b',
                    textAlign: 'center',
                  }}
                >
                  🔒 Maksu käsitellään turvallisesti · Peruutus ennen toimitusta
                </div>

                <div style={{marginTop: '0.75rem'}}>
                  <Link
                    to="/products"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.375rem',
                      color: '#64748b',
                      fontSize: '0.85rem',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    ← Jatka ostoksia
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
