import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ScanScreenContext } from "../contexts/ScanScreenContext";
import { Badge, BadgeEntity, EnrichedUser } from "../types";
import { ListTab } from "./ListTab";
import { CameraTab } from "./CameraTab";

const Tab = createBottomTabNavigator();

const cameraName = "Camera";
const listName = "List";

export const ScanScreen = ({ navigation, route }) => {
  // Context variables
  const [enrichedUsers, setEnrichedUsers] = useState<EnrichedUser[]>(
    route.params.enrichedUsers
  );
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [lastQueryUnixTimeStamp, setLastQueryUnixTimeStamp] = useState<number>(
    Date.now()
  );

  // Functions
  const participantListUpdate = async (
    badgeEntityIds: string[],
    token: string,
    badges: [Badge],
    scanTerminal: string
  ) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    var formdata = new FormData();
    formdata.append(
      "ChangedBadgeEntities",
      `[${badgeEntityIds.map((item) => '"' + item + '"')}]`
    );
    formdata.append("ScanTerminal", `${scanTerminal}`);
    formdata.append("Badges", `[${badges.map(({ _id }) => '"' + _id + '"')}]`);
    formdata.append("LastQueryUnixTimeStamp", `${lastQueryUnixTimeStamp}`);

    var requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://club-soda-test-pierre.bubbleapps.io/version-test/api/1.1/wf/ParticipantListUpdate",
        requestOptions
      );
      const json = await response.json();
      var newEnrichedUsers: EnrichedUser[] = Object.assign([], enrichedUsers);
      if (json.response.participantsUpdate.length > 1) {
        for (const badgeEntityString of json.response.participantsUpdate) {
          const badgeEntity = JSON.parse(badgeEntityString);
          const userIndex = enrichedUsers.findIndex(
            (item: EnrichedUser) => item._id === badgeEntity.userId
          );
          const badgeEntityIndex = enrichedUsers[
            userIndex
          ].badgeEntities.findIndex(
            (item: BadgeEntity) => item._id === badgeEntity.badgeEntityId
          );
          newEnrichedUsers[userIndex].badgeEntities[badgeEntityIndex].isUsed =
            badgeEntity.isUsed === "oui";
        }
      } else if (json.response.participantsUpdate.length == 1) {
        const badgeEntity = JSON.parse(json.response.participantsUpdate);
        const userIndex = enrichedUsers.findIndex(
          (item: EnrichedUser) => item._id === badgeEntity.userId
        );
        const badgeEntityIndex = enrichedUsers[
          userIndex
        ].badgeEntities.findIndex(
          (item: BadgeEntity) => item._id === badgeEntity.badgeEntityId
        );
        newEnrichedUsers[userIndex].badgeEntities[badgeEntityIndex].isUsed =
          badgeEntity.isUsed === "oui";
      }
      setEnrichedUsers(newEnrichedUsers);
      console.log("Updated with server.");
      setLastQueryUnixTimeStamp(json.response.LastQueryUnixTimeStamp);
    } catch (error) {
      console.log("error", error);
    }
  };

  // Server update
  useEffect(() => {
    const interval = setInterval(() => {
      var changedBadgeEntities = [];
      for (const user of enrichedUsers) {
        for (const badgeEntity of user.badgeEntities) {
          if (badgeEntity.toUpdate) {
            changedBadgeEntities = changedBadgeEntities.concat(badgeEntity._id);
            badgeEntity.toUpdate = false;
          }
        }
      }
      participantListUpdate(
        changedBadgeEntities,
        route.params.token,
        route.params.badges,
        route.params.scanTerminal
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScanScreenContext.Provider
      value={{
        enrichedUsers,
        setEnrichedUsers,
        selectedUserIndex,
        setSelectedUserIndex,
      }}
    >
      <Tab.Navigator
        initialRouteName={cameraName}
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string;
            let rn = route.name;

            if (rn === cameraName) {
              iconName = focused ? "scan" : "scan-outline";
            } else if (rn === listName) {
              iconName = focused ? "list" : "list-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "tomato",
          tabBarInactiveTintColor: "grey",
          tabBarLabelStyle: { paddingBottom: 10, fontSize: 10 },
          tabBarStyle: { padding: 10, height: "10%" },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name={cameraName}
          children={() => <CameraTab route={route} />}
        />
        <Tab.Screen
          name={listName}
          children={() => <ListTab route={route} />}
        />
      </Tab.Navigator>
    </ScanScreenContext.Provider>
  );
};
