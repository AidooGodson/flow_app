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
import { useEffect } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '../constants/theme';
import { UserProvider, useUser } from '../lib/UserContext';
import { LoginScreen } from '../components/LoginScreen';

SplashScreen.preventAutoHideAsync();

const NAVY = colors.brand.navy;

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  if (loading) return <View style={{ flex: 1, backgroundColor: NAVY }} />;
  if (!user)   return <LoginScreen />;
  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <UserProvider>
      <StatusBar style="light" />
      <AuthGate>
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
      </AuthGate>
    </UserProvider>
  );
}
