import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useContext } from "react";
import { StyleSheet, View, ActivityIndicator } from "react-native";
import { Context } from "../components/Context";
import { auth } from "../config/firebase";
const LoadingScreen = () => {
  const { user, setUser } = useContext(Context);
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    (async () => {
      // let rsa = new RSAKey();
      // rsa.generate(1024, "10001");
    //   console.log(rsa);
    //   console.log(rsa.getPublicString());
      try {
        // await AsyncStorage.setItem(
        //   "privateKey" + auth.currentUser.uid,
        //   JSON.stringify(rsa.getPrivateString())
        // );
        // await AsyncStorage.setItem(
        //   "publicKey" + auth.currentUser.uid,
        //   JSON.stringify(rsa.getPublicString())
        // );
        // let publicKey = rsa.getPublicString();
        // console.log(await updateProfile(auth.currentUser, {
        //   publicKey: publicKey,
        // }),'zhestt');
        // console.log(
        //   "publicKey"+
        //   auth.currentUser.uid,
        //   JSON.stringify(rsa.getPublicString())
        // );
        // console.log(await AsyncStorage.getItem("publicKey"+auth.currentUser.uid),'uuuuuuuuuuuu');
        // setUser({ ...user, publicKey });
      } catch (e) {
        console.log(e);
      }
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
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingScreen;
