import React from 'react';
import { StatusBar, Text } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <AppNavigator />
      </Provider>
    </SafeAreaProvider>
  );
};

export default App;
