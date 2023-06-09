import React, {useEffect, useContext, useRef} from 'react';
import {View, TouchableOpacity, Text, Image, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import colors from '../colors';
import {onSnapshot, collection, where, query, orderBy} from '@firebase/firestore';
import {auth, database, timestamp} from '../config/firebase';
import {signOut} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Context, useContacts, ListItem, WidthInView, LetterByLetterText} from '../components';
import Icon from 'react-native-vector-icons/Entypo';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
function LogoTitle() {
  return (
    <WidthInView style={Object.assign({}, styles.chatButton, styles.headerChatButton)}>
      <LetterByLetterText textStyle={{color: '#fff', fontSize: 18, fontWeight: 'bold'}}>Chats</LetterByLetterText>
      <Icon name="chat" size={24} color={colors.lightGray} />
    </WidthInView>
  );
}
const Home = () => {
  const navigation = useNavigation();
  const contacts = useContacts();
  const {currentUser} = auth;
  const {rooms, setRooms} = useContext(Context);
  const unsubscribeRef = useRef(null);

  const onSignOut = async () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      await AsyncStorage.removeItem('user');
    }
    signOut(auth).catch(error => console.log('Error logging out: ', error));
  };

  const chatsQuery = query(
    collection(database, 'rooms'),
    where('participantsArray', 'array-contains', currentUser.email),
    orderBy('lastMessage.createdAt', 'desc'),
  );

  const LAST_UPDATED_AT = 'roomsUPD';
  useEffect(() => {
    (async () => {
      try {
        // await AsyncStorage.clear();
        let storedRooms = JSON.parse(await AsyncStorage.getItem(`rooms_${auth.currentUser.uid}`));
        // console.log('storedRooms', storedRooms);
        if (storedRooms !== null && storedRooms?.length > 0) {
          setRooms(storedRooms);
        } else {
          setRooms([]);
          console.log('пусто');
        }
      } catch (error) {
        console.error('Error getting stored rooms:', error);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        let lastUpdatedAt = await AsyncStorage.getItem(`${LAST_UPDATED_AT}_${auth.currentUser.uid}`);
        console.log('lastupd', timestamp(new Date(JSON.parse(lastUpdatedAt)).getTime()));
        const queryWithLastUpdatedAt =
          lastUpdatedAt != null
            ? query(chatsQuery, where('lastMessage.createdAt', '>', timestamp(new Date(JSON.parse(lastUpdatedAt)).getTime())))
            : chatsQuery;
        const unsubscribe = onSnapshot(queryWithLastUpdatedAt, async querySnapshot => {
          const parsedChats = querySnapshot.docs.map((doc, i) => {
            console.log(doc.data().participants.find(p => p.email));

            const userB =
              doc.data().participants.find(p => p.email !== currentUser.email) || doc.data().participants.find(p => p.email === currentUser.email);

            return {
              ...doc.data(),
              id: doc.id,
              userB,
            };
          });
          console.log(parsedChats, 'parsedChats');
          if (parsedChats.length > 0) {
            const lastChatUpdatedAt = parsedChats[0].lastMessage.createdAt;
            console.log('NEW lastUPD', lastChatUpdatedAt.toDate(), lastChatUpdatedAt);
            await AsyncStorage.setItem(`${LAST_UPDATED_AT}_${auth.currentUser.uid}`, JSON.stringify(lastChatUpdatedAt.toDate()));
            let storedRooms = JSON.parse(await AsyncStorage.getItem(`rooms_${auth.currentUser.uid}`)) || [];
            const updatedRooms = [...storedRooms];
            for (let i = parsedChats.length - 1; i >= 0; i--) {
              const roomIndex = updatedRooms.findIndex(room => room.id === parsedChats[i].id);
              if (roomIndex !== -1) {
                updatedRooms.splice(roomIndex, 1);
                updatedRooms.unshift(parsedChats[i]);
              } else {
                updatedRooms.unshift(parsedChats[i]);
              }
            }
            console.log(updatedRooms, 'updr');
            await AsyncStorage.setItem(`rooms_${auth.currentUser.uid}`, JSON.stringify(updatedRooms));
            setRooms(updatedRooms);
          }
        });
        unsubscribeRef.current = unsubscribe;
        return unsubscribe;
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    })();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={()=>navigation.navigate('About')} style={Object.assign({}, styles.chatButton, {marginLeft: 15})}>
          <FontAwesome name="star" size={24} color={'#fff'} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 10,
          }}
          onPress={onSignOut}>
          <AntDesign name="logout" size={24} color={colors.gray} style={{marginRight: 10}} />
        </TouchableOpacity>
      ),
      headerTitle: props => <LogoTitle />,
      headerStyle: {height: 100},
      headerTitleContainerStyle: {paddingBottom: 10},
      headerLeftContainerStyle: {paddingBottom: 10},
      headerRightContainerStyle: {paddingBottom: 10},
    });
  }, [navigation]);
  function getUserB(user, contacts) {
    let userContact;
    if (contacts.length > 0) {
      userContact = contacts.find(c => c.email === user.email);
      if (userContact && userContact.contactName) {
        return {...user, contactName: userContact.contactName};
      }
    }
    return user;
  }
  return (
    <View style={styles.container}>
      <View style={{flex: 1, padding: 5, paddingRight: 10}}>
        {rooms.map((room, i) => (
          <ListItem
            id={i}
            type="chat"
            description={room.lastMessage?.text}
            key={room.id}
            room={room}
            time={room.lastMessage?.createdAt}
            user={getUserB(room.userB, contacts)}></ListItem>
        ))}
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Contacts')} style={Object.assign({}, styles.chatButton, styles.chatButton1)}>
        <Icon name="plus" size={24} color={colors.lightGray} />
      </TouchableOpacity>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerChatButton: {
    flexDirection: 'row',
    width: 200,
  },
  chatButton: {
    backgroundColor: colors.primary,
    height: 50,
    width: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  chatButton1: {
    position: 'absolute',
    right: 20,
    bottom: 50,
  },
});
