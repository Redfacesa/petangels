import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT } from '../lib/config';

type SlotKind = 'rail' | 'wrap' | 'mobile';

const SIZE: Record<SlotKind, string> = {
  rail: 'min-h-[600px] w-[160px]',
  wrap: 'min-h-[90px] w-full max-w-[728px]',
  mobile: 'min-h-[100px] w-full max-w-[320px]',
};

export default function AdSlot({
  kind,
  slot,
  label = 'Sponsored',
}: {
  kind: SlotKind;
  slot?: string;
  label?: string;
}) {
  const insRef = useRef<HTMLModElement>(null);
  const live = Boolean(ADSENSE_CLIENT && slot);

  useEffect(() => {
    if (!live || !insRef.current) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      /* AdSense script may not be ready yet */
    }
  }, [live, slot]);

  return (
    <aside
      className={`mx-auto flex flex-col items-center justify-start rounded-2xl border border-dashed border-pa-sand bg-pa-paper/80 p-2 ${SIZE[kind]}`}
      aria-label="Advertisement"
    >
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-pa-muted">{label}</p>
      {live ? (
        <ins
          ref={insRef}
          className="adsbygoogle block w-full"
          style={{ display: 'block' }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className="flex h-full min-h-[72px] w-full items-center justify-center px-2 text-center text-[11px] leading-snug text-pa-muted">
          Pet-friendly ads sit in the side wrap — never as pop-ups, never over the feed.
        </div>
      )}
    </aside>
  );
}
