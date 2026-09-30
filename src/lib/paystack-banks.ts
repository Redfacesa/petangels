/** South African banks Paystack lists for ZAR BASA transfers (List Banks API). */
export const PAYSTACK_ZA_BANKS = [
  { name: 'Absa Bank Limited, South Africa', code: '632005' },
  { name: 'Access Bank South Africa', code: '410506' },
  { name: 'African Bank Limited', code: '430000' },
  { name: 'African Business Bank', code: '584000' },
  { name: 'Albaraka Bank', code: '800000' },
  { name: 'Bank of China', code: '686000' },
  { name: 'Bank Zero', code: '888000' },
  { name: 'Bidvest Bank Limited', code: '462005' },
  { name: 'Capitec Bank Limited', code: '470010' },
  { name: 'Capitec Business', code: '450105' },
  { name: 'CitiBank', code: '350005' },
  { name: 'Discovery Bank Limited', code: '679000' },
  { name: 'Finbond EPE', code: '591000' },
  { name: 'Finbond Mutual Bank', code: '589000' },
  { name: 'First National Bank', code: '250655' },
  { name: 'FirstRand Bank', code: '201419' },
  { name: 'GoTyme Bank', code: '678910' },
  { name: 'HBZ Bank (Westville)', code: '570226' },
  { name: 'HSBC South Africa', code: '587000' },
  { name: 'Investec Bank Ltd', code: '580105' },
  { name: 'JP Morgan South Africa', code: '432000' },
  { name: 'Nedbank', code: '198765' },
  { name: 'Olympus Mobile', code: '585001' },
  { name: 'OM Bank', code: '352000' },
  { name: 'Rand Merchant Bank', code: '261251' },
  { name: 'RMB Private Bank', code: '222026' },
  { name: 'SASFIN Bank', code: '683000' },
  { name: 'Société Générale South Africa', code: '351005' },
  { name: 'South African Bank of Athens', code: '410105' },
  { name: 'Standard Bank South Africa', code: '051001' },
  { name: 'Standard Chartered Bank', code: '730020' },
  { name: 'Ubank Ltd', code: '431010' },
  { name: 'VBS Mutual Bank', code: '588000' },
] as const;

export type PaystackZaBank = (typeof PAYSTACK_ZA_BANKS)[number];

export function paystackZaBankByName(name: string): PaystackZaBank | undefined {
  return PAYSTACK_ZA_BANKS.find((b) => b.name === name);
}

export function resolvePaystackZaBankName(saved: string | undefined): string {
  const raw = (saved || '').trim();
  if (!raw) return '';
  const exact = PAYSTACK_ZA_BANKS.find((b) => b.name.toLowerCase() === raw.toLowerCase());
  if (exact) return exact.name;
  const n = raw.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  if (n === 'fnb' || n.includes('first national')) return 'First National Bank';
  if (n === 'absa' || n.startsWith('absa ')) return 'Absa Bank Limited, South Africa';
  if (n.includes('standard bank')) return 'Standard Bank South Africa';
  if (n.includes('tyme') || n.includes('gotyme')) return 'GoTyme Bank';
  if (n.includes('capitec') && n.includes('business')) return 'Capitec Business';
  if (n.includes('capitec')) return 'Capitec Bank Limited';
  if (n.includes('nedbank')) return 'Nedbank';
  if (n.includes('discovery')) return 'Discovery Bank Limited';
  if (n.includes('investec')) return 'Investec Bank Ltd';
  if (n.includes('bidvest')) return 'Bidvest Bank Limited';
  if (n.includes('african bank')) return 'African Bank Limited';
  const fuzzy = PAYSTACK_ZA_BANKS.find((b) => b.name.toLowerCase().includes(n) || n.includes(b.name.toLowerCase().split(',')[0]));
  return fuzzy?.name || '';
}
