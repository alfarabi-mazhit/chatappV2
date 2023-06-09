import {View, StyleSheet, FlatList, Text, Image} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import {HeaderBackButton} from '@react-navigation/elements';
import {WidthInView} from '../components/WidthInView';
import {LetterByLetterText} from '../components/LetterByLetter';

export default function About() {
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      headerTitle: props => <Title />,
      headerStyle: {height: 100},
      headerBackTitleVisible: false,
      headerLeft: props => (
        <View style={Object.assign({width: 50, alignItems: 'center', marginLeft: 5, paddingLeft: 10}, styles.chatButton)}>
          <HeaderBackButton {...props} tintColor="#fff" onPress={() => navigation.goBack()} />
        </View>
      ),
      headerLeftContainerStyle: {paddingBottom: 10},
      headerRightContainerStyle: {paddingBottom: 10},
      headerTintColor: '#fff',
    });
  }, [navigation]);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>ChatAppV2 © Mazhit Alfarabi</Text>
      <Text>KazNU, 2023</Text>
      <Text>email: a-mazhit@mail.ru</Text>
      <Text>phone: +77473643838</Text>
    </View>
  );
}
function Title() {
  return (
    <View style={{width: 200, alignItems: 'center'}}>
      <WidthInView style={Object.assign({marginBottom: 10}, styles.chatButton, styles.headerChatButton)}>
        <LetterByLetterText marginR={0} textStyle={{color: '#fff', fontSize: 18, fontWeight: 'bold'}}>
          About
        </LetterByLetterText>
        <Image style={{width: 30, height: 30}} source={require('../assets/about-icon.png')}></Image>
      </WidthInView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 50,
  },
  headerChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
