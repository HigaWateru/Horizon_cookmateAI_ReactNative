import { Colors } from '@/constants/theme';

export function useTheme() {
  // Force light theme colors since the app has a dedicated light theme design
  return Colors.light;
}
