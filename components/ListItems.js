import {useNavigation} from '@react-navigation/native';
import React, {useContext, useRef} from 'react';
import {Text, TouchableOpacity} from 'react-native';
import {Grid, Row, Col} from 'react-native-easy-grid';
import Avatar from './Avatar';
import {Context} from './Context';
import ActionSheet from 'react-native-actionsheet';
import {auth} from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
export function ListItem({id, type, description, user, style, time, room, image}) {
  const navigation = useNavigation();
  const {rooms, setRooms} = useContext(Context);
  let actionSheet = useRef();
  let options = ['Удалить', 'Отмена'];
  const handleDeleteChat = async () => {
    const updatedRooms = [...rooms];
    updatedRooms.splice(id, 1);
    setRooms(updatedRooms);
    await AsyncStorage.setItem(`rooms_${auth.currentUser.uid}`, JSON.stringify(updatedRooms));
  };

  return (
    <TouchableOpacity
      style={{height: 80, ...style}}
      onLongPress={() => {
        if (type !== 'contacts') {
          actionSheet.current.show();
        }
      }}
      onPress={() => (type === 'contacts' ? navigation.replace('Chat', {user, room, image}) : navigation.navigate('Chat', {user, room, image}))}>
      <Grid style={{maxHeight: 80}}>
        <Col style={{width: 80, alignItems: 'center', justifyContent: 'center'}}>
          <Avatar user={user} size={type === 'contacts' ? 40 : 65} />
        </Col>
        <Col style={{marginLeft: 10}}>
          <Row style={{alignItems: 'center'}}>
            <Col>
              <Text style={{fontWeight: 'bold', fontSize: 16}}>{user.contactName || user.displayName}</Text>
              <Text style={{fontSize: 12}}>{user.email}</Text>
            </Col>
            {time && (
              <Col style={{alignItems: 'flex-end'}}>
                <Text style={{fontSize: 11}}>{new Date(time.seconds * 1000).toLocaleString('ru-RU')}</Text>
              </Col>
            )}
          </Row>
          {description && (
            <Row style={{marginTop: -5}}>
              <Text style={{fontSize: 13}}>{description}</Text>
            </Row>
          )}
        </Col>
      </Grid>
      <ActionSheet
        options={options}
        ref={actionSheet}
        cancelButtonIndex={1}
        destructiveButtonIndex={0}
        onPress={index => {
          if (index == 0) {
            handleDeleteChat();
          }
        }}
      />
    </TouchableOpacity>
  );
}
