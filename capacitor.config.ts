import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'za.co.petangelssa.app',
  appName: 'Pet Angels SA',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'app.petangelssa.co.za',
    allowNavigation: [
      'app.petangelssa.co.za',
      'petangelssa.co.za',
      'www.petangelssa.co.za',
      '*.supabase.co',
      'www.redfacepay.co.za',
      'redfacepay.co.za',
      'paystack.shop',
      '*.paystack.co',
      '*.paystack.com',
    ],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
      launchAutoHide: true,
      backgroundColor: '#2F5D50',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#F6F0E6',
    },
  },
  android: {
    allowMixedContent: false,
    backgroundColor: '#F6F0E6',
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    backgroundColor: '#F6F0E6',
    scheme: 'Pet Angels SA',
  },
};

export default config;
