import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

export async function bootNativeShell() {
  if (!isNativeApp()) return;
  document.getElementById('pa-adsense')?.remove();
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#F6F0E6' });
  } catch {
    /* web or unsupported */
  }
  try {
    await SplashScreen.hide();
  } catch {
    /* splash plugin missing until cap sync */
  }
  void App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) window.history.back();
    else void App.exitApp();
  });
  void App.addListener('appUrlOpen', ({ url }) => {
    try {
      const u = new URL(url);
      if (u.pathname && u.pathname !== '/') {
        window.location.assign(`${u.pathname}${u.search}${u.hash}`);
      }
    } catch {
      /* ignore */
    }
  });
}

export async function openExternalUrl(url: string) {
  if (isNativeApp()) {
    await Browser.open({ url, presentationStyle: 'popover' });
    return;
  }
  window.location.href = url;
}
