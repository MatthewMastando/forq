import { useColorScheme } from 'react-native';

const light = {
  background: '#FBF7F2',
  surface: '#FFFFFF',
  surfaceAlt: '#F3ECE4',
  text: '#1C1917',
  textMuted: '#78716C',
  border: '#E7DED4',
  accent: '#E4572E',
  accentSoft: '#FCE8E0',
  onAccent: '#FFFFFF',
  success: '#2F8F5B',
  overlay: 'rgba(0,0,0,0.45)',
};

const dark: typeof light = {
  background: '#141210',
  surface: '#1F1C19',
  surfaceAlt: '#2A2622',
  text: '#F5F0EB',
  textMuted: '#A8A29E',
  border: '#36312C',
  accent: '#FF7A50',
  accentSoft: '#3D2219',
  onAccent: '#1C1917',
  success: '#4CC38A',
  overlay: 'rgba(0,0,0,0.55)',
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

export const fonts = {
  display: 'Fraunces_700Bold',
  displaySemi: 'Fraunces_600SemiBold',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { sm: 10, md: 14, lg: 20, pill: 999 };
