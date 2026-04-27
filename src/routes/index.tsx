import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import Login from '../pages/login';
import Cadastro from '../pages/Cadastro';
import Welcome from '../pages/welcome';
import QuemSomos from '../pages/QuemSomos';
import MeusDados from '../pages/MeusDados';

const Stack = createStackNavigator();

export default function Routes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={Login} /> 
      <Stack.Screen name="Cadastro" component={Cadastro} />
      <Stack.Screen name="welcome" component={Welcome} /> 
      <Stack.Screen name="MeusDados" component={MeusDados} /> 
      <Stack.Screen name="QuemSomos" component={QuemSomos} />
    </Stack.Navigator>
  );
}