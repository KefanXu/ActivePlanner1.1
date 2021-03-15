import React, { useState } from "react";
import { render } from "react-dom";
<<<<<<< HEAD
import ApiCalendar from "react-google-calendar-api";
=======
>>>>>>> parent of 4ff0deb (add google calendar api 1)
import {
  TextInput,
  Text,
  View,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  Modal,
  LayoutAnimation,
  Button,
  Animated,
} from "react-native";
import { getDataModel } from "./DataModel";

export class CalendarPlanScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  handleItemClick = (event, name) => {
    if (name === "sign-in") {
      ApiCalendar.handleAuthClick();
    } else if (name === "sign-out") {
      ApiCalendar.handleSignoutClick();
    }
  };
  render() {
    return (
      <View>
        <Button
          title="sign-in"
          onPress={(e) => this.handleItemClick(e, "sign-in")}
        ></Button>
        <Button
          title="sign-out"
          onPress={(e) => this.handleItemClick(e, "sign-out")}
        ></Button>
      </View>
    );
  }
}
