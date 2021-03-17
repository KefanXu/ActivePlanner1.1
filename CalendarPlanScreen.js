import React, { useState } from "react";
import { render } from "react-dom";
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

import * as Google from "expo-google-app-auth";
import { log } from "react-native-reanimated";

const config = {
  // clientId:
  //   "858218224278-2rdlmrgknnj1m8m7hourt0r59iuiiagm.apps.googleusercontent.com",
  iosClientId:
    "858218224278-nsuhfmntn6alt59c74sl312i5od457dm.apps.googleusercontent.com",
  scopes: [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/calendar.readonly",
  ],
};

export class CalendarPlanScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.googleServiceInit();
  }
  googleServiceInit = async () => {
    const { type, accessToken, user } = await Google.logInAsync(config);
    let userInfoResponse;
    if (type === "success") {
      //console.log(type, accessToken, user);
      userInfoResponse = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
    }
    //console.log("token",accessToken);
    //let userInfoResponseJSON = await userInfoResponse.json();
    //console.log("userInfoResponseJSON", userInfoResponseJSON);

    let calendarsList = await this.getUsersCalendarList(accessToken);
    let calendarsListJSON = await calendarsList.json();
    console.log(calendarsListJSON);

  };

  getUsersCalendarList = async (accessToken) => {
    console.log("accessToken",accessToken)
    let calendarsList;
    calendarsList = await fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return calendarsList;
  };
  // getCalendarNames = async(calendarsList) => {
  //   let calendarsListJSON = await calendarsList.json;
  // }

  render() {
    return true;
  }
}
