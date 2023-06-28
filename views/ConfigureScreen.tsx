import React, { useState, useEffect } from "react";
import {
  Image,
  FlatList,
  Text,
  View,
  Pressable,
  SafeAreaView,
} from "react-native";
import sharedStyles from "../styles/shared";
import configureStyles from "../styles/configure";
import { Event, Access, KentoEntity, User, EnrichedUser } from "../types";
import { Feather } from "@expo/vector-icons";

export const ConfigureScreen = ({ navigation, route }) => {
  // Functions
  const scannerInit = async (token: string) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      // body: formdata,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://kento.events/version-test/api/1.1/wf/scanner-init",
        requestOptions
      );
      const json = await response.json();
      console.log(json);
      if ("events_text" in json.response) {
        setEvents(JSON.parse(json.response.events_text));
      }
      if ("accesses_text" in json.response) {
        setAccesses(JSON.parse(json.response.accesses_text));
      }
      if ("scanner_terminal_id" in json.response) {
        setScanTerminal(json.response.scanner_terminal_id);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const unitSelectAccessesCall = async (
    token: String,
    accesses: Access[],
    cursor: number
  ) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions: RequestInit = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    try {
      const kentoEntityResponse = await fetch(
        `https://kento.events/version-test/api/1.1/obj/KentoEntity?cursor=${cursor}&api_token=${token}&constraints=[{ "key": "access","constraint_type":"in","value":[${accesses.map(
          ({ _id }) => '"' + _id + '"'
        )}]},{ "key": "status","constraint_type":"equals","value":"confirmed"}]`,
        requestOptions
      );
      const kentoEntityJSON = await kentoEntityResponse.json();
      console.log(`kentoEntityJSON : ${JSON.stringify(kentoEntityJSON)}`);
      if (
        "results" in kentoEntityJSON.response &&
        kentoEntityJSON.response.results.length > 0
      ) {
        const kentoEntities: [KentoEntity] = kentoEntityJSON.response.results;
        console.log(`kentoEntites :${kentoEntities.length}`);
        const userResponse = await fetch(
          `https://kento.events/version-test/api/1.1/obj/User?api_token=${token}&cursor=${cursor}&constraints=[{ "key": "_id", "constraint_type": "in", "value": [${kentoEntities
            .filter((item: KentoEntity) => item.owner !== undefined)
            .map(({ owner }) => '"' + owner + '"')}]}]`,
          requestOptions
        );
        // console.log(`response ${await userResponse.text()}`);
        const userJSON = await userResponse.json();
        console.log(`usersJSON: ${JSON.stringify(userJSON)}`);
        if (
          "results" in userJSON.response &&
          userJSON.response.results.length > 0
        ) {
          const users: [User] = userJSON.response.results;
          // console.log(`users: ${users[0].first_name}`);
          var enrichedUsers: EnrichedUser[] = [];
          for (const kentoEntity of kentoEntities) {
            kentoEntity.isUsed =
              kentoEntity.scan_terminal !== undefined &&
              kentoEntity.scan_terminal.length > 0;
            kentoEntity.isSelect = false;
            kentoEntity.toUpdate = false;
            var access: Access = accesses.find(
              (access) => access._id === kentoEntity.access
            );
            kentoEntity.accessName = access.name;
            kentoEntity.accessKentoType = access.kento_type;
            var userIndex = enrichedUsers.findIndex(
              // (user) => user._id === kentoEntity.owner
              (user) => user.email === kentoEntity.owner_email
            );
            if (userIndex !== -1) {
              enrichedUsers[userIndex].kentoEntities.push(kentoEntity);
            } else {
              var user: User = users.find(
                (user) => user._id === kentoEntity.owner
              );
              if (user === undefined) {
                const enrichedUser: EnrichedUser = {
                  email: user.authentication.email.email,
                  kentoEntities: [kentoEntity],
                };
                enrichedUsers.push(enrichedUser);
                // Handle missing owner fields in Bubble (deleted in 03.2023)
                // console.log(`error with kentoEntity: ${kentoEntity._id}`);
              } else {
                const enrichedUser: EnrichedUser = {
                  // _id: user._id,
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email: user.authentication.email.email,
                  kentoEntities: [kentoEntity],
                };
                enrichedUsers.push(enrichedUser);
              }
            }
          }

          return enrichedUsers;
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const selectAccesses = async (token: String, accesses: Access[]) => {
    // Prepare parallel requests
    const requestNumber: number = Math.ceil(
      accesses
        .map((access) => access.confirmed_quantity)
        .reduce((a, b) => a + b) / 100
    );

    try {
      const enrichedUsersList = await Promise.all(
        [...Array(requestNumber).keys()].map((cursor) =>
          unitSelectAccessesCall(token, accesses, 100 * cursor)
        )
      );
      const enrichedUsers = enrichedUsersList
        .flat()
        // Handle empty response
        .filter((enrichedUser) => enrichedUser !== undefined);
      const enrichedUsersKentoEntitiesNumber: number[] = enrichedUsers.map(
        (enrichedUser) => enrichedUser.kentoEntities.length
      );
      const nKentoEntities: number = enrichedUsersKentoEntitiesNumber.reduce(
        (a, b) => a + b
      );

      navigation.navigate("Scan", {
        token: route.params.token,
        accesses: accesses,
        nKentoEntities: nKentoEntities,
        enrichedUsers: enrichedUsers,
        scanTerminal: scanTerminal,
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  // Components
  type EventItemProps = {
    event: Event;
  };
  const EventItem = ({ event }: EventItemProps) => (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.6 : 1.0,
        },
      ]}
      onPress={() => {
        setSelectedEvent(event);
      }}
    >
      <View style={configureStyles.accessContainer}>
        <Text style={sharedStyles.blackText}>{event.name}</Text>
        {selectedEvent !== null && event._id === selectedEvent._id ? (
          <Feather name="x-square" size={24} color="black" />
        ) : (
          <Feather name="square" size={24} color="black" />
        )}
      </View>
    </Pressable>
  );

  const imageDict = {
    Artist: require("../assets/Artist.png"),
    Community: require("../assets/Community.png"),
    Guest: require("../assets/Guest.png"),
    Participant: require("../assets/Participant.png"),
  };
  type AccessItemProps = {
    access: Access;
  };
  const AccessItem = ({ access }: AccessItemProps) => (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.6 : 1.0,
        },
      ]}
      onPress={() => {
        selectItem(access);
      }}
    >
      <View style={configureStyles.accessContainer}>
        <View style={configureStyles.eventContainer}>
          <Image
            style={{
              width: 60,
              height: 60,
              borderRadius: 60 / 2,
              marginRight: 10,
            }}
            source={imageDict[access.kento_type]}
          />
          <Text style={sharedStyles.blackText}>{access.name}</Text>
        </View>
        {access.isSelect ? (
          <Feather name="x-square" size={24} color="black" />
        ) : (
          <Feather name="square" size={24} color="black" />
        )}
      </View>
    </Pressable>
  );

  const selectItem = (access: Access) => {
    access.isSelect = !access.isSelect;
    var newAccesses = Object.assign([], accesses);
    const index = newAccesses.findIndex((item) => item._id === access._id);
    newAccesses[index] = access;
    setAccesses(newAccesses);
  };

  // State variables
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event>(null);
  const [accesses, setAccesses] = useState<Access[]>([]);
  const [scanTerminal, setScanTerminal] = useState<string>("");

  // Init
  useEffect(() => {
    scannerInit(route.params.token);
  }, [navigation]);

  return (
    <SafeAreaView style={configureStyles.mainContainer}>
      <Text style={configureStyles.subtitle}>Select an event</Text>
      <FlatList
        data={events}
        renderItem={({ item }) => <EventItem event={item} />}
        keyExtractor={(item) => item._id}
      />
      <Text style={configureStyles.subtitle}>
        Select the accesses you want to scan
      </Text>
      {selectedEvent != null && (
        <>
          <FlatList
            data={accesses.filter(
              (item: Access) => item.event === selectedEvent._id
            )}
            renderItem={({ item }) => <AccessItem access={item} />}
            keyExtractor={(item) => item._id}
          />
          <View
            style={{ alignItems: "center", height: "8%", marginBottom: "10%" }}
          >
            <Pressable
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.6 : 1.0,
                },
                accesses.filter((item: Access) => item.isSelect).length > 0
                  ? configureStyles.pinkButton
                  : configureStyles.greyButton,
              ]}
              onPress={() => {
                if (accesses.length > 0) {
                  const selectedAccesses: Access[] = accesses.filter(
                    (item: Access) => item.isSelect
                  );
                  selectAccesses(route.params.token, selectedAccesses);
                }
              }}
            >
              <Text style={sharedStyles.textPinkButton}>Start to scan</Text>
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};
