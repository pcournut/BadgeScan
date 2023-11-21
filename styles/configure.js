import { StyleSheet } from "react-native";
import Colors from "../colors";

const configureStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: "90%",
    marginLeft: "5%",
    marginTop: "5%",
  },
  subtitle: {
    textAlign: "left",
    marginBottom: 16,
    marginTop: 16,
    fontSize: 16,
    fontWeight: "bold",
  },
  item: {
    backgroundColor: "#f9c2ff",
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  orgContainer: {
    justifyContent: "center",
    paddingRight: 30,
  },
  eventContainer: {
    flexDirection: "row",
    // justifyContent: "left",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: 12,
  },
  accessContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
  },
  greyButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    elevation: 3,
    backgroundColor: Colors.LUNE,
    marginTop: 15,
    width: "85%",
    height: "100%",
  },
  pinkButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 6,
    elevation: 3,
    backgroundColor: Colors.PINK,
    marginTop: 15,
    width: "85%",
    height: "100%",
  },
});

export default configureStyles;
