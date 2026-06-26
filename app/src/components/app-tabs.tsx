import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { ClipboardList, CheckSquare } from 'lucide-react-native';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor="#fff"
      indicatorColor="#000"
      labelStyle={{ selected: { color: '#000' } }}>
      <NativeTabs.Trigger name="plan">
        <NativeTabs.Trigger.Label>Lập Kế Hoạch</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon>
          <ClipboardList size={24} color="#000" />
        </NativeTabs.Trigger.Icon>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="actual">
        <NativeTabs.Trigger.Label>Nhập Thực Tế</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon>
          <CheckSquare size={24} color="#000" />
        </NativeTabs.Trigger.Icon>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
