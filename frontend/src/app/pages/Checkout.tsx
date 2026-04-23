import {useState} from 'react';

interface CheckoutProps {
  totalItems: number;
  totalPrice: number;
  totalPriceWithDiscount: number;
  discount: number;
  isBusinessCustomer: boolean;
  deliveryPrice: number;
  onConfirmOrder: () => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

export function Checkout({
  totalItems,
  totalPrice,
  totalPriceWithDiscount,
  discount,
  isBusinessCustomer,
  deliveryPrice,
  onConfirmOrder,
  onBack,
  loading,
}: CheckoutProps) {
  const [billingInfo, setBillingInfo] = useState({
    company: '',
    businessId: '',
    vatNumber: '',
    address: '',
    city: '',
    zipCode: '',
  });

  const total = totalPriceWithDiscount + deliveryPrice;

  const isValid =
    billingInfo.company &&
    billingInfo.businessId &&
    billingInfo.address &&
    billingInfo.zipCode &&
    billingInfo.city;

  return (
    <div
      style={{
        fontFamily: "'Space Grotesk', sans-serif",
        minHeight: '80vh',
        backgroundColor: '#f8fafc',
        padding: '2rem 1rem',
      }}
    >
      <div style={{maxWidth: 600, margin: '0 auto'}}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: '1rem',
            cursor: 'pointer',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          ← Takaisin ostoskoriin
        </button>

        <div
          style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          }}
        >
          <h2
            style={{
              color: '#0f2444',
              fontSize: '1.5rem',
              fontWeight: 800,
              marginBottom: '1.5rem',
            }}
          >
            Kassalle
          </h2>

          <div style={{marginBottom: '1.5rem'}}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#374151',
                marginBottom: '0.25rem',
                fontWeight: 500,
              }}
            >
              Yrityksen nimi *
            </label>
            <input
              type="text"
              value={billingInfo.company}
              onChange={(e) =>
                setBillingInfo({...billingInfo, company: e.target.value})
              }
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            />
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#374151',
                marginBottom: '0.25rem',
                fontWeight: 500,
              }}
            >
              Y-tunnus (Business ID) *
            </label>
            <input
              type="text"
              value={billingInfo.businessId}
              onChange={(e) =>
                setBillingInfo({...billingInfo, businessId: e.target.value})
              }
              required
              placeholder="1234567-8"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            />
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#374151',
                marginBottom: '0.25rem',
                fontWeight: 500,
              }}
            >
              ALV-numero (VAT)
            </label>
            <input
              type="text"
              value={billingInfo.vatNumber}
              onChange={(e) =>
                setBillingInfo({...billingInfo, vatNumber: e.target.value})
              }
              placeholder="FI12345678"
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            />
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <label
              style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#374151',
                marginBottom: '0.25rem',
                fontWeight: 500,
              }}
            >
              Toimitusosoite *
            </label>
            <input
              type="text"
              value={billingInfo.address}
              onChange={(e) =>
                setBillingInfo({...billingInfo, address: e.target.value})
              }
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                fontSize: '1rem',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  color: '#374151',
                  marginBottom: '0.25rem',
                  fontWeight: 500,
                }}
              >
                Postinumero *
              </label>
              <input
                type="text"
                value={billingInfo.zipCode}
                onChange={(e) =>
                  setBillingInfo({...billingInfo, zipCode: e.target.value})
                }
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '1rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  color: '#374151',
                  marginBottom: '0.25rem',
                  fontWeight: 500,
                }}
              >
                Kaupunki *
              </label>
              <input
                type="text"
                value={billingInfo.city}
                onChange={(e) =>
                  setBillingInfo({...billingInfo, city: e.target.value})
                }
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: '1rem',
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              />
            </div>
          </div>

          {/* Tilausyhteenveto */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              borderRadius: 12,
              padding: '1.25rem',
              marginBottom: '1.5rem',
            }}
          >
            <h3
              style={{
                fontSize: '1rem',
                fontWeight: 700,
                color: '#0f2444',
                marginBottom: '0.75rem',
              }}
            >
              Tilaus ({totalItems} tuotetta)
            </h3>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.875rem',
                color: '#374151',
                marginBottom: '0.5rem',
              }}
            >
              <span>Tuotteet</span>
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
                  marginBottom: '0.5rem',
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
                marginBottom: '0.5rem',
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
                borderTop: '1px solid #e2e8f0',
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
            onClick={onConfirmOrder}
            disabled={loading || !isValid}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: 10,
              border: 'none',
              backgroundColor: loading || !isValid ? '#94a3b8' : '#f97316',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.1rem',
              cursor: loading || !isValid ? 'not-allowed' : 'pointer',
              fontFamily: "'Space Grotesk', sans-serif",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow:
                loading || !isValid
                  ? 'none'
                  : '0 4px 16px rgba(249,115,22,0.3)',
            }}
          >
            {loading ? 'Lähetetään tilausta...' : 'Vahvista tilaus'}
          </button>
        </div>
      </div>
    </div>
  );
}
