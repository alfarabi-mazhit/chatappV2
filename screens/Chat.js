import React, {useState, useEffect, useLayoutEffect, useCallback} from 'react';
import {TouchableOpacity, Text, View, StyleSheet, Image} from 'react-native';
// import 'dayjs/locale/kk';
import Entypo from 'react-native-vector-icons/Entypo';
import {pickImg, uploadMedia} from '../components/utils';
import {GiftedChat, Send, Bubble, Time, Actions} from 'react-native-gifted-chat';
import {collection, doc, setDoc, addDoc, getDoc, deleteDoc, updateDoc, orderBy, query, onSnapshot, where} from '@firebase/firestore';
import {timestamp,storage,auth, database} from '../config/firebase';
import { ref, deleteObject } from "firebase/storage";
import 'react-native-get-random-values';
import {nanoid} from 'nanoid';
import {HeaderBackButton} from '@react-navigation/elements';
import {useNavigation, useRoute} from '@react-navigation/native';
import Avatar from '../components/Avatar';
import ImageView from 'react-native-image-viewing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import crypto from 'react-native-quick-crypto';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
const audioRecorderPlayer = new AudioRecorderPlayer();

export default function Chat() {
  const randomId = nanoid();
  const navigation = useNavigation();
  const route = useRoute();
  const [messages, setMessages] = useState([]);
  const [recordTime, setRecordTime] = useState(0);
  const [audioPath, setAudioPath] = useState(null);
  const [player, setPlayer] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageView, setSeletedImageView] = useState('');
  const {currentUser} = auth;
  let room = route.params.room;
  const userB = route.params.user;
  const roomId = room ? room.id : randomId;
  const roomRef = doc(database, 'rooms', roomId);
  let cipher, decipher;

  function getUniqueMessages(messages) {
    const uniqueMessages = [];
    const ids = [];
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (!ids.includes(message._id)) {
        uniqueMessages.unshift(message);
        ids.push(message._id);
      }
    }

    return uniqueMessages;
  }

  const initializeChat = async () => {
    if (!room) {
      console.log('createroom');
      const currentUserData = {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        email: currentUser.email,
        publicKey: JSON.parse(await AsyncStorage.getItem('publicKey' + currentUser.uid)),
      };
      if (currentUser.photoURL) {
        currentUserData.photoURL = currentUser.photoURL;
      }
      const userBData = {
        uid: userB.userDoc.uid,
        displayName: userB.userDoc.displayName,
        email: userB.userDoc.email,
        publicKey: userB.userDoc.publicKey,
      };
      if (userB.userDoc.photoURL) {
        userBData.photoURL = userB.userDoc.photoURL;
      }
      // key = crypto.randomBytes(32); // 256-bit ключ
      // iv = crypto.randomBytes(16); // 128-bit вектор инициализации
      // await AsyncStorage.setItem('AESkey' + roomId.toString() + auth.currentUser.uid, key.toString('base64'));
      // await AsyncStorage.setItem('AESiv' + roomId.toString() + auth.currentUser.uid, iv.toString('base64'));
      // let encKey = crypto.publicEncrypt(userBData.publicKey, Buffer.from(key, 'base64'));
      // let encIv = crypto.publicEncrypt(userBData.publicKey, Buffer.from(iv, 'base64'));
      // let keygen = {
      //   key: encKey.toString('base64'),
      //   iv: encIv.toString('base64'),
      //   createdby: auth.currentUser.email,
      // };
      const roomData = {
        participants: [currentUserData, userBData],
        participantsArray: [currentUser.email, userB.email],
        // keygen,
      };
      try {
        console.log(roomRef);
        console.log(roomData);
        await setDoc(roomRef, roomData);
        const roomDoc = await getDoc(roomRef);
        room = roomDoc.data();
      } catch (error) {
        console.log(error, 'fff');
      }
    }
    // if ((key == null || iv == null) && room) {
    //   try {
    //     let pk = await AsyncStorage.getItem('privatekey' + auth.currentUser.uid);
    //     key = crypto.privateDecrypt(pk, Buffer.from(room.keygen.key, 'base64'));
    //     iv = crypto.privateDecrypt(pk, Buffer.from(room.keygen.iv, 'base64'));
    //   } catch (e) {
    //     console.log(e);
    //   }
    // }
  };

  //let getKeys = async () => {
  //   try {
  //     let pk = JSON.parse(await AsyncStorage.getItem('privateKey' + auth.currentUser.uid));
  //     key = crypto.privateDecrypt(pk, Buffer.from(room.keygen.key, 'base64'));
  //     iv = crypto.privateDecrypt(pk, Buffer.from(room.keygen.iv, 'base64'));
  //     await AsyncStorage.setItem('AESkey' + roomId.toString() + auth.currentUser.uid, key.toString('base64'));
  //     await AsyncStorage.setItem('AESiv' + roomId.toString() + auth.currentUser.uid, iv.toString('base64'));
  //   } catch (e) {
  //     console.log(e, 'jvh');
  //   }
  // };
  useEffect(() => {
    (async () => {
      try {
        let storedMessages = JSON.parse(await AsyncStorage.getItem(`room${roomId}_${auth.currentUser.uid}`)) || [];
        storedMessages = getUniqueMessages(storedMessages);
        console.log('storedMessages', storedMessages.length);
        if (storedMessages !== null && storedMessages?.length > 0) {
          setMessages(storedMessages);
        } else {
          setMessages([]);
          console.log('пусто');
        }
      } catch (error) {
        console.error('Error getting stored messages:', error);
      }
      //key = (await AsyncStorage.getItem('AESkey' + roomId.toString() + auth.currentUser.uid)) || null;
      //iv = (await AsyncStorage.getItem('AESiv' + roomId.toString() + auth.currentUser.uid)) || null;
      //console.log(key, iv, 'AESkeys');
      // if ((key == null || iv == null) && room) {
      //   getKeys();
      // } else if (key != null && iv != null && room) {
      //   key = Buffer.from(key, 'base64');
      //   iv = Buffer.from(iv, 'base64');
      //   console.log(key, iv, 'aeskeyss');
      // }
    })();
  }, []);

  const roomMessagesRef = collection(database, 'rooms', roomId, 'messages');
  useEffect(() => {
    (async () => {
      let lastUpdatedAt = await AsyncStorage.getItem(`roomMSGUPD${roomId}_${auth.currentUser.uid}`);
      console.log('lastupd', timestamp(new Date(JSON.parse(lastUpdatedAt)).getTime()));
      const q = query(roomMessagesRef, orderBy('createdAt', 'desc'));
      let queryWithLastUpdatedAt =
        lastUpdatedAt != null ? query(q, where('createdAt', '>', timestamp(new Date(JSON.parse(lastUpdatedAt)).getTime()))) : q;
      const unsubscribe = onSnapshot(queryWithLastUpdatedAt, async querySnapshot => {
        const parsedMessages = querySnapshot.docs.map(doc => {
          console.log('msg');
          return {
            docId: doc.id,
            ...doc.data(),
            text: doc.data().text,
            createdAt: doc.data().createdAt.toDate(),
          };
        });
        console.log(parsedMessages.length, parsedMessages);
        if (parsedMessages.length > 0) {
          const lastChatUpdatedAt = parsedMessages[0].createdAt;
          console.log('NEW lastMESSAGEUPD', lastChatUpdatedAt);
          await AsyncStorage.setItem(`roomMSGUPD${roomId}_${auth.currentUser.uid}`, JSON.stringify(lastChatUpdatedAt));
          let storedMessages = JSON.parse(await AsyncStorage.getItem(`room${roomId}_${auth.currentUser.uid}`)) || [];
          console.log('storedMessages', storedMessages);
          const updatedMessages = [...storedMessages];
          let c = 0;
          for (let i = parsedMessages.length - 1; i >= 0; i--) {
            if (parsedMessages[i].user._id !== auth.currentUser.email) {
              if (parsedMessages[i].audio === undefined && parsedMessages[i].image === undefined) {
                try {
                  let pk = JSON.parse(await AsyncStorage.getItem('privateKey' + auth.currentUser.uid));
                  let key = crypto.privateDecrypt(pk, Buffer.from(parsedMessages[i].key, 'base64'));
                  let iv = crypto.privateDecrypt(pk, Buffer.from(parsedMessages[i].iv, 'base64'));
                  console.log(key,'alek',iv);
                  decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                  parsedMessages[i].text =
                    Buffer.concat([decipher.update(Buffer.from(parsedMessages[i].text, 'base64')), decipher.final()]).toString() ||
                    parsedMessages[i].text;
                    console.log(parsedMessages[i].text);
                } catch (error) {
                  console.log(error);
                }
              } else {
                try {
                const userDirectory = `file://${RNFS.DocumentDirectoryPath}/users/${auth.currentUser.uid}`;
                const roomDirectory = `${userDirectory}/rooms/${roomId}`;
                if (!(await RNFS.exists(roomDirectory))) {
                  await RNFS.mkdir(roomDirectory, {intermediates: true});
                }
                const fileName = nanoid();
                let format, fromUrl;
                if (parsedMessages[i].image !== undefined) {
                  format = 'jpeg';
                  fromUrl = parsedMessages[i].image;
                } else if (parsedMessages[i].audio !== undefined) {
                  format = 'mp4';
                  fromUrl = parsedMessages[i].audio;
                }
                const filePath = `${roomDirectory}/${fileName}.${format}`;
                const options = {
                  fromUrl,
                  toFile: filePath,
                  background: true,
                  cacheable: true,
                };
                await RNFS.downloadFile(options)
                  .promise.then(res => {
                    console.log('File downloaded to: ', filePath, res);
                  })
                  .catch(e => {
                    console.log(e);
                  });
                const Data = await RNFS.readFile(filePath, 'base64');
                const ArrayBuffer = Buffer.from(Data, 'base64');
                let pk = JSON.parse(await AsyncStorage.getItem('privateKey' + auth.currentUser.uid));
                let key = crypto.privateDecrypt(pk, Buffer.from(parsedMessages[i].key, 'base64'));
                let iv = crypto.privateDecrypt(pk, Buffer.from(parsedMessages[i].iv, 'base64'));
                decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
                const decrypted = Buffer.concat([decipher.update(ArrayBuffer), decipher.final()]);
                await RNFS.writeFile(filePath + `.${format}`, decrypted.toString('base64'), 'base64');
                if (parsedMessages[i].image !== undefined) {
                  parsedMessages[i].image = filePath + `.${format}`;
                  console.log('IMAGEE');
                } else if (parsedMessages[i].audio !== undefined) {
                  parsedMessages[i].audio = filePath + `.${format}`;
                  console.log('AUDIOO');
                }
                const mediaRef = ref(storage, `media/rooms/${roomId}/${parsedMessages[i]._id}.${format}`);
                  deleteObject(mediaRef).then(() => {
                    console.log('Документ успешно удален из Firebase Storage');
                  }).catch((error) => {
                    console.error('Ошибка при удалении документа из Firebase Storage:', error);
                  });
                } catch (error) {
                  console.log(error);
                }
              }
              updatedMessages.unshift(parsedMessages[i]);
              deleteDoc(doc(roomMessagesRef, parsedMessages[i].docId))
                .then((e) => {
                  console.log('Документ успешно удален из Firebase Firestore'+e);
                })
                .catch((error) => {
                  console.error('Ошибка при удалении документа из Firebase Firestore:', error);
                });
              console.log('rabiiii');
              c++;
            }
          }
          if (c > 0) {
            const uniqueMessages = getUniqueMessages(updatedMessages);
            console.log('updatedUniqMessages', uniqueMessages);
            await AsyncStorage.setItem(`room${roomId}_${auth.currentUser.uid}`, JSON.stringify(uniqueMessages));
            setMessages(uniqueMessages);
          }
        }
      });
      return unsubscribe;
    })();
  }, []);
  const Title = () => {
    return (
      <View style={Object.assign({}, styles.chatButton, styles.headerChatButton)}>
        <View>
          <Avatar size={40} user={route.params.user} />
        </View>
        <View
          style={{
            marginLeft: 15,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}>
          <Text style={{color: '#fff'}}>{route.params.user.contactName || route.params.user.displayName}</Text>
          <Text style={{color: '#fff', fontSize: 12}}>{route.params.user.email}</Text>
        </View>
      </View>
    );
  };
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => Title(),
      headerBackTitleVisible: false,
      headerLeft: props => (
        <View style={Object.assign({width: 50, alignItems: 'center', marginLeft: 5, paddingLeft: 10}, styles.chatButton)}>
          <HeaderBackButton {...props} tintColor="#fff" onPress={() => navigation.goBack()} />
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
    console.log(room);
    if (!room) {
      await initializeChat();
    } else {
      const roomDoc = await getDoc(roomRef);
      room = roomDoc.data();
    }
    let key = crypto.randomBytes(32); // 256-bit ключ
    let iv = crypto.randomBytes(16); // 128-bit вектор инициализации  
    const participants = room.participants;
      const participantIndex = Object.keys(participants).findIndex(id => participants[id].email === auth.currentUser.email);
      const pI = Object.keys(participants).findIndex(id => participants[id].email !== auth.currentUser.email);
      if (pI < 0) {
        pI = participantIndex;
      }
    console.log(key,'asdasd',participants[pI]);
    let encKey = crypto.publicEncrypt(participants[pI].publicKey, Buffer.from(key, 'base64'));
    let encIv = crypto.publicEncrypt(participants[pI].publicKey, Buffer.from(iv, 'base64'));   
    cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let enc = Buffer.concat([cipher.update(text), cipher.final()]).toString('base64');
    console.log('akkk',_id,
      createdAt,
       enc,
      encKey.toString('base64'),
      encIv.toString('base64'),
      user,);
    await Promise.all([
      addDoc(roomMessagesRef, {
        _id,
        createdAt,
        text: enc,
        key: encKey.toString('base64'),
        iv: encIv.toString('base64'),
        user,
      }),
      updateDoc(roomRef, {
        lastMessage: {...messagess[0], text: 'Text💬'},
      }),
    ])
      .catch(e => alert('Ошибка отправки...' + e))
      .then(async () => {
        let mes = JSON.parse(await AsyncStorage.getItem(`room${roomId}_${auth.currentUser.uid}`)) || [];
        mes.unshift(messagess[0]);
        const uniqueMessages = getUniqueMessages(mes);
        setMessages(uniqueMessages);
        await AsyncStorage.setItem(`room${roomId}_${auth.currentUser.uid}`, JSON.stringify(uniqueMessages));
      });
  }, []);

  function renderSend(props) {
    return props.text.length > 0 ? (
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
          <Text style={{color: '#fff', fontWeight: '600', fontSize: 14}}>Send</Text>
        </View>
      </Send>
    ) : (
      <>
        <TouchableOpacity onPressIn={() => startRecording()} onPressOut={() => stopRecording()}>
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
            <Entypo name="mic" size={27} color="white" />
          </View>
        </TouchableOpacity>
      </>
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
  async function sendMedia(uri, mediaType, time, fName) {
    console.log('myurl', uri, room.participants);
    const {url, fileName, key, iv} = await uploadMedia(roomId, uri, `media/rooms/${roomId}`, mediaType, fName);
    if (!room) {
      await initializeChat();
    } else {
      const roomDoc = await getDoc(roomRef);
      room = roomDoc.data();
    }
    const participants = room.participants;
      const participantIndex = Object.keys(participants).findIndex(id => participants[id].email === auth.currentUser.email);
      const pI = Object.keys(participants).findIndex(id => participants[id].email !== auth.currentUser.email);
      if (pI < 0) {
        pI = participantIndex;
      }
    let encKey = crypto.publicEncrypt(participants[pI].publicKey, Buffer.from(key, 'base64'));
    let encIv = crypto.publicEncrypt(participants[pI].publicKey, Buffer.from(iv, 'base64')); 
    const message = {
      _id: fileName,
      text: '',
      createdAt: new Date(),
      key: encKey.toString('base64'),
      iv: encIv.toString('base64'),
      user: {
        name: auth?.currentUser?.displayName,
        _id: auth?.currentUser?.email,
        avatar: auth?.currentUser?.photoURL ? auth.currentUser.photoURL : '',
      },
      [mediaType]: url,
    };
    if (mediaType == 'audio') {
      message.audioDuration = time;
    }
    const lastMessage = {
      ...message,
      text: mediaType === 'image' ? 'Image📷' : 'Audio🎵',
    };
    await Promise.all([addDoc(roomMessagesRef, message), updateDoc(roomRef, {lastMessage})])
      .catch(e => alert('Ошибка отправки...' + e))
      .then(async () => {
        let mes = JSON.parse(await AsyncStorage.getItem(`room${roomId}_${auth.currentUser.uid}`)) || [];
        message[mediaType] = uri;
        mes.unshift(message);
        const uniqueMessages = getUniqueMessages(mes);
        setMessages(uniqueMessages);
        await AsyncStorage.setItem(`room${roomId}_${auth.currentUser.uid}`, JSON.stringify(uniqueMessages));
      });
  }

  const startRecording = async () => {
    const userDirectory = `file://${RNFS.DocumentDirectoryPath}/users/${auth.currentUser.uid}`;
    const roomDirectory = `${userDirectory}/rooms/${roomId}`;
    if (!(await RNFS.exists(roomDirectory))) {
      await RNFS.mkdir(roomDirectory, {intermediates: true});
    }
    const fileName = nanoid();
    const filePath = `${roomDirectory}/${fileName}.mp4`;
    await audioRecorderPlayer.startRecorder(filePath);
    audioRecorderPlayer.addRecordBackListener(e => {
      setRecordTime(Math.floor(e.currentPosition));
      console.log('Record back event received: ', e);
    });
    setAudioPath(filePath);
  };

  const stopRecording = async () => {
    audioRecorderPlayer.removeRecordBackListener();
    console.log('stop', audioPath);
    await audioRecorderPlayer.stopRecorder();
    if(recordTime>=1){
      sendMedia(audioPath, 'audio', recordTime);
    }
    setRecordTime(0);
  };

  const playAudio = async path => {
    if (player) {
      await player.stopPlayer();
    }
    console.log(path, 'player');
    await audioRecorderPlayer.startPlayer(path);
    audioRecorderPlayer.addPlayBackListener(e => {
      console.log(e);
    });
    setPlayer(audioRecorderPlayer);
  };

  const pauseAudio = async () => {
    await audioRecorderPlayer.pausePlayer();
  };

  const resumeAudio = async () => {
    await audioRecorderPlayer.resumePlayer();
  };
  // const stopAudio = async () => {
  //   await audioRecorderPlayer.stopPlayer();
  //   setPlayer(null);
  // };
  async function handlePhotoPicker() {
    if (!room) {
      await initializeChat();
    }
    const {filePath, fileName} = await pickImg();
    // console.log(filePath, 'filep', filePath && fileName);
    if (filePath && fileName) {
      console.log(filePath, 'filep');
      await sendMedia(filePath, 'image', 0, fileName);
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
        icon={() => <Entypo name="camera" size={27} />}
      />
    );
  }
  return (
    <GiftedChat
      messages={messages}
      showAvatarForEveryMessage={false}
      showUserAvatar={false}
      renderAvatar={null}
      textInputProps={{autoCapitalize: 'none'}}
      alwaysShowSend
      locale="kk"
      renderSend={renderSend}
      renderBubble={renderBubble}
      renderActions={renderActions}
      renderTime={renderTime}
      renderMessageAudio={props => {
        const duration = props.currentMessage.audioDuration / 1000;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const formattedDuration = `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
        return (
          <View style={{padding: 10, flexDirection: 'row', alignItems: 'center'}}>
            <TouchableOpacity
              onPress={() => {
                playAudio(props.currentMessage.audio);
              }}>
              {false ? <Entypo name="controller-stop" size={30} /> : <Entypo name="controller-play" size={30} />}
            </TouchableOpacity>
            <Text>{formattedDuration}</Text>
          </View>
        );
      }}
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
                <ImageView imageIndex={0} visible={modalVisible} onRequestClose={() => setModalVisible(false)} images={[{uri: selectedImageView}]} />
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
