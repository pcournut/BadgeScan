import { Button } from "@rneui/themed";
import React, {
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  BottomSheetModal,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";

import { ScrollView } from "react-native-gesture-handler";

import { Image, Pressable, Text, View } from "react-native";
import { ScanScreenContext } from "../contexts/ScanScreenContext";

import { AntDesign, Feather } from "@expo/vector-icons";
import Colors from "../colors";
import scanStyles from "../styles/scan";
import sharedStyles from "../styles/shared";
import { KentoEntity, EnrichedUser } from "../types";
import { devEndpoint, prodEndpoint } from "../constants";
import { LoginContext } from "../contexts/LoginContext";

type Ref = {
  displayComponent: () => void;
};
type Props = {};

export const ScanBottomSheet = forwardRef<Ref, Props>((props, ref) => {
  // Context
  const {
    enrichedUsers,
    setEnrichedUsers,
    selectedUserIndex,
    token,
    selectedEvent,
  } = useContext(ScanScreenContext);

  // BottomSheetModalProvider params
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["25%", "50%"], []);
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);
  const handleCloseModalPress = () => bottomSheetModalRef.current.close();

  const displayComponent = () => {
    handlePresentModalPress();
  };
  React.useImperativeHandle(ref, () => ({ displayComponent }));

  // Components
  const selectItem = (KentoEntity: KentoEntity) => {
    KentoEntity.isSelect = !KentoEntity.isSelect;
    var newEnrichedUsers = Object.assign([], enrichedUsers);
    const KentoEntityIndex = enrichedUsers[
      selectedUserIndex
    ].kentoEntities.findIndex(
      (item: KentoEntity) => item._id === KentoEntity._id
    );
    newEnrichedUsers[selectedUserIndex][KentoEntityIndex] = KentoEntity;
    setEnrichedUsers(newEnrichedUsers);
  };

  // TODO: factorize imageDict
  const imageDict = {
    Artist: require("../assets/Artist.png"),
    Community: require("../assets/Community.png"),
    Guest: require("../assets/Guest.png"),
    Participant: require("../assets/Participant.png"),
  };
  const KentoEntityItem = (props: { kentoEntity: KentoEntity }) => (
    <View style={scanStyles.kentoEntityContainer}>
      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.6 : 1.0,
          },
        ]}
        onPress={() => {
          if (!props.kentoEntity.isUsed) {
            selectItem(props.kentoEntity);
          }
        }}
      >
        <View
          style={{
            borderRadius: 10,
            backgroundColor: props.kentoEntity.isUsed
              ? Colors.GREEN
              : "transparent",
          }}
        >
          {props.kentoEntity.isSelect ? (
            <Feather name="x-square" size={24} color="black" />
          ) : props.kentoEntity.isUsed ? (
            <Text style={{ color: "green", textAlign: "right" }}>
              validated
            </Text>
          ) : (
            <Feather
              name="square"
              size={24}
              color={props.kentoEntity.isUsed ? "white" : "black"}
            />
          )}
          <Image
            style={{
              width: 60,
              height: 60,
              marginTop: 5,
              marginBottom: 5,
            }}
            source={imageDict[props.kentoEntity.accessKentoType]}
          />
          <Text style={sharedStyles.blackText}>
            {props.kentoEntity.accessName}
          </Text>
        </View>
      </Pressable>
    </View>
  );

  // Functions
  const validateSelection = () => {
    var newEnrichedUsers: EnrichedUser[] = Object.assign([], enrichedUsers);
    for (const KentoEntity of newEnrichedUsers[selectedUserIndex]
      .kentoEntities) {
      if (KentoEntity.isSelect) {
        KentoEntity.isUsed = true;
        KentoEntity.isSelect = false;
        KentoEntity.toUpdate = true;
      }
    }
    setEnrichedUsers(newEnrichedUsers);
    handleCloseModalPress();
  };

  const getUserGuestlists = async (
    token: string,
    owner_email: string,
    event_id: string
  ) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    console.log(token);

    var formdata = new FormData();
    formdata.append("owner_email", owner_email);
    formdata.append("event_id", event_id);

    var requestOptions: RequestInit = {
      method: "POST",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    console.log(JSON.stringify(formdata));
    console.log(JSON.stringify(myHeaders));

    try {
      const response = await fetch(
        `${devEnvironment ? devEndpoint : prodEndpoint}/wf/get-user-guestlists`,
        requestOptions
      );
      const json = await response.json();
      console.log(`json: ${json}`);
      if ("entities_text" in json.response) {
        const offers: [KentoEntity] = JSON.parse(json.response.entities_text);
        console.log(
          `entities: ${JSON.stringify(JSON.parse(json.response.entities_text))}`
        );
        setOffers(JSON.parse(json.response.entities_text));
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  // Environment variables
  const { devEnvironment } = useContext(LoginContext);

  // Variables
  const [offers, setOffers] = useState<KentoEntity[]>([]);
  const [displayOffers, setDisplayOffers] = useState(false);
  const toggleSwitch = () =>
    setDisplayOffers((previousState) => !previousState);

  return (
    <BottomSheetModalProvider>
      <View style={sharedStyles.container}>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
        >
          {/* <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.6 : 1.0,
              },
              { alignItems: "flex-end", marginRight: "5%" },
            ]}
            onPress={() => {
              handleCloseModalPress();
            }}
          >
            <AntDesign name="close" size={24} color="black" />
          </Pressable> */}

          {selectedUserIndex != -1 ? (
            <>
              <Pressable
                style={{ alignItems: "flex-end", marginRight: "5%" }}
                onPress={() => {
                  toggleSwitch();
                  if (!displayOffers) {
                    getUserGuestlists(
                      token,
                      enrichedUsers[selectedUserIndex].email,
                      selectedEvent
                    );
                  }
                }}
              >
                <Text
                  style={{ fontWeight: "600", textDecorationLine: "underline" }}
                >
                  {displayOffers ? "See passes" : "See offers"}
                </Text>
              </Pressable>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 21,
                  fontWeight: "bold",
                  letterSpacing: 0.25,
                  marginLeft: "5%",
                }}
              >
                {enrichedUsers[selectedUserIndex].first_name}{" "}
                {enrichedUsers[selectedUserIndex].last_name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "300",
                  lineHeight: 21,
                  letterSpacing: 0.25,
                  marginLeft: "5%",
                }}
              >
                {enrichedUsers[selectedUserIndex].email}
              </Text>

              <ScrollView
                horizontal={true}
                style={{ width: "90%", marginLeft: "5%" }}
              >
                {displayOffers
                  ? offers.map((item) => (
                      <KentoEntityItem key={item._id} kentoEntity={item} />
                    ))
                  : enrichedUsers[selectedUserIndex].kentoEntities.map(
                      (item) => (
                        <KentoEntityItem key={item._id} kentoEntity={item} />
                      )
                    )}
              </ScrollView>
              <View
                style={{
                  alignItems: "center",
                  height: "20%",
                  width: "100%",
                  marginTop: "2%",
                  marginBottom: "2%",
                }}
              >
                <Pressable
                  style={({ pressed }) => [
                    {
                      opacity: pressed ? 0.6 : 1.0,
                    },
                    enrichedUsers[selectedUserIndex].kentoEntities.filter(
                      (item: KentoEntity) => item.isSelect
                    ).length > 0
                      ? scanStyles.pinkButton
                      : scanStyles.greyButton,
                  ]}
                  onPress={() => {
                    validateSelection();
                  }}
                >
                  <Text style={sharedStyles.textPinkButton}>
                    {enrichedUsers[selectedUserIndex].kentoEntities.filter(
                      (item: KentoEntity) => item.isSelect
                    ).length > 0
                      ? "Validate"
                      : `Select pass to validate`}
                  </Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <View
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AntDesign
                  name="exclamationcircle"
                  size={100}
                  color={Colors.ERROR}
                />
                <Text
                  style={{
                    marginTop: "10%",
                    fontSize: 16,
                    lineHeight: 21,
                    fontWeight: "bold",
                    letterSpacing: 0.25,
                  }}
                >
                  The kento wasn't found :(
                </Text>
              </View>
            </>
          )}
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
});
