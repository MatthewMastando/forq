import { useColorScheme } from 'react-native';

const light = {
  background: '#FFF9F5',
  card: '#FFFFFF',
  text: '#1D1B1A',
  muted: '#6F6863',
  border: '#EADFD7',
  accent: '#E8572A',
  accentText: '#FFFFFF',
  selected: '#FDE6DC',
};

const dark: typeof light = {
  background: '#151312',
  card: '#211E1C',
  text: '#F6F1EE',
  muted: '#A69C96',
  border: '#3A3431',
  accent: '#FF7A4D',
  accentText: '#1D1B1A',
  selected: '#4A2A1F',
};

export function useTheme() {
  return useColorScheme() === 'dark' ? dark : light;
}
