import {useState} from 'react';
import {useNavigate} from 'react-router';
import {useAuth} from '../contexts/AuthContext';
import {useCart} from '../contexts/CartContext';
import {
  formatPrice,
  getCustomerDiscountRate,
  getDiscountedPrice,
} from '../lib/pricing';

interface CheckoutForm {
  deliveryAddress: string;
  reference: string;
  notes: string;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const {user} = useAuth();
  const {items, clearCart} = useCart();
  const discountRate = getCustomerDiscountRate(user);

  const [form, setForm] = useState<CheckoutForm>({
    deliveryAddress: '',
    reference: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const totalBase = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalDiscounted = items.reduce(
    (sum, item) =>
      sum + getDiscountedPrice(item.price, discountRate) * item.quantity,
    0
  );

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock API call - simulates sending order to backend
    const orderPayload = {
      customerId: user?.id,
      customerName: user?.name,
      customerEmail: user?.email,
      items: items.map((item) => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        basePrice: item.price,
      })),
      totalAmount: totalDiscounted,
      discountRate,
      deliveryAddress: form.deliveryAddress,
      reference: form.reference,
      notes: form.notes,
      orderDate: new Date().toISOString(),
    };

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock response - in real app this would come from backend
    const mockOrderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    console.log('Order submitted:', orderPayload);

    // Clear cart and show confirmation
    clearCart();
    setOrderNumber(mockOrderNumber);
    setOrderPlaced(true);
    setIsSubmitting(false);
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto',
          padding: '4rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{fontSize: '2rem', fontWeight: 800, marginBottom: '1rem'}}>
          Ostoskori on tyhjä
        </h1>
        <p style={{color: '#64748b', marginBottom: '1.5rem'}}>
          Lisää tuotteita ennen tilauksen tekemistä.
        </p>
        <button
          onClick={() => navigate('/tuotteet')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f97316',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Siirry tuotteisiin
        </button>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div
        style={{
          maxWidth: 600,
          margin: '0 auto',
          padding: '4rem 1.5rem',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}
        >
          <svg
            width={40}
            height={40}
            viewBox="0 0 24 24"
            fill="none"
            stroke="#16a34a"
            strokeWidth={3}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            marginBottom: '0.5rem',
            color: '#0f2444',
          }}
        >
          Tilaus vahvistettu!
        </h1>
        <p style={{color: '#64748b', marginBottom: '1rem'}}>
          Tilauksesi on vastaanotettu. Saat vahvistuksen sähköpostiisi.
        </p>
        <div
          style={{
            backgroundColor: '#f8fafc',
            padding: '1rem',
            borderRadius: 12,
            marginBottom: '1.5rem',
          }}
        >
          <span style={{color: '#64748b', fontSize: '0.9rem'}}>
            Tilausnumero:{' '}
          </span>
          <span style={{fontWeight: 700, color: '#0f2444'}}>{orderNumber}</span>
        </div>
        <button
          onClick={() => navigate('/tuotteet')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#0f2444',
            color: 'white',
            border: 'none',
            borderRadius: 10,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Jatka ostoksia
        </button>
      </div>
    );
  }

  return (
    <div style={{maxWidth: 1120, margin: '0 auto', padding: '2rem 1.5rem'}}>
      <h1 style={{fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem'}}>
        Kassa
      </h1>
      <p style={{color: '#64748b', marginBottom: '2rem'}}>
        Täytä tilauksen tiedot ja vahvista tilaus.
      </p>

      <div
        style={{display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem'}}
      >
        <form onSubmit={handleSubmit}>
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: 18,
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(15,36,68,0.06)',
              marginBottom: '1.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                marginBottom: '1.25rem',
              }}
            >
              Tilaajatiedot
            </h2>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: 12,
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: '#0f2444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <div style={{fontWeight: 700, color: '#0f2444'}}>
                  {user?.name || 'Tuntematon asiakas'}
                </div>
                <div style={{fontSize: '0.85rem', color: '#64748b'}}>
                  {user?.email}
                </div>
              </div>
            </div>

            <h2
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                marginBottom: '1.25rem',
              }}
            >
              Toimitustiedot
            </h2>

            <div style={{marginBottom: '1rem'}}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#374151',
                }}
              >
                Toimitusosoite *
              </label>
              <input
                type="text"
                required
                value={form.deliveryAddress}
                onChange={(e) =>
                  setForm({...form, deliveryAddress: e.target.value})
                }
                placeholder="Yrityksen osoite, katuosoite ja postinumero"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 10,
                  border: '1px solid #d1d5db',
                  fontSize: '0.95rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              />
            </div>

            <div style={{marginBottom: '1rem'}}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#374151',
                }}
              >
                Viite / Tilausnumero
              </label>
              <input
                type="text"
                value={form.reference}
                onChange={(e) => setForm({...form, reference: e.target.value})}
                placeholder="Esim. OSTO-2026-001"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 10,
                  border: '1px solid #d1d5db',
                  fontSize: '0.95rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: '#374151',
                }}
              >
                Lisätiedot
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({...form, notes: e.target.value})}
                placeholder="Erityistoiveet, toimitusaika, yhteyshenkilö..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: 10,
                  border: '1px solid #d1d5db',
                  fontSize: '0.95rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                  resize: 'vertical',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: isSubmitting ? '#94a3b8' : '#0f2444',
              color: 'white',
              border: 'none',
              borderRadius: 14,
              fontSize: '1rem',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            {isSubmitting ? (
              <>
                <svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  style={{animation: 'spin 1s linear infinite'}}
                >
                  <circle
                    cx={12}
                    cy={12}
                    r={10}
                    stroke="currentColor"
                    strokeWidth={3}
                    fill="none"
                    strokeDasharray="30 60"
                  />
                </svg>
                Lähetetään...
              </>
            ) : (
              'Vahvista tilaus'
            )}
          </button>
        </form>

        <aside
          style={{
            backgroundColor: 'white',
            borderRadius: 18,
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(15,36,68,0.08)',
            height: 'fit-content',
          }}
        >
          <h2
            style={{fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem'}}
          >
            Tilauksen yhteenveto
          </h2>

          <div
            style={{marginBottom: '1rem', maxHeight: 240, overflowY: 'auto'}}
          >
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid #f1f5f9',
                }}
              >
                <div style={{flex: 1}}>
                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: '#0f2444',
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{fontSize: '0.8rem', color: '#64748b'}}>
                    {item.quantity} kpl
                  </div>
                </div>
                <div style={{fontWeight: 600, color: '#0f2444'}}>
                  {formatPrice(
                    getDiscountedPrice(item.price, discountRate) * item.quantity
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{borderTop: '2px solid #f1f5f9', paddingTop: '1rem'}}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
                color: '#64748b',
              }}
            >
              <span>Alkuperäinen hinta</span>
              <span>{formatPrice(totalBase)}</span>
            </div>
            {discountRate > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  color: '#16a34a',
                }}
              >
                <span>Alennus (-15%)</span>
                <span>-{formatPrice(totalBase - totalDiscounted)}</span>
              </div>
            )}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#0f2444',
              }}
            >
              <span>Yhteensä</span>
              <span>{formatPrice(totalDiscounted)}</span>
            </div>
          </div>

          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: '#f8fafc',
              borderRadius: 10,
              fontSize: '0.85rem',
              color: '#64748b',
            }}
          >
            <strong>Maksutapa:</strong> Laskutus (14 pv netto)
          </div>
        </aside>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export {CheckoutPage as Checkout};
