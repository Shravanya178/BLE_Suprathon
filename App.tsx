/**
 * Bluetooth Chat App - MVP 1
 * Peer-to-Peer Offline Chat via Bluetooth
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {StatusBar} from 'react-native';
import DeviceListScreen from './src/components/DeviceListScreen';
import ChatScreen from './src/components/ChatScreen';
import {NavigationParamList} from './src/types';

const Stack = createStackNavigator<NavigationParamList>();

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" />
      <Stack.Navigator
        initialRouteName="DeviceList"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="DeviceList"
          component={DeviceListScreen}
          options={{
            title: 'Bluetooth Chat',
          }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{
            title: 'Chat',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
