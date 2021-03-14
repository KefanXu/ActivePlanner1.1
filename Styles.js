import { StyleSheet } from "react-native";
export const colors = {
  primaryGreyLight: "#BDBDBD",
  secondaryGreyDark: "#6E6E6E",
};
export const loginStyles = StyleSheet.create({
  inputContatiner: {
    flex: 1,
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
  },
  inputField: {
    flex: 0.4,
    width: "80%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    backgroundColor: "white",
  },
  inputFont: {
    fontWeight: "bold",
    paddingLeft: 20,
    marginTop: 10,
  },
  inputText: {
    flex: 0.15,

    marginTop: 10,
    width: "100%",
    borderWidth: 2,
    borderRadius: 30,
    borderColor: colors.secondaryGreyDark,
  },
  inputTextField: {
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
    fontSize: 20,
  },
  buttonArea: {
    flex: 0.15,
    width: "60%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    //backgroundColor:"red",
  },
  buttonStyle: {
    flex: 0.5,
    margin: 10,
    width: "80%",
    borderWidth: 2,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6E6E6E",
    borderColor: "#6E6E6E",
  },
  buttonFont: {
    fontWeight: "bold",
    color: "white",
  },
});
export const signUpStyles = StyleSheet.create({
  inputField: {
    flex: 0.5,
    width: "80%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    backgroundColor: "white",
  },
});