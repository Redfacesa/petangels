import { countryName, flagEmoji, parseCountry } from '../lib/geo';

export default function CountryFlag({
  code,
  withName,
  className = '',
}: {
  code?: string;
  withName?: boolean;
  className?: string;
}) {
  const country = parseCountry(code);
  return (
    <span className={`inline-flex items-center gap-1 ${className}`} title={countryName(country)}>
      <span aria-hidden className="leading-none">
        {flagEmoji(country)}
      </span>
      {withName ? <span>{countryName(country)}</span> : null}
    </span>
  );
}
