import { Link } from 'react-router-dom';
import type { Product } from '../lib/types';
import { profileById } from '../lib/seed';
import { zar } from '../lib/config';

export default function ProductCard({ product }: { product: Product }) {
  const seller = profileById(product.sellerId);
  return (
    <Link to={`/marketplace/${product.id}`} className="card block overflow-hidden">
      <img src={product.image} alt="" className="h-40 w-full object-cover" />
      <div className="p-3">
        {product.featured && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-pa-rose">Featured</p>
        )}
        <p className="text-sm font-semibold text-pa-ink">{product.title}</p>
        <p className="mt-1 text-sm text-pa-forest">
          {product.fromPrice ? 'from ' : ''}
          {zar(product.price)}
        </p>
        <p className="mt-1 text-xs text-pa-muted">
          {seller?.name}
          {product.city ? ` · ${product.city}` : ''}
        </p>
      </div>
    </Link>
  );
}
