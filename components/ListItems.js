import { useNavigation } from "@react-navigation/native";
import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Grid, Row, Col } from "react-native-easy-grid";
import Avatar from "./Avatar";

export function ListItem({
  type,
  description,
  user,
  style,
  time,
  room,
  image,
}) {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={{ height: 80, ...style }}
      onPress={() =>
        type === "contacts"
          ? navigation.replace("Chat", { user, room, image })
          : navigation.navigate("Chat", { user, room, image })
      }
    >
      <Grid style={{ maxHeight: 80 }}>
        <Col
          style={{ width: 80, alignItems: "center", justifyContent: "center" }}
        >
          <Avatar user={user} size={type === "contacts" ? 40 : 65} />
        </Col>
        <Col style={{ marginLeft: 10 }}>
          <Row style={{ alignItems: "center" }}>
            <Col>
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {user.contactName||user.displayName}
              </Text>
            </Col>
            {time && (
              <Col style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 11 }}>
                  {new Date(time.seconds * 1000).toLocaleString("ru-RU")}
                </Text>
              </Col>
            )}
          </Row>
          {description && (
            <Row style={{ marginTop: -5 }}>
              <Text style={{ fontSize: 13 }}>{description}</Text>
            </Row>
          )}
        </Col>
      </Grid>
    </TouchableOpacity>
  );
}
