import React, { useState } from "react";
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
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from 'moment';

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const nDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const localizer = momentLocalizer(moment);
const myEventsList = [{
  title: "string",
  start: new Date('March 20, 2021 03:24:00'),
  end: new Date('March 20, 2021 05:24:00'),
  allDay: false,
  resource: "any",
}];

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
    this.dataModel = getDataModel();
    this.state = {
      activeDate: new Date(),
    };
    //this.googleServiceInit();
  }
  generateMatrix = () => {
    var matrix = [];
    // Create header
    matrix[0] = this.weekDays;

    var year = this.state.activeDate.getFullYear();
    var month = this.state.activeDate.getMonth();

    var firstDay = new Date(year, month, 1).getDay();

    // More code here
  };

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
    //console.log(calendarsList.items[0].backgroundColor);
    let calendarsListJSON = await calendarsList.json();
    //let calendarsListParseJSON = JSON.parse(calendarsListJSON)
    //console.log(calendarsListJSON.etag);
    //console.log(calendarsListJSON.items[0].id);
    let calendarsID = calendarsListJSON.items[0].id;
    let calendarEventList = await this.getUsersCalendarEvents(
      accessToken,
      calendarsID
    );
    let calendarEventListJSON = await calendarEventList.json();
    console.log(calendarEventListJSON);
    //console.log(JSON.stringify(calendarsListJSON))
  };

  getUsersCalendarList = async (accessToken) => {
    //console.log("accessToken",accessToken)
    let calendarsList;
    calendarsList = await fetch(
      "https://www.googleapis.com/calendar/v3/users/me/calendarList",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return calendarsList;
  };

  getUsersCalendarEvents = async (accessToken, calendarsID) => {
    console.log("calendarsID", calendarsID);
    let calendarsEventList;
    calendarsEventList = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/" +
        "kefanxu@umich.edu" +
        "/events",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return calendarsEventList;
  };

  render() {
    return (
      <View>
        <Button
          title="Get permissions"
          onPress={this.dataModel.askPermission}
        ></Button>
        <Button
          title="Push a notification in 5s"
          onPress={this.dataModel.scheduleNotification}
        ></Button>
        <View>
        {/* <Calendar
          localizer={localizer}
          events={myEventsList}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
        /> */}
        </View>
      </View>
    );
  }
}
