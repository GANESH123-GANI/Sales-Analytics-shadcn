import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * =================================================================
 * MOBILE API CONFIGURATION
 * =================================================================
 * When testing on a physical phone via Expo Go, "localhost" refers
 * to the phone itself, NOT your computer.
 *
 * Current Detected Local LAN IP: 10.10.9.75
 * Server Port: 5000
 *
 * To change the target environment:
 * 1. Set EXPO_PUBLIC_API_URL in your mobile .env or terminal
 *    e.g. EXPO_PUBLIC_API_URL=http://10.10.9.75:5000/api
 */

export const ENV_PRESETS = {
  // Option 1: Physical Phone connected to same Wi-Fi
  PHYSICAL_PHONE: 'http://10.10.9.75:5000/api',

  // Option 2: Localhost (Web browser or Android Emulator 10.0.2.2)
  LOCALHOST_WEB: 'http://localhost:5000/api',
  ANDROID_EMULATOR: 'http://10.0.2.2:5000/api',

  // Option 3: Production Server
  PRODUCTION: 'https://api.yourdomain.com/api',
};

/**
 * Automatically resolves the optimal API base URL:
 * - On Web: uses http://localhost:5000/api (or the current browser hostname)
 * - On Mobile (Expo Go): automatically resolves your computer's IP address from Expo Metro
 */
function resolveApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 1. Web browser: always uses current window hostname or localhost
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      return `http://${window.location.hostname}:5000/api`;
    }
    return ENV_PRESETS.LOCALHOST_WEB;
  }

  // 2. Mobile Expo Go: dynamically extract your PC IP from Expo Metro hostUri
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:5000/api`;
    }
  }

  // 3. Fallback for physical phone on LAN
  return ENV_PRESETS.PHYSICAL_PHONE;
}

export const API_BASE_URL = resolveApiBaseUrl();

export const APP_CONFIG = {
  appName: 'Sales Analytics',
  currencySymbol: '₹',
  apiTimeoutMs: 3500, // Reduced from 10s to 3.5s for fast failure/retry response
  refreshIntervalMs: 30000,
  cacheTtlMs: 20000,  // 20s fast in-memory cache
};
