import React, { useContext, useRef, useState, useEffect } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import scanStyles from "../styles/scan";
import { ScanScreenContext } from "../contexts/ScanScreenContext";
import { EnrichedUser } from "../types";
import { ScanBottomSheet } from "./ScanBottomSheet";
import { Divider } from "@rneui/themed";

type Ref = {
  displayComponent: () => void;
};

export const ListTab = ({ route }) => {
  // Context variables
  const { enrichedUsers, setSelectedUserIndex } = useContext(ScanScreenContext);

  // State variables
  const [searchParticipantText, setSearchParticipantText] = useState("");

  useEffect(() => {
    console.log("Init ListTab");
  }, []);

  // Components
  type EnrichedUserItemProps = {
    enrichedUser: EnrichedUser;
    index: number;
  };
  const EnrichedUserItem = ({ enrichedUser, index }: EnrichedUserItemProps) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedUserIndex(index);
        handleCallFunction();
      }}
    >
      <View
        style={{
          flexDirection: "row",
          width: "90%",
          marginLeft: "5%",
          justifyContent: "space-between",
          paddingBottom: "5%",
        }}
      >
        <Text style={scanStyles.blackText}>
          {enrichedUser.last_name}, {enrichedUser.first_name}
        </Text>
        <Text style={scanStyles.blackText}>
          {
            enrichedUser.kentoEntities.filter(
              (kentoEntity) => kentoEntity.isUsed
            ).length
          }{" "}
          / {enrichedUser.kentoEntities.length}
          {"  "}
          <Icon
            name="circle"
            size={15}
            color={
              enrichedUser.kentoEntities.filter(
                (kentoEntity) => kentoEntity.isUsed
              ).length == 0
                ? "white"
                : enrichedUser.kentoEntities.filter(
                    (kentoEntity) => kentoEntity.isUsed
                  ).length == enrichedUser.kentoEntities.length
                ? "green"
                : "orange"
            }
          ></Icon>
        </Text>
      </View>
      <Divider></Divider>
    </TouchableOpacity>
  );

  // Ref to trigger BottomSheet display
  const ref = useRef<Ref>(null!);
  const handleCallFunction = (): void => ref?.current?.displayComponent();

  return (
    <View style={scanStyles.mainContainer}>
      <Text style={scanStyles.boldBlackText}>
        {enrichedUsers
          .map(
            ({ kentoEntities }) =>
              kentoEntities.filter((kentoEntity) => {
                if (kentoEntity.isUsed) {
                  return true;
                }
                return false;
              }).length
          )
          .reduce((a, b) => a + b, 0)}
        /
        {enrichedUsers
          .map((enrichedUser) => enrichedUser.kentoEntities.length)
          .reduce((a, b) => a + b)}{" "}
        {enrichedUsers
          .map((enrichedUser) => enrichedUser.kentoEntities.length)
          .reduce((a, b) => a + b) > 1
          ? "passes"
          : "pass"}{" "}
        scanned
      </Text>
      <TextInput
        value={searchParticipantText}
        onChangeText={(searchParticipantText) =>
          setSearchParticipantText(searchParticipantText)
        }
        placeholder="Search participant"
        style={scanStyles.textInput}
      />
      <FlatList
        data={enrichedUsers.filter(
          (enrichedUser) =>
            enrichedUser.first_name
              .toLowerCase()
              .includes(searchParticipantText.toLowerCase()) ||
            enrichedUser.last_name
              .toLowerCase()
              .includes(searchParticipantText.toLowerCase()) ||
            enrichedUser.email
              .toLowerCase()
              .includes(searchParticipantText.toLowerCase())
        )}
        renderItem={({ item, index }) => (
          <EnrichedUserItem enrichedUser={item} index={index} />
        )}
        keyExtractor={(item) => item.email}
      />
      <ScanBottomSheet ref={ref}></ScanBottomSheet>
    </View>
  );
};
