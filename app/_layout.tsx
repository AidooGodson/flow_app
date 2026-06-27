import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { View } from 'react-native';
import { colors } from '../constants/theme';
import { UserProvider } from '../lib/UserContext';

const NAVY = colors.brand.navy;

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: NAVY }} />;
  }

  return (
    <UserProvider>
      <StatusBar style="light" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="report/[id]"
          options={{
            title: 'Report Detail',
            headerStyle: { backgroundColor: NAVY },
            headerTintColor: colors.white,
            headerTitleStyle: { fontFamily: 'Inter_700Bold', fontSize: 16 },
          }}
        />
      </Stack>
    </UserProvider>
  );
}
