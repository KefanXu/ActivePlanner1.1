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
import Dayz from 'dayz';


import moment from 'moment';
// would come from a network request in a "real" app

const events = new Dayz.EventsCollection([
                { content: 'Continuing event Past',
                  range: moment.range(moment('2015-09-08'), moment('2015-09-14')) },

                { content: 'Continuing event Before',
                  range: moment.range('2015-09-04', '2015-09-09') },

                { content: 'Weeklong',
                  range: moment.range('2015-09-06', moment('2015-09-12').endOf('day')) },

                { content: 'A Longer Event',
                  range: moment.range(moment('2015-09-04'), moment('2015-09-14')) },

                { content: 'Inclusive',
                  range: moment.range(moment('2015-09-07'), moment('2015-09-12')) },

                { content: '9am - 2pm (resizable)',
                  resizable: { step: 15 },
                  range: moment.range(moment('2015-09-11').hour(9),
                                      moment('2015-09-11').hour(14)) },

                { content: '8am - 8pm (non-resizable)',
                  range: moment.range(moment('2015-09-07').hour(8),
                                      moment('2015-09-07').hour(21).minutes(40)) },
            ]);

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
    this.date = moment('2015-09-11');
    //this.googleServiceInit();
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
    let calendarEventList = await this.getUsersCalendarEvents(accessToken, calendarsID);
    let calendarEventListJSON =  await calendarEventList.json();
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
    console.log("calendarsID",calendarsID);
    let calendarsEventList;
    calendarsEventList = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/" + "kefanxu@umich.edu" + "/events",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return calendarsEventList;
  }


  render() {
    return (
      <View>
        <Button 
          title="Get permissions"
          onPress= {this.dataModel.askPermission}>
        </Button>
        <Button
          title="Push a notification in 5s" 
          onPress = {this.dataModel.scheduleNotification}>
        </Button>
        <Dayz
          date = {this.date}
          display='week'
      />
      </View>
    );
  }
}
