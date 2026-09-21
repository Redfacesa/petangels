import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCatalog } from '../contexts/CatalogContext';
import { useAuth } from '../contexts/AuthContext';
import { zar } from '../lib/config';
import { addToCart } from '../lib/store';
import { checkoutWithRedFacePay } from '../lib/redface-pay';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { productById, profileById } = useCatalog();
  const product = id ? productById(id) : undefined;
  if (!product) return <p className="p-8 text-center text-pa-muted">Listing not found.</p>;
  const seller = profileById(product.sellerId);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <img src={product.image} alt="" className="h-72 w-full rounded-3xl object-cover" />
      <p className="mt-4 text-xs uppercase tracking-wider text-pa-muted">{product.category}</p>
      <h1 className="font-display text-3xl text-pa-ink">{product.title}</h1>
      <p className="mt-2 text-lg text-pa-forest">
        {product.fromPrice ? 'from ' : ''}
        {zar(product.price)}
      </p>
      {seller && (
        <Link to={`/u/${seller.handle}`} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-pa-ink">
          <img src={seller.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
          {seller.name}
        </Link>
      )}
      <p className="mt-3 text-xs text-pa-muted">Paid with RedFace Pay. Pet Angels never takes the card details.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="btn-primary"
          onClick={() =>
            void checkoutWithRedFacePay({
              merchantId: seller?.redfaceMerchantId,
              amountZar: product.price,
              label: `Pet Angels · ${product.title}`,
              kind: product.kind === 'service' ? 'service' : 'product',
              returnPath: '/profile?paid=1',
              payerId: user?.id,
              payeeProfileId: seller?.id,
            })
          }
        >
          Pay with RedFace Pay
        </button>
        <button
          type="button"
          className="btn-ghost"
          onClick={() => {
            addToCart(product.id);
            navigate('/cart');
          }}
        >
          Add to cart
        </button>
      </div>
    </div>
  );
}
