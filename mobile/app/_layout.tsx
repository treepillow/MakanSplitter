import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BillProvider } from "../context/BillContext";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BillProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </BillProvider>
    </GestureHandlerRootView>
  );
}
