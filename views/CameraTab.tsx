import { BarCodeScanner } from "expo-barcode-scanner";
import React, { useContext, useEffect, useRef, useState } from "react";

import { StyleSheet, View } from "react-native";
import sharedStyles from "../styles/shared";
import { ScanBottomSheet } from "./ScanBottomSheet";
import { ScanScreenContext } from "../contexts/ScanScreenContext";

type Ref = {
  displayComponent: () => void;
};

export const CameraTab = ({ route }) => {
  // Context
  const { enrichedUsers, setSelectedUserIndex } = useContext(ScanScreenContext);

  // Scan permissions and setup
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    console.log("initScanTab");
    const getBarCodeScannerPermissions = async () => {
      console.log("gettingBarCodeScannerPermissions");
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    };
    getBarCodeScannerPermissions();
  }, []);

  // Ref to trigger BottomSheet display
  const ref = useRef<Ref>(null!);
  const displayBottomSheet = (): void => ref?.current?.displayComponent();

  // Functions
  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    console.log(data);
    const selectedUserIndex = enrichedUsers.findIndex(
      (item) => item._id === data
    );
    setSelectedUserIndex(selectedUserIndex);
    displayBottomSheet();
    setScanned(false);
  };

  return (
    <View style={sharedStyles.container}>
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />
      <ScanBottomSheet ref={ref}></ScanBottomSheet>
    </View>
  );
};
