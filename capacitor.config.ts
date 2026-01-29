import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wavegram.app',
  appName: 'Wavegram',
  webDir: 'dist',
  server: {
    url: 'https://TrainingTWC.github.io/Wavegram/',
    cleartext: true,
    allowNavigation: ['TrainingTWC.github.io', '*.github.io']
  }
};

export default config;
