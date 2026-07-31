import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: '#11876d' } }}>
      <NativeTabs.Trigger name="index">
        <Label>Trang chủ</Label>
        <Icon
          src={require('@/assets/images/tabIcons/home.png')}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="inventory">
        <Label>Kho</Label>
        <Icon
          src={require('@/assets/images/tabIcons/inventory.png')}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="recipes">
        <Label>Món ăn</Label>
        <Icon
          src={require('@/assets/images/tabIcons/recipes.png')}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="budget">
        <Label>Ngân sách</Label>
        <Icon
          src={require('@/assets/images/tabIcons/budget.png')}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>Cá nhân</Label>
        <Icon
          src={require('@/assets/images/tabIcons/profile.png')}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
