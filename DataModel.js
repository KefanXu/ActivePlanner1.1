import firebase from "firebase";
import "@firebase/firestore";
import "@firebase/storage";
import { firebaseConfig } from "./Secret";

import * as Notification from "expo-notifications";
import * as Google from "expo-google-app-auth";

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

Notification.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class DataModel {
  constructor() {
    if (firebase.apps.length === 0) {
      firebase.initializeApp(firebaseConfig);
    }
    this.usersRef = firebase.firestore().collection("users");
    this.users = [];
    this.plans = [];
    this.key = "";
    this.asyncInit();
    console.log("Data Model created");
  }

  asyncInit = async () => {
    await this.loadUsers();
    //console.log("this.users", this.users);
  };

  loadUsers = async () => {
    let querySnap = await this.usersRef.get();
    querySnap.forEach(async (qDocSnap) => {
      let key = qDocSnap.id;
      let data = qDocSnap.data();
      data.key = key;
      let isUserExist = false;
      for (let user of this.users) {
        if (user.key === data.key) {
          isUserExist = true;
        }
      }
      if (!isUserExist) {
        this.users.push(data);
      }
    });
    console.log("load user", this.users.length);
    console.log("this.users", this.users);
  };
  loadUserPlans = async (key) => {
    let userPlanCollection = await this.usersRef
      .doc(key)
      .collection("activity_plans")
      .get();
    userPlanCollection.forEach(async (qDocSnap) => {
      let key = qDocSnap.id;
      let plan = qDocSnap.data();
      plan.key = key;
      this.plans.push(plan);
    });
  };
  getUserPlans = () => {
    return this.plans;
  };

  createNewUser = async (username) => {
    let newUser = {
      email: username,
    };
    let newUsersDocRef = await this.usersRef.add(newUser);
    let key = newUsersDocRef.id;
    await this.usersRef.doc(key).update({ id: key });
    let testColl = {
      test: 1,
    };
    let newUserColl = await newUsersDocRef.collection("activity_plans");
    await newUserColl.add(testColl);
    this.key = key;
  };
  createNewPlan = async (key, newEvent) => {
    //newEvent.reminderKey = await this.scheduleNotification(newEvent);
    //newEvent.reportReminderKey = await this.scheduleReportNotification(newEvent);
    // console.log("data modal",newEvent);
    let userPlanCollection = await this.usersRef
      .doc(key)
      .collection("activity_plans")
      .add(newEvent);
  };
  getUserKey = () => {
    return this.key;
  };
  getUsers = () => {
    return this.users;
  };
  updatePlan = async (userKey, newEvent) => {
    let newEventRef = this.usersRef
      .doc(userKey)
      .collection("activity_plans")
      .doc(newEvent.key);
    newEventRef.update(newEvent);
  };
  deleteReminders = async (newEvent) => {
    await Notification.cancelScheduledNotificationAsync(newEvent.activityReminderKey);
    await Notification.cancelScheduledNotificationAsync(
      newEvent.reportReminderKey
    );
  };

  askPermission = async () => {
    const perms = await Notification.getPermissionsAsync();
    let granted = perms.granted;
    console.log("tried to get permissions", perms);
    if (!granted) {
      const newPerms = await Notification.requestPermissionsAsync();
      granted = newPerms.granted;
    }
    return granted;
    
  };
  scheduleNotification = async (newEvent) => {
    //2021-04-16T10:37:00
    //let trigger = new Date(Date.now() + 5 * 1000);
    let startTime = newEvent.start;
    let trigger = new Date(Date.parse(startTime) - 60 * 60 * 1000);
    //let secTrigger = new Date(Date.parse(startTime) + 7 * 1000);
    console.log("trigger",trigger);

    let identifier = await Notification.scheduleNotificationAsync({
      content: {
        title: "Upcoming Physical Activity",
        body: newEvent.title + " is about to happen in an hour",
        data: { data: "goes here" },
      },
      trigger,
    });
    console.log("identifier1", identifier);
    return identifier;
  };

  scheduleReportNotification = async (newEvent) => {
    let reportStartTime = newEvent.start.slice(0, 11) + "21:00:00";
    //console.log("reportStartTime", reportStartTime);
    let trigger = new Date(Date.parse(reportStartTime));
    //console.log("reportTrigger", reportTrigger);
    let identifier = await Notification.scheduleNotificationAsync({
      content: {
        title: "Upcoming Physical Activity2",
        body: " is about to happen in an hour",
        data: { data: "goes here" },
      },
      trigger,
    });
    console.log("identifier2", identifier);
    return identifier;
  };
  cancelNotification = async () => {};
  googleServiceInit = async (timeMin, timeMax) => {
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
    let userInfoResponseJSON = await userInfoResponse.json();
    //console.log("userInfoResponseJSON", userInfoResponseJSON);

    //let calendarsList = await this.getUsersCalendarList(accessToken);
    //console.log(calendarsList.items[0].backgroundColor);
    //let calendarsListJSON = await calendarsList.json();
    //let calendarsListParseJSON = JSON.parse(calendarsListJSON)
    //console.log(calendarsListJSON.etag);
    //console.log(calendarsListJSON.items[0].id);
    //let calendarsID = calendarsListJSON.items[0].id;
    let calendarsID = userInfoResponseJSON.email;
    let calendarEventList = await this.getUsersCalendarEvents(
      accessToken,
      calendarsID,
      timeMin,
      timeMax
    );
    let calendarEventListJSON = await calendarEventList.json();
    return [calendarEventListJSON, calendarsID];
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

  getUsersCalendarEvents = async (
    accessToken,
    calendarsID,
    timeMin,
    timeMax
  ) => {
    console.log("calendarsID", calendarsID);
    let calendarsEventList;
    calendarsEventList = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/" +
        calendarsID +
        "/events?" +
        timeMax +
        "&" +
        timeMin,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return calendarsEventList;
  };
}

let theDataModel = undefined;

export function getDataModel() {
  if (!theDataModel) {
    theDataModel = new DataModel();
  }
  return theDataModel;
}
