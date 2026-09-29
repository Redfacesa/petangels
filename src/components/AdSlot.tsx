import { useEffect, useRef } from 'react';
import { ADSENSE_CLIENT } from '../lib/config';

type SlotKind = 'rail' | 'wrap' | 'mobile';

/** Fixed Display sizes — not Auto ads. Google fills only these boxes. */
const BOX: Record<SlotKind, { className: string; width: number; height: number }> = {
  rail: { className: 'w-[160px]', width: 160, height: 600 },
  wrap: { className: 'w-full max-w-[728px]', width: 728, height: 90 },
  mobile: { className: 'w-full max-w-[320px]', width: 320, height: 100 },
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
  const box = BOX[kind];

  useEffect(() => {
    if (!live || !insRef.current) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      w.adsbygoogle = w.adsbygoogle || [];
      w.adsbygoogle.push({});
    } catch {
      /* script may still be loading */
    }
  }, [live, slot]);

  return (
    <aside
      className={`mx-auto flex flex-col items-center rounded-2xl border border-pa-sand bg-pa-paper/80 p-2 ${box.className}`}
      aria-label="Advertisement"
    >
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-pa-muted">{label}</p>
      {live ? (
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: 'inline-block', width: box.width, height: box.height }}
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slot}
        />
      ) : (
        <div
          className="flex w-full items-center justify-center px-2 text-center text-[11px] leading-snug text-pa-muted"
          style={{ minHeight: box.height }}
        >
          Display ad · {box.width}×{box.height}
        </div>
      )}
    </aside>
  );
}
