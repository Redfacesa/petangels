import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { loadCart, saveCart } from '../lib/store';
import { zar } from '../lib/config';
import { checkoutWithRedFacePay } from '../lib/redface-pay';
import { useCatalog } from '../contexts/CatalogContext';
import { useAuth } from '../contexts/AuthContext';

export default function CartPage() {
  const { user } = useAuth();
  const { productById, profileById } = useCatalog();
  const [items, setItems] = useState(() => loadCart());
  const rows = useMemo(
    () =>
      items
        .map((i) => ({ ...i, product: productById(i.productId) }))
        .filter((r) => r.product),
    [items, productById],
  );
  const total = rows.reduce((sum, r) => sum + (r.product?.price || 0) * r.qty, 0);

  function checkout() {
    void checkoutWithRedFacePay({
      amountZar: total || 1,
      label: `Pet Angels cart · ${rows.length} item(s)`,
      kind: 'product',
      returnPath: '/profile?paid=1',
      payerId: user?.id,
    });
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="font-display text-3xl">Cart</h1>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-pa-muted">
          Empty. <Link to="/marketplace">Browse the marketplace</Link>
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {rows.map((r) => (
            <li key={r.productId} className="card flex gap-3 p-3">
              <img src={r.product!.image} alt="" className="h-16 w-16 rounded-xl object-cover" />
              <div className="flex-1">
                <p className="font-semibold">{r.product!.title}</p>
                <p className="text-xs text-pa-muted">{profileById(r.product!.sellerId)?.name}</p>
                <p className="text-sm text-pa-forest">{zar(r.product!.price)}</p>
              </div>
              <button
                type="button"
                className="text-xs text-pa-rose"
                onClick={() => {
                  const next = items.filter((i) => i.productId !== r.productId);
                  saveCart(next);
                  setItems(next);
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {rows.length > 0 && (
        <div className="mt-6">
          <p className="font-semibold">Total {zar(total)}</p>
          <p className="mt-1 text-xs text-pa-muted">Checkout opens the RedFace Pay merchant link.</p>
          <button type="button" className="btn-primary mt-4 w-full" onClick={checkout}>
            Pay with RedFace Pay
          </button>
        </div>
      )}
    </div>
  );
}
