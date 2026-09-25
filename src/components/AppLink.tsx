import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { appHref } from '../lib/hosts';

export default function AppLink({
  to,
  className,
  children,
  'aria-label': ariaLabel,
}: {
  to: string;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
}) {
  const href = appHref(to);
  if (href.startsWith('http')) {
    return (
      <a href={href} className={className} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={className} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
