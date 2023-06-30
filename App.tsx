import { AntDesign, Feather } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Image, Pressable, View } from "react-native";

import Colors from "./colors";
import { ConfigureScreen } from "./views/ConfigureScreen";
import { LoginScreen } from "./views/LoginScreen";
import { ScanScreen } from "./views/ScanScreen";

const App = () => {
  // Components
  const Stack = createStackNavigator();

  const LogoTitle = (props: any) => {
    return (
      <View>
        <Image
          style={{
            width: 100,
            height: "100%",
          }}
          source={require("./assets/kento-text-rose.jpg")}
          resizeMode="cover"
        />
      </View>
    );
  };

  const MyCustomHeaderBackImage = () => (
    <Feather
      style={{ marginLeft: "8%" }}
      name="arrow-left"
      size={30}
      color={Colors.PINK}
    />
  );

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ route, navigation }) => ({
          headerBackImage: MyCustomHeaderBackImage,
          headerBackTitleVisible: false,
          headerTitle: (props) => <LogoTitle {...props} />,
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate("Login")}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.6 : 1.0,
                  marginRight: "8%",
                },
              ]}
            >
              <AntDesign name="logout" size={24} color={Colors.PINK} />
            </Pressable>
          ),
        })}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Configure" component={ConfigureScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
