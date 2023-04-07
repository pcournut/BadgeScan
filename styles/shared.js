import { StyleSheet } from "react-native";
import Colors from "../colors";

const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 12,
    alignItems: "center",
  },
  containerRow: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 12,
    alignItems: "center",
  },
  pinkButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    elevation: 3,
    backgroundColor: Colors.PINK,
    marginTop: 15,
    width: "85%",
    height: "7%",
  },
  greyButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    elevation: 3,
    backgroundColor: Colors.LUNE,
    marginTop: 15,
    width: "85%",
    height: "7%",
  },
  textPinkButton: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  blackText: {
    color: "black",
    fontSize: 16,
  },
  text: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: "bold",
    letterSpacing: 0.25,
    color: "white",
  },
  badgeItem: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: "row",
  },

  button_rne: {
    margin: 10,
  },
  itemContainer: {
    padding: 6,
    margin: 6,
    backgroundColor: "#eee",
  },
});

export default sharedStyles;
