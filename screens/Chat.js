import React, {useState, useEffect, useLayoutEffect, useCallback} from 'react';
import {TouchableOpacity, Text, View, StyleSheet, Image} from 'react-native';
import 'dayjs/locale/kk';
import Ionicons from 'react-native-vector-icons/Entypo';
import {pickImg, uploadImage} from '../components/utils';
import {
  GiftedChat,
  Send,
  Bubble,
  Time,
  Actions,
} from 'react-native-gifted-chat';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  orderBy,
  query,
  onSnapshot,
  getDoc,
} from 'firebase/firestore';
import 'react-native-get-random-values';
import {nanoid} from 'nanoid';
import {HeaderBackButton} from '@react-navigation/elements';
import {auth, database} from '../config/firebase';
import {useNavigation, useRoute} from '@react-navigation/native';
import Avatar from '../components/Avatar';
import ImageView from 'react-native-image-viewing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import crypto from 'react-native-quick-crypto';
import { serverTimestamp } from "firebase/firestore";
const randomId = nanoid();
export default function Chat() {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();
  const route = useRoute();
  const {currentUser} = auth;
  const room = route.params.room;
  const userB = route.params.user;
  const roomId = room ? room.id : randomId;
  const roomRef = doc(database, 'rooms', roomId);
  const roomMessagesRef = collection(database, 'rooms', roomId, 'messages');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageView, setSeletedImageView] = useState('');
  // const keyPair = QuickCrypto.generateKeyPair('rsa', {
  //   modulusLength: 2048,    // options
  //   publicExponent: 0x10101,
  //   publicKeyEncoding: {
  //     type: 'pkcs1',
  //     format: 'pem'
  //   },
  //   privateKeyEncoding: {
  //     type: 'pkcs8',
  //     format: 'pem',
  //   }
  // }, (err, publicKey, privateKey) => { // Callback function
  //        if(!err)
  //        {
  //          // Prints new asymmetric key pair
  //          console.log("Public Key is : ", publicKey);
  //          console.log();
  //          console.log("Private Key is: ", privateKey);
  //        }
  //        else
  //        {
  //          // Prints error
  //          console.log("Errr is: ", err);
  //        }
  //   });

  // useEffect(() => {
  //   (async () => {
  //     // console.log(userB.userDoc,'ub');
  //     // console.log(currentUser,'ua');
  //     if (!room) {
  //       const currentUserData = {
  //         uid: currentUser.uid,
  //         displayName: currentUser.displayName,
  //         email: currentUser.email,
  //         publicKey: JSON.parse(
  //           await AsyncStorage.getItem('publicKey' + currentUser.uid),
  //         ),
  //       };
  //       if (currentUser.photoURL) {
  //         currentUserData.photoURL = currentUser.photoURL;
  //       }
  //       const userBData = {
  //         uid: userB.userDoc.uid,
  //         displayName: userB.userDoc.displayName,
  //         email: userB.userDoc.email,
  //         publicKey: userB.userDoc.publicKey,
  //       };
  //       if (userB.userDoc.photoURL) {
  //         userBData.photoURL = userB.userDoc.photoURL;
  //       }
  //       const roomData = {
  //         participants: [currentUserData, userBData],
  //         participantsArray: [currentUser.email, userB.email],
  //       };
  //       try {
  //         console.log(roomRef);
  //         console.log(roomData);
  //         await setDoc(roomRef, roomData);
  //       } catch (error) {
  //         console.log(error, 'fff');
  //       }
  //     }
  //     let participants = (await getDoc(roomRef)).data().participants;
  //     if (participants.every(part => part.uid === auth.currentUser.uid)) {
  //       console.log('1');
  //       setPublicKeyB(
  //         await AsyncStorage.getItem('publicKey' + auth.currentUser.uid),
  //       );
  //     } else {
  //       console.log('2');
  //       console.log(
  //         participants.find(
  //           participant => participant.uid !== auth.currentUser.uid,
  //         ).publicKey,
  //       );
  //       let x = participants.find(
  //         participant => participant.uid !== auth.currentUser.uid,
  //       ).publicKey;
  //       setPublicKeyB(x);
  //     }
  //   })();
  // }, [publicKeyB]);
  useEffect(() => {
  //   const getPublicKey = async () => {
  //     let participants = (await getDoc(roomRef)).data().participants;
  //     if (participants.every(part => part.uid === auth.currentUser.uid)) {
  //       console.log('1');
  //       setPublicKeyB(
  //         await AsyncStorage.getItem('publicKey' + auth.currentUser.uid),
  //       );
  //     } else {
  //       console.log('2');
  //       console.log(
  //         participants.find(
  //           participant => participant.uid !== auth.currentUser.uid,
  //         ).publicKey,
  //       );
  //       let x = participants.find(
  //         participant => participant.uid !== auth.currentUser.uid,
  //       ).publicKey;
  //       setPublicKeyB(x);
  //     }
  //   };
    const initializeChat = async () => {
      if (!room) {
        const currentUserData = {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          email: currentUser.email,
          // publicKey: JSON.parse(
          //   await AsyncStorage.getItem('publicKey' + currentUser.uid),
          // ),
        };
        if (currentUser.photoURL) {
          currentUserData.photoURL = currentUser.photoURL;
        }
        const userBData = {
          uid: userB.userDoc.uid,
          displayName: userB.userDoc.displayName,
          email: userB.userDoc.email,
          // publicKey: userB.userDoc.publicKey,
        };
        if (userB.userDoc.photoURL) {
          userBData.photoURL = userB.userDoc.photoURL;
        }
        const roomData = {
          participants: [currentUserData, userBData],
          participantsArray: [currentUser.email, userB.email],
        };
        try {
          console.log(roomRef);
          console.log(roomData);
          await setDoc(roomRef, roomData);
        } catch (error) {
          console.log(error, 'fff');
        }
      }
    };
    initializeChat();
  }, []);
  
  useEffect(() => {
    (async () => {
        const q = query(roomMessagesRef, orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, querySnapshot => {
          setMessages(
            querySnapshot.docs.map(doc => {
              console.log('msg');
              return {
                ...doc.data(),
                text: doc.data()
                  .text,
                createdAt: doc.data().createdAt.toDate(),
              };
            }),
          );
        });
        return unsubscribe;
    })();
  }, []);
  const Title = () => {
    return (
      <View
        style={Object.assign({}, styles.chatButton, styles.headerChatButton)}>
        <View>
          <Avatar size={40} user={route.params.user} />
        </View>
        <View
          style={{
            marginLeft: 15,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{color: '#fff'}}>
            {route.params.user.contactName || route.params.user.displayName}
          </Text>
        </View>
      </View>
    );
  };
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => Title(),
      headerBackTitleVisible: false,
      headerLeft: props => (
        <View
          style={Object.assign(
            {width: 50, alignItems: 'center', marginLeft: 5, paddingLeft: 10},
            styles.chatButton,
          )}>
          <HeaderBackButton
            {...props}
            tintColor="#fff"
            onPress={() => navigation.goBack()}
          />
        </View>
      ),
      headerStyle: {height: 100},
      headerTitleContainerStyle: {paddingBottom: 10},
      headerLeftContainerStyle: {paddingBottom: 10},
      headerRightContainerStyle: {paddingBottom: 10},
    });
  }, [navigation]);

  const onSend = useCallback(async (messagess = []) => {
    let {_id, createdAt, text, user} = messagess[0];
      await Promise.all([
        addDoc(roomMessagesRef, {
          _id,
          createdAt,
          text: text,
          user,
        }),
        updateDoc(roomRef, {lastMessage: {...messagess[0], text: text}}),
      ])
        .catch(e => alert('Ошибка отправки...' + e))
        .then(
          setMessages(previousMessages =>
            GiftedChat.append(previousMessages, messagess),
          ),
        );
  }, []);

  function renderSend(props) {
    return (
      <Send {...props}>
        <View
          style={{
            marginBottom: 2,
            marginRight: 20,
            marginLeft: 35,
            borderRadius: 100,
            borderColor: 'transparent',
            borderWidth: 1,
            paddingLeft: 10,
            paddingRight: 10,
            paddingTop: 10,
            paddingBottom: 10,
            backgroundColor: '#f57c00',
          }}>
          <Text style={{color: '#fff', fontWeight: '600', fontSize: 14}}>
            Отправить
          </Text>
        </View>
      </Send>
    );
  }
  function renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: '#f57c00',
          },
        }}
        textStyle={{
          left: {
            color: '#fff',
          },
        }}
      />
    );
  }
  function renderTime(props) {
    return (
      <Time
        {...props}
        timeTextStyle={{
          left: {
            color: '#fff',
          },
          right: {
            color: '#fff',
          },
        }}
      />
    );
  }
  async function sendImage(uri) {
    const {url, fileName} = await uploadImage(uri, `images/rooms/${roomId}`);
    const message = {
      _id: fileName,
      text: '',
      createdAt: new Date(),
      user: {
        name: auth?.currentUser?.displayName,
        _id: auth?.currentUser?.email,
        avatar: auth?.currentUser?.photoURL ? auth.currentUser.photoURL : '',
      },
      image: url,
    };
    const lastMessage = {...message, text: 'Image'};
    await Promise.all([
      addDoc(roomMessagesRef, message),
      updateDoc(roomRef, {lastMessage}),
    ]);
  }
  async function handlePhotoPicker() {
    const result = await pickImg();
    if (!result.canceled) {
      await sendImage(result.assets[0].uri);
    }
  }
  function renderActions(props) {
    return (
      <Actions
        {...props}
        containerStyle={{
          position: 'absolute',
          right: 125,
          bottom: 0,
          zIndex: 9999,
        }}
        onPressActionButton={handlePhotoPicker}
        icon={() => <Ionicons name="camera" size={27} />}
      />
    );
  }
  return (
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={false}
      showUserAvatar={false}
      alwaysShowSend
      locale="kk"
      renderSend={renderSend}
      renderBubble={renderBubble}
      renderActions={renderActions}
      renderTime={renderTime}
      renderMessageImage={props => {
        return (
          <View style={{borderRadius: 15, padding: 2}}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(true);
                setSeletedImageView(props.currentMessage.image);
              }}>
              <Image
                resizeMode="contain"
                style={{
                  width: 200,
                  height: 200,
                  padding: 6,
                  borderRadius: 15,
                  resizeMode: 'cover',
                }}
                source={{uri: props.currentMessage.image}}
              />
              {selectedImageView ? (
                <ImageView
                  imageIndex={0}
                  visible={modalVisible}
                  onRequestClose={() => setModalVisible(false)}
                  images={[{uri: selectedImageView}]}
                />
              ) : null}
            </TouchableOpacity>
          </View>
        );
      }}
      timeFormat="LT"
      dateFormat="LLLL"
      onSend={messages => {
        if (messages.length) {
          onSend(messages);
        }
      }}
      messagesContainerStyle={{
        backgroundColor: '#fff',
      }}
      textInputStyle={{
        backgroundColor: '#fff',
        borderRadius: 20,
      }}
      user={{
        name: auth?.currentUser?.displayName,
        _id: auth?.currentUser?.email,
        avatar: auth?.currentUser?.photoURL ? auth?.currentUser?.photoURL : '',
      }}
    />
  );
}

const styles = StyleSheet.create({
  headerChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 5,
    paddingRight: 5,
  },
  chatButton: {
    backgroundColor: '#f57c00',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    shadowColor: '#f57c00',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
});

// import React, {
//   useState,
//   useEffect,
//   useLayoutEffect,
//   useCallback,
//   useRef,
// } from 'react';
// import {TouchableOpacity, Text, View, StyleSheet, Image} from 'react-native';
// import 'dayjs/locale/kk';
// import Icon from 'react-native-vector-icons/Entypo';
// import {pickImg, uploadImage} from '../components/utils';
// import {
//   GiftedChat,
//   Send,
//   Bubble,
//   Time,
//   Actions,
// } from 'react-native-gifted-chat';
// import {
//   collection,
//   doc,
//   setDoc,
//   addDoc,
//   updateDoc,
//   orderBy,
//   query,
//   onSnapshot,
//   getDoc,
//   where,
// } from 'firebase/firestore';
// import 'react-native-get-random-values';
// import {nanoid} from 'nanoid';
// import {HeaderBackButton} from '@react-navigation/elements';
// import {auth, database, timestamp} from '../config/firebase';
// import {useNavigation, useRoute} from '@react-navigation/native';
// import Avatar from '../components/Avatar';
// import ImageView from 'react-native-image-viewing';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import RSAKey from 'react-native-rsa';
// const randomId = nanoid();
// export default function Chat() {
//   const [messages,setMessages] = useState([]);
//   const navigation = useNavigation();
//   const route = useRoute();
//   const {currentUser} = auth;
//   const room = route.params.room;
//   const userB = route.params.user;
//   const roomId = room ? room.id : randomId;
//   const roomRef = doc(database, 'rooms', roomId);
//   const roomMessagesRef = collection(database, 'rooms', roomId, 'messages');
//   const [modalVisible, setModalVisible] = useState(false);
//   const [selectedImageView, setSeletedImageView] = useState('');
//   const publicKeyB = useRef([]);
//   const [start, setStart] = useState(false);
//   let rsaB = new RSAKey();
//   let rsaA = new RSAKey();

//   useEffect(() => {
//     (async () => {
//       // console.log(userB.userDoc,'ub');
//       // console.log(currentUser,'ua');
//       if (!room) {
//         const currentUserData = {
//           uid: currentUser.uid,
//           displayName: currentUser.displayName,
//           email: currentUser.email,
//           publicKey: JSON.parse(
//             await AsyncStorage.getItem('publicKey' + currentUser.uid),
//           ),
//         };
//         if (currentUser.photoURL) {
//           currentUserData.photoURL = currentUser.photoURL;
//         }
//         const userBData = {
//           uid: userB.userDoc.uid,
//           displayName: userB.userDoc.displayName,
//           email: userB.userDoc.email,
//           publicKey: userB.userDoc.publicKey,
//         };
//         if (userB.userDoc.photoURL) {
//           userBData.photoURL = userB.userDoc.photoURL;
//         }
//         const roomData = {
//           participants: [currentUserData, userBData],
//           participantsArray: [currentUser.email, userB.email],
//         };
//         try {
//           console.log('roomRef' + roomRef);
//           console.log('roomData' + roomData);
//           await setDoc(roomRef, roomData);
//         } catch (error) {
//           console.log(error, 'error!');
//         }
//       }
//       let participants = (await getDoc(roomRef)).data().participants;
//       if (participants.every(part => part.uid === auth.currentUser.uid)) {
//         publicKeyB.current = await AsyncStorage.getItem(
//           'publicKey' + auth.currentUser.uid,
//         );
//         rsaB.setPublicString(publicKeyB);
//       } else {
//         publicKeyB.current = participants.find(
//           participant => participant.uid !== auth.currentUser.uid,
//         ).publicKey;
//       }
//       console.log(publicKeyB.current, 'pblckB');
//       rsaB.setPublicString(publicKeyB.current);
//       console.log(rsaB, 'rsaB');
//       rsaA.setPrivateString(
//         JSON.parse(
//           await AsyncStorage.getItem('privateKey' + auth.currentUser.uid),
//         ),
//       );
//       console.log(rsaA, 'rsaA');
//       const lastUpdatedAt = await AsyncStorage.getItem(
//         `room_${roomId}_${auth.currentUser.uid}`,
//       );
//       console.log(lastUpdatedAt, 'aas');
//       const q = query(roomMessagesRef, orderBy('createdAt', 'asc'));
//       const queryWithLastUpdatedAt = lastUpdatedAt
//         ? query(
//             roomMessagesRef,
//             where(
//               'createdAt',
//               '>',
//               timestamp(new Date(JSON.parse(lastUpdatedAt)).getTime()),
//             ),
//           )
//         : q;
//       const unsubscribe = onSnapshot(queryWithLastUpdatedAt, async querySnapshot => {
//         const newMessages = querySnapshot.docs.map(doc => ({
//           ...doc.data(),
//           text: doc.data().text,
//           createdAt: doc.data().createdAt.toDate(),
//         }));
//         console.log(newMessages[newMessages.length - 1]?.createdAt, 'pp');
//         if (!lastUpdatedAt) {
//             console.log('asd');
//           await AsyncStorage.setItem(
//             `room_${roomId}_${auth.currentUser.uid}`,
//             JSON.stringify(newMessages[newMessages.length - 1].createdAt),
//           );
//           setMessages(...messages,newMessages);
//           console.log(messages,'as');
//         } else {
//           console.log(await AsyncStorage.getItem(
//             `room_${roomId}_${auth.currentUser.uid}_messages`,
//           ))
//           setMessages(...messages, newMessages);
//         }
//       });
//       return unsubscribe;
//     })();
//   }, []);
//   const Title = () => {
//     return (
//       <View
//         style={Object.assign({}, styles.chatButton, styles.headerChatButton)}>
//         <View>
//           <Avatar size={40} user={route.params.user} />
//         </View>
//         <View
//           style={{
//             marginLeft: 15,
//             alignItems: 'center',
//             justifyContent: 'center',
//           }}>
//           <Text style={{color: '#fff'}}>
//             {route.params.user.contactName || route.params.user.displayName}
//           </Text>
//         </View>
//       </View>
//     );
//   };
//   useLayoutEffect(() => {
//     navigation.setOptions({
//       headerTitle: () => Title(),
//       headerBackTitleVisible: false,
//       headerLeft: props => (
//         <View
//           style={Object.assign(
//             {width: 50, alignItems: 'center', marginLeft: 5, paddingLeft: 10},
//             styles.chatButton,
//           )}>
//           <HeaderBackButton
//             {...props}
//             tintColor="#fff"
//             onPress={() => navigation.goBack()}
//           />
//         </View>
//       ),
//       headerStyle: {height: 100},
//       headerTitleContainerStyle: {paddingBottom: 10},
//       headerLeftContainerStyle: {paddingBottom: 10},
//       headerRightContainerStyle: {paddingBottom: 10},
//     });
//   }, [navigation]);

//   const onSend = useCallback(async (messagess = []) => {
//     let {_id, createdAt, text, user} = messagess[0];
//     if (start) {
//       //let entext = rsaB.encrypt(text);
//       // console.log(entext,'weqe',text);
//       await Promise.all([
//         addDoc(roomMessagesRef, {
//           _id,
//           createdAt,
//           text: text,
//           user,
//         }),
//         updateDoc(roomRef, {lastMessage: {...messagess[0], text: text}}),
//       ])
//         .catch(e => alert('Ошибка отправки...' + e))
//         .then(
//           setMessages(previousMessages =>
//             GiftedChat.append(previousMessages, messagess),
//           ),
//         );
//     }
//   }, []);

//   function renderSend(props) {
//     return (
//       <Send {...props}>
//         <View
//           style={{
//             marginBottom: 2,
//             marginRight: 20,
//             marginLeft: 35,
//             borderRadius: 100,
//             borderColor: 'transparent',
//             borderWidth: 1,
//             paddingLeft: 10,
//             paddingRight: 10,
//             paddingTop: 10,
//             paddingBottom: 10,
//             backgroundColor: '#f57c00',
//           }}>
//           <Text style={{color: '#fff', fontWeight: '600', fontSize: 14}}>
//             Отправить
//           </Text>
//         </View>
//       </Send>
//     );
//   }
//   function renderBubble(props) {
//     return (
//       <Bubble
//         {...props}
//         wrapperStyle={{
//           left: {
//             backgroundColor: '#f57c00',
//           },
//         }}
//         textStyle={{
//           left: {
//             color: '#fff',
//           },
//         }}
//       />
//     );
//   }
//   function renderTime(props) {
//     return (
//       <Time
//         {...props}
//         timeTextStyle={{
//           left: {
//             color: '#fff',
//           },
//           right: {
//             color: '#fff',
//           },
//         }}
//       />
//     );
//   }
//   async function sendImage(uri) {
//     const {url, fileName} = await uploadImage(uri, `images/rooms/${roomId}`);
//     const message = {
//       _id: fileName,
//       text: '',
//       createdAt: new Date(),
//       user: {
//         name: auth?.currentUser?.displayName,
//         _id: auth?.currentUser?.email,
//         avatar: auth?.currentUser?.photoURL ? auth.currentUser.photoURL : '',
//       },
//       image: url,
//     };
//     const lastMessage = {...message, text: 'Image'};
//     await Promise.all([
//       addDoc(roomMessagesRef, message),
//       updateDoc(roomRef, {lastMessage}),
//     ]);
//   }
//   async function handlePhotoPicker() {
//     const result = await pickImg();
//     if (!result.canceled) {
//       await sendImage(result.assets[0].uri);
//     }
//   }
//   function renderActions(props) {
//     return (
//       <Actions
//         {...props}
//         containerStyle={{
//           position: 'absolute',
//           right: 125,
//           bottom: 0,
//           zIndex: 9999,
//         }}
//         onPressActionButton={handlePhotoPicker}
//         icon={() => <Icon name="camera" size={27} />}
//       />
//     );
//   }
//   return (
//     <GiftedChat
//       messages={messages}
//       showAvatarForEveryMessage={false}
//       showUserAvatar={false}
//       alwaysShowSend
//       locale="kk"
//       inverted={false}
//       renderSend={renderSend}
//       renderBubble={renderBubble}
//       renderActions={renderActions}
//       renderTime={renderTime}
//       renderMessageImage={props => {
//         return (
//           <View style={{borderRadius: 15, padding: 2}}>
//             <TouchableOpacity
//               onPress={() => {
//                 setModalVisible(true);
//                 setSeletedImageView(props.currentMessage.image);
//                 console.log(modalVisible,'modqw');
//               }}>
//               <Image
//                 resizeMode="contain"
//                 style={{
//                   width: 200,
//                   height: 200,
//                   padding: 6,
//                   borderRadius: 15,
//                   resizeMode: 'cover',
//                 }}
//                 source={{uri: props.currentMessage.image}}
//               />
//               {selectedImageView ? (
//                 <ImageView
//                   imageIndex={0}
//                   visible={modalVisible}
//                   onRequestClose={() => setModalVisible(false)}
//                   images={[{uri: selectedImageView}]}
//                 />
//               ) : null}
//             </TouchableOpacity>
//           </View>
//         );
//       }}
//       timeFormat="LT"
//       dateFormat="LLLL"
//       onSend={messages => {
//         if (messages.length) {
//           onSend(messages);
//         }
//       }}
//       messagesContainerStyle={{
//         backgroundColor: '#fff',
//       }}
//       textInputStyle={{
//         backgroundColor: '#fff',
//         borderRadius: 20,
//       }}
//       user={{
//         name: auth?.currentUser?.displayName,
//         _id: auth?.currentUser?.email,
//         avatar: auth?.currentUser?.photoURL ? auth?.currentUser?.photoURL : '',
//       }}
//     />
//   );
// }

// const styles = StyleSheet.create({
//   headerChatButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingLeft: 5,
//     paddingRight: 5,
//   },
//   chatButton: {
//     backgroundColor: '#f57c00',
//     height: 50,
//     borderRadius: 25,
//     justifyContent: 'center',
//     shadowColor: '#f57c00',
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.9,
//     shadowRadius: 8,
//   },
// });
