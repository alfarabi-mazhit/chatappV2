import { View, Text, StyleSheet, FlatList } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { HeaderBackButton } from "@react-navigation/elements";
import { WidthInView } from "../components/WidthInView";
import { LetterByLetterText } from "../components/LetterByLetter";
import { collection, onSnapshot, query, where } from "@firebase/firestore";
import { ListItem } from "../components/ListItems";
import { Context } from "../components/Context";
import { auth, database } from "../config/firebase";
import { useContacts } from "../components/useHooks";

export default function Contacts() {
  const contacts = useContacts();
  const route = useRoute();
  const navigation = useNavigation();
  const image = route.params && route.params.image;
  useEffect(() => {
    navigation.setOptions({
      headerTitle: (props) => <Title />,
      headerStyle: { height: 100 },
      headerBackTitleVisible: false,
      headerLeft: (props) => (
        <View
          style={Object.assign(
            { width: 50, alignItems: "center", marginLeft: 5, paddingLeft: 10 },
            styles.chatButton
          )}
        >
          <HeaderBackButton
            {...props}
            tintColor="#fff"
            onPress={() => navigation.goBack()}
          />
        </View>
      ),
      headerLeftContainerStyle: { paddingBottom: 10 },
      headerRightContainerStyle: { paddingBottom: 10 },
      headerTintColor: "#fff",
    });
  }, [navigation]);
  if (!contacts.length) {
    return null;
  } else {
    return (
      <FlatList
        style={{ flex: 1, padding: 10 }}
        data={contacts}
        keyExtractor={(_, i) => i}
        renderItem={({ item }) => (
          <ContactPreview contact={item} image={image} />
        )}
      />
    );
  }
}

function ContactPreview({ contact, image }) {
  const { rooms } = useContext(Context);
  const [user, setUser] = useState(contact);
  useEffect(() => {
    const q = query(
      collection(database, "users"),
      where("email", "==", contact.email)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.docs.length) {
        const userDoc = snapshot.docs[0].data();
        setUser((prevUser) => ({ ...prevUser, userDoc }));
      }
    });
    return () => unsubscribe();
  }, []);
  if (!user.userDoc) {
    return null; // Возвращаем null, если данные еще не загружены
  }
  let room;
  if (user.email === auth.currentUser.email) {
    room = rooms.find((room) =>
      room.participantsArray.every((email) => email === user.email)
    );
  } else {
    room = rooms.find((room) => room.participantsArray.includes(user.email));
  }
  return (
    <ListItem
      style={{ marginTop: 7 }}
      type="contacts"
      user={user}
      image={image}
      room={room}
    />
  );
}

function Title() {
  return (
    <View style={{ width: 200, alignItems: "center" }}>
      <WidthInView
        style={Object.assign(
          { marginBottom: 10 },
          styles.chatButton,
          styles.headerChatButton
        )}
      >
        <LetterByLetterText
          marginR={0}
          textStyle={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}
        >
          Contacts
        </LetterByLetterText>
      </WidthInView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerChatButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatButton: {
    backgroundColor: "#f57c00",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    shadowColor: "#f57c00",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
});
