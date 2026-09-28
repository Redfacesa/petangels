import { useState } from 'react';

export default function ImageCarousel({ images, alt = '' }: { images: string[]; alt?: string }) {
  const [i, setI] = useState(0);
  if (images.length === 0) return null;
  if (images.length === 1) {
    return <img src={images[0]} alt={alt} className="max-h-96 w-full object-cover" />;
  }
  const prev = () => setI((n) => (n === 0 ? images.length - 1 : n - 1));
  const next = () => setI((n) => (n === images.length - 1 ? 0 : n + 1));

  return (
    <div className="relative bg-pa-sand">
      <img src={images[i]} alt={alt} className="max-h-96 w-full object-cover" />
      <button
        type="button"
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-2 py-1 text-sm text-white"
        aria-label="Previous photo"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-2 py-1 text-sm text-white"
        aria-label="Next photo"
      >
        ›
      </button>
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
        {images.map((_, n) => (
          <button
            key={n}
            type="button"
            aria-label={`Photo ${n + 1}`}
            onClick={() => setI(n)}
            className={`h-1.5 rounded-full ${n === i ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
          />
        ))}
      </div>
      <p className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white">
        {i + 1}/{images.length}
      </p>
    </div>
  );
}
