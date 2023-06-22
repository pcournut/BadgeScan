import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import sharedStyles from "../styles/shared";
import loginStyles from "../styles/login";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

export const LoginScreen = ({ navigation }) => {
  // Functions
  const sendCode = async (email: string) => {
    var formdata = new FormData();
    formdata.append("email", email);

    var requestOptions: RequestInit = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://kento.events/version-test/api/1.1/wf/login-email-otp",
        requestOptions
      );
      const result = await response.text();
      console.log(result);
    } catch (error) {
      console.log("error", error);
    }
  };

  const verifyCode = async (email: string, code: string) => {
    var formdata = new FormData();
    formdata.append("email", email);
    formdata.append("OTP", code);

    var requestOptions: RequestInit = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://kento.events/version-test/api/1.1/wf/login",
        requestOptions
      );
      const json = await response.json();
      console.log(json);
      navigation.navigate("Configure", {
        user_id: json.response.user_id,
        token: json.response.token,
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  const devConnect = async (email: string) => {
    var formdata = new FormData();
    formdata.append("email", email);

    var requestOptions: RequestInit = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        "https://kento.events/version-test/api/1.1/wf/admin-login",
        requestOptions
      );
      const json = await response.json();
      console.log(json);
      navigation.navigate("Configure", {
        user_id: json.response.user_id,
        token: json.response.token,
      });
    } catch (error) {
      console.log("error", error);
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    return emailRegex.test(email);
  };

  // State variables
  // -- email
  const [email, setEmail] = useState("pierre.cournut@gmail.com");
  const [emailIsValid, setEmailIsValid] = useState(true);
  // -- UI states
  const [showCode, setShowCode] = useState(false);
  // -- code
  const CELL_COUNT = 4;
  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  return (
    <View style={sharedStyles.container}>
      <TextInput
        value={email}
        onChangeText={(email) => setEmail(email)}
        placeholder="Enter email"
        style={loginStyles.textInput}
      />

      {validateEmail(email) && (
        <>
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.6 : 1.0,
              },
              sharedStyles.pinkButton,
            ]}
            onPress={() => {
              sendCode(email);
              setShowCode(true);
            }}
          >
            <Text style={sharedStyles.textPinkButton}>Send code</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.6 : 1.0,
              },
              sharedStyles.pinkButton,
            ]}
            onPress={() => {
              devConnect(email);
            }}
          >
            <Text style={sharedStyles.textPinkButton}>Dev connect</Text>
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
            verifyCode(email, value);
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
                sendCode(email);
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
