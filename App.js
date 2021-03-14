import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { LoginScreen } from './LoginScreen';
import {SignUp} from './SignUp';
import {CalendarPlanScreen} from './CalendarPlanScreen';


const Stack = createStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Login"   
        screenOptions={{
          headerShown: true,
          headerLeft:null
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUp} />
        <Stack.Screen name="Home Screen" component={CalendarPlanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;