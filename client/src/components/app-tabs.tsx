import { NativeTabs, Icon, Label, VectorIcon } from 'expo-router/unstable-native-tabs';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  // Force light colors because the application screens only support light mode styles
  const colors = Colors.light;

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      disableTransparentOnScrollEdge={true}
      labelStyle={{ selected: { color: '#11876d' } }}>
      <NativeTabs.Trigger name="index">
        <Label>Trang chủ</Label>
        <Icon
          src={{
            default: <VectorIcon family={MaterialCommunityIcons} name="home-variant-outline" />,
            selected: <VectorIcon family={MaterialCommunityIcons} name="home-variant" />,
          }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="inventory">
        <Label>Kho</Label>
        <Icon
          src={{
            default: <VectorIcon family={MaterialCommunityIcons} name="fridge-outline" />,
            selected: <VectorIcon family={MaterialCommunityIcons} name="fridge" />,
          }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="recipes">
        <Label>Món ăn</Label>
        <Icon
          src={{
            default: <VectorIcon family={MaterialCommunityIcons} name="silverware-fork-knife" />,
            selected: <VectorIcon family={MaterialCommunityIcons} name="silverware-fork-knife" />,
          }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="budget">
        <Label>Ngân sách</Label>
        <Icon
          src={{
            default: <VectorIcon family={MaterialCommunityIcons} name="wallet-outline" />,
            selected: <VectorIcon family={MaterialCommunityIcons} name="wallet" />,
          }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="chat">
        <Label>AI</Label>
        <Icon
          src={{
            default: <VectorIcon family={MaterialCommunityIcons} name="message-processing-outline" />,
            selected: <VectorIcon family={MaterialCommunityIcons} name="message-processing" />,
          }}
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>Cá nhân</Label>
        <Icon
          src={{
            default: <VectorIcon family={MaterialCommunityIcons} name="account-outline" />,
            selected: <VectorIcon family={MaterialCommunityIcons} name="account" />,
          }}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
