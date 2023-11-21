import { StyleSheet } from "react-native";
import Colors from "../colors";

const loginStyles = StyleSheet.create({
  pinkText: {
    color: Colors.PINK,
    fontSize: 16,
    fontWeight: "bold",
  },
  greyText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "grey",
  },
  root: { flex: 1, padding: 20 },
  title: { textAlign: "center", fontSize: 30 },
  codeFieldRoot: { marginTop: 20 },
  cell: {
    width: 40,
    height: 40,
    lineHeight: 38,
    fontSize: 24,
    borderWidth: 2,
    borderColor: "#00000030",
    textAlign: "center",
    marginRight: 10,
    borderRadius: 5,
  },
  focusCell: {
    borderColor: "#000",
  },
  textInput: {
    height: "7%",
    width: "85%",
    backgroundColor: Colors.ARGENT,
    textAlign: "center",
    borderColor: Colors.ARGENT,
    borderRadius: 5,
    marginTop: "2%",
    marginBottom: "2%",
  },
});

export default loginStyles;
