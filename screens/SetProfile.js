import {View, Text, Button, Image, Alert} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {FadeInView} from '../components/FadeInView';
import {TextInput, TouchableOpacity} from 'react-native-gesture-handler';
import {pickImgg, uploadImage} from '../components/utils';
import {auth, database} from '../config/firebase';
import {updateProfile} from '@firebase/auth';
import {doc, setDoc, updateDoc, getDoc} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SetProfile() {
  const navigation = useNavigation();
  const [displayName, setDisplayName] = useState('');
  const [selectedImg, setSelectedImg] = useState(null);
  const [button, setButton] = useState(false);
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  async function handlePress() {
    setButton(true);
    const user = auth.currentUser;
    let photoURL;
    if (selectedImg) {
      photoURL = selectedImg;
    }
    const userData = {
      displayName,
      email: user.email,
      publicKey: JSON.parse(await AsyncStorage.getItem('publicKey' + user.uid)),
      uid: user.uid,
    };
    if (photoURL) {
      userData.photoURL = photoURL;
    }
    const docRef = doc(database, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      await updateDoc(docRef, {...userData});
    } else {
      await setDoc(docRef, {...userData});
    }
    await Promise.all([updateProfile(user, userData)])
      .then(navigation.navigate('Home'))
      .catch(e => {
        alert('Ошибка соединения. Повторите позже'), setButton(false);
      });
  }
  async function handleProfilePicture() {
    try {
      const result = await pickImgg();
      if (!result.didCancel) {
        console.log(result);
        Alert.alert('', result);
        const uploadResult = await uploadImage(result.assets[0].uri, 'images/users/' + auth.currentUser.uid + '/');
        setSelectedImg(uploadResult.url);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('', 'Failed to get image' + error);
    }
  }

  // (async () => {
  // console.log(JSON.parse(await AsyncStorage.getItem("publicKey" + auth.currentUser.uid)));
  // console.log(auth.currentUser);
  // })();

  return (
    <View style={{flex: 1}}>
      {/*View style={{ flex: 1 }} || React.Fragment*/}
      <FadeInView
        style={{
          flex: 1,
          alignItems: 'center',
          marginTop: 90,
          padding: 35,
        }}>
        <Text style={{fontSize: 22}}>Информация профиля</Text>
        <Text
          style={{
            fontSize: 14,
            paddingTop: 20,
            textAlign: 'center',
          }}>
          Введите ваше имя пользователя и фото:
        </Text>
        <TouchableOpacity
          onPress={handleProfilePicture}
          style={{
            marginTop: 30,
            width: 120,
            height: 120,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f57c00',
            borderRadius: 100,
          }}
          disabled={button}>
          {!selectedImg ? (
            // <MaterialCommunityIcons size={45} name="camera-plus" />
            <Image source={{}} style={{width: 100, borderRadius: 100, height: 100}} />
          ) : (
            <Image source={{uri: selectedImg}} style={{width: 100, borderRadius: 100, height: 100}} />
          )}
        </TouchableOpacity>
        <TextInput
          placeholder="Имя пользователя"
          value={displayName}
          onChangeText={setDisplayName}
          style={{
            marginTop: 40,
            borderBottomWidth: 2,
            borderBottomColor: '#f57c00',
            width: '100%',
            height: 30,
            fontSize: 22,
          }}
        />
        <View style={{marginTop: 20, width: 120}}>
          <Button title="продолжить" color={'#f57c00'} disabled={button || !displayName} onPress={handlePress} />
        </View>
      </FadeInView>
    </View>
  );
}