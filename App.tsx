import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Routes from './src/routes'; 
import { StatusBar } from 'expo-status-bar';

import { setupDatabase } from './src/services/database';
import { ThemeProvider, useTheme } from './src/pages/TemasAcoes/Temas';

function AppStatusBar() {
  const { isDarkMode } = useTheme();
  return <StatusBar style={isDarkMode ? "light" : "dark"} />;
}

export default function App() {
  useEffect(() => {
    setupDatabase();
  }, []);

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
            <Routes />
            <AppStatusBar />
        </NavigationContainer>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}