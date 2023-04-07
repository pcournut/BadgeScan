import { StyleSheet } from "react-native";
import Colors from "../colors";

const scanStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  blackText: {
    color: "black",
    fontSize: 16,
    letterSpacing: 0.25,
    paddingTop: "5%",
  },
  textInput: {
    height: "6%",
    width: "90%",
    marginLeft: "5%",
    backgroundColor: Colors.ARGENT,
    textAlign: "center",
    borderColor: Colors.ARGENT,
    borderRadius: 5,
    marginTop: "2%",
    marginBottom: "2%",
  },
  contentContainer: {
    // flex: 1,
    // alignItems: "center",
  },
  boldBlackText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "black",
    textAlign: "center",
    paddingTop: "2%",
  },
  badgeEntityContainer: {
    justifyContent: "center",
    paddingRight: 30,
  },
  greyButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    elevation: 3,
    backgroundColor: Colors.LUNE,
    width: "85%",
    height: "100%",
  },
  pinkButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    elevation: 3,
    backgroundColor: Colors.PINK,
    width: "85%",
    height: "100%",
  },
});

export default scanStyles;
