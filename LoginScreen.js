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
} from "react-native";

import { loginStyles } from "./Styles";
import { getDataModel } from "./DataModel";

export class LoginScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      displayNameInput: "",
      passwordInput: "",
    };
  }
  componentDidMount = () => {
    this.dataModel = getDataModel();
    this.focusUnsubscribe = this.props.navigation.addListener('focus', this.onFocus);

  };
  onFocus = () => {
    this.dataModel.asyncInit();
  }

  onLogin = () => {
    //console.log("Login");
    let userList = this.dataModel.getUsers();
    let userName = this.state.displayNameInput;
    let password = this.state.passwordInput;
    let isUserFound = false;
    for (let user of userList) {
      if (user.email === userName && user.password === password) {
        console.log("user found");
        isUserFound = true;
      }
    }
    if (isUserFound) {
      this.props.navigation.navigate("Home Screen");
    } else {
      Alert.alert(
        "Login Failed",
        "No match found for this email and password.",
        [{ text: "OK", style: "OK" }]
      );
    }
  };

  onRegist = () => {
    //console.log("Regist");
    this.props.navigation.navigate("SignUp", {});
  };
  render() {
    return (
      <View
        style={loginStyles.inputContatiner}
        behavior={"height"}
        keyboardVerticalOffset={1}
      >
        <View style={loginStyles.inputField}>
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
        </View>
        <View style={loginStyles.buttonArea}>
          <TouchableOpacity
            style={loginStyles.buttonStyle}
            onPress={() => this.onLogin()}
          >
            <Text style={loginStyles.buttonFont}>Log in</Text>
          </TouchableOpacity>
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
