import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React, { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { ScanScreenContext } from "../contexts/ScanScreenContext";
import { Access, KentoEntity, EnrichedUser, UpdatedEntity } from "../types";
import { ListTab } from "./ListTab";
import { CameraTab } from "./CameraTab";
import { devEndpoint, prodEndpoint } from "../constants";

const Tab = createBottomTabNavigator();

const cameraName = "Camera";
const listName = "List";

export const ScanScreen = ({ navigation, route }) => {
  // Context variables
  const [token, setToken] = useState(route.params.token);
  const [selectedEvent, setSelectedEvent] = useState(
    route.params.selectedEvent
  );
  const [enrichedUsers, setEnrichedUsers] = useState<EnrichedUser[]>(
    route.params.enrichedUsers
  );
  const [selectedUserIndex, setSelectedUserIndex] = useState(0);
  const [lastQueryUnixTimeStamp, setLastQueryUnixTimeStamp] = useState<number>(
    Date.now()
  );
  const [failedKentoEntities, setFailedKentoEntities] = useState<string[]>([]);

  // Functions
const participantListUpdate = async (
  kentoEntityIds: string[],
  token: string,
  accesses: [Access],
  scanTerminal: string
) => {
  const TIMEOUT = 25000; // Set your timeout value
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT);

  var myHeaders = new Headers();
  myHeaders.append("Authorization", `Bearer ${token}`);

  var formdata = new FormData();
  formdata.append(
    "scanned_entities",
    `[${kentoEntityIds.map((item) => '"' + item + '"')}]`
  );
  formdata.append("scan_terminal", `${scanTerminal}`);
  formdata.append(
    "accesses",
    `[${accesses.map(({ _id }) => '"' + _id + '"')}]`
  );
  formdata.append(
    "last_query_unix_timestamp",
    `${lastQueryUnixTimeStamp.toString()}`
  );

  var requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: formdata,
    redirect: "follow",
  };

  try {
    const response = await fetch(
      `${route.params.devEnvironment ? devEndpoint : prodEndpoint}/wf/participant-list-update`,
      { signal: controller.signal, ...requestOptions }
    )
    .catch((e) => {
      if (e.name === 'AbortError') {
        // If the request times out, add the entityIds to the failed list
        setFailedKentoEntities([...failedKentoEntities, ...kentoEntityIds]);
        throw new Error('Request timed out');
      }
  
      throw e;
    })
    .finally(() => clearTimeout(id));
  
    if (!response.ok) {
      // If server response is not ok, add the entityIds to the failed list
      setFailedKentoEntities([...failedKentoEntities, ...kentoEntityIds]);
      throw new Error('Server response was not ok');
    }

    const json = await response.json();
    var newEnrichedUsers: EnrichedUser[] = Object.assign([], enrichedUsers);
    if ("updated_entities_text" in json.response) {
      const updatedEntities: [UpdatedEntity] = JSON.parse(
        json.response.updated_entities_text
      );
      console.log(`Number of updated entities: ${updatedEntities.length}`);
      if (updatedEntities.length > 0) {
        console.log(JSON.stringify(updatedEntities));
        for (const updatedEntity of updatedEntities) {
          const userIndex = enrichedUsers.findIndex(
            // (item: EnrichedUser) => item._id === updatedEntity.owner._id
            (item: EnrichedUser) => item.email === updatedEntity.owner.email
          );
          if (userIndex !== -1) {
            const kentoEntityIndex = enrichedUsers[
              userIndex
            ].kentoEntities.findIndex(
              (item: KentoEntity) => item._id === updatedEntity._id
            );
            if (kentoEntityIndex !== -1) {
              newEnrichedUsers[userIndex].kentoEntities[
                kentoEntityIndex
              ].isUsed = updatedEntity.scan_terminal !== undefined;
            } else {
              const kentoEntity: KentoEntity = {
                _id: updatedEntity._id,
                access: updatedEntity.access,
                owner: updatedEntity.owner._id,
                owner_email: updatedEntity.owner.email,
                scan_terminal: updatedEntity.scan_terminal,
                isUsed:
                  updatedEntity.scan_terminal !== undefined &&
                  updatedEntity.scan_terminal.length > 0,
              };
              newEnrichedUsers[userIndex].kentoEntities.push(kentoEntity);
            }
          } else {
            const kentoEntity: KentoEntity = {
              _id: updatedEntity._id,
              access: updatedEntity.access,
              owner: updatedEntity.owner._id,
              owner_email: updatedEntity.owner.email,
              scan_terminal: updatedEntity.scan_terminal,
              isUsed:
                updatedEntity.scan_terminal !== undefined &&
                updatedEntity.scan_terminal.length > 0,
            };
            const enrichedUser: EnrichedUser = {
              // _id: updatedEntity.owner._id,
              first_name:
                "first_name" in updatedEntity.owner
                  ? updatedEntity.owner.first_name
                  : updatedEntity.owner.email,
              last_name:
                "last_name" in updatedEntity.owner
                  ? updatedEntity.owner.last_name
                  : "",
              email: updatedEntity.owner.email,
              kentoEntities: [kentoEntity],
            };
            newEnrichedUsers.push(enrichedUser);
          }
        }
      }
    } else {
      console.log(`Empty updated entities.`);
    }               
    setEnrichedUsers(newEnrichedUsers);
    // When a response is successful, remove the corresponding entityIds from the failed list
    setFailedKentoEntities(failedKentoEntities.filter(id => !kentoEntityIds.includes(id)));
  } catch (error) {
    console.log("error", error);
  }
};


  // Server update
  useEffect(() => {
    const interval = setInterval(() => {
      var changedKentoEntities = [];
      for (const user of enrichedUsers) {
        for (const kentoEntity of user.kentoEntities) {
          if (kentoEntity.toUpdate) {
            changedKentoEntities = changedKentoEntities.concat(kentoEntity._id);
            kentoEntity.toUpdate = false;
          }
        }
      }
      participantListUpdate(
        [...failedKentoEntities, ...changedKentoEntities],
        route.params.token,
        route.params.accesses,
        route.params.scanTerminal
      );
    }, 30000);
    return () => clearInterval(interval);
  }, [failedKentoEntities]);

  return (
    <ScanScreenContext.Provider
      value={{
        enrichedUsers,
        setEnrichedUsers,
        selectedUserIndex,
        setSelectedUserIndex,
        token,
        selectedEvent,
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
