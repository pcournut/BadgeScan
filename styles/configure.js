import { StyleSheet } from "react-native";
import Colors from "../colors";

const configureStyles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: "90%",
    marginLeft: "5%",
  },
  subtitle: {
    textAlign: "right",
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
    justifyContent: "left",
    alignItems: "center",
    paddingBottom: 12,
  },
  badgeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
  },
  badgeItem: {
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    flexDirection: "row",
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
