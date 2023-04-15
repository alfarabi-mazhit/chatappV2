import { View, Text, Button, Image } from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { FadeInView } from "../components/FadeInView";
import { TextInput, TouchableOpacity } from "react-native-gesture-handler";
import {
  pickImg,
  uploadImage,
} from "../components/utils";
import { auth, database } from "../config/firebase";
import { updateProfile } from "@firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SetProfile() {
  const navigation = useNavigation();
  const [displayName, setDisplayName] = useState("");
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
      const { url } = await uploadImage(
        selectedImg,
        `images/users/${user.uid}`,
        "profilePicture"
      );
      photoURL = url;
    }
    const userData = {
      displayName,
      email: user.email,
      publicKey: JSON.parse(await AsyncStorage.getItem("publicKey" + user.uid)),
    };
    if (photoURL) {
      userData.photoURL = photoURL;
    }
    await Promise.all([
      updateProfile(user, userData),
      setDoc(doc(database, "users", user.uid), { ...userData, uid: user.uid }),
    ])
      .then(navigation.navigate("Home"))
      .catch((e) => {
        alert("Ошибка соединения. Повторите позже"), setButton(false);
      });
  }

  async function handleProfilePicture() {
    try {
      const result = await pickImg({
        mediaType: "photo",
        quality: 0.5,
        includeBase64: false,
      });
      if (!result.didCancel) {
        console.log(result);
        const uploadResult = await uploadImage(result.uri, "profile_pictures");
        setSelectedImg(uploadResult.url);
      }
    } catch (error) {
      console.log(error);
      alert("Failed to get image");
    }
  }
  
  // (async () => {
    // console.log(JSON.parse(await AsyncStorage.getItem("publicKey" + auth.currentUser.uid)));
    // console.log(auth.currentUser);
  // })();

  return (
    <View style={{ flex: 1 }}>
      {/*View style={{ flex: 1 }} || React.Fragment*/}
      <FadeInView
        style={{
          flex: 1,
          alignItems: "center",
          marginTop: 90,
          padding: 35,
        }}
      >
        <Text style={{ fontSize: 22 }}>Информация профиля</Text>
        <Text
          style={{
            fontSize: 14,
            paddingTop: 20,
            textAlign: "center",
          }}
        >
          Введите ваше имя пользователя и фото:
        </Text>
        <TouchableOpacity
          onPress={handleProfilePicture}
          style={{
            marginTop: 30,
            width: 120,
            height: 120,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f57c00",
            borderRadius: 100,
          }}
          disabled={button}
        >
          {!selectedImg ? (
            // <MaterialCommunityIcons size={45} name="camera-plus" />
            <Image
            source={{ }}
            style={{ width: 100, borderRadius: 100, height: 100 }}
          />
          ) : (
            <Image
              source={{ uri: selectedImg }}
              style={{ width: 100, borderRadius: 100, height: 100 }}
            />
          )}
        </TouchableOpacity>
        <TextInput
          placeholder="Имя пользователя"
          value={displayName}
          onChangeText={setDisplayName}
          style={{
            marginTop: 40,
            borderBottomWidth: 2,
            borderBottomColor: "#f57c00",
            width: "100%",
            height: 30,
            fontSize: 22,
          }}
        />
        <View style={{ marginTop: 20, width: 120 }}>
          <Button
            title="продолжить"
            color={"#f57c00"}
            disabled={button||!displayName}
            onPress={handlePress}
          />
        </View>
      </FadeInView>
    </View>
  );
}
