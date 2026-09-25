import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AdSlot from './AdSlot';
import { ADSENSE_CLIENT, ADSENSE_SLOT_RAIL, ADSENSE_SLOT_WRAP } from '../lib/config';

const HIDE = ['/', '/login', '/signup', '/join', '/auth', '/legal'];

function adsAllowed(pathname: string) {
  return !HIDE.some((p) => pathname === p || (p !== '/' && pathname.startsWith(p)));
}

export default function AdWrap({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const show = adsAllowed(pathname);

  useEffect(() => {
    if (!ADSENSE_CLIENT || document.getElementById('pa-adsense')) return;
    const s = document.createElement('script');
    s.id = 'pa-adsense';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`;
    document.head.appendChild(s);
  }, []);

  if (!show) return <>{children}</>;

  return (
    <div className="mx-auto flex w-full max-w-[1400px] items-start justify-center gap-3 px-2">
      <div className="sticky top-20 hidden shrink-0 xl:block">
        <AdSlot kind="rail" slot={ADSENSE_SLOT_RAIL} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-4 flex justify-center md:hidden">
          <AdSlot kind="mobile" slot={ADSENSE_SLOT_WRAP} />
        </div>
        <div className="mb-4 hidden justify-center md:flex xl:hidden">
          <AdSlot kind="wrap" slot={ADSENSE_SLOT_WRAP} />
        </div>
        {children}
        <div className="mt-8 hidden justify-center xl:flex">
          <AdSlot kind="wrap" slot={ADSENSE_SLOT_WRAP} />
        </div>
      </div>
      <div className="sticky top-20 hidden shrink-0 xl:block">
        <AdSlot kind="rail" slot={ADSENSE_SLOT_RAIL} />
      </div>
    </div>
  );
}
