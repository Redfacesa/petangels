/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_REDFACE_PAY_URL: string;
  readonly VITE_PET_ANGELS_MERCHANT_ID: string;
  readonly VITE_SITE_URL: string;
  readonly VITE_REDFACE_SSO: string;
  readonly VITE_STORAGE_BUCKET: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
