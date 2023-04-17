import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useContext} from 'react';
import {StyleSheet, View, ActivityIndicator} from 'react-native';
import {Context} from '../components/Context';
import {auth} from '../config/firebase';
import QuickCrypto from 'react-native-quick-crypto';
import { updateProfile } from "@firebase/auth";
const LoadingScreen = () => {
  const {user, setUser} = useContext(Context);
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      let publicKey = await AsyncStorage.getItem(`publicKey${user.uid}`);
      let privateKey = await AsyncStorage.getItem(`privateKey${user.uid}`);
      if (publicKey == null || privateKey == null){
      const keyPair = QuickCrypto.generateKeyPair(
        'rsa',
        {
          modulusLength: 2048, // options
          publicExponent: 0x10101,
          publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
          },
          privateKeyEncoding: {
            type: 'pkcs8',
            format: 'pem',
          },
        },
        async (err, publicKey, privateKey) => {
          // Callback function
          if (!err) {
            // Prints new asymmetric key pair
            console.log('Public Key is : ', publicKey);
            await updateProfile(auth.currentUser, {
              publicKey: publicKey,
            });
            await AsyncStorage.setItem(
              'publicKey' + auth.currentUser.uid,
              JSON.stringify(publicKey),
            );
            console.log('Private Key is: ', privateKey);
            await AsyncStorage.setItem(
              'privateKey' + auth.currentUser.uid,
              JSON.stringify(privateKey),
            );
            setUser({...user, publicKey});
          } else {
            console.log('Errr is: ', err);
          }
        },
      );
      }
      // console.log(await AsyncStorage.getItem("publicKey"+auth.currentUser.uid),'uuuuuuuuuuuu');
    })();
  }, []);
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#f57c00" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingScreen;
