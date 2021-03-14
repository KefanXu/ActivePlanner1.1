import React from "react";
import {
  TextInput,
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  LayoutAnimation,
  Button,
} from "react-native";

import { loginStyles } from "./Styles";
import { signUpStyles } from "./Styles";
import { getDataModel } from "./DataModel";

export class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayNameInput: "",
      passwordInput: "",
      reenterPassword: "",
    };
  }

  componentDidMount = () => {
    this.dataModel = getDataModel();
    this.props.navigation.setOptions({
      headerLeft: () => (
        <Button
          title="Back"
          color="blue"
          onPress={() => this.props.navigation.navigate("Login")}
        />
      ),
    });
  };

  onRegist = async () => {
    if (
      this.state.displayNameInput !== "" &&
      this.state.passwordInput !== "" &&
      this.state.reenterPassword !== ""
    ) {
      if (this.state.passwordInput !== this.state.reenterPassword) {
        Alert.alert(
          "Passwords not match",
          "Please make sure two password match",
          [{ text: "OK", style: "OK" }]
        );
        return;
      } else {
        let users = this.dataModel.getUsers();
        for (let user of users) {
          if (user.email === this.state.displayNameInput) {
            Alert.alert(
              "User already exists",
              "User " + this.state.displayNameInput + " already exists",
              [{ text: "OK", style: "OK" }]
            );
            return;
          } else {
          }
        }
      }
    } else {
      Alert.alert("Missing Information", "Please fill in all the field above", [
        { text: "OK", style: "OK" },
      ]);
      return;
    }
    this.dataModel.createNewUser(
      this.state.displayNameInput,
      this.state.passwordInput
    );
    Alert.alert(
      "You are all set!",
      "Thank you for participating in this study",
      [
        {
          text: "Go to the login page",
          onPress: () => {
            this.props.navigation.navigate("Login");
          },
        },
      ]
    );

    //console.log("Regist");
  };

  render() {
    return (
      <View
        style={loginStyles.inputContatiner}
        behavior={"height"}
        keyboardVerticalOffset={1}
      >
        <View style={signUpStyles.inputField}>
          <Text style={loginStyles.inputFont}>Email</Text>
          <View style={loginStyles.inputText}>
            <TextInput
              style={loginStyles.inputTextField}
              autoCapitalize="none"
              autoCorrect={false}
              value={this.state.displayNameInput}
              onChangeText={(text) => {
                this.setState({ displayNameInput: text });
              }}
            />
          </View>
          <Text style={loginStyles.inputFont}>Password</Text>
          <View style={loginStyles.inputText}>
            <TextInput
              secureTextEntry={true}
              style={loginStyles.inputTextField}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              value={this.state.passwordInput}
              onChangeText={(text) => {
                this.setState({ passwordInput: text });
              }}
            />
          </View>
          <Text style={loginStyles.inputFont}>Reenter Password</Text>
          <View style={loginStyles.inputText}>
            <TextInput
              secureTextEntry={true}
              style={loginStyles.inputTextField}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="password"
              value={this.state.reenterPassword}
              onChangeText={(text) => {
                this.setState({ reenterPassword: text });
              }}
            />
          </View>
        </View>
        <View style={loginStyles.buttonArea}>
          <TouchableOpacity
            style={loginStyles.buttonStyle}
            onPress={() => this.onRegist()}
          >
            <Text style={loginStyles.buttonFont}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}
