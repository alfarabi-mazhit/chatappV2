import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useContext, useState} from 'react';
import {StyleSheet, View, ActivityIndicator} from 'react-native';
import {Context} from '../components/Context';
import {auth, database} from '../config/firebase';
import QuickCrypto from 'react-native-quick-crypto';
import {updateProfile} from '@firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  getDocs,
  where,
  query,
  orderBy,
  arrayUnion,
} from '@firebase/firestore';
const LoadingScreen = () => {
  const {user, setUser} = useContext(Context);
  const {checking, setChecking} = useContext(Context);
  const [keyPair, setKeyPair] = useState(null);

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const checkKeyPair = async () => {
    const publicKey = JSON.parse(
      await AsyncStorage.getItem('publicKey' + auth.currentUser.uid),
    );
    const privateKey = JSON.parse(
      await AsyncStorage.getItem('privateKey' + auth.currentUser.uid),
    );
    return publicKey && privateKey ? {publicKey, privateKey} : null;
  };
  const generateKeyPair = async () => {
    return new Promise((resolve, reject) => {
      QuickCrypto.generateKeyPair(
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
            console.log('Private Key is: ', privateKey);
            let enc = QuickCrypto.publicEncrypt(publicKey, Buffer.from('alfa', 'base64'));
            console.log(enc.toString('base64'),'proverka');
            let dec = QuickCrypto.privateDecrypt(privateKey, Buffer.from(enc, 'base64'));
            console.log(dec.toString('base64'),'proverka');
            await AsyncStorage.setItem(
              'publicKey' + auth.currentUser.uid,
              JSON.stringify(publicKey),
            );
            await AsyncStorage.setItem(
              'privateKey' + auth.currentUser.uid,
              JSON.stringify(privateKey),
            );
            resolve({publicKey, privateKey});
          } else {
            reject(err);
          }
        },
      );
    });
  };
  const checkPublicKey = async () => {
    const currentUser = auth.currentUser;
    const publicKey = JSON.parse(
      await AsyncStorage.getItem('publicKey' + auth.currentUser.uid),
    );
    const userProfile = await getUserProfile(currentUser.uid);
    console.log('ghv', userProfile?.publicKey !== publicKey);
    if (userProfile && userProfile?.publicKey !== publicKey) {
      const {publicKey, privateKey} = await generateKeyPair();
      const docRef = doc(database, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {publicKey});
        console.log('updatedKeyAtUser');
      } else {
        await setDoc(docRef, {publicKey});
        console.log('setKeyAtUser');
      }
      await updateUserPublicKey(currentUser.email, publicKey);
      return {publicKey, privateKey};
    }
    return null;
  };

  const updateUserPublicKey = async (userE, publicKey) => {
    const roomsQuery = query(
      collection(database, 'rooms'),
      where('participantsArray', 'array-contains', userE),
    );
    const roomsSnapshot = await getDocs(roomsQuery);
    roomsSnapshot.forEach(async roomDoc => {
      const roomRef = doc(database, 'rooms', roomDoc.id);
      const participants = roomDoc.data().participants;
      const participantIndex = Object.keys(participants).findIndex(
        id => participants[id].email === userE,
      );
      console.log('partIn', participantIndex);
      if (participantIndex >= 0) {
        const updatedParticipants = [
          ...participants.slice(0, participantIndex),
          {...participants[participantIndex], publicKey: publicKey},
          ...participants.slice(participantIndex + 1),
        ];
        await updateDoc(roomRef, {participants: updatedParticipants});
      }
    });
  };

  const getUserProfile = async userId => {
    const userRef = doc(database, 'users', userId);
    const docSnap = await getDoc(userRef);
    return docSnap.exists() ? docSnap.data() : null;
  };

  useEffect(() => {
    const loadKeyPair = async () => {
      // await AsyncStorage.removeItem('publicKey' + auth.currentUser.uid);
      // await AsyncStorage.removeItem('privateKey' + auth.currentUser.uid);
      const storedKeyPair = await checkKeyPair();
      console.log(storedKeyPair, 'mimi');
      if (storedKeyPair) {
        setKeyPair(storedKeyPair);
      } else {
        const generatedKeyPair = await generateKeyPair();
        setKeyPair(generatedKeyPair);
      }
    };

    const checkUserPublicKey = async () => {
      const publicKeyPair = await checkPublicKey();
      console.log('popopo');
      if (publicKeyPair) {
        setKeyPair(publicKeyPair);
      }
      setChecking(false);
    };
    loadKeyPair();
    checkUserPublicKey();
  }, []);
  // useEffect(() => {
  //   (async () => {
  //     let publicKey = await AsyncStorage.getItem(`publicKey${user.uid}`);
  //     let privateKey = await AsyncStorage.getItem(`privateKey${user.uid}`);
  //     if (publicKey == null || privateKey == null){
  //     const keyPair = QuickCrypto.generateKeyPair(
  //       'rsa',
  //       {
  //         modulusLength: 2048, // options
  //         publicExponent: 0x10101,
  //         publicKeyEncoding: {
  //           type: 'pkcs1',
  //           format: 'pem',
  //         },
  //         privateKeyEncoding: {
  //           type: 'pkcs8',
  //           format: 'pem',
  //         },
  //       },
  //       async (err, publicKey, privateKey) => {
  //         // Callback function
  //         if (!err) {
  //           // Prints new asymmetric key pair
  //           console.log('Public Key is : ', publicKey);
  //           await updateProfile(auth.currentUser, {
  //             publicKey: publicKey,
  //           });
  //           await AsyncStorage.setItem(
  //             'publicKey' + auth.currentUser.uid,
  //             JSON.stringify(publicKey),
  //           );
  //           console.log('Private Key is: ', privateKey);
  //           await AsyncStorage.setItem(
  //             'privateKey' + auth.currentUser.uid,
  //             JSON.stringify(privateKey),
  //           );
  //           setUser({...user, publicKey});
  //         } else {
  //           console.log('Errr is: ', err);
  //         }
  //       },
  //     );
  //     }
  //     // console.log(await AsyncStorage.getItem("publicKey"+auth.currentUser.uid),'uuuuuuuuuuuu');
  //   })();
  // }, []);
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
