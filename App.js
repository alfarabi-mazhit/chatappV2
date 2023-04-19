import React, {useState, useContext, useEffect, memo} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {onAuthStateChanged} from 'firebase/auth';
import {auth} from './config/firebase';
import {Context, Provider} from './components/Context';
import Login from './screens/Login';
import Signup from './screens/Signup';
import Chat from './screens/Chat';
import Home from './screens/Home';
import SetProfile from './screens/SetProfile';
import Contacts from './screens/Contacts';
import LoadingScreen from './screens/LoadingScreen';

const Stack = createStackNavigator();

function ChatStack() {
  const {user, setUser} = useContext(Context);
  const {checking, setChecking} = useContext(Context);
  return (
    <Stack.Navigator /* defaultScreenOptions={Home} */>
      {/* {console.log(user, "ussrr")} */}
      {checking && <Stack.Screen name="LoadingScreen" component={LoadingScreen} />}
      {!user.displayName && (
        <Stack.Screen name="setProfile" component={SetProfile} />
      )}
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Contacts" component={Contacts} />
      <Stack.Screen name="Chat" component={Chat} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  const {checking, setChecking} = useContext(Context);
  setChecking(true);
  return (
    <Stack.Navigator
      screenOptions={{headerShown: false, animationEnabled: false}}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Signup" component={Signup} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const {user, setUser} = useContext(Context);
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(
      auth,
      async authenticatedUser => {
        console.log(authenticatedUser);
        // if (authenticatedUser && !authenticatedUser.emailVerified) {
        //   Alert.alert(
        //     'Email not verified',
        //     'Please verify your email before logging in.',
        //   );
        //   auth.signOut();
        // }
        authenticatedUser
          ? (await AsyncStorage.setItem(
              'user',
              JSON.stringify(authenticatedUser),
            ),
            setUser(authenticatedUser))
          : (await AsyncStorage.removeItem('user'), setUser(null));
      },
    );
    return unsubscribeAuth;
  }, []);

  return (
    <NavigationContainer>
      {user ? <ChatStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <Provider>
      <RootNavigator />
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
