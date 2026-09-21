export default function BrandMark({
  size = 'md',
  light = false,
}: {
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
}) {
  const px = size === 'lg' ? 44 : size === 'sm' ? 28 : 36;
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={px} height={px} viewBox="0 0 64 64" aria-hidden>
        <rect width="64" height="64" rx="16" fill={light ? '#F6F0E6' : '#2F5D50'} />
        <path
          fill={light ? '#2F5D50' : '#F6F0E6'}
          d="M22 28c-3.2 0-5.8-2.8-5.8-6.2S18.8 15.6 22 15.6s5.8 2.8 5.8 6.2S25.2 28 22 28zm20 0c-3.2 0-5.8-2.8-5.8-6.2s2.6-6.2 5.8-6.2 5.8 2.8 5.8 6.2S45.2 28 42 28zM16.5 36.2c-2.6 1.6-4.8-.8-4-3.6.8-2.8 3.8-4.4 6.4-2.8 2.6 1.6 2.8 5.2.2 6.8zm31 0c-2.6 1.6-2.4-5.2.2-6.8 2.6-1.6 5.6 0 6.4 2.8.8 2.8-1.4 5.2-4 3.6zM32 50c-8.4 0-14.5-6.2-14.5-13.2 0-4.4 3.4-7.6 8.2-8.8 2 .8 4.1 1.3 6.3 1.3s4.3-.5 6.3-1.3c4.8 1.2 8.2 4.4 8.2 8.8C46.5 43.8 40.4 50 32 50z"
        />
      </svg>
      <span className={light ? 'font-display text-pa-cream' : 'font-display text-pa-forest'}>
        <span className={`block leading-none ${size === 'lg' ? 'text-2xl' : 'text-lg'} font-semibold`}>
          Pet Angels
        </span>
        {size !== 'sm' && (
          <span className={`block text-[10px] uppercase tracking-[0.18em] ${light ? 'text-pa-sage' : 'text-pa-muted'}`}>
            Animal ecosystem
          </span>
        )}
      </span>
    </span>
  );
}
