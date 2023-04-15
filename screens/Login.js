import React, {useState, useContext} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Image,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import {signInWithEmailAndPassword, signInWithPhoneNumber} from 'firebase/auth';
import {auth} from '../config/firebase';
import {Context, Provider} from '../components/Context';

export default function Login({navigation}) {
  const {user, setUser} = useContext(Context);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [button, setButton] = useState(false);
  async function onHandleLogin() {
    if (email !== '' && password !== '') {
      setButton(true);
      await signInWithEmailAndPassword(auth, email, password)
        .then(() => console.log('Login success'))
        .catch(err => {
          setButton(false), Alert.alert('Login error', err.message);
        });
    }
  }

  return (
    <View style={styles.container}>
      <Image /*source={backImage}*/ style={styles.backImage} />
      {/* <Text style={styles.backText}>Chatify</Text> */}
      <View style={styles.whiteSheet} />
      {!button ? (
        <SafeAreaView style={styles.form}>
          <Text style={styles.title}>Log In</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoFocus={false}
            value={email}
            onChangeText={text => setEmail(text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={true}
            textContentType="password"
            value={password}
            onChangeText={text => setPassword(text)}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={onHandleLogin}
            disabled={button}>
            <Text style={{fontWeight: 'bold', color: '#fff', fontSize: 18}}>
              {' '}
              Log In
            </Text>
          </TouchableOpacity>
          <View
            style={{
              marginTop: 20,
              flexDirection: 'row',
              alignItems: 'center',
              alignSelf: 'center',
            }}>
            <Text style={{color: 'gray', fontWeight: '600', fontSize: 14}}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('Signup', {
                  animationTypeForReplace: 'push',
                })
              }
              disabled={button}>
              <Text
                style={{
                  color: '#f57c00',
                  fontWeight: '600',
                  fontSize: 14,
                }}>
                {' '}
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      ) : (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" />
        </View>
      )}

      <StatusBar barStyle="light-content" />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'orange',
    alignSelf: 'center',
    paddingBottom: 24,
  },
  input: {
    backgroundColor: '#F6F7FB',
    height: 58,
    marginBottom: 20,
    fontSize: 16,
    borderRadius: 10,
    padding: 12,
  },
  backImage: {
    width: '100%',
    height: 340,
    position: 'absolute',
    top: 0,
    resizeMode: 'cover',
    backgroundColor: '#f57c00',
  },
  backText: {
    position: 'absolute',
    top: '10%',
    width: '100%',
    textAlign: 'center',
    fontSize: 52,
  },
  whiteSheet: {
    width: '100%',
    height: '75%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
  },
  form: {
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 30,
  },
  button: {
    backgroundColor: '#f57c00',
    height: 58,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
});
// import React, { useRef, useState } from "react";
// import { StyleSheet, Text, View, Button, TextInput, Image, SafeAreaView, TouchableOpacity, StatusBar, Alert } from "react-native";
// import { signInWithPhoneNumber,PhoneAuthProvider, signInWithCredential } from "firebase/auth";
// import { auth } from "../config/firebase";

// export default function Login({ navigation }) {
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [verificationId, setVerificationId] = useState("");
//   const [verificationCode, setVerificationCode] = useState("");
//   const [button, setButton] = useState(false);
//   const [sent, setSent] = useState(false);
//   const [error, setError] = useState(null);
//   const recaptchaVerifier = useRef(null);
//   const onHandleSendCode = () => {
//     signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier.current)
//       .then((res) => {
//         setVerificationId(res.verificationId);
//         setButton(false);
//         setSent(true);
//         setError(null);
//       })
//       .catch((err) => {
//         setButton(false);
//         setError(err.message);
//       });
//     setButton(true);
//   };

//   const onHandleVerification = () => {
//     const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
//     signInWithCredential(auth, credential)
//       .then((res) => {
//         console.log(res);
//         setButton(false);
//       })
//       .catch((err) => {
//         setButton(false);
//         setError(err.message);
//       });
//     setButton(true);
//   };

//   return (
//     <View style={styles.container}>
//       <Image /*source={backImage}*/ style={styles.backImage} />
//       {/* <Text style={styles.backText}>Chatify</Text> */}
//       <View style={styles.whiteSheet} />
//       <SafeAreaView style={styles.form}>
//         <Text style={styles.title}>Log In</Text>
//         {sent ? (
//           <>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter verification code"
//               keyboardType="number-pad"
//               textContentType="oneTimeCode"
//               autoFocus={false}
//               value={verificationCode}
//               onChangeText={(text) => setVerificationCode(text)}
//             />
//             {error && <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>}
//             <TouchableOpacity style={styles.button} onPress={onHandleVerification} disabled={button}>
//               <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>Verify Code</Text>
//             </TouchableOpacity>
//           </>
//         ) : (
//           <>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter phone number"
//               keyboardType="phone-pad"
//               autoFocus={false}
//               value={phoneNumber}
//               onChangeText={(text) => setPhoneNumber(text)}
//             />
//             {error && <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text>}
//             <TouchableOpacity style={styles.button} onPress={onHandleSendCode} disabled={button}>
//               <Text style={{ fontWeight: "bold", color: "#fff", fontSize: 18 }}>Send Code</Text>
//             </TouchableOpacity>
//           </>
//         )}
//         <View style={{ marginTop: 20, flexDirection: "row", alignItems: "center", alignSelf: "center" }}>
//           <Text style={{ color: "gray", fontWeight: "600", fontSize: 14 }}>Don't have an account? </Text>
//           <TouchableOpacity onPress={() => navigation.navigate("Signup")} disabled={button}>
//             <Text style={{ color: '#f57c00', fontWeight: '600', fontSize: 14 }}> Sign Up</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//       <StatusBar barStyle="light-content" />
//     </View>
//   );
// }
