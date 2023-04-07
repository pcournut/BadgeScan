import { useRef, useState } from "react";
import { View, Text, Pressable } from "react-native";
import sharedStyles from "../styles/shared";
import loginStyles from "../styles/login";
import PhoneInput from "react-native-phone-number-input";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

export const LoginScreen = ({ navigation }) => {
  // Functions
  const sendCode = async (phoneCountryCode: string, phoneNumber: string) => {
    var formdata = new FormData();
    formdata.append("phoneNumber", phoneNumber);
    formdata.append("phoneCountryCode", phoneCountryCode);

    var requestOptions: RequestInit = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://club-soda-test-pierre.bubbleapps.io/version-test/api/1.1/wf/PasswordlessSendCode",
        requestOptions
      );
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.log("error", error);
    }
  };

  const verifyCode = async (
    phoneCountryCode: string,
    phoneNumber: string,
    twilioCode: string
  ) => {
    var formdata = new FormData();
    formdata.append("phoneNumber", phoneNumber);
    formdata.append("code", twilioCode);
    formdata.append("phoneCountryCode", phoneCountryCode);

    var requestOptions: RequestInit = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://club-soda-test-pierre.bubbleapps.io/version-test/api/1.1/wf/PasswordlessVerifyCode",
        requestOptions
      );
      const json = await response.json();
      console.log(json);
      navigation.navigate("Configure", {
        userFirstName: json.response.userFirstName,
        token: json.response.token,
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  const devConnect = async (phoneCountryCode: string, phoneNumber: string) => {
    var formdata = new FormData();
    formdata.append("phoneNumber", phoneNumber);
    formdata.append("phoneCountryCode", phoneCountryCode);

    var requestOptions: RequestInit = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://club-soda-test-pierre.bubbleapps.io/version-test/api/1.1/wf/PasswordlessVerifyCodeNOTWILIO",
        requestOptions
      );
      const json = await response.json();
      console.log(json);
      navigation.navigate("Configure", {
        userFirstName: json.response.userFirstName,
        token: json.response.token,
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  // State variables
  const [phoneNumber, setPhoneNumber] = useState("674670066");
  const [formattedPhoneNumber, setFormattedPhoneNumber] = useState("");
  const phoneInput = useRef<PhoneInput>(null);
  const [showCode, setShowCode] = useState(false);

  const CELL_COUNT = 4;
  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  return (
    <View style={sharedStyles.container}>
      <PhoneInput
        ref={phoneInput}
        defaultValue={phoneNumber}
        defaultCode="FR"
        layout="first"
        onChangeText={(text) => {
          setPhoneNumber(text);
        }}
        onChangeFormattedText={(text) => {
          setFormattedPhoneNumber(text);
        }}
        withDarkTheme
        withShadow
        autoFocus
      />
      {phoneInput.current?.isValidNumber(phoneNumber) && (
        <>
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.6 : 1.0,
              },
              sharedStyles.pinkButton,
            ]}
            onPress={() => {
              sendCode(`+${phoneInput.current?.getCallingCode()}`, phoneNumber);
              setShowCode(true);
            }}
          >
            <Text style={sharedStyles.textPinkButton}>Receive SMS</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.6 : 1.0,
              },
              sharedStyles.pinkButton,
            ]}
            onPress={() => {
              devConnect(
                `+${phoneInput.current?.getCallingCode()}`,
                phoneNumber
              );
            }}
          >
            <Text style={sharedStyles.textPinkButton}>No Twilio connect</Text>
          </Pressable>
        </>
      )}
      {showCode && (
        <CodeField
          ref={ref}
          {...props}
          // Use `caretHidden={false}` when users can't paste a text value, because context menu doesn't appear
          value={value}
          onChangeText={setValue}
          cellCount={CELL_COUNT}
          rootStyle={loginStyles.codeFieldRoot}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          renderCell={({ index, symbol, isFocused }) => (
            <Text
              key={index}
              style={[loginStyles.cell, isFocused && loginStyles.focusCell]}
              onLayout={getCellOnLayoutHandler(index)}
            >
              {symbol || (isFocused ? <Cursor /> : null)}
            </Text>
          )}
        />
      )}
      {value.length == CELL_COUNT && (
        <Pressable
          style={({ pressed }) => [
            {
              opacity: pressed ? 0.6 : 1.0,
            },
            sharedStyles.pinkButton,
          ]}
          onPress={() => {
            verifyCode(
              `+${phoneInput.current?.getCallingCode()}`,
              phoneNumber,
              value
            );
          }}
        >
          <Text style={sharedStyles.textPinkButton}>Confirm</Text>
        </Pressable>
      )}
      {showCode && (
        <>
          <View style={sharedStyles.containerRow}>
            <Text style={loginStyles.greyText}>Did not receive?</Text>
            <Pressable
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.6 : 1.0,
                },
              ]}
              onPress={() => {
                sendCode(
                  `+${phoneInput.current?.getCallingCode()}`,
                  phoneNumber
                );
              }}
            >
              <Text style={loginStyles.pinkText}>Resend code</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
};
