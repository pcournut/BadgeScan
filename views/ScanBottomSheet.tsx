import { Button } from "@rneui/themed";
import React, {
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useRef,
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
import { BadgeEntity, EnrichedUser } from "../types";

type Ref = {
  displayComponent: () => void;
};
type Props = {};

export const ScanBottomSheet = forwardRef<Ref, Props>((props, ref) => {
  // Context
  const { enrichedUsers, setEnrichedUsers, selectedUserIndex } =
    useContext(ScanScreenContext);

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
  const selectItem = (badgeEntity: BadgeEntity) => {
    badgeEntity.isSelect = !badgeEntity.isSelect;
    var newEnrichedUsers = Object.assign([], enrichedUsers);
    const badgeEntityIndex = enrichedUsers[
      selectedUserIndex
    ].badgeEntities.findIndex(
      (item: BadgeEntity) => item._id === badgeEntity._id
    );
    newEnrichedUsers[selectedUserIndex][badgeEntityIndex] = badgeEntity;
    setEnrichedUsers(newEnrichedUsers);
  };

  const BadgeEntityItem = (props: { badgeEntity: BadgeEntity }) => (
    <View style={scanStyles.badgeEntityContainer}>
      <Pressable
        style={({ pressed }) => [
          {
            opacity: pressed ? 0.6 : 1.0,
          },
        ]}
        onPress={() => {
          if (!props.badgeEntity.isUsed) {
            selectItem(props.badgeEntity);
          }
        }}
      >
        {props.badgeEntity.isSelect ? (
          <Feather name="x-square" size={24} color="black" />
        ) : (
          <Feather
            name="square"
            size={24}
            color={props.badgeEntity.isUsed ? "white" : "black"}
          />
        )}
        <Image
          style={{
            width: 60,
            height: 60,
            borderRadius: 60 / 2,
            borderWidth: 1,
            marginTop: 10,
            backgroundColor: props.badgeEntity.isUsed ? "grey" : "transparent",
          }}
          source={{
            uri: `https:${props.badgeEntity.parentBadgeIcon}`,
          }}
        />
        <Text style={sharedStyles.blackText}>
          {props.badgeEntity.parentBadgeName}
        </Text>
      </Pressable>
    </View>
  );

  // Functions
  const validateSelection = () => {
    var newEnrichedUsers: EnrichedUser[] = Object.assign([], enrichedUsers);
    for (const badgeEntity of newEnrichedUsers[selectedUserIndex]
      .badgeEntities) {
      if (badgeEntity.isSelect) {
        badgeEntity.isUsed = true;
        badgeEntity.isSelect = false;
        badgeEntity.toUpdate = true;
      }
    }
    setEnrichedUsers(newEnrichedUsers);
    handleCloseModalPress();
  };

  return (
    <BottomSheetModalProvider>
      <View style={sharedStyles.container}>
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={1}
          snapPoints={snapPoints}
        >
          <Pressable
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
          </Pressable>

          {selectedUserIndex != -1 ? (
            <>
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 21,
                  fontWeight: "bold",
                  letterSpacing: 0.25,
                  marginLeft: "5%",
                }}
              >
                {enrichedUsers[selectedUserIndex].last_name},{" "}
                {enrichedUsers[selectedUserIndex].first_name}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  lineHeight: 21,
                  letterSpacing: 0.25,
                }}
              >
                {enrichedUsers[selectedUserIndex].email}
              </Text>
              <ScrollView
                horizontal={true}
                style={{ width: "90%", marginLeft: "5%" }}
              >
                {enrichedUsers[selectedUserIndex].badgeEntities.map((item) => (
                  <BadgeEntityItem key={item._id} badgeEntity={item} />
                ))}
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
                    enrichedUsers[selectedUserIndex].badgeEntities.filter(
                      (item: BadgeEntity) => item.isSelect
                    ).length > 0
                      ? scanStyles.pinkButton
                      : scanStyles.greyButton,
                  ]}
                  onPress={() => {
                    validateSelection();
                  }}
                >
                  <Text style={sharedStyles.textPinkButton}>
                    {enrichedUsers[selectedUserIndex].badgeEntities.filter(
                      (item: BadgeEntity) => item.isSelect
                    ).length > 0
                      ? "Validate"
                      : "Select pass to validate"}
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
