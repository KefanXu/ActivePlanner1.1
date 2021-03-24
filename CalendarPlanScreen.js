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
import { MonthCalendar } from "./Calendar";
import * as Google from "expo-google-app-auth";
import { Calendar } from "react-native-big-calendar";
import SegmentedControl from "@react-native-segmented-control/segmented-control";

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
    this.state = {
      isMonthCalVis: true,
    };
    this.dataModel = getDataModel();
    // this.googleServiceInit();
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
    let calView;
    if (this.state.isMonthCalVis) {
      console.log(this.state.isMonthCalVis)
      calView = <MonthCalendar/>;
    } else {
      calView = (
        <Calendar
          events={[{ title: "test", start: new Date(), end: new Date() }]}
          height={1}
          mode="week"
          showTime={true}
        />
      );
    }
    return (
      <View>
        {/* <View style={{backgroundColor:"red"}}>
        <Button
          title="Get permissions"
          onPress={this.dataModel.askPermission}
        ></Button>
        <Button
          title="Push a notification in 5s"
          onPress={this.dataModel.scheduleNotification}
        ></Button>
        </View> */}
        <View>
          <SegmentedControl
            values={["Month", "Week"]}
            selectedIndex={"Month"}
            onChange={(event) => {
              // this.setState({
              //   selectedIndex: event.nativeEvent.selectedSegmentIndex,
              // });
              console.log(event.nativeEvent.selectedSegmentIndex);
              if (event.nativeEvent.selectedSegmentIndex == 1) {
                this.setState({isMonthCalVis:false});
              } else {
                this.setState({isMonthCalVis:true});
              }
              
            }}
          />
        </View>
        <View style={{ flexDirection: "column", backgroundColor: "" }}>
          {/* <View style={[{alignItems:"flex-start", justifyContent:"flex-start", marginTop:0},{ transform: [{ scale: 0.5 }] }]}>
            <Calendar
              events={[{ title: "test", start: new Date(), end: new Date() }]}
              height={1}
              mode="week"
              showTime={true}
              style={[{marginTop:0},{ transform: [{ scale: 1}] }]}
            />
          </View> */}
          {/* <View style={[{ transform: [{ scale: 0.5 }] }]}>
            <Calendar
              events={[{ title: "test", start: new Date(), end: new Date() }]}
              height={1}
              mode="week"
              showTime={true}
            />
          </View> */}
          {calView}
        </View>
      </View>
    );
  }
}
